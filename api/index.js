const path = require('path');

// Ensure packages installed in backend/node_modules resolve cleanly
const backendNodeModules = path.join(__dirname, '..', 'backend', 'node_modules');
if (!module.paths.includes(backendNodeModules)) {
  module.paths.unshift(backendNodeModules);
}

const { app } = require('../backend/server');
const { connectDB } = require('../backend/config/db');

let isConnected = false;

module.exports = async (req, res) => {
  if (!isConnected) {
    await connectDB();
    isConnected = true;
  }

  // Ensure request URL maintains /api prefix expected by backend routes
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }

  return app(req, res);
};
