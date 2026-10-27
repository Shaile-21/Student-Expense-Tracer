import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  X,
  PlusCircle,
  Tag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { formatINR, formatDate, categoryMeta } from '../utils/formatters';

export const CalendarPage = ({ onQuickAdd, refreshKey }) => {
  const { token } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed
  const monthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  const fetchCalendar = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/analytics/calendar?month=${monthStr}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCalendarData(data.days || []);
      }
    } catch (err) {
      console.error('Error fetching calendar:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [token, monthStr, refreshKey]);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(null);
  };

  // Build calendar matrix
  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sun, 1 is Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Offset so Monday is day 0
  const startOffset = (firstDayOfWeek + 6) % 7;
  const totalSlots = Math.ceil((startOffset + daysInMonth) / 7) * 7;

  const monthName = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  // Map calendar data by day number
  const dayDataMap = {};
  calendarData.forEach(d => {
    dayDataMap[d.dayNumber] = d;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Calendar Expense View
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Day-by-day heatmap of your daily spending and allowance credits
          </p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center gap-2 bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 p-1.5 rounded-2xl shadow-sm self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-900 dark:text-white px-3">
            {monthName}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div className="text-indigo-500">Sat</div>
          <div className="text-indigo-500">Sun</div>
        </div>

        {/* Calendar slots */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {Array.from({ length: totalSlots }).map((_, idx) => {
            const dayNum = idx - startOffset + 1;
            const isValid = dayNum > 0 && dayNum <= daysInMonth;
            const dayRecord = isValid ? dayDataMap[dayNum] : null;
            const hasExpense = dayRecord && dayRecord.expense > 0;
            const hasIncome = dayRecord && dayRecord.income > 0;
            const isToday =
              isValid &&
              new Date().toDateString() === new Date(year, month, dayNum).toDateString();
            const isSelected = selectedDay && selectedDay.dayNumber === dayNum;

            if (!isValid) {
              return (
                <div
                  key={idx}
                  className="min-h-[70px] sm:min-h-[90px] rounded-2xl bg-slate-50/40 dark:bg-slate-900/20 border border-transparent"
                />
              );
            }

            return (
              <div
                key={idx}
                onClick={() => setSelectedDay(dayRecord)}
                className={`min-h-[70px] sm:min-h-[90px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40'
                    : isToday
                    ? 'border-indigo-400/80 bg-slate-50/80 dark:bg-slate-900/60 shadow-sm'
                    : 'border-slate-200/70 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                      isToday
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {dayNum}
                  </span>

                  {dayRecord?.transactions?.length > 0 && (
                    <span className="text-[10px] font-semibold px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 hidden sm:inline">
                      {dayRecord.transactions.length}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 mt-1">
                  {hasIncome && (
                    <div className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
                      +{formatINR(dayRecord.income)}
                    </div>
                  )}
                  {hasExpense && (
                    <div className="text-[10px] sm:text-[11px] font-extrabold text-rose-600 dark:text-rose-400 truncate">
                      -{formatINR(dayRecord.expense)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Selected Day Details Drawer */}
      {selectedDay && (
        <div className="p-6 rounded-3xl bg-white dark:bg-[#131B2E] border border-slate-200 dark:border-slate-800 shadow-md animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                Transactions on {formatDate(selectedDay.date)}
              </h3>
              <p className="text-xs text-slate-400">
                Total spent: {formatINR(selectedDay.expense)} • Total received: {formatINR(selectedDay.income)}
              </p>
            </div>
            <button
              onClick={() => setSelectedDay(null)}
              className="p-1 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {selectedDay.transactions && selectedDay.transactions.length > 0 ? (
              selectedDay.transactions.map((t) => {
                const meta = categoryMeta[t.category] || categoryMeta.Other;
                const isExp = t.type === 'expense';

                return (
                  <div
                    key={t._id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${meta.badge}`} />
                      <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                          {t.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {t.category} • {t.paymentMethod} {t.notes ? `• ${t.notes}` : ''}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-sm font-extrabold ${
                        isExp ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {isExp ? '-' : '+'} {formatINR(t.amount)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-400">
                No transactions recorded on this day.
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
