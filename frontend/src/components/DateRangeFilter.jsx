import React, { useState } from "react";
import { Calendar, Filter, RotateCcw } from "lucide-react";
import { toast } from "react-hot-toast";

export default function DateRangeFilter({ onFilterChange, initialStartDate = "", initialEndDate = "" }) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [activePreset, setActivePreset] = useState("All");

  const formatLocalDate = (dateObj) => {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const applyPreset = (presetName) => {
    setActivePreset(presetName);
    const today = new Date();
    let start = "";
    let end = formatLocalDate(today);

    switch (presetName) {
      case "Today":
        start = formatLocalDate(today);
        end = formatLocalDate(today);
        break;
      case "Last 7 Days": {
        const d = new Date();
        d.setDate(d.getDate() - 6);
        start = formatLocalDate(d);
        break;
      }
      case "Last 30 Days": {
        const d = new Date();
        d.setDate(d.getDate() - 29);
        start = formatLocalDate(d);
        break;
      }
      case "This Month": {
        const d = new Date(today.getFullYear(), today.getMonth(), 1);
        start = formatLocalDate(d);
        break;
      }
      case "Previous Month": {
        const firstDayPrev = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayPrev = new Date(today.getFullYear(), today.getMonth(), 0);
        start = formatLocalDate(firstDayPrev);
        end = formatLocalDate(lastDayPrev);
        break;
      }
      case "This Year": {
        const d = new Date(today.getFullYear(), 0, 1);
        start = formatLocalDate(d);
        break;
      }
      default:
        start = "";
        end = "";
        break;
    }

    setStartDate(start);
    setEndDate(end);
    if (onFilterChange) {
      onFilterChange({ startDate: start, endDate: end });
    }
  };

  const handleStartChange = (val) => {
    setActivePreset("Custom");
    setStartDate(val);
    if (val && endDate && new Date(val) > new Date(endDate)) {
      toast.error("Start Date cannot be after End Date.");
      return;
    }
    if (onFilterChange) {
      onFilterChange({ startDate: val, endDate });
    }
  };

  const handleEndChange = (val) => {
    setActivePreset("Custom");
    setEndDate(val);
    if (startDate && val && new Date(val) < new Date(startDate)) {
      toast.error("End Date cannot be before Start Date.");
      return;
    }
    if (onFilterChange) {
      onFilterChange({ startDate, endDate: val });
    }
  };

  const handleReset = () => {
    setActivePreset("All");
    setStartDate("");
    setEndDate("");
    if (onFilterChange) {
      onFilterChange({ startDate: "", endDate: "" });
    }
  };

  const presets = ["Today", "Last 7 Days", "Last 30 Days", "This Month", "Previous Month", "This Year"];

  return (
    <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200/60 dark:border-emerald-900/40 p-4 shadow-sm space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-bold text-xs">
          <Filter size={15} className="text-emerald-600 dark:text-emerald-400" />
          <span>Custom Date Range Filter</span>
          {(startDate || endDate) && (
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-extrabold border border-emerald-200 dark:border-emerald-800/50">
              Active Filter
            </span>
          )}
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => applyPreset(preset)}
              className={`px-3 py-1 rounded-xl text-[11px] font-semibold transition cursor-pointer ${
                activePreset === preset
                  ? "bg-emerald-600 text-white shadow-sm font-bold"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
              }`}
            >
              {preset}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            title="Reset Filters"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Date Pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center text-xs">
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Start Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="date"
              value={startDate}
              onChange={(e) => handleStartChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-emerald-900/40 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/30 transition"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">End Date</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="date"
              value={endDate}
              onChange={(e) => handleEndChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-emerald-900/40 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/30 transition"
            />
          </div>
        </div>

        {/* Selected Date Summary Display */}
        <div className="lg:col-span-2 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 rounded-xl p-2.5 flex items-center justify-between text-[11px] text-emerald-900 dark:text-emerald-300 font-medium">
          <span>
            {startDate && endDate
              ? `Filtered Period: ${startDate} to ${endDate}`
              : startDate
              ? `Filtered from ${startDate} onwards`
              : endDate
              ? `Filtered up to ${endDate}`
              : "Showing all historical footprint records"}
          </span>
          {(startDate || endDate) && (
            <button
              onClick={handleReset}
              className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline ml-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
