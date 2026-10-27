require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB, getDBStatus } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const savingsGoalRoutes = require('./routes/savingsGoalRoutes');
const recurringRoutes = require('./routes/recurringRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all during development or specific client URL
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger for development
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`[${new Date().toLocaleTimeString('en-IN')}] ${req.method} ${req.url}`);
  }
  next();
});

// System Health & Database Status
app.get('/api/health', (req, res) => {
  const dbStatus = getDBStatus();
  res.status(200).json({
    status: 'online',
    appName: 'Student Expense Tracker API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/savings-goals', savingsGoalRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect to Database & start listening
let server;
const startServer = async () => {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 Student Expense Tracker API running on port ${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
