const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a savings goal title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  targetAmount: {
    type: Number,
    required: [true, 'Please specify the target amount'],
    min: [1, 'Target amount must be at least ₹1']
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: [0, 'Saved amount cannot be negative']
  },
  targetDate: {
    type: Date,
    required: [true, 'Please specify a target achievement date']
  },
  category: {
    type: String,
    default: 'Gadgets',
    enum: ['Education', 'Gadgets', 'Emergency Fund', 'Travel', 'Clothing', 'Certifications', 'Other']
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
