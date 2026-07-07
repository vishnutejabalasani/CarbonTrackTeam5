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