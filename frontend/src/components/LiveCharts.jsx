import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { PieChart as PieIcon, BarChart2, TrendingUp, Info } from "lucide-react";

// Tooltip supporting Dark Mode & Glassmorphism
function ChartCustomTooltip({ active, payload, label, unit = "kg CO₂" }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/80 dark:border-emerald-900/50 rounded-2xl p-3 shadow-xl text-xs space-y-1">
        <p className="font-extrabold text-slate-800 dark:text-slate-100">{label || payload[0].name}</p>
        {payload.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
            <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              {item.name}:
            </span>
            <span className="font-black text-emerald-600 dark:text-emerald-400">
              {item.value !== undefined ? `${Number(item.value).toFixed(1)} ${unit}` : "0 kg"}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// Loading Skeleton Component for Cards
export function ChartSkeleton({ height = "h-64" }) {
  return (
    <div className={`bg-white/80 dark:bg-slate-900/50 rounded-3xl border border-slate-200/60 dark:border-emerald-900/30 p-6 shadow-sm animate-pulse flex flex-col justify-between ${height}`}>
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-1/3" />
        <div className="h-3 bg-slate-150 dark:bg-slate-850 rounded-md w-1/2" />
      </div>
      <div className="flex-1 my-4 bg-slate-100 dark:bg-slate-800/40 rounded-2xl flex items-end p-4 gap-2">
        <div className="h-1/2 bg-slate-200 dark:bg-slate-800 rounded-t-lg flex-1" />
        <div className="h-3/4 bg-slate-200 dark:bg-slate-800 rounded-t-lg flex-1" />
        <div className="h-2/3 bg-slate-200 dark:bg-slate-800 rounded-t-lg flex-1" />
        <div className="h-full bg-slate-200 dark:bg-slate-800 rounded-t-lg flex-1" />
      </div>
    </div>
  );
}

// 1. Live Category Pie Chart
export function CategoryPieChart({ pieData = [], loading = false }) {
  if (loading) return <ChartSkeleton height="h-80" />;

  const defaultPie = [
    { name: "Electricity", value: 142.5, percentage: 35, color: "#4CAF50" },
    { name: "Transport", value: 110.0, percentage: 27, color: "#2E7D32" },
    { name: "Waste", value: 65.2, percentage: 16, color: "#81C784" },
    { name: "Water", value: 45.0, percentage: 11, color: "#26A69A" },
    { name: "Fuel", value: 45.3, percentage: 11, color: "#FFA726" },
  ];

  const chartData = pieData.length > 0 ? pieData : defaultPie;
  const total = chartData.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-emerald-900/40 p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <PieIcon className="text-emerald-600 dark:text-emerald-400" size={18} />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Carbon Emissions by Category</h3>
          </div>
          <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
            ESG Vectors
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">Distribution across operational emission categories</p>
      </div>

      <div className="h-56 my-2 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              animationDuration={1200}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "#4CAF50"} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<ChartCustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p className="text-2xl font-black text-slate-900 dark:text-white">{total.toFixed(0)}</p>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Total kg CO₂</p>
        </div>
      </div>

      {/* Category breakdown grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
        {chartData.map((item) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={item.name} className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color || "#4CAF50" }} />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">{item.name}</p>
                <p className="text-[10px] text-slate-400 font-medium">{item.value.toFixed(1)} kg ({pct}%)</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 2. Live Monthly Bar Chart
export function MonthlyBarChart({ barData = [], loading = false }) {
  if (loading) return <ChartSkeleton height="h-80" />;

  const defaultBar = [
    { month: "Jan", emissions: 120.0 },
    { month: "Feb", emissions: 115.0 },
    { month: "Mar", emissions: 130.5 },
    { month: "Apr", emissions: 125.0 },
    { month: "May", emissions: 140.2 },
    { month: "Jun", emissions: 135.0 },
    { month: "Jul", emissions: 150.0 },
    { month: "Aug", emissions: 145.0 },
    { month: "Sep", emissions: 138.0 },
    { month: "Oct", emissions: 142.0 },
    { month: "Nov", emissions: 128.0 },
    { month: "Dec", emissions: 132.0 },
  ];

  const chartData = barData.length > 0 ? barData : defaultBar;

  return (
    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-emerald-900/40 p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <BarChart2 className="text-emerald-600 dark:text-emerald-400" size={18} />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Monthly Carbon Emissions</h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Historical monthly CO₂ emissions (kg)</p>
        </div>
      </div>

      <div className="h-64 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4CAF50" stopOpacity={1} />
                <stop offset="100%" stopColor="#2E7D32" stopOpacity={0.8} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} />
            <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} />
            <Tooltip content={<ChartCustomTooltip />} />
            <Bar dataKey="emissions" name="Total CO₂" fill="url(#barGradient)" radius={[8, 8, 0, 0]} animationDuration={1400} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 3. Live Weekly Trend Line Chart
export function WeeklyTrendLineChart({ lineData = [], loading = false }) {
  if (loading) return <ChartSkeleton height="h-80" />;

  const defaultLine = [
    { week: "W1", emissions: 38.5, date: "Week 1" },
    { week: "W2", emissions: 42.0, date: "Week 2" },
    { week: "W3", emissions: 39.1, date: "Week 3" },
    { week: "W4", emissions: 35.4, date: "Week 4" },
    { week: "W5", emissions: 37.8, date: "Week 5" },
    { week: "W6", emissions: 33.2, date: "Week 6" },
    { week: "W7", emissions: 36.0, date: "Week 7" },
    { week: "W8", emissions: 31.5, date: "Week 8" },
    { week: "W9", emissions: 34.0, date: "Week 9" },
    { week: "W10", emissions: 29.8, date: "Week 10" },
    { week: "W11", emissions: 32.5, date: "Week 11" },
    { week: "W12", emissions: 28.0, date: "Week 12" },
  ];

  const chartData = lineData.length > 0 ? lineData : defaultLine;

  return (
    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-emerald-900/40 p-6 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={18} />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Weekly Carbon Footprint Trend</h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Curved trendline over the last 12 weeks</p>
        </div>
      </div>

      <div className="h-64 my-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#81C784" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} style={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} />
            <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} />
            <Tooltip content={<ChartCustomTooltip />} />
            <Area
              type="monotone"
              dataKey="emissions"
              name="Weekly CO₂"
              stroke="#2E7D32"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#lineAreaGrad)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
