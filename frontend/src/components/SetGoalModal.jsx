import { useState } from "react";
import { X, Target } from "lucide-react";
import { setGoal } from "../api/goals";

const QUICK_TARGETS = [
  { label: "Conservative (5%)", value: 5 },
  { label: "Moderate (10%)", value: 10 },
  { label: "Aggressive (20%)", value: 20 },
];

export default function SetGoalModal({ onClose, onSaved }) {
  const [targetPercent, setTargetPercent] = useState(10);
  const [timeframe, setTimeframe] = useState("weekly");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setGoal({ targetReductionPercent: targetPercent, timeframe });
      onSaved?.();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't save your goal. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="font-semibold text-gray-900">Set Carbon Goal</h2>
            <p className="text-xs text-gray-500">Define your impact target.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={18} />
          </button>
        </div>

        <div className="bg-brand-50 rounded-xl p-6 flex flex-col items-center mb-5">
          <div className="w-14 h-14 rounded-full bg-brand-800 flex items-center justify-center mb-2">
            <Target className="text-white" size={22} />
          </div>
          <p className="text-sm font-medium text-brand-900">Aiming for Net Zero</p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Target Reduction
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="100"
              value={targetPercent}
              onChange={(e) => setTargetPercent(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Recommended for your activity: 8% – 12%</p>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
            Timeframe
          </label>
          <div className="grid grid-cols-2 gap-2">
            {["weekly", "monthly"].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`py-2 rounded-lg text-sm font-medium capitalize border transition ${
                  timeframe === tf
                    ? "bg-brand-800 text-white border-brand-800"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wide">
            Quick Targets
          </label>
          <div className="flex flex-wrap gap-2">
            {QUICK_TARGETS.map((qt) => (
              <button
                key={qt.value}
                type="button"
                onClick={() => setTargetPercent(qt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  targetPercent === qt.value
                    ? "bg-brand-100 text-brand-800 border-brand-300"
                    : "border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {qt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-brand-800 hover:bg-brand-900 text-white rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Goal"}
          </button>
        </div>
      </div>
    </div>
  );
}
