import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Download,
  PlusCircle,
  Edit2,
  Trash2,
  Calendar,
  CreditCard,
  Tag,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ConfirmModal } from '../components/ConfirmModal';
import { formatINR, formatDate, categoryMeta } from '../utils/formatters';

export const TransactionsPage = ({ onAddClick, onEditClick, refreshKey }) => {
  const { token, showToast } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedMethod, setSelectedMethod] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totals, setTotals] = useState({ income: 0, expense: 0, net: 0 });

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const categories = [
    'All',
    'Food',
    'Transport',
    'Education',
    'Accommodation',
    'Shopping',
    'Entertainment',
    'Bills',
    'Healthcare',
    'Monthly allowance',
    'Scholarship',
    'Part-time job',
    'Freelancing',
    'Family support',
    'Other'
  ];

  const paymentMethods = ['All', 'UPI', 'Cash', 'Debit Card', 'Credit Card', 'Net Banking', 'Other'];

  const fetchTransactions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedMethod !== 'All') params.append('paymentMethod', selectedMethod);
      if (selectedType !== 'All') params.append('type', selectedType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);

      const res = await fetch(`/api/transactions?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setTransactions(data.data || []);
        if (data.totals) setTotals(data.totals);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [token, search, selectedCategory, selectedMethod, selectedType, startDate, endDate, sortBy, sortOrder, refreshKey]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/transactions/${deleteTarget._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast('Transaction deleted successfully', 'info');
        setDeleteTarget(null);
        fetchTransactions();
      } else {
        throw new Error(data.message || 'Failed to delete');
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'All') params.append('category', selectedCategory);
    if (selectedType !== 'All') params.append('type', selectedType);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    // Direct download trigger
    fetch(`/api/transactions/export/csv?${params.toString()}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `student-expenses-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        showToast('Transactions exported to CSV successfully!', 'success');
      })
      .catch(() => showToast('Failed to export CSV', 'error'));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, filter, categorize, and export your college expenses and allowances
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-sm transition-all"
            title="Export filtered records to Excel/CSV"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onAddClick}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Record Entry</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        
        {/* Top search & type filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Search box */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title (e.g. Canteen, Metro, Book)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Type tabs (All / Expenses / Income) */}
          <div className="md:col-span-4 flex rounded-xl bg-slate-100 dark:bg-slate-900/80 p-1">
            {['All', 'expense', 'income'].map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  selectedType === t
                    ? 'bg-white dark:bg-indigo-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t === 'expense' ? 'Expenses' : t === 'income' ? 'Income' : 'All'}
              </button>
            ))}
          </div>

          {/* Sort By Toggle */}
          <div className="md:col-span-3 flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
              <option value="title">Sort by Title</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Second row: Category, Payment Method, Date Range */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Payment Method
            </label>
            <select
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
            >
              {paymentMethods.map(pm => (
                <option key={pm} value={pm}>{pm}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

      </div>

      {/* Summary Chips for Filtered Query */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-medium">
          Showing <strong className="text-slate-900 dark:text-white">{transactions.length}</strong> entries
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-semibold border border-rose-200 dark:border-rose-900/60">
          Total Spent: {formatINR(totals.expense)}
        </span>
        <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-200 dark:border-emerald-900/60">
          Total Income: {formatINR(totals.income)}
        </span>
      </div>

      {/* Transactions Table & List Card */}
      <div className="rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <span className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin inline-block mb-2"></span>
            <p>Loading transactions...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50 dark:bg-slate-900/40">
                  <th className="py-3.5 px-4 sm:px-6">Description</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
                {transactions.map((t) => {
                  const meta = categoryMeta[t.category] || categoryMeta.Other;
                  const isExp = t.type === 'expense';

                  return (
                    <tr
                      key={t._id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Description + Notes */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {t.title}
                        </div>
                        {t.notes && (
                          <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                            {t.notes}
                          </div>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${meta.badge}`} />
                          {t.category}
                        </span>
                      </td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs font-medium text-slate-500 dark:text-slate-400">
                        {t.paymentMethod}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(t.date)}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <span className={`font-extrabold text-sm ${isExp ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          {isExp ? '-' : '+'} {formatINR(t.amount)}
                        </span>
                      </td>

                      {/* Actions: Edit & Delete */}
                      <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditClick(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            title="Edit Transaction"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(t)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Delete Transaction"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center">
            <Tag className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              No matching transactions found
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search keywords, filters, or record a new transaction!
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Transaction?"
        message={`Are you sure you want to permanently delete "${deleteTarget?.title}" (${formatINR(deleteTarget?.amount)})? Your balances and budget charts will recalculate automatically.`}
      />

    </div>
  );
};
