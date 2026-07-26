import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Calendar, Zap, ArrowUp, ArrowDown, Activity } from "lucide-react";

export default function WeeklyEmissionsChart({ data, loading = false }) {
  const chartData = data?.dailyData || [
    { day: "Mon", emissions: 4.2, transport: 1.5, electricity: 1.8, food: 0.9, shopping: 0.0 },
    { day: "Tue", emissions: 3.8, transport: 1.2, electricity: 1.6, food: 1.0, shopping: 0.0 },
    { day: "Wed", emissions: 5.5, transport: 2.1, electricity: 2.0, food: 0.8, shopping: 0.6 },
    { day: "Thu", emissions: 7.2, transport: 3.2, electricity: 2.5, food: 1.1, shopping: 0.4 },
    { day: "Fri", emissions: 4.8, transport: 2.0, electricity: 1.7, food: 1.1, shopping: 0.0 },
    { day: "Sat", emissions: 2.3, transport: 0.5, electricity: 1.2, food: 0.6, shopping: 0.0 },
    { day: "Sun", emissions: 1.8, transport: 0.2, electricity: 1.0, food: 0.6, shopping: 0.0 },
  ];

  const weeklyTotal = useMemo(
    () => data?.weeklyTotal ?? chartData.reduce((acc, curr) => acc + (curr.emissions || 0), 0).toFixed(1),
    [data, chartData]
  );

  const highestDay = data?.highestDay || "Thu (7.2 kg)";
  const lowestDay = data?.lowestDay || "Sun (1.8 kg)";
  const averageDaily = data?.averageDailyEmissions ?? (weeklyTotal / 7).toFixed(1);

  if (loading) {
    return (
      <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-6 shadow-sm animate-pulse space-y-4">
        <div className="h-6 bg-slate-200 dark:bg-brand-900/40 rounded w-1/3" />
        <div className="h-56 bg-slate-100 dark:bg-brand-900/20 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-6 shadow-sm space-y-6">
      
      {/* Header & Badges */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Activity className="text-emerald-500" size={18} />
            Live Weekly Carbon Emissions
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Real-time breakdown of daily carbon footprint vectors over the past 7 days.
          </p>
        </div>

        {/* Stat Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/50 rounded-xl p-2.5">
            <span className="block text-[9px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Weekly Total</span>
            <span className="text-sm font-black text-emerald-950 dark:text-emerald-200">{weeklyTotal} kg</span>
          </div>

          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-100/50 dark:border-rose-900/50 rounded-xl p-2.5">
            <span className="block text-[9px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wide flex items-center gap-0.5">
              <ArrowUp size={10} /> Highest Day
            </span>
            <span className="text-xs font-extrabold text-rose-950 dark:text-rose-200 truncate block">{highestDay}</span>
          </div>

          <div className="bg-sky-50 dark:bg-sky-950/30 border border-sky-100/50 dark:border-sky-900/50 rounded-xl p-2.5">
            <span className="block text-[9px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wide flex items-center gap-0.5">
              <ArrowDown size={10} /> Lowest Day
            </span>
            <span className="text-xs font-extrabold text-sky-950 dark:text-sky-200 truncate block">{lowestDay}</span>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-100/50 dark:border-amber-900/50 rounded-xl p-2.5">
            <span className="block text-[9px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide">Daily Avg</span>
            <span className="text-sm font-black text-amber-950 dark:text-amber-200">{averageDaily} kg</span>
          </div>
        </div>
      </div>

      {/* Recharts Area / Line Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="emissionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }}
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#64748B" }}
              unit=" kg"
            />

            <Tooltip content={<CustomTooltip />} />

            <Area
              type="monotone"
              dataKey="emissions"
              stroke="#059669"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#emissionsGradient)"
              isAnimationActive={true}
              animationDuration={1200}
              dot={{ r: 4, fill: "#059669", stroke: "#FFFFFF", strokeWidth: 2 }}
              activeDot={{ r: 7, fill: "#047857", stroke: "#A7F3D0", strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white rounded-xl p-3 shadow-xl text-xs space-y-1.5 border border-slate-700 backdrop-blur-md">
        <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
          <span>{label} ({data.date || "Selected Day"})</span>
          <span className="text-white font-extrabold">{data.emissions?.toFixed(1)} kg CO₂e</span>
        </p>
        <div className="space-y-1 text-[10px] text-slate-300">
          <div className="flex justify-between gap-3">
            <span>🚗 Transport:</span>
            <span className="font-bold text-white">{data.transport?.toFixed(1) || 0} kg</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>⚡ Electricity:</span>
            <span className="font-bold text-white">{data.electricity?.toFixed(1) || 0} kg</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>🥗 Food:</span>
            <span className="font-bold text-white">{data.food?.toFixed(1) || 0} kg</span>
          </div>
          <div className="flex justify-between gap-3">
            <span>🛍️ Shopping:</span>
            <span className="font-bold text-white">{data.shopping?.toFixed(1) || 0} kg</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
