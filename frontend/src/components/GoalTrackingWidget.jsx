import React from "react";
import { useTranslation } from "react-i18next";
import {
  Target,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Sprout
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function CleanChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;

    const isFuture = data.isFuture;
    const actual = data.cumulativeActual;
    const target = data.targetLimit;
    const projected = data.projectedEmissions;

    return (
      <div className="bg-slate-900/95 text-white backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-xl text-xs space-y-2 min-w-[210px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="font-extrabold text-slate-200 flex items-center gap-1.5">
            <Calendar size={13} className="text-emerald-400" /> {label}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isFuture ? "bg-amber-500/20 text-amber-300" : "bg-emerald-500/20 text-emerald-300"}`}>
            {isFuture ? "Projected" : "Actual"}
          </span>
        </div>

        <div className="space-y-2 pt-1">
          {!isFuture && actual != null && (
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-400 font-medium">Logged Footprint:</span>
              <span className="font-extrabold text-emerald-400">{actual} kg CO₂</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <span className="text-slate-400 font-medium">Target Allowance:</span>
            <span className="font-bold text-slate-300">{target} kg CO₂</span>
          </div>

          {isFuture && projected != null && (
            <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-slate-800">
              <span className="text-amber-300 font-medium">Projected Trend:</span>
              <span className="font-extrabold text-amber-300">{projected} kg CO₂</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export default function GoalTrackingWidget({ currentGoal, onCreateGoal }) {
  const { t } = useTranslation();
  const hasGoal = Boolean(currentGoal);

  const goalTitle = hasGoal ? currentGoal.title : "Weekly Carbon Reduction Target (-20%)";
  const progressPercent = hasGoal ? (currentGoal.progressPercent || 0) : 65.0;
  const isOnTrack = hasGoal ? Boolean(currentGoal.onTrack) : true;

  const currentEmissions = hasGoal ? (currentGoal.currentEmissions || 78.5) : 85.0;
  const targetEmissions = hasGoal ? (currentGoal.targetEmissions || 160.0) : 144.0;
  const remainingDays = hasGoal ? (currentGoal.remainingDays ?? 3) : 3;
  const recentDailyAvg = hasGoal ? (currentGoal.recentDailyAvgEmissions || 15.2) : 16.5;
  const dailyAllowed = hasGoal ? (currentGoal.dailyAllowedEmissions || 20.5) : 20.5;
  const dailyReductionRequired = hasGoal ? (currentGoal.dailyReductionRequired || 0) : -4.0;
  const projectedTotalEmissions = hasGoal ? (currentGoal.projectedTotalEmissions || 130.0) : 134.5;

  const defaultTrajectory = [
    { dayLabel: "Mon", actualEmissions: 18.2, cumulativeActual: 18.2, targetLimit: 20.5, projectedEmissions: 18.2, isFuture: false },
    { dayLabel: "Tue", actualEmissions: 16.5, cumulativeActual: 34.7, targetLimit: 41.0, projectedEmissions: 34.7, isFuture: false },
    { dayLabel: "Wed", actualEmissions: 17.8, cumulativeActual: 52.5, targetLimit: 61.5, projectedEmissions: 52.5, isFuture: false },
    { dayLabel: "Thu", actualEmissions: 15.4, cumulativeActual: 67.9, targetLimit: 82.0, projectedEmissions: 67.9, isFuture: false },
    { dayLabel: "Fri", actualEmissions: 17.1, cumulativeActual: 85.0, targetLimit: 102.5, projectedEmissions: 85.0, isFuture: false },
    { dayLabel: "Sat", actualEmissions: null, cumulativeActual: null, targetLimit: 123.0, projectedEmissions: 101.5, isFuture: true },
    { dayLabel: "Sun", actualEmissions: null, cumulativeActual: null, targetLimit: 144.0, projectedEmissions: 118.0, isFuture: true },
  ];

  const trajectoryData = (hasGoal && currentGoal.trajectoryData && currentGoal.trajectoryData.length > 0)
    ? currentGoal.trajectoryData
    : defaultTrajectory;

  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const needsReduction = dailyReductionRequired > 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8 animate-fade-in text-slate-800">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Target size={14} className="text-emerald-600" /> Goal Tracker
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border ${
              isOnTrack
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-rose-50 text-rose-800 border-rose-200"
            }`}>
              <span className={`w-2 h-2 rounded-full ${isOnTrack ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
              {isOnTrack ? "ON TRACK" : "REDUCTION NEEDED"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {goalTitle}
          </h2>
        </div>

        {!hasGoal && (
          <button
            onClick={onCreateGoal}
            className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl px-5 py-3 text-xs font-bold shadow-sm transition flex items-center gap-2 shrink-0 self-start sm:self-center"
          >
            <Sparkles size={16} />
            Set Custom Target
          </button>
        )}
      </div>

      {/* Main 2-Column Clean Layout */}
      <div className="grid lg:grid-cols-2 gap-8 items-stretch">

        {/* Card 1: Current vs Target Footprint */}
        <div className="bg-slate-50/70 rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Footprint Target Progress
            </span>
            <span className="text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
              {remainingDays} Days Left
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-8 py-2">
            {/* SVG Circular Progress */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="72" cy="72" r={radius} className="stroke-slate-200" strokeWidth="10" fill="transparent" />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  className={`transition-all duration-1000 ease-out ${isOnTrack ? "stroke-emerald-600" : "stroke-rose-500"}`}
                  strokeWidth="10"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900 tracking-tight">{progressPercent}%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Met</span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="space-y-4 w-full">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase block">Current Logged</span>
                <div className="text-lg font-black text-slate-900">{currentEmissions} <span className="text-xs font-bold text-slate-400">kg CO₂e</span></div>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/70 shadow-2xs space-y-1">
                <span className="text-[11px] font-semibold text-emerald-700 uppercase block">Target Limit Budget</span>
                <div className="text-lg font-black text-emerald-700">{targetEmissions} <span className="text-xs font-bold text-emerald-600/70">kg CO₂e</span></div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Projected End Footprint:</span>
            <strong className={`font-bold ${projectedTotalEmissions <= targetEmissions ? "text-emerald-700" : "text-rose-600"}`}>
              {projectedTotalEmissions} kg CO₂e
            </strong>
          </div>
        </div>

        {/* Card 2: Daily Reduction Required Indicator */}
        <div className={`rounded-2xl border p-6 flex flex-col justify-between space-y-6 ${
          needsReduction
            ? "bg-amber-50/60 border-amber-200/80 text-amber-950"
            : "bg-emerald-50/60 border-emerald-200/80 text-emerald-950"
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
              needsReduction ? "text-amber-800" : "text-emerald-800"
            }`}>
              {needsReduction ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              Daily Pace Analysis
            </span>
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
              needsReduction ? "bg-amber-200/70 text-amber-900" : "bg-emerald-200/70 text-emerald-900"
            }`}>
              {needsReduction ? "REDUCTION NEEDED" : "ON TRACK"}
            </span>
          </div>

          <div className="space-y-3">
            <div className="text-3xl font-black tracking-tight">
              {needsReduction ? (
                <span className="text-amber-900">Reduce {dailyReductionRequired.toFixed(1)} kg / day</span>
              ) : (
                <span className="text-emerald-800">Operating below daily limit</span>
              )}
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {needsReduction ? (
                <span>
                  Your recent pace is <strong>{recentDailyAvg} kg/day</strong>. Reducing by <strong>{dailyReductionRequired.toFixed(1)} kg/day</strong> over the next {remainingDays} days keeps you on target.
                </span>
              ) : (
                <span>
                  Your daily average of <strong>{recentDailyAvg} kg/day</strong> is safely within the maximum allowed rate of <strong>{dailyAllowed} kg/day</strong>.
                </span>
              )}
            </p>

            {/* Daily Pace Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>Recent Daily Pace: {recentDailyAvg} kg</span>
                <span>Allowed Max: {dailyAllowed} kg</span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${needsReduction ? "bg-amber-500" : "bg-emerald-600"}`}
                  style={{ width: `${Math.min(100, (recentDailyAvg / Math.max(1, dailyAllowed)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/80 rounded-xl border border-slate-200/60 text-xs text-slate-600 flex items-center gap-2">
            <Sprout size={16} className="text-emerald-600 shrink-0" />
            <span>Swapping 1 drive with public transit saves ~2.5 kg CO₂e per day.</span>
          </div>
        </div>

      </div>

      {/* Timeline Chart Section */}
      <div className="space-y-4 pt-4 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Clock className="text-emerald-700" size={18} />
              Footprint Timeline & Projection
            </h3>
            <p className="text-xs text-slate-400">
              Daily cumulative emissions plotted against linear target limit and predicted outcome.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600" />
              <span>Actual Logged</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full border-2 border-slate-400 border-dashed" />
              <span>Target Allowance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span>Future Projection</span>
            </div>
          </div>
        </div>

        {/* Clean Recharts Container */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trajectoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
              <XAxis dataKey="dayLabel" tickLine={false} axisLine={false} style={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} />
              <YAxis tickLine={false} axisLine={false} style={{ fontSize: 11, fill: "#64748b", fontWeight: 600 }} />
              <Tooltip content={<CleanChartTooltip />} />

              {/* Target Limit Allowance */}
              <Line
                type="monotone"
                dataKey="targetLimit"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ r: 3, fill: "#94a3b8" }}
              />

              {/* Projected Future Trend */}
              <Line
                type="monotone"
                dataKey="projectedEmissions"
                stroke="#f59e0b"
                strokeWidth={2.5}
                strokeDasharray="6 6"
                dot={{ r: 3.5, fill: "#f59e0b" }}
              />

              {/* Actual Cumulative Logged */}
              <Area
                type="monotone"
                dataKey="cumulativeActual"
                stroke="#059669"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#actualGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
