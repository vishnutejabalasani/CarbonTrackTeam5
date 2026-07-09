import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from "recharts";

const displayColorMap = {
  Transport: "#6d5fd6",
  Electricity: "#e8a23d",
  Food: "#e05c5c",
  Shopping: "#3d9be8"
};

const gradientMap = {
  Transport: ["#818cf8", "#4f46e5"],
  Electricity: ["#fbbf24", "#d97706"],
  Food: ["#f87171", "#dc2626"],
  Shopping: ["#60a5fa", "#2563eb"]
};

// Premium Glassmorphic Tooltip
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-xl p-3 shadow-lg">
        <p className="text-xs font-bold text-slate-800">{payload[0].name || payload[0].payload.date}</p>
        <p className="text-sm font-extrabold text-brand-850 mt-0.5">
          {payload[0].value.toFixed(1)} kg CO₂e
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
  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition duration-300">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900">Emissions by Category</h3>
        <p className="text-xs text-slate-400 mt-0.5">Distribution over last {days} days</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 items-center">
        {/* Pie Chart */}
        <div className="h-48 relative flex items-center justify-center">
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
                innerRadius={60}
                outerRadius={80}
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
            <p className="text-2xl font-black text-slate-900">{total.toFixed(0)}</p>
            <p className="text-[9px] uppercase font-bold text-slate-400">Total kg</p>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2">
          {chartData.map((item) => {
            const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
            return (
              <div key={item.name} className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: displayColorMap[item.name] || "#10b981" }}
                  />
                  <span className="text-xs font-semibold text-slate-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-900">{item.value.toFixed(1)} kg</span>
                  <span className="text-[10px] text-slate-400 font-medium ml-1.5">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DailyEmissionsChart({ days = 7, data, target = 35 }) {
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

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 hover:shadow-md transition duration-300">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h3 className="text-base font-bold text-slate-900">Emission Trends</h3>
          <p className="text-xs text-slate-400 mt-0.5">Daily activity over last {days} days</p>
        </div>
        <div className="flex items-center gap-1 bg-brand-50 border border-brand-100 rounded-full px-2.5 py-1 text-[10px] font-bold text-brand-800">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
          Live
        </div>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} />
            <YAxis tickLine={false} axisLine={false} style={{ fontSize: 10, fill: "#94a3b8", fontWeight: 600 }} />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={target} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: `Limit (${target}kg)`, fill: "#d97706", fontSize: 9, position: "top", fontWeight: 700 }} />
            <Area type="monotone" dataKey="emissions" stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}