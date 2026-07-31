import React from "react";
import { Target, CheckCircle2, AlertTriangle, ArrowDownRight, ArrowUpRight, Sparkles } from "lucide-react";

export default function MonthlyProgressWidget({ monthlyProgress, loading = false }) {
  const defaultProgress = {
    monthlyTargetKg: 150.0,
    currentMonthTotalKg: 84.5,
    previousMonthTotalKg: 98.0,
    percentComplete: 56.3,
    remainingAllowanceKg: 65.5,
    percentChangeVsLastMonth: -13.8,
  };

  const data = monthlyProgress || defaultProgress;

  const {
    monthlyTargetKg = 150.0,
    currentMonthTotalKg = 84.5,
    percentComplete = 56.3,
    remainingAllowanceKg = 65.5,
    percentChangeVsLastMonth = -13.8,
  } = data;

  const isReduced = percentChangeVsLastMonth <= 0;

  if (loading) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl border border-slate-200/60 dark:border-emerald-900/40 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-full w-full" />
        <div className="grid grid-cols-3 gap-2">
          <div className="h-10 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
          <div className="h-10 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
          <div className="h-10 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-emerald-900/40 p-6 shadow-sm hover:shadow-md transition duration-300 space-y-5 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shadow-sm">
            <Target size={18} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Monthly Cumulative Target Progress
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">Track carbon budget allowance for the current month</p>
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-[10px] font-black border flex items-center gap-1 ${
          isReduced
            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
            : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/50"
        }`}>
          {isReduced ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
          <span>{Math.abs(percentChangeVsLastMonth)}% vs last month</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles size={14} className="text-emerald-600 dark:text-emerald-400" />
            Monthly Allowance Budget
          </span>
          <span className="font-black text-emerald-800 dark:text-emerald-300 text-sm">
            {percentComplete.toFixed(1)}% Used
          </span>
        </div>

        <div className="h-4 w-full bg-slate-100 dark:bg-slate-800/60 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
          <div
            className={`h-full rounded-full transition-all duration-1000 shadow-sm ${
              percentComplete > 85
                ? "bg-rose-500"
                : percentComplete > 70
                ? "bg-amber-500"
                : "bg-gradient-to-r from-emerald-600 to-teal-500"
            }`}
            style={{ width: `${Math.min(100, percentComplete)}%` }}
          />
        </div>
      </div>

      {/* Breakdown Cards */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-3 text-center space-y-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logged</p>
          <p className="text-base font-black text-emerald-700 dark:text-emerald-400">{currentMonthTotalKg.toFixed(1)} kg</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800 rounded-2xl p-3 text-center space-y-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Cap</p>
          <p className="text-base font-black text-slate-900 dark:text-white">{monthlyTargetKg.toFixed(1)} kg</p>
        </div>

        <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl p-3 text-center space-y-0.5">
          <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Remaining</p>
          <p className="text-base font-black text-emerald-600 dark:text-emerald-300">{remainingAllowanceKg.toFixed(1)} kg</p>
        </div>
      </div>
    </div>
  );
}
