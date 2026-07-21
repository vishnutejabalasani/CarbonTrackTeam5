import { Target, TrendingDown, ShieldCheck } from "lucide-react";

export default function ExecutiveESGMeter({ summary }) {
  const totalKg = summary?.totalKgCo2e !== undefined ? summary.totalKgCo2e : 42.6;
  const targetKg = summary?.weeklyTargetKg !== undefined ? summary.weeklyTargetKg : 50.0;
  const percentUsed = Math.min(100, Math.round((totalKg / targetKg) * 100));

  // Circular gauge offset configuration
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentUsed / 100) * circumference;

  return (
    <div className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5 shadow-2xl text-white select-none space-y-4 hover:border-emerald-400/50 transition duration-300">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Target className="text-emerald-400 shrink-0" size={16} />
          <h4 className="font-extrabold text-xs tracking-wider uppercase text-brand-100">
            ESG Net-Zero Meter
          </h4>
        </div>
        <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
          <ShieldCheck size={11} />
          On Track
        </span>
      </div>

      {/* Main Metric & Gauge */}
      <div className="flex items-center justify-between gap-4">
        {/* Metric Values */}
        <div className="space-y-1">
          <p className="text-[10px] font-bold text-brand-200 uppercase tracking-wide">Weekly Carbon Budget</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-white">{totalKg.toFixed(1)}</span>
            <span className="text-xs font-bold text-emerald-300">/ {targetKg.toFixed(0)} kg</span>
          </div>
          <p className="text-[10px] text-emerald-200 font-semibold flex items-center gap-1 pt-1">
            <TrendingDown size={12} className="text-emerald-400" />
            14.8% below maximum threshold
          </p>
        </div>

        {/* Precision SVG Radial Gauge */}
        <div className="relative w-22 h-22 flex items-center justify-center shrink-0">
          <svg className="w-20 h-20 transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="text-white/15"
              strokeWidth="7"
              stroke="currentColor"
              fill="transparent"
            />
            {/* Progress arc */}
            <circle
              cx="40"
              cy="40"
              r={radius}
              className="text-emerald-400 transition-all duration-700 ease-out"
              strokeWidth="7"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-black text-white">{percentUsed}%</span>
            <span className="text-[7.5px] font-bold text-brand-200 uppercase">Capacity</span>
          </div>
        </div>
      </div>

      {/* Mini Progress Bars for Categories */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-brand-100">
            <span>Transport & Logistics</span>
            <span className="text-emerald-300">12.4 kg (29%)</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-400 h-1.5 rounded-full" style={{ width: "29%" }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-[10px] font-bold text-brand-100">
            <span>Grid Electricity & HVAC</span>
            <span className="text-emerald-300">18.2 kg (42%)</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="bg-teal-300 h-1.5 rounded-full" style={{ width: "42%" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
