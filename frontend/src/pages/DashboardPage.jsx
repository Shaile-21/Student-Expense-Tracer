import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  Target,
  PlusCircle,
  Clock,
  ArrowRight,
  Sparkles,
  PieChart as PieIcon,
  Tag,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import { PocketMoneyBanner } from '../components/PocketMoneyBanner';
import { BudgetAlertBanner } from '../components/BudgetAlertBanner';
import { formatINR, formatCompactINR, formatDate, categoryMeta } from '../utils/formatters';

export const DashboardPage = ({ onQuickAdd, onNavigate, refreshKey }) => {
  const { token, user, seedDemo } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [budgetData, setBudgetData] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [pocketMoneyData, setPocketMoneyData] = useState(null);

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const headers = { 'Authorization': `Bearer ${token}` };

      const [transRes, budgetRes, analyticsRes, pocketRes] = await Promise.all([
        fetch('/api/transactions?limit=8&sortBy=date&sortOrder=desc', { headers }),
        fetch('/api/budgets/current', { headers }),
        fetch('/api/analytics', { headers }),
        fetch('/api/recurring', { headers })
      ]);

      const [transJson, budgetJson, analyticsJson, pocketJson] = await Promise.all([
        transRes.json(),
        budgetRes.json(),
        analyticsRes.json(),
        pocketRes.json()
      ]);

      if (transJson.success) setTransactions(transJson.data || []);
      if (budgetJson.success) setBudgetData(budgetJson.data);
      if (analyticsJson.success) setAnalyticsData(analyticsJson.data);
      if (pocketJson.success) setPocketMoneyData(pocketJson.data.pocketMoney);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, refreshKey]);

  const summary = analyticsData?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    averageDailySpending: 0
  };

  const categoryData = analyticsData?.categoryData || [];
  const monthlyTrends = analyticsData?.monthlyTrends || [];
  const smartTips = analyticsData?.smartTips || [];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Top Welcome & Quick Add bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track your student allowance, active budgets, and daily spending habits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {transactions.length === 0 && (
            <button
              onClick={() => seedDemo(true)}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
            >
              🌱 Load Sample Data
            </button>
          )}

          <button
            onClick={onQuickAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Pocket Money Allowance Tracker Banner */}
      <PocketMoneyBanner pocketMoney={pocketMoneyData} />

      {/* 80% Budget Alert Banner */}
      <BudgetAlertBanner
        budgetData={budgetData}
        onManageBudget={() => onNavigate('budgets')}
      />

      {/* 4 Key Fintech Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Balance / Savings"
          amount={summary.netSavings}
          subtitle={`Savings rate: ${summary.savingsRate || 0}%`}
          icon={Wallet}
          variant={summary.netSavings >= 0 ? 'income' : 'expense'}
        />

        <MetricCard
          title="Monthly Income / Allowance"
          amount={summary.totalIncome}
          subtitle="Pocket money & extras"
          icon={TrendingUp}
          variant="income"
        />

        <MetricCard
          title="Monthly Expenses"
          amount={summary.totalExpense}
          subtitle={`Avg ${formatINR(summary.averageDailySpending)}/day`}
          icon={TrendingDown}
          variant="expense"
        />

        <MetricCard
          title="Remaining Budget"
          amount={budgetData?.remainingBudget !== undefined ? budgetData.remainingBudget : 0}
          subtitle={`${budgetData?.overallPercentage || 0}% used of ${formatCompactINR(budgetData?.monthlyLimit || 0)}`}
          icon={Target}
          variant={budgetData?.isExceeded ? 'expense' : budgetData?.isWarning ? 'warning' : 'primary'}
          badge={budgetData?.isExceeded ? 'Exceeded' : budgetData?.isWarning ? '80% Spent' : 'On Track'}
        />
      </div>

      {/* Charts Grid: Monthly Trend & Category Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Spending Trend Line/Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Monthly Spending & Income Trends
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparison over the last 6 months
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              6 Months
            </span>
          </div>

          <div className="h-64 w-full">
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="label" stroke="#94A3B8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, '']}
                  />
                  <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#incomeGrad)" />
                  <Area type="monotone" dataKey="expense" name="Expense" stroke="#EF4444" strokeWidth={2.5} fillOpacity={1} fill="url(#expenseGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No trend data available yet
              </div>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Expenses by Category
              </h3>
              <PieIcon className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Where your college pocket money goes
            </p>
          </div>

          <div className="h-52 w-full my-auto">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E293B',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px'
                    }}
                    formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No expenses logged this month
              </div>
            )}
          </div>

          {/* Top 3 categories list */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {categoryData.slice(0, 3).map((cat) => (
              <div key={cat.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                  {cat.name}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatINR(cat.value)} ({cat.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Row: Budget Progress Bars & Smart Saving Tips */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Category Budget Usage Progress Bars */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Category Budget Progress
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Warning triggers automatically at 80% limit
              </p>
            </div>
            <button
              onClick={() => onNavigate('budgets')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Budgets</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {budgetData?.categoryProgress && budgetData.categoryProgress.length > 0 ? (
              budgetData.categoryProgress.slice(0, 5).map((cp) => {
                const isOver = cp.isExceeded;
                const isWarn = cp.isWarning;
                const barColor = isOver ? 'bg-rose-500' : isWarn ? 'bg-amber-500' : 'bg-indigo-500';

                return (
                  <div key={cp.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                        {cp.category}
                        {isOver && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-rose-500/10 text-rose-500">
                            Exceeded
                          </span>
                        )}
                        {isWarn && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-amber-500/10 text-amber-500">
                            80% Warning
                          </span>
                        )}
                      </span>
                      <span className="text-slate-500 dark:text-slate-400">
                        <strong className="text-slate-900 dark:text-white">{formatINR(cp.spent)}</strong> / {formatINR(cp.limit)}
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(100, cp.percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No active category limits set. Click "Manage Budgets" to create one.
              </div>
            )}
          </div>
        </div>

        {/* Smart Student Saving Tips */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Smart Saving Tips
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              AI rule engine tailored to your spending patterns
            </p>

            <div className="space-y-3">
              {smartTips.length > 0 ? (
                smartTips.slice(0, 2).map((tip) => (
                  <div
                    key={tip.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      {tip.title}
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                      {tip.tip}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 text-xs text-slate-500">
                  Log a few transactions to generate personalized smart saving tips!
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('analytics')}
            className="mt-4 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start"
          >
            <span>View Full Financial Analytics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* Recent Transactions List */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Latest expenses & allowances recorded
            </p>
          </div>
          <button
            onClick={() => onNavigate('transactions')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All ({transactions.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {transactions.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {transactions.slice(0, 6).map((t) => {
              const meta = categoryMeta[t.category] || categoryMeta.Other;
              const isExp = t.type === 'expense';
              return (
                <div
                  key={t._id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 px-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs flex-shrink-0 border ${meta.color}`}
                    >
                      {t.category.slice(0, 2)}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                        {t.title}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{t.category}</span>
                        <span>•</span>
                        <span>{t.paymentMethod}</span>
                        <span>•</span>
                        <span>{formatDate(t.date)}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-sm font-extrabold whitespace-nowrap ${
                      isExp ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {isExp ? '-' : '+'} {formatINR(t.amount)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center">
            <Clock className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              No transactions logged yet
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Start by clicking "Add Transaction" above to record your first canteen meal, bus pass, or pocket money!
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
