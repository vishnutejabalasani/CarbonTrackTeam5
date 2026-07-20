import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";

const displayColorMap = {
  Transport: "#818cf8",
  Electricity: "#fbbf24",
  Food: "#f87171",
  Shopping: "#38bdf8"
};

const gradientMap = {
  Transport: ["#818cf8", "#4f46e5"],
  Electricity: ["#fbbf24", "#d97706"],
  Food: ["#f87171", "#dc2626"],
  Shopping: ["#60a5fa", "#2563eb"]
};

// Premium Glassmorphic Tooltip supporting Dark Mode
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isForecast = data.forecast !== undefined && data.emissions === undefined;
    const value = isForecast ? data.forecast : data.emissions;
    const label = isForecast ? "AI Projected Emissions" : "Actual Emissions";
    return (
      <div className="bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200/60 dark:border-brand-900/50 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{data.date}</p>
        <p className="text-[10px] font-semibold text-emerald-700 dark:text-brand-350 mt-1">{label}</p>
        <p className="text-sm font-extrabold text-brand-850 dark:text-brand-300 mt-0.5">
          {value !== undefined && value !== null ? `${value.toFixed(1)} kg CO₂e` : "0.0 kg"}
        </p>
      </div>
    );
  }
  return null;
}

export function CategoryPieChart({ days = 30, data }) {
  const defaultData = [
    { name: "Transport", value: 45 },
    { name: "Electricity", value: 25 },
    { name: "Food", value: 20 },
    { name: "Shopping", value: 10 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;
  const total = chartData.reduce((sum, item) => sum + item.value, 0);  return (
    <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 shadow-sm p-6 hover:shadow-md transition duration-300 flex flex-col justify-between">
      <div className="mb-2">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Emissions by Category</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Distribution over last {days} days</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-2">
        {/* Pie Chart */}
        <div className="h-44 w-44 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {Object.keys(gradientMap).map((key) => (
                  <linearGradient key={key} id={`${key}Grad`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={gradientMap[key][0]} />
                    <stop offset="100%" stopColor={gradientMap[key][1]} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={`url(#${entry.name}Grad)`} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{total.toFixed(0)}</p>
            <p className="text-[9px] uppercase font-bold text-slate-400 dark:text-slate-500">Total kg</p>
          </div>
        </div>
      </div>

      {/* Legend below in 2-column grid */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-brand-900/20">
        {chartData.map((item) => {
          const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
          return (
            <div key={item.name} className="flex items-center justify-between p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-brand-900/20 transition">
              <div className="flex items-center gap-1.5 min-w-0">
                <div
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: displayColorMap[item.name] || "#10b981" }}
                />
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-350 truncate">{item.name}</span>
              </div>
              <div className="text-right whitespace-nowrap ml-2 shrink-0">
                <span className="text-[11px] font-black text-slate-900 dark:text-slate-100">{item.value.toFixed(1)} kg</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium ml-1">({pct}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function DailyEmissionsChart({ days = 7, data, target = 35, forecast }) {
  const defaultData = [
    { date: "Mon", emissions: 25 },
    { date: "Tue", emissions: 30 },
    { date: "Wed", emissions: 22 },
    { date: "Thu", emissions: 28 },
    { date: "Fri", emissions: 35 },
    { date: "Sat", emissions: 20 },
    { date: "Sun", emissions: 18 },
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  // Merge historical and AI forecast data
  let combinedData = [...chartData];
  if (forecast && forecast.length > 0) {
    const lastItem = combinedData[combinedData.length - 1];
    if (lastItem) {
      lastItem.forecast = lastItem.emissions;
    }
    forecast.forEach((f) => {
      combinedData.push({
        date: `${f.date} (AI)`,
        forecast: f.emissions,
      });
    });
  }

  return (
    <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 shadow-sm p-6 hover:shadow-md transition duration-300">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Emission Trends & AI Forecast</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Daily activity benchmarked with future projections</p>
        </div>
        <div className="flex items-center gap-1 bg-brand-50 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/50 rounded-full px-2.5 py-1 text-[10px] font-bold text-brand-800 dark:text-brand-300">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400 animate-pulse" />
          AI Forecast Active
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={combinedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} />
            <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={target} stroke="#fbbf24" strokeDasharray="4 4" label={{ value: `Limit (${parseFloat(target).toFixed(1)} kg)`, fill: "#d97706", fontSize: 9, position: "top", fontWeight: 700 }} />
            <Area type="monotone" dataKey="emissions" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGrad)" />
            <Area type="monotone" dataKey="forecast" stroke="#fbbf24" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#forecastGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}