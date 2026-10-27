import React from 'react';
import {
  Wallet,
  TrendingUp,
  PieChart,
  ShieldCheck,
  PiggyBank,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Smartphone,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LandingPage = ({ onGetStarted, onLogin }) => {
  const { loginAsDemo } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Navigation */}
      <nav className="border-b border-slate-100 dark:border-slate-800/80 sticky top-0 z-40 bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              StudentExpense
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loginAsDemo}
              className="text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-colors hidden sm:block"
            >
              ⚡ Instant Demo
            </button>
            <button
              onClick={onLogin}
              className="text-xs sm:text-sm font-semibold px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="text-xs sm:text-sm font-semibold px-4 py-2 rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 active:scale-95 transition-all"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        {/* Glow backdrop circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Designed specifically for Indian College Students</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Master your allowance. <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Stop running out of money.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            The smart fintech tracker built for campus life. Track UPI payments, monitor canteen & mess spends, receive 80% budget warnings, and hit your laptop savings goals.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={loginAsDemo}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-800 dark:text-white font-bold text-base border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Explore Live Demo (1-Click)</span>
            </button>
          </div>

          {/* Key perks strip */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% Free for Students
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Native Indian Rupee (₹) & UPI Support
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Works Offline & Persists Seamlessly
            </span>
          </div>

          {/* Product Preview Mockup Card */}
          <div className="mt-16 max-w-5xl mx-auto rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-4 sm:p-6 text-left relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-xs text-slate-400 ml-2 font-mono">dashboard.studentexpense.app</span>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ● Live Student System
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <p className="text-xs text-slate-400 font-medium">Monthly Allowance</p>
                <p className="text-2xl font-black text-white mt-1">₹8,000</p>
                <p className="text-xs text-emerald-400 mt-1">₹5,400 remaining this month</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <p className="text-xs text-slate-400 font-medium">Safe Daily Spending</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">₹360 / day</p>
                <p className="text-xs text-slate-400 mt-1">Calculated from 15 days left</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <p className="text-xs text-slate-400 font-medium">Savings Goal: Coding Laptop</p>
                <p className="text-2xl font-black text-indigo-400 mt-1">45%</p>
                <div className="w-full bg-slate-700 h-2 rounded-full mt-2 overflow-hidden">
                  <div className="bg-indigo-500 h-full w-[45%]" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-20 bg-slate-50 dark:bg-[#0d1424] border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Everything a student needs to survive & save
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm sm:text-base">
              No complicated banking jargon or spreadsheets. Just clear, beautiful insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Pocket-Money Tracker</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Know exactly how many days remain until your parents send your next monthly allowance, with an automatic safe daily limit.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
                <PieChart className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">80% Budget Warnings</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Set category budgets for Food, Transport, and Entertainment. Get amber alerts at 80% and red alarms if you exceed your ceiling.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                <PiggyBank className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Student Savings Goals</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Save towards a new laptop, semester fees, or Goa trip with roommates. Watch progress bars climb with celebration confetti on completion!
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Smart Saving Insights</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Rule engine automatically alerts you when food or impulse shopping consumes too much of your cash, offering practical campus tips.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Calendar Expense View</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Visualize daily spending on a full interactive calendar. Spot high-spending weekends and quiet weekdays at a glance.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Export to CSV & Reports</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Need to submit receipts to parents or track for hostel accounting? One-click export to CSV with dates, notes, and payment methods.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        <p>© 2026 Student Expense Tracker. Designed with React, Tailwind CSS, Node.js & MongoDB.</p>
        <p className="mt-1">Built with ❤️ for College Students across India.</p>
      </footer>

    </div>
  );
};
