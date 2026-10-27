import React from 'react';
import { formatINR } from '../utils/formatters';

export const MetricCard = ({ title, amount, subtitle, icon: Icon, trend, variant = 'neutral', badge }) => {
  const variantStyles = {
    income: {
      bg: 'bg-emerald-50/50 dark:bg-emerald-950/20',
      border: 'border-emerald-200/70 dark:border-emerald-900/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400',
      glow: 'hover:shadow-emerald-500/10'
    },
    expense: {
      bg: 'bg-rose-50/50 dark:bg-rose-950/20',
      border: 'border-rose-200/70 dark:border-rose-900/40',
      text: 'text-rose-600 dark:text-rose-400',
      iconBg: 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400',
      glow: 'hover:shadow-rose-500/10'
    },
    primary: {
      bg: 'bg-indigo-50/50 dark:bg-indigo-950/20',
      border: 'border-indigo-200/70 dark:border-indigo-900/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400',
      glow: 'hover:shadow-indigo-500/10'
    },
    warning: {
      bg: 'bg-amber-50/50 dark:bg-amber-950/20',
      border: 'border-amber-200/70 dark:border-amber-900/40',
      text: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400',
      glow: 'hover:shadow-amber-500/10'
    },
    neutral: {
      bg: 'bg-white dark:bg-[#131B2E]',
      border: 'border-slate-200 dark:border-slate-800',
      text: 'text-slate-900 dark:text-white',
      iconBg: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      glow: 'hover:shadow-indigo-500/10'
    }
  };

  const style = variantStyles[variant] || variantStyles.neutral;

  return (
    <div
      className={`p-5 rounded-3xl border transition-all duration-300 shadow-sm hover:shadow-lg ${style.bg} ${style.border} ${style.glow}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${style.iconBg}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${style.text}`}>
          {formatINR(amount)}
        </h3>
        {badge && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {badge}
          </span>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          {trend && (
            <span className={`font-semibold ${trend > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {trend > 0 ? `+${trend}%` : `${trend}%`}
            </span>
          )}
          <span>{subtitle}</span>
        </div>
      )}
    </div>
  );
};
