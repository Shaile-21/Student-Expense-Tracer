const { SavingsGoal } = require('../config/db');

// @desc    Get all savings goals for user
// @route   GET /api/savings-goals
// @access  Private
const getSavingsGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ user: req.user._id }).sort({ createdAt: -1 });

    const formattedGoals = goals.map(g => {
      const target = Number(g.targetAmount) || 1;
      const current = Number(g.currentAmount) || 0;
      const percentage = Math.min(100, Number(((current / target) * 100).toFixed(1)));
      const remainingAmount = Math.max(0, target - current);
      
      const targetDate = new Date(g.targetDate);
      const diffTime = targetDate.getTime() - new Date().getTime();
      const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

      return {
        ...g,
        progressPercentage: percentage,
        remainingAmount,
        daysRemaining,
        isCompleted: current >= target || Boolean(g.isCompleted)
      };
    });

    res.status(200).json({
      success: true,
      count: formattedGoals.length,
      data: formattedGoals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new savings goal
// @route   POST /api/savings-goals
// @access  Private
const createSavingsGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, currentAmount = 0, targetDate, category, notes } = req.body;

    if (!title || !targetAmount || !targetDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, target amount, and target date'
      });
    }

    const goal = await SavingsGoal.create({
      user: req.user._id,
      title: title.trim(),
      targetAmount: Number(targetAmount),
      currentAmount: Math.max(0, Number(currentAmount) || 0),
      targetDate: new Date(targetDate),
      category: category || 'Gadgets',
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      data: goal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Deposit / add funds towards a savings goal
// @route   POST /api/savings-goals/:id/deposit
// @access  Private
const depositToGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const addAmt = Number(amount);

    if (isNaN(addAmt) || addAmt <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid deposit amount greater than 0'
      });
    }

    const goal = await SavingsGoal.findById(req.params.id);
    if (!goal || String(goal.user) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    const newAmount = Number(goal.currentAmount || 0) + addAmt;
    const isCompleted = newAmount >= Number(goal.targetAmount);

    const updated = await SavingsGoal.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          currentAmount: newAmount,
          isCompleted
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Successfully deposited ₹${addAmt.toLocaleString('en-IN')}!`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Withdraw funds from a savings goal
// @route   POST /api/savings-goals/:id/withdraw
// @access  Private
const withdrawFromGoal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const withdrawAmt = Number(amount);

    if (isNaN(withdrawAmt) || withdrawAmt <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid withdrawal amount greater than 0'
      });
    }

    const goal = await SavingsGoal.findById(req.params.id);
    if (!goal || String(goal.user) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    if (withdrawAmt > Number(goal.currentAmount || 0)) {
      return res.status(400).json({
        success: false,
        message: 'Withdrawal amount exceeds currently saved balance'
      });
    }

    const newAmount = Math.max(0, Number(goal.currentAmount || 0) - withdrawAmt);
    const isCompleted = newAmount >= Number(goal.targetAmount);

    const updated = await SavingsGoal.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          currentAmount: newAmount,
          isCompleted
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Successfully withdrew ₹${withdrawAmt.toLocaleString('en-IN')}`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update savings goal
// @route   PUT /api/savings-goals/:id
// @access  Private
const updateSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);
    if (!goal || String(goal.user) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    const { title, targetAmount, targetDate, category, notes, isCompleted } = req.body;
    const fields = {};
    if (title) fields.title = title.trim();
    if (targetAmount) fields.targetAmount = Number(targetAmount);
    if (targetDate) fields.targetDate = new Date(targetDate);
    if (category) fields.category = category;
    if (notes !== undefined) fields.notes = notes.trim();
    if (isCompleted !== undefined) fields.isCompleted = Boolean(isCompleted);

    const updated = await SavingsGoal.findByIdAndUpdate(
      req.params.id,
      { $set: fields },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Savings goal updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings-goals/:id
// @access  Private
const deleteSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findById(req.params.id);
    if (!goal || String(goal.user) !== String(req.user._id)) {
      return res.status(404).json({ success: false, message: 'Savings goal not found' });
    }

    await SavingsGoal.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSavingsGoals,
  createSavingsGoal,
  depositToGoal,
  withdrawFromGoal,
  updateSavingsGoal,
  deleteSavingsGoal
};
