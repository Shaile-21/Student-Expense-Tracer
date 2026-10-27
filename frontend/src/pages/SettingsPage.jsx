import React, { useState, useEffect } from 'react';
import {
  User,
  GraduationCap,
  IndianRupee,
  Lock,
  Sun,
  Moon,
  Database,
  Download,
  RotateCcw,
  Save,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { formatINR } from '../utils/formatters';

export const SettingsPage = () => {
  const { user, token, updateUser, seedDemo, showToast } = useAuth();
  const { theme, setTheme } = useTheme();

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [college, setCollege] = useState(user?.college || '');
  const [monthlyAllowance, setMonthlyAllowance] = useState(String(user?.monthlyAllowance || 8000));
  const [pocketMoneyDay, setPocketMoneyDay] = useState(String(user?.pocketMoneyDay || 1));
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // DB status state
  const [dbStatus, setDbStatus] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setCollege(user.college || '');
      setMonthlyAllowance(String(user.monthlyAllowance || 8000));
      setPocketMoneyDay(String(user.pocketMoneyDay || 1));
    }

    const checkDb = async () => {
      try {
        const res = await fetch('/api/health');
        const data = await res.json();
        setDbStatus(data.database);
      } catch (e) {
        // quiet
      }
    };
    checkDb();
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          college: college.trim(),
          monthlyAllowance: Number(monthlyAllowance),
          pocketMoneyDay: Number(pocketMoneyDay),
          themePreference: theme
        })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update profile');

      updateUser(data.user);
      showToast('Profile and allowance settings updated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to update password');

      showToast('Password updated successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleBackupExport = async () => {
    try {
      const [trans, budgets, goals, recurring] = await Promise.all([
        fetch('/api/transactions', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/budgets/history', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/savings-goals', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/recurring', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json())
      ]);

      const backupData = {
        exportedAt: new Date().toISOString(),
        user,
        transactions: trans.data || [],
        budgets: budgets.data || [],
        savingsGoals: goals.data || [],
        recurringExpenses: recurring.data?.recurringExpenses || []
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `student-expense-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast('All expense data exported as JSON backup!', 'success');
    } catch (err) {
      showToast('Failed to export backup data', 'error');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-4xl">
      
      {/* Header bar */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Profile & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your allowance settings, security credentials, appearance, and demo data
        </p>
      </div>

      {/* Profile & Allowance Configuration */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-500 flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Student Information & Allowance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Affects your pocket-money countdown and recommended daily limits
            </p>
          </div>
        </div>

        <form onSubmit={handleProfileSubmit} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                College / University
              </label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Monthly Allowance (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  required
                  value={monthlyAllowance}
                  onChange={(e) => setMonthlyAllowance(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Allowance Date of Month
              </label>
              <input
                type="number"
                min="1"
                max="31"
                required
                value={pocketMoneyDay}
                onChange={(e) => setPocketMoneyDay(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={profileSaving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{profileSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Appearance Theme Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-base text-slate-900 dark:text-white">
          Appearance & Theme
        </h3>

        <div className="grid grid-cols-2 gap-3 max-w-sm">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
              theme === 'light'
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-600 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-bold">Light Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-3.5 rounded-2xl border text-center flex flex-col items-center gap-2 transition-all ${
              theme === 'dark'
                ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-400 ring-2 ring-indigo-500/20'
                : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            <Moon className="w-5 h-5 text-indigo-400" />
            <span className="text-xs font-bold">Dark Mode</span>
          </button>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-500 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Security & Password
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update your account password
            </p>
          </div>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-3.5 pt-1 max-w-md">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={passwordSaving}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all"
          >
            {passwordSaving ? 'Updating...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Database Status & Demo Data Tools */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-slate-800 text-emerald-500 flex items-center justify-center">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Data Management & Demo Utilities
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Database status and sample test datasets
            </p>
          </div>
        </div>

        {dbStatus && (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700 dark:text-slate-200">Database Engine:</span>
              <span className="font-semibold text-indigo-500">{dbStatus.dbType}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400">
              {dbStatus.message}
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={() => seedDemo(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Seed Fresh Student Demo Data</span>
          </button>

          <button
            onClick={handleBackupExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-emerald-500" />
            <span>Download All Data (JSON Backup)</span>
          </button>
        </div>
      </div>

    </div>
  );
};
