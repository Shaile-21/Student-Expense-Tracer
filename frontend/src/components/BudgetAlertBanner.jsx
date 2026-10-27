import React from 'react';
import { AlertCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const BudgetAlertBanner = ({ budgetData, onManageBudget }) => {
  if (!budgetData) return null;

  const { isWarning, isExceeded, totalSpent, monthlyLimit, overallPercentage, month } = budgetData;

  if (!isWarning && !isExceeded) return null;

  return (
    <div
      className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-300 ${
        isExceeded
          ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
          : 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isExceeded
              ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
              : 'bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400'
          }`}
        >
          {isExceeded ? <AlertCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>

        <div>
          <h4 className="text-sm font-bold">
            {isExceeded
              ? `Budget Exceeded for ${month}!`
              : `Warning: ${overallPercentage}% of Budget Spent`}
          </h4>
          <p className="text-xs opacity-90 mt-0.5">
            {isExceeded
              ? `You have spent ${formatINR(totalSpent)} out of your ${formatINR(monthlyLimit)} limit by ${formatINR(totalSpent - monthlyLimit)}.`
              : `You have spent ${formatINR(totalSpent)} of your ${formatINR(monthlyLimit)} limit. Slow down spending to stay on track.`}
          </p>
        </div>
      </div>

      {onManageBudget && (
        <button
          onClick={onManageBudget}
          className={`self-start sm:self-auto text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1 transition-all active:scale-95 whitespace-nowrap ${
            isExceeded
              ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
              : 'bg-amber-600 text-white border-amber-700 hover:bg-amber-700'
          }`}
        >
          <span>Adjust Budget</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
