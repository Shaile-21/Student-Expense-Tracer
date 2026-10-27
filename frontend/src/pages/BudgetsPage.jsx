import React, { useState, useEffect } from 'react';
import {
  PieChart as PieIcon,
  AlertTriangle,
  AlertCircle,
  Save,
  CheckCircle2,
  Calendar,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatCompactINR } from '../utils/formatters';

export const BudgetsPage = ({ refreshKey }) => {
  const { token, showToast } = useAuth();

  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [budgetData, setBudgetData] = useState(null);
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [categoryLimits, setCategoryLimits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultCategories = [
    'Food',
    'Transport',
    'Education',
    'Accommodation',
    'Shopping',
    'Entertainment',
    'Bills',
    'Healthcare',
    'Other'
  ];

  const fetchBudget = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/budgets/month/${selectedMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.data) {
        setBudgetData(json.data);
        setMonthlyLimit(String(json.data.monthlyLimit || 0));

        // Sync category limits
        const existingLimits = json.data.budget?.categoryLimits || [];
        const mapped = defaultCategories.map(cat => {
          const match = existingLimits.find(el => el.category === cat);
          return {
            category: cat,
            limit: match ? match.limit : 0
          };
        });
        setCategoryLimits(mapped);
      }
    } catch (err) {
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudget();
  }, [token, selectedMonth, refreshKey]);

  const handleLimitChange = (catName, val) => {
    setCategoryLimits(prev =>
      prev.map(item =>
        item.category === catName ? { ...item, limit: Math.max(0, Number(val) || 0) } : item
      )
    );
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        month: selectedMonth,
        monthlyLimit: Math.max(0, Number(monthlyLimit) || 0),
        categoryLimits,
        alertThreshold: 80
      };

      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to update budget');
      }

      showToast(`Budget for ${selectedMonth} updated successfully!`, 'success');
      fetchBudget();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalCategoryAllocated = categoryLimits.reduce((acc, curr) => acc + (Number(curr.limit) || 0), 0);
  const totalSpent = budgetData?.totalSpent || 0;
  const numMonthlyLimit = Number(monthlyLimit) || 0;
  const overallPercentage = numMonthlyLimit > 0 ? (totalSpent / numMonthlyLimit) * 100 : 0;
  const isOver = totalSpent > numMonthlyLimit && numMonthlyLimit > 0;
  const isWarn = overallPercentage >= 80 && !isOver;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Page Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Monthly Budget Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set overall spending ceilings and category allocations with 80% warning alerts
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm">
          <Calendar className="w-4 h-4 text-indigo-500 ml-2" />
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 pr-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Top Banner Status */}
      <div
        className={`p-6 rounded-3xl border ${
          isOver
            ? 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900/60'
            : isWarn
            ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
            : 'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {selectedMonth} Budget Overview
              </span>
              {isOver && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white">
                  Exceeded
                </span>
              )}
              {isWarn && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white">
                  80% Warning
                </span>
              )}
            </div>

            <h3 className="text-3xl font-black text-slate-900 dark:text-white">
              {formatINR(totalSpent)} <span className="text-sm font-normal text-slate-400">spent of</span> {formatINR(numMonthlyLimit)}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isOver
                ? `You have exceeded your monthly budget ceiling by ${formatINR(totalSpent - numMonthlyLimit)}.`
                : `${formatINR(Math.max(0, numMonthlyLimit - totalSpent))} remaining to spend this month.`}
            </p>
          </div>

          {/* Large percentage gauge chip */}
          <div className="flex items-center gap-4 bg-white dark:bg-[#131B2E] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 self-start md:self-auto shadow-sm">
            <div>
              <p className="text-[11px] font-medium text-slate-400">Budget Consumed</p>
              <p className={`text-2xl font-black ${isOver ? 'text-rose-500' : isWarn ? 'text-amber-500' : 'text-indigo-500'}`}>
                {overallPercentage.toFixed(1)}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-slate-800 flex items-center justify-center">
              <PieIcon className="w-6 h-6 text-indigo-500" />
            </div>
          </div>
        </div>

        {/* Big Overall Progress Bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full mt-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isOver ? 'bg-rose-500' : isWarn ? 'bg-amber-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.min(100, overallPercentage)}%` }}
          />
        </div>
      </div>

      {/* Category Budget Form & Progress Grid */}
      <form onSubmit={handleSaveBudget} className="space-y-6">
        
        {/* Set Overall Monthly Limit */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="max-w-md">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Overall Monthly Spending Limit (₹)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">
                ₹
              </span>
              <input
                type="number"
                min="0"
                required
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(e.target.value)}
                className="w-full pl-9 pr-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 font-extrabold text-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="e.g. 8000"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              Sum of allocated category budgets: <strong className="text-slate-700 dark:text-slate-300">{formatINR(totalCategoryAllocated)}</strong>
            </p>
          </div>
        </div>

        {/* Category Budget Cards */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Category Spending Allocations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize limits for individual expense categories and track consumption
              </p>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Budget Changes'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {categoryLimits.map((c) => {
              const progressMatch = budgetData?.categoryProgress?.find(cp => cp.category === c.category);
              const spent = progressMatch?.spent || 0;
              const limit = c.limit || 0;
              const pct = limit > 0 ? (spent / limit) * 100 : 0;
              const catExceeded = spent > limit && limit > 0;
              const catWarn = pct >= 80 && !catExceeded;

              return (
                <div
                  key={c.category}
                  className={`p-4 rounded-2xl border transition-all ${
                    catExceeded
                      ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                      : catWarn
                      ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                      : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                      {c.category}
                    </span>
                    {catExceeded && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-500 text-white">
                        Exceeded
                      </span>
                    )}
                    {catWarn && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500 text-white">
                        80% Warning
                      </span>
                    )}
                  </div>

                  <div className="relative mb-2">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={c.limit}
                      onChange={(e) => handleLimitChange(c.category, e.target.value)}
                      className="w-full pl-7 pr-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1.5">
                    <span>Spent: <strong className="text-slate-900 dark:text-white">{formatINR(spent)}</strong></span>
                    <span>{pct.toFixed(0)}%</span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        catExceeded ? 'bg-rose-500' : catWarn ? 'bg-amber-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};
