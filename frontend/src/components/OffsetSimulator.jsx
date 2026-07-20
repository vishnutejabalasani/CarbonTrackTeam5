import { useState } from "react";
import { Sliders, Leaf, Zap } from "lucide-react";

export default function OffsetSimulator() {
  const [trainDays, setTrainDays] = useState(1);
  const [renewablePercent, setRenewablePercent] = useState(20);
  const [thermostatOffset, setThermostatOffset] = useState(0);

  // Calculations (1 USD = 83 INR)
  // 1 train day saves approx 6.2 kg CO2 and 4.50 USD (~373.50 INR) compared to standard car commuting
  const commuteSavingCo2 = trainDays * 6.2;
  const commuteSavingCost = trainDays * 4.5 * 83; 

  // 10% increase in renewable energy for servers saves approx 12.5 kg CO2 and 8.00 USD (~664.00 INR) per week
  const serverSavingCo2 = (renewablePercent - 20) * 1.25;
  const serverSavingCost = (renewablePercent - 20) * 0.8 * 83; 

  // 1 degree F adjustment saves approx 3.8 kg CO2 and 2.10 USD (~174.30 INR) per week
  const thermostatSavingCo2 = thermostatOffset * 3.8;
  const thermostatSavingCost = thermostatOffset * 2.1 * 83; 

  const totalCo2Saved = Math.max(0, commuteSavingCo2 + serverSavingCo2 + thermostatSavingCo2);
  const totalCostSaved = Math.max(0, commuteSavingCost + serverSavingCost + thermostatSavingCost);
  const equivalentTrees = (totalCo2Saved / 1.5).toFixed(1);

  // Gauge Percentage
  const maxSavings = (5 * 6.2) + (80 * 1.25) + (4 * 3.8); // 146.2 kg
  const gaugePercent = Math.min(100, Math.round((totalCo2Saved / maxSavings) * 100));

  // Circular gauge offset configuration
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (gaugePercent / 100) * circumference;

  return (
    <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-6 shadow-sm space-y-6 transition-all duration-300">
      <div className="flex items-center gap-2">
        <Sliders className="text-brand-850 dark:text-brand-350" size={16} />
        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Carbon Offset Simulator</h3>
      </div>

      <div className="grid grid-cols-[1fr_124px] gap-4 items-center">
        {/* Sliders Container */}
        <div className="space-y-4">
          {/* Slider 1 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 gap-2">
              <span className="truncate">Commute by Train/Bike</span>
              <span className="text-brand-850 dark:text-brand-350 whitespace-nowrap shrink-0">{trainDays} days/wk</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              value={trainDays}
              onChange={(e) => setTrainDays(Number(e.target.value))}
              className="w-full accent-brand-800 bg-slate-100 dark:bg-brand-900/40 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Slider 2 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 gap-2">
              <span className="truncate">Server Renewable Mix</span>
              <span className="text-brand-850 dark:text-brand-350 whitespace-nowrap shrink-0">{renewablePercent}%</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={renewablePercent}
              onChange={(e) => setRenewablePercent(Number(e.target.value))}
              className="w-full accent-brand-800 bg-slate-100 dark:bg-brand-900/40 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Slider 3 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 gap-2">
              <span className="truncate">HVAC Adjustment</span>
              <span className="text-brand-850 dark:text-brand-350 whitespace-nowrap shrink-0">+{thermostatOffset}°F (Eco)</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              value={thermostatOffset}
              onChange={(e) => setThermostatOffset(Number(e.target.value))}
              className="w-full accent-brand-800 bg-slate-100 dark:bg-brand-900/40 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Circular SVG Gauge */}
        <div className="flex flex-col items-center justify-center space-y-1.5 select-none border-l border-slate-100 dark:border-brand-900/20 pl-3">
          <div className="relative w-24 h-24 flex items-center justify-center">
            {/* SVG circle gauge */}
            <svg width="96" height="96" viewBox="0 0 100 100" className="transform -rotate-90">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-slate-100 dark:stroke-brand-900/30"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="stroke-brand-800 transition-all duration-300"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-black text-slate-900 dark:text-white">{gaugePercent}%</span>
              <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wide">Reduction</span>
            </div>
          </div>
          <span className="text-[8px] font-bold text-slate-400 text-center uppercase tracking-wide whitespace-nowrap">Simulated Target</span>
        </div>
      </div>

      {/* Results grid */}
      <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-slate-100 dark:border-brand-900/30">
        <div className="bg-slate-50 dark:bg-brand-900/10 p-2.5 rounded-xl border border-slate-100 dark:border-brand-900/30 flex flex-col items-center text-center justify-center gap-1">
          <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 shrink-0">
            <Leaf size={13} />
          </div>
          <div className="w-full">
            <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">CO₂ Saved</p>
            <p className="text-xs font-black text-slate-800 dark:text-slate-100">{totalCo2Saved.toFixed(1)} kg</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-brand-900/10 p-2.5 rounded-xl border border-slate-100 dark:border-brand-900/30 flex flex-col items-center text-center justify-center gap-1">
          <div className="w-[26px] h-[26px] rounded bg-amber-50 dark:bg-amber-950/30 text-amber-600 font-black text-xs flex items-center justify-center shrink-0">
            ₹
          </div>
          <div className="w-full">
            <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Cost Saved</p>
            <p className="text-xs font-black text-slate-800 dark:text-slate-100">₹{totalCostSaved.toFixed(0)}</p>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-brand-900/10 p-2.5 rounded-xl border border-slate-100 dark:border-brand-900/30 flex flex-col items-center text-center justify-center gap-1">
          <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-950/30 text-blue-600 shrink-0">
            <Zap size={13} />
          </div>
          <div className="w-full">
            <p className="text-[8.5px] text-slate-400 font-bold uppercase tracking-wider">Trees Offset</p>
            <p className="text-xs font-black text-slate-800 dark:text-slate-100">{equivalentTrees} trees</p>
          </div>
        </div>
      </div>
    </div>
  );
}
