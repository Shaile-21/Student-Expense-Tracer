const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Please enter a valid amount'],
    min: [0.01, 'Amount must be greater than zero']
  },
  type: {
    type: String,
    enum: ['expense', 'income'],
    required: [true, 'Please specify transaction type']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      // Expense categories
      'Food',
      'Transport',
      'Education',
      'Accommodation',
      'Shopping',
      'Entertainment',
      'Bills',
      'Healthcare',
      'Other',
      // Income categories
      'Monthly allowance',
      'Scholarship',
      'Part-time job',
      'Freelancing',
      'Family support',
      'Other income'
    ]
  },
  date: {
    type: Date,
    required: [true, 'Please enter transaction date'],
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Debit Card', 'Credit Card', 'Net Banking', 'Other'],
    default: 'UPI'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters'],
    default: ''
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecurringExpense'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);
