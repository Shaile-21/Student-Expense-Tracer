const { Transaction, Budget, User } = require('../config/db');

// @desc    Get complete analytics, chart datasets, and smart saving tips
// @route   GET /api/analytics
// @access  Private
const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate, month } = req.query;

    const query = { user: userId };
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIdx = now.getMonth();

    // Default to current month if no filter passed
    let rangeStart;
    let rangeEnd;

    if (startDate && endDate) {
      rangeStart = new Date(startDate);
      rangeEnd = new Date(endDate);
      rangeEnd.setHours(23, 59, 59, 999);
      query.date = { $gte: rangeStart, $lte: rangeEnd };
    } else if (month) {
      const [y, m] = month.split('-').map(Number);
      rangeStart = new Date(y, m - 1, 1);
      rangeEnd = new Date(y, m, 0, 23, 59, 59, 999);
      query.date = { $gte: rangeStart, $lte: rangeEnd };
    } else {
      rangeStart = new Date(currentYear, currentMonthIdx, 1);
      rangeEnd = new Date(currentYear, currentMonthIdx + 1, 0, 23, 59, 59, 999);
      query.date = { $gte: rangeStart, $lte: rangeEnd };
    }

    // Fetch all transactions for this range
    const transactions = await Transaction.find(query).sort({ date: 1 });

    // 1. Calculate overall metrics
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryTotals = {};
    const paymentMethodTotals = {};
    const dailyMap = {};

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      const dateKey = new Date(t.date).toISOString().slice(0, 10);

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, expense: 0, income: 0, count: 0 };
      }

      if (t.type === 'expense') {
        totalExpense += amt;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
        paymentMethodTotals[t.paymentMethod] = (paymentMethodTotals[t.paymentMethod] || 0) + amt;
        dailyMap[dateKey].expense += amt;
        dailyMap[dateKey].count += 1;
      } else if (t.type === 'income') {
        totalIncome += amt;
        dailyMap[dateKey].income += amt;
      }
    });

    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Number(((netSavings / totalIncome) * 100).toFixed(1)) : 0;

    // Number of active days in range
    const daysInRange = Math.max(1, Math.round((rangeEnd - rangeStart) / (1000 * 60 * 60 * 24)));
    const averageDailySpending = Number((totalExpense / daysInRange).toFixed(0));

    // Highest spending category
    let highestCategory = { category: 'None', amount: 0, percentage: 0 };
    Object.entries(categoryTotals).forEach(([cat, amount]) => {
      if (amount > highestCategory.amount) {
        highestCategory = {
          category: cat,
          amount,
          percentage: totalExpense > 0 ? Number(((amount / totalExpense) * 100).toFixed(1)) : 0
        };
      }
    });

    // 2. Category Pie / Donut Chart Data
    const categoryColors = {
      Food: '#EF4444',
      Transport: '#F59E0B',
      Education: '#3B82F6',
      Accommodation: '#8B5CF6',
      Shopping: '#EC4899',
      Entertainment: '#10B981',
      Bills: '#06B6D4',
      Healthcare: '#14B8A6',
      Other: '#6B7280'
    };

    const categoryData = Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalExpense > 0 ? Number(((value / totalExpense) * 100).toFixed(1)) : 0,
        color: categoryColors[name] || '#6366F1'
      }))
      .sort((a, b) => b.value - a.value);

    // 3. Payment Methods Breakdown
    const paymentMethodData = Object.entries(paymentMethodTotals).map(([name, value]) => ({
      name,
      value
    }));

    // 4. Daily Spending Bar Chart Data (sorted by date)
    const dailyData = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    // 5. Monthly Spending Trends (Last 6 Months)
    const sixMonthsAgo = new Date(currentYear, currentMonthIdx - 5, 1);
    const lastSixMonthsTransactions = await Transaction.find({
      user: userId,
      date: { $gte: sixMonthsAgo }
    }).sort({ date: 1 });

    const monthMap = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date(currentYear, currentMonthIdx - i, 1);
      const mKey = d.toISOString().slice(0, 7);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      monthMap[mKey] = { month: mKey, label, expense: 0, income: 0, savings: 0 };
    }

    lastSixMonthsTransactions.forEach(t => {
      const mKey = new Date(t.date).toISOString().slice(0, 7);
      if (monthMap[mKey]) {
        const amt = Number(t.amount) || 0;
        if (t.type === 'expense') monthMap[mKey].expense += amt;
        if (t.type === 'income') monthMap[mKey].income += amt;
        monthMap[mKey].savings = monthMap[mKey].income - monthMap[mKey].expense;
      }
    });

    const monthlyTrends = Object.values(monthMap);

    // 6. Smart Rule-Based Saving Tips for Students
    const smartTips = [];

    // Food tip
    const foodSpent = categoryTotals['Food'] || 0;
    if (totalExpense > 0 && foodSpent / totalExpense > 0.35) {
      smartTips.push({
        id: 'food_high',
        type: 'warning',
        category: 'Food',
        title: 'High Food & Canteen Expenses',
        tip: `Food accounts for ${((foodSpent / totalExpense) * 100).toFixed(0)}% of your total spending (₹${foodSpent.toLocaleString('en-IN')}). Consider eating at hostel mess or batch-cooking snacks with roommates to save ₹800–₹1,500 monthly.`
      });
    }

    // Entertainment & Subscriptions tip
    const entSpent = categoryTotals['Entertainment'] || 0;
    if (entSpent > 1200) {
      smartTips.push({
        id: 'ent_tip',
        type: 'info',
        category: 'Entertainment',
        title: 'Optimize Student Subscriptions',
        tip: `You've spent ₹${entSpent.toLocaleString('en-IN')} on entertainment. Check if you can share family streaming plans or claim student discounts on Spotify, YouTube Premium, and Amazon Prime.`
      });
    }

    // Shopping tip
    const shopSpent = categoryTotals['Shopping'] || 0;
    if (shopSpent > 2500) {
      smartTips.push({
        id: 'shop_tip',
        type: 'warning',
        category: 'Shopping',
        title: 'Apply the 48-Hour Purchase Rule',
        tip: `Before making impulse online purchases on Amazon/Flipkart, add items to your wishlist and wait 48 hours. Often the urge fades, preventing unnecessary spending.`
      });
    }

    // General savings encouragement
    if (savingsRate >= 20) {
      smartTips.push({
        id: 'savings_good',
        type: 'success',
        category: 'Savings',
        title: 'Excellent Savings Rate!',
        tip: `Outstanding work! You are saving ${savingsRate}% of your allowance/income. Channel this surplus into your savings goals (like laptops or certifications).`
      });
    } else {
      smartTips.push({
        id: 'daily_budget',
        type: 'info',
        category: 'Budgeting',
        title: 'Stick to Your Daily Cap',
        tip: `Your current daily average spend is ₹${averageDailySpending}. Try setting a mental cap of ₹${Math.max(100, Math.round(averageDailySpending * 0.85))} on non-essential days to boost your monthly savings buffer.`
      });
    }

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalIncome,
          totalExpense,
          netSavings,
          savingsRate,
          averageDailySpending,
          highestCategory,
          daysInRange
        },
        categoryData,
        paymentMethodData,
        dailyData,
        monthlyTrends,
        smartTips
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get calendar month overview with daily transaction markers
// @route   GET /api/analytics/calendar
// @access  Private
const getCalendarData = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { month } = req.query; // YYYY-MM
    const requestedMonth = month || new Date().toISOString().slice(0, 7);
    const [year, mNum] = requestedMonth.split('-').map(Number);

    const startOfMonth = new Date(year, mNum - 1, 1);
    const endOfMonth = new Date(year, mNum, 0, 23, 59, 59, 999);

    const transactions = await Transaction.find({
      user: userId,
      date: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ date: 1 });

    const daysMap = {};
    const totalDays = new Date(year, mNum, 0).getDate();

    for (let d = 1; d <= totalDays; d++) {
      const dayStr = `${requestedMonth}-${String(d).padStart(2, '0')}`;
      daysMap[dayStr] = {
        date: dayStr,
        dayNumber: d,
        expense: 0,
        income: 0,
        transactions: []
      };
    }

    transactions.forEach(t => {
      const dayStr = new Date(t.date).toISOString().slice(0, 10);
      if (daysMap[dayStr]) {
        const amt = Number(t.amount) || 0;
        if (t.type === 'expense') daysMap[dayStr].expense += amt;
        if (t.type === 'income') daysMap[dayStr].income += amt;
        daysMap[dayStr].transactions.push(t);
      }
    });

    res.status(200).json({
      success: true,
      month: requestedMonth,
      days: Object.values(daysMap)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAnalytics,
  getCalendarData
};
