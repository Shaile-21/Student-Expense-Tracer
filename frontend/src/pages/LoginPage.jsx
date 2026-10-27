import React, { useState } from 'react';
import { Wallet, Lock, Mail, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = ({ onSwitchToRegister, onBackToLanding }) => {
  const { login, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async () => {
    setError('');
    try {
      await loginAsDemo();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F17] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-[#131B2E] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div
            onClick={onBackToLanding}
            className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            <Wallet className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-4">
            Welcome Back!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Log in to manage your campus expenses & budgets
          </p>
        </div>

        {/* Demo Account Button */}
        <button
          type="button"
          onClick={handleDemoClick}
          className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-amber-500/25 active:scale-95 transition-all mb-5 shadow-sm"
        >
          <Zap className="w-4 h-4 fill-amber-500" />
          <span>⚡ Try Demo Account with 1-Click (No Password Needed)</span>
        </button>

        <div className="relative flex items-center justify-center mb-5">
          <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
          <span className="bg-white dark:bg-[#131B2E] px-3 text-[11px] text-slate-400 uppercase font-semibold">
            Or sign in with email
          </span>
        </div>

        {error && (
          <div className="p-3 mb-4 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. rahul.sharma@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
          >
            {loading && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>}
            <span>Sign In to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have an account yet?{' '}
          <button
            onClick={onSwitchToRegister}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Register for Free
          </button>
        </div>

      </div>
    </div>
  );
};
