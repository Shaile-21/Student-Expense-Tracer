import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  PlusCircle,
  Calendar,
  CheckCircle,
  PauseCircle,
  PlayCircle,
  Trash2,
  Sparkles,
  CreditCard,
  IndianRupee,
  Clock,
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatINR, formatDate } from '../utils/formatters';

export const RecurringPage = ({ refreshKey }) => {
  const { token, user, showToast } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add recurring modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Accommodation');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [frequency, setFrequency] = useState('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categories = ['Accommodation', 'Food', 'Bills', 'Entertainment', 'Transport', 'Education', 'Shopping', 'Other'];

  const fetchRecurring = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/recurring', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setData(json.data);
      }
    } catch (err) {
      console.error('Error fetching recurring:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecurring();
  }, [token, refreshKey]);

  const handleToggle = async (id) => {
    try {
      const res = await fetch(`/api/recurring/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(resJson.message, 'info');
        fetchRecurring();
      }
    } catch (err) {
      showToast('Failed to toggle status', 'error');
    }
  };

  const handlePayNow = async (id, title) => {
    try {
      const res = await fetch(`/api/recurring/${id}/pay`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(`Recorded payment for ${title}!`, 'success');
        fetchRecurring();
      }
    } catch (err) {
      showToast('Failed to process payment', 'error');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title || !amount || !nextDueDate) return;

    setSaving(true);
    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title.trim(),
          amount: Number(amount),
          category,
          paymentMethod,
          frequency,
          nextDueDate,
          notes: notes.trim()
        })
      });
      const resJson = await res.json();
      if (!resJson.success) throw new Error(resJson.message || 'Failed to create');

      showToast(`Recurring expense "${title}" added!`, 'success');
      setIsAddOpen(false);
      setTitle('');
      setAmount('');
      setNextDueDate('');
      setNotes('');
      fetchRecurring();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/recurring/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Recurring expense deleted', 'info');
        setDeleteTarget(null);
        fetchRecurring();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const pm = data?.pocketMoney;
  const recurringList = data?.recurringExpenses || [];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Pocket Money & Recurring Payments
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Stay on top of mess fees, hostel rent, subscriptions, and allowance scheduling
          </p>
        </div>

        <button
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 active:scale-95 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Recurring Bill</span>
        </button>
      </div>

      {/* Pocket Money Deep Card */}
      {pm && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-500 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Monthly Allowance Countdown & Daily Safe Spending
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Scheduled allowance received on the {pm.allowanceDay}st/th of each month
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block">Monthly Allowance</span>
              <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                {formatINR(pm.monthlyAllowance)}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                Spent so far: {formatINR(pm.currentMonthExpense)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block">Pocket Money Remaining</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                {formatINR(pm.pocketMoneyRemaining)}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                For the next {pm.daysUntilAllowance} days
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/40">
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block">Safe Daily Limit</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                {formatINR(pm.recommendedDailyLimit)} <span className="text-xs font-normal">/ day</span>
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                Keeps you funded until next refill
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block">Monthly Recurring Total</span>
              <span className="text-xl font-black text-slate-900 dark:text-white mt-1 block">
                {formatINR(pm.totalMonthlyRecurring)}
              </span>
              <span className="text-xs text-slate-400 mt-1 block">
                Committed mess, WiFi, rent
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Commitments List */}
      <div className="rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Scheduled Regular Payments
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Automatic tracking for mess fees, rent, mobile recharges, and streaming subscriptions
            </p>
          </div>
        </div>

        {recurringList.length > 0 ? (
          <div className="space-y-3">
            {recurringList.map((r) => (
              <div
                key={r._id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  r.isActive
                    ? 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800'
                    : 'bg-slate-100/40 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-slate-800 text-indigo-500 flex items-center justify-center font-bold text-xs flex-shrink-0">
                    <RefreshCw className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        {r.title}
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
                        {r.frequency}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-400'
                      }`}>
                        {r.isActive ? 'Active' : 'Paused'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 mt-0.5">
                      {r.category} • Method: {r.paymentMethod} • Next Due: <strong className="text-slate-700 dark:text-slate-300">{formatDate(r.nextDueDate)}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center">
                  <span className="text-base font-extrabold text-slate-900 dark:text-white">
                    {formatINR(r.amount)}
                  </span>

                  {/* Actions: Pay Now, Pause/Resume, Delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handlePayNow(r._id, r.title)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                      title="Instantly log this payment into Transactions"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Pay Now</span>
                    </button>

                    <button
                      onClick={() => handleToggle(r._id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                      title={r.isActive ? 'Pause recurring' : 'Activate recurring'}
                    >
                      {r.isActive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4 text-emerald-500" />}
                    </button>

                    <button
                      onClick={() => setDeleteTarget(r)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No recurring payments configured. Click "Add Recurring Bill" to add your mess dues, hostel rent, or subscriptions!
          </div>
        )}
      </div>

      {/* Add Recurring Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Add Recurring Expense
              </h3>
              <button onClick={() => setIsAddOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3.5 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Bill / Expense Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hostel Mess Fees, Room Rent, Spotify"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="2500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Frequency
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Next Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Notes / Payee Details
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI to warden, pay before 5th"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
                >
                  {saving ? 'Adding...' : 'Save Commitment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Recurring Bill?"
        message={`Are you sure you want to stop tracking "${deleteTarget?.title}"?`}
      />

    </div>
  );
};
