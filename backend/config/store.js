const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isServerless ? path.join('/tmp', 'data') : path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create data dir:', e.message);
  }
}

// In serverless, copy initial seed db.json to /tmp if it doesn't exist
if (isServerless && !fs.existsSync(DB_FILE)) {
  const seedFile = path.join(__dirname, '..', 'data', 'db.json');
  if (fs.existsSync(seedFile)) {
    try {
      fs.copyFileSync(seedFile, DB_FILE);
    } catch (e) {
      console.warn('Could not seed /tmp/data/db.json:', e.message);
    }
  }
}

// Initial DB structure
const initialData = {
  users: [],
  transactions: [],
  budgets: [],
  savingsgoals: [],
  recurringexpenses: []
};

// Load or initialize DB
function loadDB() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return { ...initialData };
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      users: parsed.users || [],
      transactions: parsed.transactions || [],
      budgets: parsed.budgets || [],
      savingsgoals: parsed.savingsgoals || [],
      recurringexpenses: parsed.recurringexpenses || []
    };
  } catch (err) {
    console.error('Error loading JSON DB, resetting to initial structure:', err.message);
    return { ...initialData };
  }
}

// Save DB atomically
function saveDB(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.error('Error writing to JSON DB:', err.message);
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }
}

// Helper to generate 24-char hex string like ObjectId
function generateId() {
  return crypto.randomBytes(12).toString('hex');
}

// Query matcher helper
function matchQuery(item, query = {}) {
  for (const [key, val] of Object.entries(query)) {
    if (val === undefined) continue;

    // Handle MongoDB-like operators
    if (val !== null && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      if (val.$gte !== undefined || val.$lte !== undefined || val.$gt !== undefined || val.$lt !== undefined) {
        const itemVal = item[key] instanceof Date ? item[key].getTime() : new Date(item[key]).getTime();
        if (val.$gte !== undefined) {
          const target = val.$gte instanceof Date ? val.$gte.getTime() : new Date(val.$gte).getTime();
          if (itemVal < target) return false;
        }
        if (val.$gt !== undefined) {
          const target = val.$gt instanceof Date ? val.$gt.getTime() : new Date(val.$gt).getTime();
          if (itemVal <= target) return false;
        }
        if (val.$lte !== undefined) {
          const target = val.$lte instanceof Date ? val.$lte.getTime() : new Date(val.$lte).getTime();
          if (itemVal > target) return false;
        }
        if (val.$lt !== undefined) {
          const target = val.$lt instanceof Date ? val.$lt.getTime() : new Date(val.$lt).getTime();
          if (itemVal >= target) return false;
        }
        continue;
      }
      if (val.$regex !== undefined) {
        const flags = val.$options || 'i';
        const regex = new RegExp(val.$regex, flags);
        if (!regex.test(String(item[key] || ''))) return false;
        continue;
      }
      if (val.$in !== undefined && Array.isArray(val.$in)) {
        if (!val.$in.includes(item[key])) return false;
        continue;
      }
      if (val.$ne !== undefined) {
        if (String(item[key]) === String(val.$ne)) return false;
        continue;
      }
    }

    // Direct comparison
    if (key === '_id' || key === 'id') {
      const itemId = String(item._id || item.id);
      const targetId = String(val._id || val);
      if (itemId !== targetId) return false;
    } else if (key === 'user') {
      const itemUser = String(item.user?._id || item.user);
      const targetUser = String(val?._id || val);
      if (itemUser !== targetUser) return false;
    } else if (String(item[key]).toLowerCase() !== String(val).toLowerCase()) {
      return false;
    }
  }
  return true;
}

// Factory for collection operations
function createCollection(collectionName) {
  return {
    find(query = {}) {
      let sortObj = null;
      let limitNum = null;
      let skipNum = null;

      const execute = () => {
        const db = loadDB();
        let list = (db[collectionName] || []).filter(item => matchQuery(item, query));
        if (sortObj) {
          list = [...list].sort((a, b) => {
            for (const [sKey, order] of Object.entries(sortObj)) {
              let valA = a[sKey];
              let valB = b[sKey];
              if (sKey === 'date' || sKey === 'createdAt') {
                valA = new Date(valA).getTime();
                valB = new Date(valB).getTime();
              }
              if (valA < valB) return order === -1 || order === 'desc' ? 1 : -1;
              if (valA > valB) return order === -1 || order === 'desc' ? -1 : 1;
            }
            return 0;
          });
        }
        if (skipNum) list = list.slice(skipNum);
        if (limitNum) list = list.slice(0, limitNum);
        return list;
      };

      const queryObj = {
        sort(s) {
          sortObj = s;
          return queryObj;
        },
        limit(l) {
          limitNum = l;
          return queryObj;
        },
        skip(sk) {
          skipNum = sk;
          return queryObj;
        },
        then(resolve, reject) {
          try {
            resolve(execute());
          } catch (err) {
            reject(err);
          }
        }
      };

      return queryObj;
    },

    async findOne(query = {}) {
      const db = loadDB();
      const item = (db[collectionName] || []).find(it => matchQuery(it, query));
      if (!item) return null;
      return attachHelpers(collectionName, item);
    },

    async findById(id) {
      const db = loadDB();
      const item = (db[collectionName] || []).find(it => String(it._id) === String(id));
      if (!item) return null;
      return attachHelpers(collectionName, item);
    },

    async create(docData) {
      const db = loadDB();
      const now = new Date().toISOString();
      const doc = {
        _id: generateId(),
        ...docData,
        createdAt: docData.createdAt || now,
        updatedAt: now
      };

      if (collectionName === 'users' && doc.password) {
        if (!doc.password.startsWith('$2a$') && !doc.password.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(10);
          doc.password = await bcrypt.hash(doc.password, salt);
        }
      }

      db[collectionName].push(doc);
      saveDB(db);
      return attachHelpers(collectionName, doc);
    },

    async findByIdAndUpdate(id, update, options = {}) {
      const db = loadDB();
      const index = (db[collectionName] || []).findIndex(it => String(it._id) === String(id));
      if (index === -1) return null;

      const existing = db[collectionName][index];
      const updateData = update.$set ? { ...update.$set } : { ...update };
      delete updateData._id;

      if (collectionName === 'users' && updateData.password) {
        if (!updateData.password.startsWith('$2a$') && !updateData.password.startsWith('$2b$')) {
          const salt = await bcrypt.genSalt(10);
          updateData.password = await bcrypt.hash(updateData.password, salt);
        }
      }

      const updated = {
        ...existing,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      db[collectionName][index] = updated;
      saveDB(db);
      return attachHelpers(collectionName, updated);
    },

    async findOneAndUpdate(query, update, options = {}) {
      const db = loadDB();
      const index = (db[collectionName] || []).findIndex(it => matchQuery(it, query));
      if (index === -1) {
        if (options.upsert) {
          const docData = { ...query, ...(update.$set || update) };
          return this.create(docData);
        }
        return null;
      }

      const existing = db[collectionName][index];
      const updateData = update.$set ? { ...update.$set } : { ...update };
      delete updateData._id;

      const updated = {
        ...existing,
        ...updateData,
        updatedAt: new Date().toISOString()
      };

      db[collectionName][index] = updated;
      saveDB(db);
      return attachHelpers(collectionName, updated);
    },

    async findByIdAndDelete(id) {
      const db = loadDB();
      const index = (db[collectionName] || []).findIndex(it => String(it._id) === String(id));
      if (index === -1) return null;
      const [removed] = db[collectionName].splice(index, 1);
      saveDB(db);
      return removed;
    },

    async deleteMany(query = {}) {
      const db = loadDB();
      const initialCount = db[collectionName].length;
      db[collectionName] = db[collectionName].filter(it => !matchQuery(it, query));
      saveDB(db);
      return { deletedCount: initialCount - db[collectionName].length };
    },

    async countDocuments(query = {}) {
      const db = loadDB();
      return (db[collectionName] || []).filter(it => matchQuery(it, query)).length;
    }
  };
}

function attachHelpers(collectionName, item) {
  if (!item) return null;
  const clone = { ...item };
  if (collectionName === 'users') {
    clone.matchPassword = async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
  }
  return clone;
}

module.exports = {
  loadDB,
  saveDB,
  createCollection,
  generateId,
  DB_FILE
};
