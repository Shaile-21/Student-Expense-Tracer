// Format amount in Indian Rupees (INR)
export const formatINR = (amount, includeDecimals = false) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '₹0';
  const num = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: includeDecimals ? 2 : 0,
    minimumFractionDigits: includeDecimals ? 2 : 0
  }).format(num);
};

// Compact Indian format e.g. ₹15K, ₹1.5L
export const formatCompactINR = (amount) => {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '₹0';
  const num = Number(amount);
  if (Math.abs(num) >= 10000000) {
    return `₹${(num / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(num) >= 100000) {
    return `₹${(num / 100000).toFixed(1)}L`;
  }
  if (Math.abs(num) >= 1000) {
    return `₹${(num / 1000).toFixed(1)}K`;
  }
  return `₹${num}`;
};

// Format date into standard Indian format (e.g. "15 Oct 2024")
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

// Friendly relative date format
export const formatRelativeDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  const now = new Date();
  
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return formatDate(dateInput);
};

// Category style & color config
export const categoryMeta = {
  Food: { color: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900', badge: 'bg-red-500' },
  Transport: { color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900', badge: 'bg-amber-500' },
  Education: { color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900', badge: 'bg-blue-500' },
  Accommodation: { color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900', badge: 'bg-purple-500' },
  Shopping: { color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900', badge: 'bg-pink-500' },
  Entertainment: { color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900', badge: 'bg-emerald-500' },
  Bills: { color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900', badge: 'bg-cyan-500' },
  Healthcare: { color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900', badge: 'bg-teal-500' },
  Other: { color: 'text-slate-500 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700', badge: 'bg-slate-500' },
  // Income
  'Monthly allowance': { color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900', badge: 'bg-emerald-500' },
  Scholarship: { color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900', badge: 'bg-emerald-600' },
  'Part-time job': { color: 'text-green-500 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900', badge: 'bg-green-500' },
  Freelancing: { color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900', badge: 'bg-teal-500' },
  'Family support': { color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900', badge: 'bg-emerald-500' },
  'Other income': { color: 'text-slate-500 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700', badge: 'bg-slate-500' }
};
