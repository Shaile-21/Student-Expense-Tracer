// Client-Side Offline / Static Fallback Database Engine
// Ensures 100% of the application works seamlessly even on static frontend hosting (e.g. Vercel static)
// when the server returns HTML instead of JSON.

const STORAGE_KEY = 'student_expense_tracker_db_v1';

const defaultUser = {
  _id: 'user_demo_101',
  name: 'Aarav Patel',
  email: 'student.demo@college.edu',
  college: 'BITS Pilani / IIT Delhi',
  monthlyAllowance: 10000,
  pocketMoneyDay: 1,
  currency: 'INR',
  currencySymbol: '₹',
  themePreference: 'dark'
};

function getSeedData() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth();
  const currentMonthStr = `${currentYear}-${String(currentMonthIdx + 1).padStart(2, '0')}`;

  const transactions = [
    { _id: 'tx_1', user: 'user_demo_101', title: 'Monthly Pocket Allowance from Parents', amount: 9000, type: 'income', category: 'Monthly allowance', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 1).toISOString(), notes: 'Received via GPay' },
    { _id: 'tx_2', user: 'user_demo_101', title: 'Merit Scholarship Installment', amount: 3500, type: 'income', category: 'Scholarship', paymentMethod: 'Net Banking', date: new Date(currentYear, currentMonthIdx, 5).toISOString(), notes: 'Semester reward scholarship' },
    { _id: 'tx_3', user: 'user_demo_101', title: 'Web Design Freelance Project', amount: 4000, type: 'income', category: 'Freelancing', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 12).toISOString(), notes: 'Landing page for client' },
    { _id: 'tx_4', user: 'user_demo_101', title: 'Hostel Mess Monthly Fees', amount: 2800, type: 'expense', category: 'Accommodation', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 2).toISOString(), notes: 'Monthly mess dues' },
    { _id: 'tx_5', user: 'user_demo_101', title: 'Campus Canteen Lunch & Chai', amount: 160, type: 'expense', category: 'Food', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 3).toISOString(), notes: 'Thali with classmates' },
    { _id: 'tx_6', user: 'user_demo_101', title: 'Late Night Pizza & Snacks', amount: 450, type: 'expense', category: 'Food', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 7).toISOString(), notes: 'Exam study session' },
    { _id: 'tx_7', user: 'user_demo_101', title: 'Groceries, Milk & Oatmeal', amount: 620, type: 'expense', category: 'Food', paymentMethod: 'Cash', date: new Date(currentYear, currentMonthIdx, 10).toISOString(), notes: 'Supermarket purchase' },
    { _id: 'tx_8', user: 'user_demo_101', title: 'Cafe Coffee Day Coffee & Sandwich', amount: 240, type: 'expense', category: 'Food', paymentMethod: 'Debit Card', date: new Date(currentYear, currentMonthIdx, 14).toISOString(), notes: 'Assignment work' },
    { _id: 'tx_9', user: 'user_demo_101', title: 'Metro Monthly Smart Card Recharge', amount: 600, type: 'expense', category: 'Transport', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 2).toISOString(), notes: 'Metro commute pass' },
    { _id: 'tx_10', user: 'user_demo_101', title: 'Auto-rickshaw to Railway Station', amount: 180, type: 'expense', category: 'Transport', paymentMethod: 'Cash', date: new Date(currentYear, currentMonthIdx, 8).toISOString(), notes: 'Weekend trip home' },
    { _id: 'tx_11', user: 'user_demo_101', title: 'Data Structures & Algorithms Textbook', amount: 750, type: 'expense', category: 'Education', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 4).toISOString(), notes: 'Reference textbook' },
    { _id: 'tx_12', user: 'user_demo_101', title: 'Netflix & Spotify Student Subscription', amount: 299, type: 'expense', category: 'Entertainment', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 5).toISOString(), notes: 'Student plan' },
    { _id: 'tx_13', user: 'user_demo_101', title: 'Laptop Wireless Mouse & Pad', amount: 550, type: 'expense', category: 'Shopping', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 8).toISOString(), notes: 'Logitech mouse' },
    { _id: 'tx_14', user: 'user_demo_101', title: 'Mobile 5G Data Pack Recharge', amount: 349, type: 'expense', category: 'Bills', paymentMethod: 'UPI', date: new Date(currentYear, currentMonthIdx, 3).toISOString(), notes: 'Monthly recharge' },
    { _id: 'tx_15', user: 'user_demo_101', title: 'Medical Clinic Doctor Consultation & Meds', amount: 420, type: 'expense', category: 'Healthcare', paymentMethod: 'Cash', date: new Date(currentYear, currentMonthIdx, 12).toISOString(), notes: 'Clinic visit' }
  ];

  const budgets = [
    {
      _id: 'b_1',
      user: 'user_demo_101',
      month: currentMonthStr,
      monthlyLimit: 12000,
      alertThreshold: 80,
      categoryLimits: [
        { category: 'Food', limit: 4500 },
        { category: 'Transport', limit: 1200 },
        { category: 'Education', limit: 2000 },
        { category: 'Accommodation', limit: 3000 },
        { category: 'Shopping', limit: 1500 },
        { category: 'Entertainment', limit: 1000 },
        { category: 'Bills', limit: 800 },
        { category: 'Healthcare', limit: 800 }
      ]
    }
  ];

  const savingsGoals = [
    {
      _id: 'sg_1',
      user: 'user_demo_101',
      title: 'New Coding Laptop (M2 / i7)',
      targetAmount: 65000,
      currentAmount: 28500,
      targetDate: new Date(currentYear, 11, 31).toISOString(),
      category: 'Gadgets',
      notes: 'Placement and project work'
    },
    {
      _id: 'sg_2',
      user: 'user_demo_101',
      title: 'Semester Exam & Registration Fee',
      targetAmount: 8500,
      currentAmount: 6000,
      targetDate: new Date(currentYear, currentMonthIdx + 2, 15).toISOString(),
      category: 'Education',
      notes: 'Emergency reserve'
    },
    {
      _id: 'sg_3',
      user: 'user_demo_101',
      title: 'Goa College Road Trip Fund',
      targetAmount: 12000,
      currentAmount: 4200,
      targetDate: new Date(currentYear + 1, 0, 10).toISOString(),
      category: 'Travel',
      notes: 'Trip with hostel friends'
    }
  ];

  const recurring = [
    { _id: 'rc_1', user: 'user_demo_101', title: 'Hostel Mess Bill', amount: 2800, category: 'Accommodation', dueDay: 5, frequency: 'monthly', paymentMethod: 'UPI', isActive: true, isPaidThisMonth: true },
    { _id: 'rc_2', user: 'user_demo_101', title: 'Spotify & Netflix Student', amount: 299, category: 'Entertainment', dueDay: 10, frequency: 'monthly', paymentMethod: 'UPI', isActive: true, isPaidThisMonth: true },
    { _id: 'rc_3', user: 'user_demo_101', title: 'Hostel High-Speed Wi-Fi', amount: 499, category: 'Bills', dueDay: 18, frequency: 'monthly', paymentMethod: 'UPI', isActive: true, isPaidThisMonth: false },
    { _id: 'rc_4', user: 'user_demo_101', title: 'Gym & Fitness Membership', amount: 800, category: 'Healthcare', dueDay: 25, frequency: 'monthly', paymentMethod: 'UPI', isActive: true, isPaidThisMonth: false }
  ];

  return {
    users: [defaultUser],
    transactions,
    budgets,
    savingsGoals,
    recurring
  };
}

export function getLocalDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getSeedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    const fallback = getSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
}

export function saveLocalDB(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save to local storage', e);
  }
}

function mockResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Client API Handler
export async function handleClientApi(urlStr, config = {}) {
  const db = getLocalDB();
  const url = new URL(urlStr, window.location.origin);
  const path = url.pathname;
  const method = (config.method || 'GET').toUpperCase();
  const body = config.body ? JSON.parse(config.body) : {};

  // Mock token to user
  const token = localStorage.getItem('token') || 'demo_token_123';
  const currentUser = db.users[0] || defaultUser;

  // 1. Health Check
  if (path === '/api/health') {
    return mockResponse({
      status: 'online',
      appName: 'Student Expense Tracker (Client Engine)',
      database: { connected: true, isMongo: false, dbType: 'Browser Storage Engine' }
    });
  }

  // 2. Auth Login
  if (path === '/api/auth/login' && method === 'POST') {
    const { email } = body;
    const user = db.users.find(u => u.email.toLowerCase() === (email || '').toLowerCase()) || defaultUser;
    return mockResponse({
      success: true,
      token: 'client_jwt_' + Date.now(),
      user
    });
  }

  // 3. Auth Register
  if (path === '/api/auth/register' && method === 'POST') {
    const newUser = {
      _id: 'user_' + Date.now(),
      name: body.name || 'Student',
      email: body.email,
      college: body.college || 'College',
      monthlyAllowance: Number(body.monthlyAllowance) || 8000,
      pocketMoneyDay: Number(body.pocketMoneyDay) || 1,
      currency: 'INR',
      currencySymbol: '₹',
      themePreference: 'dark'
    };
    db.users.push(newUser);
    saveLocalDB(db);
    return mockResponse({
      success: true,
      token: 'client_jwt_' + Date.now(),
      user: newUser
    }, 201);
  }

  // 4. Auth Me
  if (path === '/api/auth/me') {
    return mockResponse({
      success: true,
      user: currentUser
    });
  }

  // 5. Auth Seed Demo
  if (path === '/api/auth/seed-demo' && method === 'POST') {
    const fresh = getSeedData();
    saveLocalDB(fresh);
    return mockResponse({ success: true, message: 'Demo data seeded successfully' });
  }

  // 6. Transactions
  if (path === '/api/transactions' && method === 'GET') {
    let list = [...db.transactions];
    const category = url.searchParams.get('category');
    const type = url.searchParams.get('type');
    const search = url.searchParams.get('search');
    const paymentMethod = url.searchParams.get('paymentMethod');
    const limit = Number(url.searchParams.get('limit'));

    if (category && category !== 'all') list = list.filter(t => t.category === category);
    if (type && type !== 'all') list = list.filter(t => t.type === type);
    if (paymentMethod && paymentMethod !== 'all') list = list.filter(t => t.paymentMethod === paymentMethod);
    if (search) list = list.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

    list.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalIncome = list.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const totalExpense = list.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);

    if (limit && limit > 0) list = list.slice(0, limit);

    return mockResponse({
      success: true,
      count: list.length,
      data: list,
      totals: {
        income: totalIncome,
        expense: totalExpense,
        balance: totalIncome - totalExpense
      }
    });
  }

  if (path === '/api/transactions' && method === 'POST') {
    const newTx = {
      _id: 'tx_' + Date.now(),
      user: currentUser._id,
      title: body.title,
      amount: Number(body.amount),
      type: body.type || 'expense',
      category: body.category || 'Other',
      paymentMethod: body.paymentMethod || 'UPI',
      date: body.date || new Date().toISOString(),
      notes: body.notes || ''
    };
    db.transactions.unshift(newTx);
    saveLocalDB(db);
    return mockResponse({ success: true, data: newTx }, 201);
  }

  if (path.startsWith('/api/transactions/') && method === 'PUT') {
    const id = path.split('/')[3];
    const idx = db.transactions.findIndex(t => t._id === id);
    if (idx !== -1) {
      db.transactions[idx] = { ...db.transactions[idx], ...body };
      saveLocalDB(db);
      return mockResponse({ success: true, data: db.transactions[idx] });
    }
  }

  if (path.startsWith('/api/transactions/') && method === 'DELETE') {
    const id = path.split('/')[3];
    db.transactions = db.transactions.filter(t => t._id !== id);
    saveLocalDB(db);
    return mockResponse({ success: true, message: 'Transaction removed' });
  }

  // 7. Budgets
  if (path === '/api/budgets/current' || path.startsWith('/api/budgets/month/') || (path === '/api/budgets' && method === 'GET')) {
    const budget = db.budgets[0] || {
      monthlyLimit: 12000,
      alertThreshold: 80,
      categoryLimits: []
    };

    const expenses = db.transactions.filter(t => t.type === 'expense');
    const totalSpent = expenses.reduce((acc, t) => acc + Number(t.amount), 0);
    const categorySpentMap = {};
    expenses.forEach(t => {
      categorySpentMap[t.category] = (categorySpentMap[t.category] || 0) + Number(t.amount);
    });

    const categoriesWithSpent = (budget.categoryLimits || []).map(c => {
      const spent = categorySpentMap[c.category] || 0;
      const remaining = Math.max(0, c.limit - spent);
      const percentage = c.limit > 0 ? Math.round((spent / c.limit) * 100) : 0;
      return {
        ...c,
        spent,
        remaining,
        percentage,
        isWarning: percentage >= (budget.alertThreshold || 80) && percentage < 100,
        isExceeded: percentage >= 100
      };
    });

    const monthlyRemaining = Math.max(0, budget.monthlyLimit - totalSpent);
    const overallPercentage = budget.monthlyLimit > 0 ? Math.round((totalSpent / budget.monthlyLimit) * 100) : 0;

    return mockResponse({
      success: true,
      data: {
        ...budget,
        totalSpent,
        remaining: monthlyRemaining,
        overallPercentage,
        isWarning: overallPercentage >= (budget.alertThreshold || 80) && overallPercentage < 100,
        isExceeded: overallPercentage >= 100,
        categoryLimits: categoriesWithSpent
      }
    });
  }

  if (path === '/api/budgets' && method === 'POST') {
    if (db.budgets.length > 0) {
      db.budgets[0] = { ...db.budgets[0], ...body };
    } else {
      db.budgets.push({ _id: 'b_1', user: currentUser._id, ...body });
    }
    saveLocalDB(db);
    return mockResponse({ success: true, data: db.budgets[0] });
  }

  // 8. Analytics & Summary
  if (path === '/api/analytics' || path === '/api/analytics/summary') {
    const transactions = db.transactions;
    const income = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
    const expense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
    const balance = income - expense;

    const categoryBreakdown = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + Number(t.amount);
    });

    const categoryList = Object.entries(categoryBreakdown).map(([name, value]) => ({
      name,
      value,
      percentage: expense > 0 ? Math.round((value / expense) * 100) : 0
    })).sort((a, b) => b.value - a.value);

    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const avgDailySpend = daysPassed > 0 ? Math.round(expense / daysPassed) : 0;

    const monthlyLimit = db.budgets[0]?.monthlyLimit || 12000;
    const remainingBudget = Math.max(0, monthlyLimit - expense);
    const daysLeft = Math.max(1, daysInMonth - daysPassed);
    const dailySpendingLimit = Math.round(remainingBudget / daysLeft);

    const timeline = [];
    for (let d = 1; d <= daysPassed; d++) {
      const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayExpense = transactions
        .filter(t => t.type === 'expense' && t.date.startsWith(dateStr))
        .reduce((sum, t) => sum + Number(t.amount), 0);
      timeline.push({ day: d, amount: dayExpense, date: dateStr });
    }

    return mockResponse({
      success: true,
      data: {
        summary: {
          totalIncome: income,
          totalExpense: expense,
          totalBalance: balance,
          savingsRate: income > 0 ? Math.round(((income - expense) / income) * 100) : 0,
          avgDailySpend,
          dailySpendingLimit,
          highestCategory: categoryList[0]?.name || 'None'
        },
        categoryBreakdown: categoryList,
        timeline,
        smartTips: [
          'Great job keeping transport costs within your monthly metro pass budget!',
          'Your food expenses make up the largest share of spending. Look for campus canteen combo offers.',
          `You have ₹${dailySpendingLimit} safe spending limit per day for the remaining ${daysLeft} days.`
        ]
      }
    });
  }

  // 9. Savings Goals
  if (path === '/api/savings-goals' && method === 'GET') {
    return mockResponse({
      success: true,
      data: db.savingsGoals
    });
  }

  if (path === '/api/savings-goals' && method === 'POST') {
    const newGoal = {
      _id: 'sg_' + Date.now(),
      user: currentUser._id,
      title: body.title,
      targetAmount: Number(body.targetAmount),
      currentAmount: Number(body.currentAmount || 0),
      targetDate: body.targetDate || new Date().toISOString(),
      category: body.category || 'General',
      notes: body.notes || ''
    };
    db.savingsGoals.push(newGoal);
    saveLocalDB(db);
    return mockResponse({ success: true, data: newGoal }, 201);
  }

  if (path.includes('/deposit') && method === 'POST') {
    const id = path.split('/')[3];
    const goal = db.savingsGoals.find(g => g._id === id);
    if (goal) {
      goal.currentAmount = (goal.currentAmount || 0) + Number(body.amount);
      saveLocalDB(db);
      return mockResponse({ success: true, data: goal });
    }
  }

  if (path.includes('/withdraw') && method === 'POST') {
    const id = path.split('/')[3];
    const goal = db.savingsGoals.find(g => g._id === id);
    if (goal) {
      goal.currentAmount = Math.max(0, (goal.currentAmount || 0) - Number(body.amount));
      saveLocalDB(db);
      return mockResponse({ success: true, data: goal });
    }
  }

  // 10. Recurring Expenses & Pocket Money
  if (path === '/api/recurring' && method === 'GET') {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysPassed = now.getDate();
    const pocketMoneyDay = currentUser.pocketMoneyDay || 1;
    let daysUntilAllowance = pocketMoneyDay - daysPassed;
    if (daysUntilAllowance <= 0) daysUntilAllowance += daysInMonth;

    return mockResponse({
      success: true,
      data: {
        recurring: db.recurring,
        pocketMoney: {
          daysRemaining: daysUntilAllowance,
          monthlyAllowance: currentUser.monthlyAllowance || 10000,
          pocketMoneyDay
        }
      }
    });
  }

  if (path.includes('/pay') && method === 'POST') {
    const id = path.split('/')[3];
    const item = db.recurring.find(r => r._id === id);
    if (item) {
      item.isPaidThisMonth = true;
      // also log as transaction
      db.transactions.unshift({
        _id: 'tx_' + Date.now(),
        user: currentUser._id,
        title: item.title,
        amount: item.amount,
        type: 'expense',
        category: item.category,
        paymentMethod: item.paymentMethod,
        date: new Date().toISOString(),
        notes: 'Paid recurring subscription'
      });
      saveLocalDB(db);
      return mockResponse({ success: true, data: item });
    }
  }

  // Fallback generic 200
  return mockResponse({ success: true, data: [] });
}

// Global fetch interceptor to guarantee 100% uptime on static deployments
export function installClientApiInterceptor() {
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;

  window.fetch = async function(resource, config) {
    const url = typeof resource === 'string' ? resource : resource?.url || '';

    if (url.startsWith('/api') || url.includes('/api/')) {
      try {
        const response = await originalFetch(resource, config);
        const contentType = response.headers.get('content-type') || '';

        // If the server answered with valid JSON or an API response, return it
        if (contentType.includes('application/json')) {
          return response;
        }

        // If the server responded with HTML (static SPA rewrite fallback) or 404
        return handleClientApi(url, config);
      } catch (err) {
        // Network failure / offline: fallback to client storage engine
        return handleClientApi(url, config);
      }
    }

    return originalFetch(resource, config);
  };
}
