const { Transaction } = require('../config/db');

// @desc    Get all transactions with filtering, search, sorting, and pagination
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      search,
      category,
      paymentMethod,
      type,
      startDate,
      endDate,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 100
    } = req.query;

    const query = { user: userId };

    // Search by title or notes
    if (search && search.trim()) {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    // Filter by type
    if (type && ['expense', 'income'].includes(type)) {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by payment method
    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end of day for inclusive end date
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting
    const sortField = ['date', 'amount', 'title'].includes(sortBy) ? sortBy : 'date';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortDirection };

    const transactions = await Transaction.find(query).sort(sort);

    // Calculate totals for the filtered subset
    let totalExpense = 0;
    let totalIncome = 0;

    transactions.forEach(t => {
      if (t.type === 'expense') totalExpense += Number(t.amount);
      if (t.type === 'income') totalIncome += Number(t.amount);
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      totals: {
        income: totalIncome,
        expense: totalExpense,
        net: totalIncome - totalExpense
      },
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Ensure transaction belongs to user
    if (String(transaction.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const {
      title,
      amount,
      type,
      category,
      date,
      paymentMethod,
      notes,
      isRecurring,
      recurringId
    } = req.body;

    if (!title || amount === undefined || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, type, and category'
      });
    }

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be a positive number greater than 0'
      });
    }

    const transaction = await Transaction.create({
      user: req.user._id,
      title: title.trim(),
      amount: numericAmount,
      type,
      category,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'UPI',
      notes: notes ? notes.trim() : '',
      isRecurring: Boolean(isRecurring),
      recurringId: recurringId || null
    });

    res.status(201).json({
      success: true,
      message: `${type === 'expense' ? 'Expense' : 'Income'} recorded successfully`,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update existing transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Ownership check
    if (String(transaction.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this transaction'
      });
    }

    const {
      title,
      amount,
      type,
      category,
      date,
      paymentMethod,
      notes
    } = req.body;

    const updateFields = {};
    if (title) updateFields.title = title.trim();
    if (amount !== undefined) {
      const num = Number(amount);
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than 0' });
      }
      updateFields.amount = num;
    }
    if (type) updateFields.type = type;
    if (category) updateFields.category = category;
    if (date) updateFields.date = new Date(date);
    if (paymentMethod) updateFields.paymentMethod = paymentMethod;
    if (notes !== undefined) updateFields.notes = notes.trim();

    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Transaction updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Ownership check
    if (String(transaction.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this transaction'
      });
    }

    await Transaction.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Transaction deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export user transactions as CSV
// @route   GET /api/transactions/export/csv
// @access  Private
const exportTransactionsCSV = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, category, type } = req.query;

    const query = { user: userId };
    if (type && ['expense', 'income'].includes(type)) query.type = type;
    if (category && category !== 'All') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    // Format Indian CSV
    const headers = ['Transaction ID', 'Title', 'Type', 'Category', 'Amount (INR)', 'Payment Method', 'Date', 'Notes'];
    const rows = transactions.map(t => {
      const formattedDate = new Date(t.date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      const escape = (str) => `"${String(str || '').replace(/"/g, '""')}"`;
      return [
        escape(t._id),
        escape(t.title),
        escape(t.type.toUpperCase()),
        escape(t.category),
        escape(t.amount),
        escape(t.paymentMethod),
        escape(formattedDate),
        escape(t.notes)
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\r\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=student-expenses-${new Date().toISOString().slice(0, 10)}.csv`);
    return res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  getTransactionById,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  exportTransactionsCSV
};
