import React, { useState, useEffect } from 'react';
import {
  PiggyBank,
  PlusCircle,
  Sparkles,
  Target,
  Calendar,
  CheckCircle2,
  Trash2,
  TrendingUp,
  ArrowDownLeft,
  X,
  Laptop,
  GraduationCap,
  Palmtree,
  ShieldCheck,
  Tag
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatINR, formatDate } from '../utils/formatters';

export const SavingsGoalsPage = ({ refreshKey }) => {
  const { token, showToast } = useAuth();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Goal Modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [initialSaved, setInitialSaved] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Gadgets');
  const [notes, setNotes] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  // Deposit/Withdraw Modal state
  const [fundsModal, setFundsModal] = useState({ open: false, goal: null, action: 'deposit' });
  const [fundsAmount, setFundsAmount] = useState('');
  const [fundsLoading, setFundsLoading] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const goalCategories = ['Gadgets', 'Education', 'Emergency Fund', 'Travel', 'Clothing', 'Certifications', 'Other'];

  const categoryIcons = {
    Gadgets: Laptop,
    Education: GraduationCap,
    'Emergency Fund': ShieldCheck,
    Travel: Palmtree,
    Other: Tag
  };

  const fetchGoals = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/savings-goals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setGoals(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching savings goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [token, refreshKey]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title || !targetAmount || !targetDate) return;

    setSavingGoal(true);
    try {
      const res = await fetch('/api/savings-goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          targetAmount: Number(targetAmount),
          currentAmount: Math.max(0, Number(initialSaved) || 0),
          targetDate,
          category,
          notes: notes.trim()
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to create goal');

      showToast(`Savings goal "${title}" created!`, 'success');
      setIsAddOpen(false);
      setTitle('');
      setTargetAmount('');
      setInitialSaved('');
      setTargetDate('');
      setNotes('');
      fetchGoals();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingGoal(false);
    }
  };

  const handleFundsSubmit = async (e) => {
    e.preventDefault();
    const { goal, action } = fundsModal;
    const num = Number(fundsAmount);
    if (!goal || isNaN(num) || num <= 0) return;

    setFundsLoading(true);
    try {
      const endpoint = `/api/savings-goals/${goal._id}/${action}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount: num })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update goal funds');

      showToast(data.message, 'success');

      // Trigger confetti if completed
      if (data.data?.isCompleted) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setFundsModal({ open: false, goal: null, action: 'deposit' });
      setFundsAmount('');
      fetchGoals();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setFundsLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/savings-goals/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Savings goal deleted', 'info');
        setDeleteTarget(null);
        fetchGoals();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const totalTarget = goals.reduce((acc, g) => acc + (Number(g.targetAmount) || 0), 0);
  const totalSaved = goals.reduce((acc, g) => acc + (Number(g.currentAmount) || 0), 0);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Savings Goals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Set target funds for your coding laptop, semester registration, trips, and campus gear
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Top Total Saved Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 border border-indigo-500/20 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
            Total Accumulated Student Savings
          </span>
          <h2 className="text-3xl font-black text-white mt-1">
            {formatINR(totalSaved)} <span className="text-sm font-normal text-slate-400">of {formatINR(totalTarget)} target</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Across {goals.length} active savings {goals.length === 1 ? 'goal' : 'goals'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <PiggyBank className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
          <p>Loading savings goals...</p>
        </div>
      ) : goals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {goals.map((g) => {
            const Icon = categoryIcons[g.category] || categoryIcons.Other;
            const pct = g.progressPercentage || 0;
            const isDone = g.isCompleted;

            return (
              <div
                key={g._id}
                className={`p-5 rounded-3xl bg-white dark:bg-[#131B2E] border transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col justify-between ${
                  isDone ? 'border-emerald-500/50 dark:border-emerald-500/30' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex items-center gap-1">
                      {isDone ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Goal Hit!</span>
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {g.daysRemaining} days left
                        </span>
                      )}

                      <button
                        onClick={() => setDeleteTarget(g)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 ml-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                    {g.title}
                  </h3>
                  {g.notes && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {g.notes}
                    </p>
                  )}

                  {/* Amounts */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Saved so far</span>
                      <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                        {formatINR(g.currentAmount)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Target</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {formatINR(g.targetAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2.5 space-y-1">
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-600'
                        }`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                      <span>{pct}% complete</span>
                      <span>Target: {formatDate(g.targetDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions: Deposit / Withdraw Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                  <button
                    onClick={() => setFundsModal({ open: true, goal: g, action: 'deposit' })}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Deposit (₹)</span>
                  </button>

                  <button
                    onClick={() => setFundsModal({ open: true, goal: g, action: 'withdraw' })}
                    disabled={Number(g.currentAmount) <= 0}
                    className="flex-1 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-1"
                  >
                    <ArrowDownLeft className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 p-8">
          <PiggyBank className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No savings goals set yet
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Saving for a new laptop, exam fees, or a college road trip? Create your first savings goal and track your milestone progress!
          </p>
          <button
            onClick={() => setIsAddOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      )}

      {/* New Goal Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Create Savings Goal
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGoal} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M2 MacBook / Placement Laptop, Goa Trip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Target Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 50000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Initial Deposit (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={initialSaved}
                    onChange={(e) => setInitialSaved(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    required
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {goalCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Notes
                </label>
                <textarea
                  rows="2"
                  placeholder="Motivation or specifications..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingGoal}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
                >
                  {savingGoal ? 'Saving...' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit / Withdraw Modal */}
      {fundsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <h3 className="font-bold text-base text-slate-900 dark:text-white capitalize">
              {fundsModal.action} Money
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Target: <strong className="text-slate-200">{fundsModal.goal?.title}</strong>
            </p>

            <form onSubmit={handleFundsSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  placeholder="0.00"
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFundsModal({ open: false, goal: null, action: 'deposit' })}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={fundsLoading}
                  className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-all ${
                    fundsModal.action === 'deposit'
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {fundsLoading ? 'Processing...' : `Confirm ${fundsModal.action}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Goal Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Savings Goal?"
        message={`Are you sure you want to remove the goal "${deleteTarget?.title}"?`}
      />

    </div>
  );
};
