import { useState } from "react";

/**
 * Simple Pie Chart using SVG - No recharts dependency
 */
export function CategoryPieChart({ days = 7 }) {
  const data = [
    { name: "Transport", value: 45, color: "#14532D" },   // Deep Forest Green
    { name: "Electricity", value: 25, color: "#2F855A" }, // Emerald Green
    { name: "Food", value: 20, color: "#68D391" },        // Soft Mint Green
    { name: "Shopping", value: 10, color: "#A7F3D0" },    // Light Sage Green
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  // Calculate pie slices
  let currentAngle = 0;
  const slices = data.map((item) => {
    const sliceAngle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    // Convert to SVG path
    const startRadians = (startAngle * Math.PI) / 180;
    const endRadians = (endAngle * Math.PI) / 180;

    const x1 = 100 + 80 * Math.cos(startRadians);
    const y1 = 100 + 80 * Math.sin(startRadians);
    const x2 = 100 + 80 * Math.cos(endRadians);
    const y2 = 100 + 80 * Math.sin(endRadians);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const path = `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`;

    return {
      ...item,
      path,
      percentage: ((item.value / total) * 100).toFixed(1),
    };
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Emissions by Category</h3>
        <p className="text-xs text-gray-500 mt-1">Last {days} days breakdown</p>
      </div>

      <div className="flex flex-col items-center gap-6">
        {/* SVG Pie Chart */}
        <svg width="240" height="240" viewBox="0 0 200 200" className="drop-shadow-md">
          {slices.map((slice, index) => (
            <path
              key={index}
              d={slice.path}
              fill={slice.color}
              stroke="white"
              strokeWidth="2"
            />
          ))}
          <circle cx="100" cy="100" r="50" fill="white" />
          <text
            x="100"
            y="105"
            textAnchor="middle"
            fontSize="24"
            fontWeight="bold"
            fill="#1f2937"
          >
            {total}
          </text>
          <text
            x="100"
            y="125"
            textAnchor="middle"
            fontSize="12"
            fill="#6b7280"
          >
            kg CO2e
          </text>
        </svg>

        {/* Legend */}
        <div className="w-full space-y-2">
          {slices.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700 font-medium">{item.name}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{item.value} kg</p>
                <p className="text-xs text-gray-500">{item.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Simple Line Chart using SVG - No recharts dependency
 */
export function DailyEmissionsChart({ days = 7 }) {
  const data = [
    { date: "Mon", emissions: 25, target: 35 },
    { date: "Tue", emissions: 30, target: 35 },
    { date: "Wed", emissions: 22, target: 35 },
    { date: "Thu", emissions: 28, target: 35 },
    { date: "Fri", emissions: 35, target: 35 },
    { date: "Sat", emissions: 20, target: 35 },
    { date: "Sun", emissions: 18, target: 35 },
  ];

  const maxValue = 40;
  const chartHeight = 200;
  const chartWidth = 350;
  const barWidth = chartWidth / data.length;

  const avgEmissions = (data.reduce((sum, d) => sum + d.emissions, 0) / data.length).toFixed(1);
  const maxEmissions = Math.max(...data.map((d) => d.emissions));
  const totalEmissions = data.reduce((sum, d) => sum + d.emissions, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Daily Emissions Trend</h3>
        <p className="text-xs text-gray-500 mt-1">Last {days} days activity</p>
      </div>

      <div className="flex justify-center overflow-x-auto pb-4">
        <svg width={chartWidth} height={chartHeight + 60} className="drop-shadow-sm">
          {/* Grid lines */}
          {[0, 10, 20, 30, 40].map((gridValue) => (
            <g key={`grid-${gridValue}`}>
              <line
                x1="40"
                y1={chartHeight - (gridValue / maxValue) * chartHeight + 10}
                x2={chartWidth}
                y2={chartHeight - (gridValue / maxValue) * chartHeight + 10}
                stroke="#f3f4f6"
                strokeWidth="1"
              />
              <text
                x="35"
                y={chartHeight - (gridValue / maxValue) * chartHeight + 15}
                textAnchor="end"
                fontSize="11"
                fill="#9ca3af"
              >
                {gridValue}
              </text>
            </g>
          ))}

          {/* Target line (dashed) */}
          <line
            x1="40"
            y1={chartHeight - (35 / maxValue) * chartHeight + 10}
            x2={chartWidth}
            y2={chartHeight - (35 / maxValue) * chartHeight + 10}
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Bars */}
          {data.map((item, idx) => {
            const barHeight = (item.emissions / maxValue) * chartHeight;
            const x = 40 + idx * barWidth + barWidth / 2 - 12;
            const y = chartHeight - barHeight + 10;

            return (
              <g key={`bar-${idx}`}>
                <rect
                  x={x}
                  y={y}
                  width="24"
                  height={barHeight}
                  fill="#166534"
                  rx="2"
                  opacity="0.8"
                />
                <text
                  x={x + 12}
                  y={chartHeight + 30}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                  fontWeight="500"
                >
                  {item.date}
                </text>
              </g>
            );
          })}

          {/* Y-axis */}
          <line x1="40" y1="10" x2="40" y2={chartHeight + 10} stroke="#d1d5db" strokeWidth="1" />
          {/* X-axis */}
          <line x1="40" y1={chartHeight + 10} x2={chartWidth} y2={chartHeight + 10} stroke="#d1d5db" strokeWidth="1" />
        </svg>
      </div>

      {/* Legend */}
      <div className="flex gap-6 justify-center mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-700 rounded" />
          <span className="text-gray-600">Your Emissions</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 border-t-2 border-dashed border-amber-500" />
          <span className="text-gray-600">Weekly Target (35kg)</span>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600">Avg Daily</p>
          <p className="text-lg font-semibold text-blue-600">{avgEmissions} kg</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600">Peak Day</p>
          <p className="text-lg font-semibold text-amber-600">{maxEmissions} kg</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-xs text-gray-600">Total</p>
          <p className="text-lg font-semibold text-green-700">{totalEmissions} kg</p>
        </div>
      </div>
    </div>
  );
}

// Tooltip for Weekly Emissions chart
function WeeklyTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200/60 dark:border-brand-900/50 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{data.day} Footprint</p>
        <p className="text-sm font-extrabold text-brand-850 dark:text-brand-300 mt-1">
          {data.emissions !== undefined ? `${data.emissions.toFixed(1)} kg CO₂e` : "0.0 kg CO₂e"}
        </p>
      </div>
    );
  }
  return null;
}

export function WeeklyEmissionsChart({ logs = [], summary }) {
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysMap = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  
  if (logs && logs.length > 0) {
    logs.forEach((log) => {
      if (log.logDate && log.calculatedEmissionsKgCO2e !== undefined) {
        const dateObj = new Date(log.logDate);
        const dayName = dayNames[dateObj.getDay()];
        if (daysMap[dayName] !== undefined) {
          daysMap[dayName] += log.calculatedEmissionsKgCO2e;
        }
      }
    });
  }

  const chartData = [
    { day: "Mon", emissions: Math.round(daysMap.Mon * 10) / 10 },
    { day: "Tue", emissions: Math.round(daysMap.Tue * 10) / 10 },
    { day: "Wed", emissions: Math.round(daysMap.Wed * 10) / 10 },
    { day: "Thu", emissions: Math.round(daysMap.Thu * 10) / 10 },
    { day: "Fri", emissions: Math.round(daysMap.Fri * 10) / 10 },
    { day: "Sat", emissions: Math.round(daysMap.Sat * 10) / 10 },
    { day: "Sun", emissions: Math.round(daysMap.Sun * 10) / 10 },
  ];

  const totalEmissions = summary?.totalKgCo2e !== undefined ? summary.totalKgCo2e : chartData.reduce((acc, curr) => acc + curr.emissions, 0);
  const percentChange = summary?.percentChangeVsLastWeek !== undefined ? summary.percentChangeVsLastWeek : 0;

  return (
    <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 shadow-sm p-6 hover:shadow-md transition duration-300 relative group overflow-hidden">
      {/* Header section with summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">Weekly Emissions</h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Daily footprint distribution across Mon–Sun</p>
        </div>

        {/* Summary Pill Badge */}
        <div className="flex items-center gap-3 bg-slate-50 dark:bg-brand-900/20 border border-slate-200/60 dark:border-brand-900/40 rounded-xl px-3.5 py-2 shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block leading-none font-medium">This Week</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">{totalEmissions.toFixed(1)} <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">kg CO₂e</span></span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-brand-900/40" />
          <div className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${
            percentChange <= 0
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
              : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400"
          }`}>
            <span>{percentChange <= 0 ? "↓" : "↑"} {Math.abs(percentChange).toFixed(1)}%</span>
            <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">vs last week</span>
          </div>
        </div>
      </div>

      {/* Minimal responsive Area Chart */}
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="weeklyAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2c6835" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#5fa268" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis dataKey="day" tickLine={false} axisLine={false} style={{ fontSize: 11, fill: "#64748b", fontWeight: 700 }} />
            <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} unit="kg" />
            <Tooltip content={<WeeklyTooltip />} />
            <Area type="monotone" dataKey="emissions" stroke="#2c6835" strokeWidth={3} fillOpacity={1} fill="url(#weeklyAreaGrad)" activeDot={{ r: 6, fill: "#34d399", stroke: "#1e4322", strokeWidth: 2 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}