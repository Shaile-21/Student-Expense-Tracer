const { Budget, Transaction } = require('../config/db');

// @desc    Get budget details & spending analysis for a specific month
// @route   GET /api/budgets/month/:month (e.g. 2024-10)
// @access  Private
const getBudgetForMonth = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const requestedMonth = req.params.month || new Date().toISOString().slice(0, 7);

    // Find or return default budget
    let budget = await Budget.findOne({ user: userId, month: requestedMonth });

    if (!budget) {
      budget = {
        month: requestedMonth,
        monthlyLimit: req.user.monthlyAllowance || 8000,
        categoryLimits: [
          { category: 'Food', limit: 3000 },
          { category: 'Transport', limit: 1200 },
          { category: 'Education', limit: 1500 },
          { category: 'Entertainment', limit: 800 },
          { category: 'Shopping', limit: 1000 },
          { category: 'Bills', limit: 500 }
        ],
        alertThreshold: 80
      };
    }

    // Get all expense transactions for this month
    const [year, monthNum] = requestedMonth.split('-').map(Number);
    const startOfMonth = new Date(year, monthNum - 1, 1);
    const endOfMonth = new Date(year, monthNum, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      user: userId,
      type: 'expense',
      date: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // Calculate total spent and category-wise spending
    let totalSpent = 0;
    const categorySpending = {};

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      totalSpent += amt;
      categorySpending[t.category] = (categorySpending[t.category] || 0) + amt;
    });

    const monthlyLimit = Number(budget.monthlyLimit) || 0;
    const remainingBudget = Math.max(0, monthlyLimit - totalSpent);
    const overallPercentage = monthlyLimit > 0 ? (totalSpent / monthlyLimit) * 100 : 0;
    const isWarning = overallPercentage >= (budget.alertThreshold || 80) && overallPercentage < 100;
    const isExceeded = totalSpent > monthlyLimit && monthlyLimit > 0;

    // Build category-wise budget progress breakdown
    const categoryProgress = (budget.categoryLimits || []).map(catItem => {
      const catLimit = Number(catItem.limit) || 0;
      const spent = categorySpending[catItem.category] || 0;
      const remaining = Math.max(0, catLimit - spent);
      const percentage = catLimit > 0 ? (spent / catLimit) * 100 : 0;
      return {
        category: catItem.category,
        limit: catLimit,
        spent,
        remaining,
        percentage: Number(percentage.toFixed(1)),
        isWarning: percentage >= (budget.alertThreshold || 80) && percentage < 100,
        isExceeded: spent > catLimit && catLimit > 0
      };
    });

    // Also include any categories spent on that weren't explicitly in categoryLimits
    Object.keys(categorySpending).forEach(cat => {
      if (!categoryProgress.some(cp => cp.category === cat)) {
        categoryProgress.push({
          category: cat,
          limit: 0,
          spent: categorySpending[cat],
          remaining: 0,
          percentage: 100,
          isWarning: false,
          isExceeded: true
        });
      }
    });

    res.status(200).json({
      success: true,
      data: {
        budget,
        month: requestedMonth,
        monthlyLimit,
        totalSpent,
        remainingBudget,
        overallPercentage: Number(overallPercentage.toFixed(1)),
        isWarning,
        isExceeded,
        alertThreshold: budget.alertThreshold || 80,
        categoryProgress
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set or update budget for a month
// @route   POST /api/budgets
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month, monthlyLimit, categoryLimits, alertThreshold = 80 } = req.body;

    if (!month || monthlyLimit === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Please provide month (YYYY-MM) and monthly limit'
      });
    }

    const cleanedCategoryLimits = Array.isArray(categoryLimits)
      ? categoryLimits.map(c => ({
          category: c.category,
          limit: Math.max(0, Number(c.limit) || 0)
        }))
      : [];

    const updatedBudget = await Budget.findOneAndUpdate(
      { user: userId, month },
      {
        user: userId,
        month,
        monthlyLimit: Math.max(0, Number(monthlyLimit)),
        categoryLimits: cleanedCategoryLimits,
        alertThreshold: Math.min(100, Math.max(1, Number(alertThreshold)))
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Budget for ${month} saved successfully`,
      data: updatedBudget
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all historical budgets for user
// @route   GET /api/budgets/history
// @access  Private
const getBudgetHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const budgets = await Budget.find({ user: userId }).sort({ month: -1 });

    res.status(200).json({
      success: true,
      count: budgets.length,
      data: budgets
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBudgetForMonth,
  setBudget,
  getBudgetHistory
};
