const mongoose = require('mongoose');

const recurringExpenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please provide title for recurring expense'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide recurring amount'],
    min: [0.01, 'Amount must be greater than zero']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: ['Food', 'Transport', 'Education', 'Accommodation', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Other']
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'Other'],
    default: 'UPI'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'monthly'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  nextDueDate: {
    type: Date,
    required: true
  },
  lastProcessedDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('RecurringExpense', recurringExpenseSchema);
