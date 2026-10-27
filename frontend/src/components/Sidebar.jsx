import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  PiggyBank,
  RefreshCw,
  Calendar,
  Settings,
  ChevronRight,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ activeTab, onSelectTab, isMobileOpen, setIsMobileOpen }) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ArrowLeftRight },
    { id: 'budgets', label: 'Budgets', icon: PieChart },
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'savings', label: 'Savings Goals', icon: PiggyBank },
    { id: 'recurring', label: 'Recurring & Allowance', icon: RefreshCw },
    { id: 'calendar', label: 'Calendar View', icon: Calendar },
    { id: 'settings', label: 'Profile & Settings', icon: Settings },
  ];

  const handleSelect = (id) => {
    onSelectTab(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-[#0B0F17] border-r border-slate-200 dark:border-slate-800 p-4 z-40 transition-transform duration-300 ease-in-out overflow-y-auto ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Student Mini Profile Chip */}
        <div className="mb-6 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 dark:bg-indigo-400/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Student Profile</p>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
              {user?.name || 'Student'}
            </p>
            <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold truncate">
              {user?.college || 'College'}
            </p>
          </div>
        </div>

        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Finance Menu
          </p>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
              </button>
            );
          })}
        </div>

        {/* Quick Tips footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200">💡 Student Tip</span>
            <p className="text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Tracking small daily chai & canteen spends helps save up to ₹1,500 every semester!
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
