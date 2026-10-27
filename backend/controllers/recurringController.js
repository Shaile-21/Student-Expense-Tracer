const { RecurringExpense, Transaction, User } = require('../config/db');

// @desc    Get all recurring expenses and pocket-money allowance status
// @route   GET /api/recurring
// @access  Private
const getRecurringAndPocketMoney = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const recurringList = await RecurringExpense.find({ user: userId }).sort({ nextDueDate: 1 });

    // Pocket-money tracker calculations
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();
    const allowanceDay = user.pocketMoneyDay || 1;
    const monthlyAllowance = Number(user.monthlyAllowance) || 0;

    // Determine next allowance date
    let nextAllowanceDate;
    if (currentDate < allowanceDay) {
      nextAllowanceDate = new Date(currentYear, currentMonth, allowanceDay);
    } else {
      nextAllowanceDate = new Date(currentYear, currentMonth + 1, allowanceDay);
    }

    const diffDays = Math.max(0, Math.ceil((nextAllowanceDate - now) / (1000 * 60 * 60 * 24)));

    // Calculate current month's expenses so far
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);

    const monthTransactions = await Transaction.find({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    let currentMonthExpense = 0;
    let currentMonthIncome = 0;
    monthTransactions.forEach(t => {
      if (t.type === 'expense') currentMonthExpense += Number(t.amount);
      if (t.type === 'income') currentMonthIncome += Number(t.amount);
    });

    // Pocket money remaining estimate
    const pocketMoneyRemaining = Math.max(0, (currentMonthIncome || monthlyAllowance) - currentMonthExpense);

    // Days remaining in current calendar month
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysLeftInMonth = Math.max(1, totalDaysInMonth - currentDate);

    // Safe daily spending limit calculation
    const recommendedDailyLimit = Number((pocketMoneyRemaining / daysLeftInMonth).toFixed(0));

    // Total active recurring monthly commitments
    const totalMonthlyRecurring = recurringList
      .filter(r => r.isActive)
      .reduce((acc, curr) => {
        let monthlyEquivalent = Number(curr.amount) || 0;
        if (curr.frequency === 'daily') monthlyEquivalent *= 30;
        if (curr.frequency === 'weekly') monthlyEquivalent *= 4.33;
        return acc + monthlyEquivalent;
      }, 0);

    res.status(200).json({
      success: true,
      data: {
        pocketMoney: {
          monthlyAllowance,
          allowanceDay,
          nextAllowanceDate,
          daysUntilAllowance: diffDays,
          currentMonthExpense,
          currentMonthIncome,
          pocketMoneyRemaining,
          daysLeftInMonth,
          recommendedDailyLimit,
          totalMonthlyRecurring: Math.round(totalMonthlyRecurring)
        },
        recurringExpenses: recurringList
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create recurring expense
// @route   POST /api/recurring
// @access  Private
const createRecurring = async (req, res, next) => {
  try {
    const { title, amount, category, paymentMethod, frequency, nextDueDate, notes } = req.body;

    if (!title || !amount || !category || !nextDueDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, category, and next due date'
      });
    }

    const recurring = await RecurringExpense.create({
      user: req.user._id,
      title: title.trim(),
      amount: Number(amount),
      category,
      paymentMethod: paymentMethod || 'UPI',
      frequency: frequency || 'monthly',
      nextDueDate: new Date(nextDueDate),
      notes: notes ? notes.trim() : '',
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Recurring expense created successfully',
      data: recurring
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle recurring expense active status
// @route   PATCH /api/recurring/:id/toggle
// @access  Private
const toggleRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringExpense.findById(req.params.id);
    if (!recurring || String(recurring.user) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Recurring expense not found' });
    }

    const updated = await RecurringExpense.findByIdAndUpdate(
      req.params.id,
      { $set: { isActive: !recurring.isActive } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Recurring expense is now ${updated.isActive ? 'active' : 'paused'}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Manually record / post a recurring expense as a real transaction right now
// @route   POST /api/recurring/:id/pay
// @access  Private
const payRecurringNow = async (req, res, next) => {
  try {
    const recurring = await RecurringExpense.findById(req.params.id);
    if (!recurring || String(recurring.user) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Recurring expense not found' });
    }

    // Create the transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      title: `${recurring.title} (Recurring)`,
      amount: recurring.amount,
      type: 'expense',
      category: recurring.category,
      paymentMethod: recurring.paymentMethod || 'UPI',
      date: new Date(),
      notes: recurring.notes || 'Auto-paid recurring commitment',
      isRecurring: true,
      recurringId: recurring._id
    });

    // Advance nextDueDate based on frequency
    const nextDate = new Date(recurring.nextDueDate);
    if (recurring.frequency === 'daily') nextDate.setDate(nextDate.getDate() + 1);
    else if (recurring.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
    else nextDate.setMonth(nextDate.getMonth() + 1);

    const updated = await RecurringExpense.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          lastProcessedDate: new Date(),
          nextDueDate: nextDate
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Recorded payment of ₹${recurring.amount} for "${recurring.title}"`,
      transaction,
      recurring: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete recurring expense
// @route   DELETE /api/recurring/:id
// @access  Private
const deleteRecurring = async (req, res, next) => {
  try {
    const recurring = await RecurringExpense.findById(req.params.id);
    if (!recurring || String(recurring.user) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Recurring expense not found' });
    }

    await RecurringExpense.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Recurring expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRecurringAndPocketMoney,
  createRecurring,
  toggleRecurring,
  payRecurringNow,
  deleteRecurring
};
