const assert = require('assert');
const http = require('http');

process.env.NODE_ENV = 'test';

const { app } = require('../server');
const { connectDB } = require('../config/db');

console.log('🧪 Running API Integration Tests...\n');

let server;
let testPort;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    let bodyPayload = null;
    const reqHeaders = {
      Connection: 'close',
      ...(options.headers || {})
    };

    if (postData) {
      bodyPayload = typeof postData === 'string' ? postData : JSON.stringify(postData);
      reqHeaders['Content-Length'] = Buffer.byteLength(bodyPayload);
      if (!reqHeaders['Content-Type']) {
        reqHeaders['Content-Type'] = 'application/json';
      }
    }

    const opts = {
      hostname: '127.0.0.1',
      port: testPort,
      agent: false,
      ...options,
      headers: reqHeaders
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.setTimeout(15000, () => {
      req.destroy();
      reject(new Error(`Request timeout on ${opts.path}`));
    });

    req.on('error', (err) => reject(err));

    if (bodyPayload) {
      req.write(bodyPayload);
    }
    req.end();
  });
}

async function runTests() {
  await connectDB();

  server = app.listen(0, '127.0.0.1', async () => {
    testPort = server.address().port;
    console.log(`📡 Test server listening on ephemeral port ${testPort}`);

    try {
      // Test 1: Health Check Endpoint
      console.log('Testing GET /api/health ...');
      const healthRes = await makeRequest({
        path: '/api/health',
        method: 'GET'
      });
      assert.strictEqual(healthRes.status, 200, 'Health endpoint should return 200');
      assert.strictEqual(healthRes.body.status, 'online');
      console.log('✅ API Test 1 Passed: GET /api/health returned online status');

      // Test 2: Reject unauthenticated request to /api/transactions
      console.log('Testing GET /api/transactions without token ...');
      const unauthRes = await makeRequest({
        path: '/api/transactions',
        method: 'GET'
      });
      assert.strictEqual(unauthRes.status, 401, 'Protected route should return 401 without token');
      console.log('✅ API Test 2 Passed: Unauthorized request rejected with 401');

      // Test 3: Register a new test student user
      console.log('Testing POST /api/auth/register ...');
      const uniqueEmail = `test_student_${Date.now()}@college.edu`;
      const regRes = await makeRequest({
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }, {
        name: 'Rahul Sharma',
        email: uniqueEmail,
        password: 'password123',
        college: 'IIT Delhi',
        monthlyAllowance: 8000
      });
      assert.strictEqual(regRes.status, 201, 'User registration should return 201');
      assert.ok(regRes.body.token, 'Registration should return JWT token');
      const token = regRes.body.token;
      console.log('✅ API Test 3 Passed: POST /api/auth/register created student user and returned token');

      // Test 4: Create an expense transaction with auth token
      console.log('Testing POST /api/transactions ...');
      const expenseRes = await makeRequest({
        path: '/api/transactions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }, {
        title: 'Canteen Meals',
        amount: 250,
        type: 'expense',
        category: 'Food',
        paymentMethod: 'UPI',
        notes: 'Thali with friends'
      });
      assert.strictEqual(expenseRes.status, 201, 'Transaction creation should return 201');
      assert.strictEqual(expenseRes.body.data.amount, 250);
      assert.strictEqual(expenseRes.body.data.category, 'Food');
      console.log('✅ API Test 4 Passed: POST /api/transactions created expense successfully');

      // Test 5: Fetch transactions and verify math
      console.log('Testing GET /api/transactions ...');
      const getTransRes = await makeRequest({
        path: '/api/transactions',
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      assert.strictEqual(getTransRes.status, 200);
      assert.ok(getTransRes.body.data.length >= 1);
      assert.strictEqual(getTransRes.body.totals.expense, 250);
      console.log('✅ API Test 5 Passed: GET /api/transactions returned user-isolated transactions with accurate totals');

      console.log('\n🎉 ALL API INTEGRATION TESTS PASSED SUCCESSFULLY!\n');
      server.close(() => {
        process.exit(0);
      });
    } catch (err) {
      console.error('❌ Test failed:', err);
      if (server) {
        server.close(() => process.exit(1));
      } else {
        process.exit(1);
      }
    }
  });
}

runTests();

