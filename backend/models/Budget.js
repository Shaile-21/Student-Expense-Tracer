const mongoose = require('mongoose');

const categoryLimitSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true
  },
  limit: {
    type: Number,
    required: true,
    min: [0, 'Category budget limit cannot be negative'],
    default: 0
  }
}, { _id: false });

const budgetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  month: {
    type: String,
    required: [true, 'Please provide month in YYYY-MM format'],
    match: [/^\d{4}-\d{2}$/, 'Month must be in YYYY-MM format']
  },
  monthlyLimit: {
    type: Number,
    required: [true, 'Please set a monthly limit'],
    min: [0, 'Monthly budget limit cannot be negative'],
    default: 0
  },
  categoryLimits: [categoryLimitSchema],
  alertThreshold: {
    type: Number,
    default: 80, // 80% warning
    min: 1,
    max: 100
  }
}, {
  timestamps: true
});

// Ensure a user has only one budget record per month
budgetSchema.index({ user: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
