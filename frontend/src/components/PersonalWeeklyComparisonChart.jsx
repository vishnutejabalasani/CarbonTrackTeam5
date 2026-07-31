import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { TrendingUp, ArrowUpRight, ArrowDownRight, Calendar } from "lucide-react";

function ComparisonTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const current = payload.find((p) => p.dataKey === "currentWeekEmissions")?.value || 0;
    const previous = payload.find((p) => p.dataKey === "previousWeekEmissions")?.value || 0;
    const diff = current - previous;
    const isHigher = diff > 0;

    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-emerald-900/50 rounded-2xl p-3.5 shadow-xl text-xs space-y-2">
        <p className="font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
          <Calendar size={13} className="text-emerald-600 dark:text-emerald-400" />
          {label} (Week Comparison)
        </p>

        <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
              Current Week:
            </span>
            <span className="font-black text-emerald-800 dark:text-emerald-300">{current.toFixed(1)} kg CO₂</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400 inline-block" />
              Previous Week:
            </span>
            <span className="font-bold text-slate-600 dark:text-slate-300">{previous.toFixed(1)} kg CO₂</span>
          </div>
        </div>

        <div className={`pt-1 text-[10px] font-extrabold flex items-center gap-1 ${isHigher ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"}`}>
          {isHigher ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
          <span>{Math.abs(diff).toFixed(1)} kg CO₂ {isHigher ? "higher" : "lower"} than previous week</span>
        </div>
      </div>
    );
  }
  return null;
}

export default function PersonalWeeklyComparisonChart({ data = [], loading = false }) {
  const defaultData = [
    { day: "Mon", currentWeekEmissions: 4.2, previousWeekEmissions: 5.0 },
    { day: "Tue", currentWeekEmissions: 5.1, previousWeekEmissions: 5.8 },
    { day: "Wed", currentWeekEmissions: 3.8, previousWeekEmissions: 4.2 },
    { day: "Thu", currentWeekEmissions: 4.5, previousWeekEmissions: 5.2 },
    { day: "Fri", currentWeekEmissions: 6.0, previousWeekEmissions: 6.5 },
    { day: "Sat", currentWeekEmissions: 3.2, previousWeekEmissions: 4.0 },
    { day: "Sun", currentWeekEmissions: 2.9, previousWeekEmissions: 3.5 },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  const currentTotal = chartData.reduce((acc, curr) => acc + (curr.currentWeekEmissions || 0), 0);
  const previousTotal = chartData.reduce((acc, curr) => acc + (curr.previousWeekEmissions || 0), 0);
  const percentDiff = previousTotal > 0 ? (((currentTotal - previousTotal) / previousTotal) * 100).toFixed(1) : 0;
  const isReduced = currentTotal <= previousTotal;

  if (loading) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/80 rounded-3xl border border-slate-200/60 dark:border-emerald-900/40 p-6 shadow-sm animate-pulse h-80 flex flex-col justify-between">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
        <div className="h-48 bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-emerald-900/40 p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={18} />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
              Weekly Footprint Trend (Current vs Previous Week)
            </h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Direct day-by-day comparison of daily carbon emissions
          </p>
        </div>

        <div className={`px-3 py-1 rounded-full text-[10px] font-black border flex items-center gap-1.5 w-fit ${
          isReduced
            ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50"
            : "bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800/50"
        }`}>
          {isReduced ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
          <span>{Math.abs(percentDiff)}% {isReduced ? "Footprint Reduction" : "Increase vs last week"}</span>
        </div>
      </div>

      <div className="h-64 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="currentWeekGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} style={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} />
            <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} />
            <Tooltip content={<ComparisonTooltip />} />
            
            {/* Previous Week (Dashed Line) */}
            <Area
              type="monotone"
              dataKey="previousWeekEmissions"
              name="Previous Week"
              stroke="#94a3b8"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={0}
            />

            {/* Current Week (Solid Green Line with Gradient Fill) */}
            <Area
              type="monotone"
              dataKey="currentWeekEmissions"
              name="Current Week"
              stroke="#2E7D32"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#currentWeekGrad)"
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend Footer */}
      <div className="flex items-center justify-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 shadow-sm" />
          <span className="text-slate-800 dark:text-slate-200">Current Week ({currentTotal.toFixed(1)} kg)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full border-2 border-slate-400 border-dashed" />
          <span className="text-slate-500 dark:text-slate-400">Previous Week ({previousTotal.toFixed(1)} kg)</span>
        </div>
      </div>
    </div>
  );
}
