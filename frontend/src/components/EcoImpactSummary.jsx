import { Sparkles, Wind, Sun, ShieldCheck, Sprout, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function EcoImpactSummary({ summary }) {
  const co2Saved = summary ? Math.max(0, 35 - summary.totalKgCo2e).toFixed(1) : "4.2";
  const trees = summary ? Math.max(1, Math.round(summary.totalKgCo2e / 12)) : 3;

  return (
    <div className="w-full text-white space-y-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" />
          <h4 className="font-extrabold text-xs text-white uppercase tracking-wider">
            Live Eco-Health Monitor
          </h4>
        </div>
        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
          Optimal Grid
        </span>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Air Quality */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:bg-white/15 transition duration-300 space-y-1">
          <div className="flex items-center justify-between text-brand-200">
            <span className="text-[9px] font-extrabold uppercase tracking-wide">Air Quality Index</span>
            <Wind size={13} className="text-emerald-300" />
          </div>
          <p className="text-lg font-black text-white">42 <span className="text-xs font-semibold text-emerald-300">AQI</span></p>
          <p className="text-[9px] font-bold text-emerald-300 flex items-center gap-1">
            <ShieldCheck size={10} /> Clean Air Quality
          </p>
        </div>

        {/* Renewable Energy Mix */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 hover:bg-white/15 transition duration-300 space-y-1">
          <div className="flex items-center justify-between text-brand-200">
            <span className="text-[9px] font-extrabold uppercase tracking-wide">Clean Grid Mix</span>
            <Sun size={13} className="text-amber-300" />
          </div>
          <p className="text-lg font-black text-white">78%</p>
          <p className="text-[9px] text-amber-200 font-medium truncate">Solar & Hydro Powered</p>
        </div>
      </div>

      {/* AI Forest Guardian Insight Box */}
      <div className="bg-gradient-to-r from-emerald-950/70 to-brand-900/80 rounded-xl p-3 border border-emerald-500/30 space-y-1.5 shadow-inner">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-emerald-300 flex items-center gap-1.5">
            <Sprout size={13} className="text-emerald-400" />
            AI Guardian Insight
          </span>
          <Sparkles size={11} className="text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <p className="text-[11px] text-brand-100 leading-relaxed font-medium">
          Your footprint is <strong className="text-emerald-300">18% lower</strong> than regional averages this week! Keep avoiding peak-hour drive times to sustain progress.
        </p>
      </div>

      {/* Quick Link Footer */}
      <Link
        to="/analytics"
        className="w-full flex items-center justify-between text-xs font-bold text-white/90 bg-white/10 hover:bg-white/20 py-2 px-3 rounded-xl border border-white/15 transition group"
      >
        <span>Explore Detailed Climate Metrics</span>
        <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
      </Link>
    </div>
  );
}
