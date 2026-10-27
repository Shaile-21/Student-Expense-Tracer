const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User, Transaction, Budget, SavingsGoal, RecurringExpense } = require('../config/db');

// Helper to generate JWT token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_student_expense_tracker_2024',
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// @desc    Register a new student user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, college, monthlyAllowance, pocketMoneyDay } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase().trim() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists'
      });
    }

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      college: college ? college.trim() : 'College / University',
      monthlyAllowance: monthlyAllowance !== undefined ? Number(monthlyAllowance) : 8000,
      pocketMoneyDay: pocketMoneyDay !== undefined ? Number(pocketMoneyDay) : 1,
      currency: 'INR',
      currencySymbol: '₹',
      themePreference: 'dark'
    });

    // Auto-create initial default budget for current month (e.g. 2024-10)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const allowance = user.monthlyAllowance || 8000;

    await Budget.create({
      user: user._id,
      month: currentMonth,
      monthlyLimit: allowance,
      categoryLimits: [
        { category: 'Food', limit: Math.round(allowance * 0.40) },
        { category: 'Transport', limit: Math.round(allowance * 0.15) },
        { category: 'Education', limit: Math.round(allowance * 0.15) },
        { category: 'Entertainment', limit: Math.round(allowance * 0.10) },
        { category: 'Shopping', limit: Math.round(allowance * 0.10) },
        { category: 'Bills', limit: Math.round(allowance * 0.10) }
      ],
      alertThreshold: 80
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        monthlyAllowance: user.monthlyAllowance,
        pocketMoneyDay: user.pocketMoneyDay,
        currency: user.currency,
        currencySymbol: user.currencySymbol,
        themePreference: user.themePreference
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        monthlyAllowance: user.monthlyAllowance,
        pocketMoneyDay: user.pocketMoneyDay,
        currency: user.currency,
        currencySymbol: user.currencySymbol,
        themePreference: user.themePreference
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        college: user.college,
        monthlyAllowance: user.monthlyAllowance,
        pocketMoneyDay: user.pocketMoneyDay,
        currency: user.currency,
        currencySymbol: user.currencySymbol,
        themePreference: user.themePreference
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { name, college, monthlyAllowance, pocketMoneyDay, themePreference } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name.trim();
    if (college !== undefined) fieldsToUpdate.college = college.trim();
    if (monthlyAllowance !== undefined) fieldsToUpdate.monthlyAllowance = Math.max(0, Number(monthlyAllowance));
    if (pocketMoneyDay !== undefined) fieldsToUpdate.pocketMoneyDay = Math.min(31, Math.max(1, Number(pocketMoneyDay)));
    if (themePreference && ['light', 'dark', 'system'].includes(themePreference)) {
      fieldsToUpdate.themePreference = themePreference;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: fieldsToUpdate },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        college: updatedUser.college,
        monthlyAllowance: updatedUser.monthlyAllowance,
        pocketMoneyDay: updatedUser.pocketMoneyDay,
        currency: updatedUser.currency,
        currencySymbol: updatedUser.currencySymbol,
        themePreference: updatedUser.themePreference
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.findByIdAndUpdate(req.user._id, {
      $set: { password: hashedPassword }
    });

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed comprehensive sample demo data for student account
// @route   POST /api/auth/seed-demo
// @access  Private
const seedDemoData = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Optional: clear existing records for clean demo
    if (req.body.clearExisting) {
      await Transaction.deleteMany({ user: userId });
      await Budget.deleteMany({ user: userId });
      await SavingsGoal.deleteMany({ user: userId });
      await RecurringExpense.deleteMany({ user: userId });
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth();
    const currentMonthStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;

    // Sample student transactions with dates distributed across the current month
    const sampleTransactions = [
      // Income
      { title: 'Monthly Pocket Allowance from Parents', amount: 9000, type: 'income', category: 'Monthly allowance', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 1), notes: 'Received via GPay' },
      { title: 'Merit Scholarship Installment', amount: 3500, type: 'income', category: 'Scholarship', paymentMethod: 'Net Banking', date: new Date(currentYear, currentMonthIdx, 5), notes: 'Semester reward scholarship' },
      { title: 'Web Design Freelance Project', amount: 4000, type: 'income', category: 'Freelancing', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 12), notes: 'Landing page for client' },
      
      // Expenses: Food & Campus Dining
      { title: 'Hostel Mess Monthly Fees', amount: 2800, type: 'expense', category: 'Accommodation', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 2), notes: 'October mess dues' },
      { title: 'Campus Canteen Lunch & Chai', amount: 160, type: 'expense', category: 'Food', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 3), notes: 'Thali with classmates' },
      { title: 'Late Night Pizza & Snacks', amount: 450, type: 'expense', category: 'Food', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 7), notes: 'Exam study group session' },
      { title: 'Groceries, Milk & Oatmeal', amount: 620, type: 'expense', category: 'Food', paymentMethod: 'Cash', date: new Date(currentYear, currentMonthIdx, 10), notes: 'Supermarket purchase' },
      { title: 'Cafe Coffee Day Coffee & Sandwich', amount: 240, type: 'expense', category: 'Food', paymentMethod: 'Debit Card', date: new Date(currentYear, currentMonthIdx, 14), notes: 'Assignment work session' },

      // Transport
      { title: 'Metro Monthly Smart Card Recharge', amount: 600, type: 'expense', category: 'Transport', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 2), notes: 'Delhi/Bangalore Metro pass' },
      { title: 'Auto-rickshaw to Railway Station', amount: 180, type: 'expense', category: 'Transport', paymentMethod: 'Cash', date: new Date(currentYear, currentMonthIdx, 8), notes: 'Weekend trip to home' },
      { title: 'Uber Ride with Friends to Mall', amount: 120, type: 'expense', category: 'Transport', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 13), notes: 'Split 4 ways' },

      // Education & Books
      { title: 'Data Structures & Algorithms Textbook', amount: 750, type: 'expense', category: 'Education', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 4), notes: 'Reference book for 5th semester' },
      { title: 'College Lab Record Notebooks & Stationery', amount: 320, type: 'expense', category: 'Education', paymentMethod: 'Cash', date: new Date(currentYear, currentMonthIdx, 6), notes: 'Physics and electronics manuals' },
      { title: 'Udemy Full Stack React & Node Course', amount: 499, type: 'expense', category: 'Education', paymentMethod: 'Credit Card', date: new Date(currentYear, currentMonthIdx, 9), notes: 'Festive discount offer' },

      // Entertainment & Subscriptions
      { title: 'Netflix & Spotify Student Subscription', amount: 299, type: 'expense', category: 'Entertainment', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 5), notes: 'Monthly recurring student plan' },
      { title: 'Movie Ticket with Roommates', amount: 350, type: 'expense', category: 'Entertainment', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 11), notes: 'Weekend IMAX show' },

      // Shopping & Tech
      { title: 'Laptop Wireless Mouse & Mousepad', amount: 550, type: 'expense', category: 'Shopping', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 8), notes: 'Logitech silent wireless mouse' },
      { title: 'Campus Hoodie & College T-shirt', amount: 890, type: 'expense', category: 'Shopping', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 13), notes: 'College fest merchandise' },

      // Bills & Healthcare
      { title: 'Mobile 5G Data Pack Recharge', amount: 349, type: 'expense', category: 'Bills', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 3), notes: 'Jio 84 days plan' },
      { title: 'Medical Clinic Doctor Consultation & Meds', amount: 420, type: 'expense', category: 'Healthcare', paymentMethod: 'Cash', date: new Date(currentYear, currentMonthIdx, 12), notes: 'Viral fever medication' }
    ];

    for (const item of sampleTransactions) {
      await Transaction.create({ ...item, user: userId });
    }

    // Set sample Budget for current month
    await Budget.findOneAndUpdate(
      { user: userId, month: currentMonthStr },
      {
        user: userId,
        month: currentMonthStr,
        monthlyLimit: 12000,
        categoryLimits: [
          { category: 'Food', limit: 4500 },
          { category: 'Transport', limit: 1200 },
          { category: 'Education', limit: 2000 },
          { category: 'Accommodation', limit: 3000 },
          { category: 'Shopping', limit: 1500 },
          { category: 'Entertainment', limit: 1000 },
          { category: 'Bills', limit: 800 },
          { category: 'Healthcare', limit: 800 }
        ],
        alertThreshold: 80
      },
      { upsert: true }
    );

    // Sample Savings Goals
    const sampleGoals = [
      {
        title: 'New Coding Laptop (M2 / i7)',
        targetAmount: 65000,
        currentAmount: 28500,
        targetDate: new Date(currentYear, 11, 31),
        category: 'Gadgets',
        notes: 'Saving for final year project and placement coding'
      },
      {
        title: 'Semester Exam & Registration Fee',
        targetAmount: 8500,
        currentAmount: 6000,
        targetDate: new Date(currentYear, currentMonthIdx + 2, 15),
        category: 'Education',
        notes: 'Keep in emergency reserve'
      },
      {
        title: 'Goa College Road Trip Fund',
        targetAmount: 12000,
        currentAmount: 4200,
        targetDate: new Date(currentYear + 1, 0, 10),
        category: 'Travel',
        notes: 'Post-semester vacation with hostel batchmates'
      }
    ];

    for (const g of sampleGoals) {
      await SavingsGoal.create({ ...g, user: userId });
    }

    // Sample Recurring Expenses
    const sampleRecurring = [
      {
        title: 'Hostel Room & Mess Payment',
        amount: 2800,
        category: 'Accommodation',
        paymentMethod: 'UPI',
        frequency: 'monthly',
        nextDueDate: new Date(currentYear, currentMonthIdx + 1, 1),
        isActive: true,
        notes: 'Pay by 5th to avoid late penalty'
      },
      {
        title: 'Hostel High-Speed WiFi Share',
        amount: 250,
        category: 'Bills',
        paymentMethod: 'UPI',
        frequency: 'monthly',
        nextDueDate: new Date(currentYear, currentMonthIdx + 1, 5),
        isActive: true,
        notes: 'Split among 4 flatmates'
      },
      {
        title: 'Spotify Student Streaming',
        amount: 69,
        category: 'Entertainment',
        paymentMethod: 'UPI',
        frequency: 'monthly',
        nextDueDate: new Date(currentYear, currentMonthIdx + 1, 10),
        isActive: true,
        notes: 'Verified with college email ID'
      }
    ];

    for (const r of sampleRecurring) {
      await RecurringExpense.create({ ...r, user: userId });
    }

    res.status(200).json({
      success: true,
      message: 'Sample demo data successfully seeded! You now have transactions, budgets, goals, and recurring expenses.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
  seedDemoData
};
