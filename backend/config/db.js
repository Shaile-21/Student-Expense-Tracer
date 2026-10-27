const mongoose = require('mongoose');
const { createCollection } = require('./store');

// Import real Mongoose models
const UserModel = require('../models/User');
const TransactionModel = require('../models/Transaction');
const BudgetModel = require('../models/Budget');
const SavingsGoalModel = require('../models/SavingsGoal');
const RecurringExpenseModel = require('../models/RecurringExpense');

// Fallback collections
const storeUsers = createCollection('users');
const storeTransactions = createCollection('transactions');
const storeBudgets = createCollection('budgets');
const storeSavingsGoals = createCollection('savingsgoals');
const storeRecurring = createCollection('recurringexpenses');

const dbState = {
  isMongo: false,
  connected: false,
  uri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_expense_tracker',
  dbType: 'Initializing...',
  message: ''
};

const net = require('net');

function probePort(host, port, timeoutMs = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let called = false;
    const done = (result) => {
      if (called) return;
      called = true;
      socket.destroy();
      resolve(result);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
    socket.connect(port, host);
  });
}

// Attempt MongoDB connection with instant probe
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_expense_tracker';
  dbState.uri = uri;

  const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');

  if (isLocal) {
    const probeTimeout = process.env.NODE_ENV === 'test' ? 300 : 700;
    const isRunning = await probePort('127.0.0.1', 27017, probeTimeout);
    if (!isRunning) {
      console.log('[DB] ℹ️ Local MongoDB server not active on port 27017. Activating local persistent JSON DB.');
      dbState.isMongo = false;
      dbState.connected = true;
      dbState.dbType = 'Local Persistent Database (JSON File)';
      dbState.message = 'Using local persistent JSON database at backend/data/db.json (Fully functional with full CRUD persistence)';
      console.log(`[DB] 🚀 ${dbState.message}`);
      return false;
    }
  }

  try {
    console.log(`[DB] Attempting MongoDB connection to: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')} ...`);
    
    const timeout = process.env.NODE_ENV === 'test' ? 1000 : 3000;
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeout,
      connectTimeoutMS: timeout
    });

    dbState.isMongo = true;
    dbState.connected = true;
    dbState.dbType = 'MongoDB';
    dbState.message = `Connected to MongoDB at ${mongoose.connection.host}`;
    console.log(`[DB] ✅ ${dbState.message}`);

    mongoose.connection.on('error', (err) => {
      console.error('[DB] ❌ MongoDB Connection Error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DB] ⚠️ MongoDB Disconnected.');
    });

    return true;
  } catch (error) {
    console.warn(`[DB] ⚠️ MongoDB not available (${error.message}). Activating local persistent JSON DB.`);
    dbState.isMongo = false;
    dbState.connected = true;
    dbState.dbType = 'Local Persistent Database (JSON File)';
    dbState.message = 'Using local persistent JSON database at backend/data/db.json (Fully functional with full CRUD persistence)';
    console.log(`[DB] 🚀 ${dbState.message}`);
    return false;
  }
};

const getDBStatus = () => ({
  connected: dbState.connected,
  isMongo: dbState.isMongo,
  dbType: dbState.dbType,
  message: dbState.message,
  uri: dbState.uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
});

// Dynamic proxy to delegate to Mongoose Model or Store Collection
const createProxy = (mongooseModel, storeRepo) => {
  return new Proxy({}, {
    get(target, prop) {
      if (dbState.isMongo) {
        const val = mongooseModel[prop];
        return typeof val === 'function' ? val.bind(mongooseModel) : val;
      } else {
        const val = storeRepo[prop];
        return typeof val === 'function' ? val.bind(storeRepo) : val;
      }
    }
  });
};

const User = createProxy(UserModel, storeUsers);
const Transaction = createProxy(TransactionModel, storeTransactions);
const Budget = createProxy(BudgetModel, storeBudgets);
const SavingsGoal = createProxy(SavingsGoalModel, storeSavingsGoals);
const RecurringExpense = createProxy(RecurringExpenseModel, storeRecurring);

module.exports = {
  connectDB,
  getDBStatus,
  User,
  Transaction,
  Budget,
  SavingsGoal,
  RecurringExpense,
  dbState
};
