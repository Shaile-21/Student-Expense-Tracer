import React from 'react';
import { Sparkles, Calendar, TrendingDown, ShieldAlert } from 'lucide-react';
import { formatINR } from '../utils/formatters';

export const PocketMoneyBanner = ({ pocketMoney }) => {
  if (!pocketMoney) return null;

  const {
    monthlyAllowance,
    daysUntilAllowance,
    pocketMoneyRemaining,
    recommendedDailyLimit,
    daysLeftInMonth
  } = pocketMoney;

  return (
    <div className="p-5 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900/40 border border-indigo-500/20 backdrop-blur-md relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left info */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Student Pocket-Money Tracker
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {daysUntilAllowance} {daysUntilAllowance === 1 ? 'day' : 'days'} left
              </span>
            </div>
            <p className="text-lg font-extrabold text-white mt-0.5">
              {formatINR(pocketMoneyRemaining)} <span className="text-xs font-normal text-slate-300">left until next allowance</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Monthly allowance: {formatINR(monthlyAllowance)} • {daysLeftInMonth} days remaining this month
            </p>
          </div>
        </div>

        {/* Right Recommended Daily Limit Widget */}
        <div className="flex items-center gap-4 bg-slate-900/60 border border-slate-700/60 p-3.5 rounded-2xl self-start md:self-auto">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">
              Safe Daily Spend Limit
            </span>
            <span className="text-lg font-black text-emerald-400">
              {formatINR(recommendedDailyLimit)} <span className="text-[11px] font-normal text-slate-400">/ day</span>
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
