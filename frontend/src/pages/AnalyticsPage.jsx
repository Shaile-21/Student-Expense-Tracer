import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  PieChart as PieIcon,
  Download,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Award,
  Wallet
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/MetricCard';
import { formatINR, formatCompactINR } from '../utils/formatters';

export const AnalyticsPage = ({ refreshKey }) => {
  const { token, showToast } = useAuth();

  const [dateRange, setDateRange] = useState('month'); // 'month', 'custom'
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  const fetchAnalytics = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (dateRange === 'month') {
        params.append('month', selectedMonth);
      } else if (dateRange === 'custom' && startDate && endDate) {
        params.append('startDate', startDate);
        params.append('endDate', endDate);
      }

      const res = await fetch(`/api/analytics?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setAnalytics(json.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [token, dateRange, selectedMonth, startDate, endDate, refreshKey]);

  const summary = analytics?.summary || {
    totalIncome: 0,
    totalExpense: 0,
    netSavings: 0,
    savingsRate: 0,
    averageDailySpending: 0,
    highestCategory: { category: 'None', amount: 0, percentage: 0 }
  };

  const categoryData = analytics?.categoryData || [];
  const dailyData = analytics?.dailyData || [];
  const monthlyTrends = analytics?.monthlyTrends || [];
  const smartTips = analytics?.smartTips || [];

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (dateRange === 'month') {
      const [y, m] = selectedMonth.split('-').map(Number);
      params.append('startDate', new Date(y, m - 1, 1).toISOString());
      params.append('endDate', new Date(y, m, 0, 23, 59, 59).toISOString());
    } else if (startDate && endDate) {
      params.append('startDate', startDate);
      params.append('endDate', endDate);
    }

    fetch(`/api/transactions/export/csv?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${selectedMonth}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('Financial report exported to CSV successfully!', 'success');
      })
      .catch(() => showToast('Failed to export CSV report', 'error'));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header & Date Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Financial Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep dive into your college spending, savings rate, and campus habits
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick preset vs custom */}
          <div className="flex bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-sm">
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateRange === 'month'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              By Month
            </button>
            <button
              onClick={() => setDateRange('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                dateRange === 'custom'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Custom Range
            </button>
          </div>

          {dateRange === 'month' ? (
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 px-3 py-2 rounded-2xl shadow-sm focus:outline-none"
            />
          ) : (
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-xl shadow-sm"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 px-2.5 py-1.5 rounded-xl shadow-sm"
              />
            </div>
          )}

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 4 Analytics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Income / Allowance"
          amount={summary.totalIncome}
          subtitle="Allowances & Freelance"
          icon={TrendingUp}
          variant="income"
        />

        <MetricCard
          title="Total Spending"
          amount={summary.totalExpense}
          subtitle="All campus expenses"
          icon={TrendingDown}
          variant="expense"
        />

        <MetricCard
          title="Net Savings"
          amount={summary.netSavings}
          subtitle={`Savings Rate: ${summary.savingsRate}%`}
          icon={Wallet}
          variant={summary.netSavings >= 0 ? 'income' : 'expense'}
        />

        <MetricCard
          title="Highest Spending Category"
          amount={summary.highestCategory?.amount || 0}
          subtitle={`${summary.highestCategory?.category} (${summary.highestCategory?.percentage || 0}%)`}
          icon={Award}
          variant="warning"
        />
      </div>

      {/* Income vs Expenses Bar Chart & Category Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Income vs Expense Bar Comparison */}
        <div className="lg:col-span-2 p-5 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Income vs Expense Monthly Comparison
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track how much money you save vs spend each month
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            {monthlyTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="income" name="Income" fill="#10B981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" name="Expense" fill="#EF4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Category Donut Breakdown */}
        <div className="p-5 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Category Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Percentage of monthly spend
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
                No categorized expenses
              </div>
            )}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
            {categoryData.slice(0, 4).map((c) => (
              <div key={c.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatINR(c.value)} ({c.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Daily Spending Timeline Bar Chart */}
      <div className="p-5 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Daily Spending Histogram
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Identify spikes on canteen days, weekends, and project materials
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400">
            Avg: {formatINR(summary.averageDailySpending)} / day
          </span>
        </div>

        <div className="h-60 w-full">
          {dailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="date"
                  stroke="#94A3B8"
                  fontSize={10}
                  tickLine={false}
                  tickFormatter={(val) => val.slice(8)} // show DD
                />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                  labelFormatter={(val) => `Date: ${val}`}
                  formatter={(val) => [`₹${val.toLocaleString('en-IN')}`, 'Spent']}
                />
                <Bar dataKey="expense" name="Daily Expense" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No daily expenses logged in this range
            </div>
          )}
        </div>
      </div>

      {/* Smart Student Saving Insights Grid */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/50 text-indigo-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Automated Student Financial Insights
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Rules and observations generated from your actual transaction records
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {smartTips.map((tip) => (
            <div
              key={tip.id}
              className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                tip.type === 'warning'
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40 text-rose-900 dark:text-rose-200'
                  : tip.type === 'success'
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200'
                  : 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm">{tip.title}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/60 dark:bg-slate-800/60">
                  {tip.category}
                </span>
              </div>
              <p className="opacity-90 leading-relaxed text-slate-700 dark:text-slate-300">
                {tip.tip}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
