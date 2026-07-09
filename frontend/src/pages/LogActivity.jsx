import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Zap, Utensils, ShoppingBag, Info, Sparkles, CheckCircle2, ChevronRight } from "lucide-react";
import { logActivity, getRecentActivities, getEmissionFactor } from "../api/activities";

const CATEGORIES = [
  {
    key: "transport",
    label: "Transport",
    icon: Car,
    bgGradient: "from-indigo-500/10 to-purple-500/5",
    iconColor: "text-indigo-600 bg-indigo-50",
    description: "Vehicular commutes, short & long flights.",
    activityTypes: [
      { value: "car_km_petrol", label: "Car (Petrol)", unit: "km" },
      { value: "car_km_diesel", label: "Car (Diesel)", unit: "km" },
      { value: "car_km_electric", label: "Car (Electric)", unit: "km" },
      { value: "flight_short_hours", label: "Short-haul Flight", unit: "hours" },
      { value: "flight_long_hours", label: "Long-haul Flight", unit: "hours" },
      { value: "public_transit_km", label: "Public Transit", unit: "km" },
    ],
  },
  {
    key: "electricity",
    label: "Electricity",
    icon: Zap,
    bgGradient: "from-amber-500/10 to-yellow-500/5",
    iconColor: "text-amber-600 bg-amber-50",
    description: "Grid consumption, coal or gas sources.",
    activityTypes: [
      { value: "kwh_grid_avg", label: "Grid Average", unit: "kWh" },
      { value: "kwh_coal", label: "Coal Power", unit: "kWh" },
      { value: "kwh_natural_gas", label: "Natural Gas", unit: "kWh" },
      { value: "kwh_renewable", label: "Renewable Power", unit: "kWh" },
    ],
  },
  {
    key: "food",
    label: "Food",
    icon: Utensils,
    bgGradient: "from-rose-500/10 to-red-500/5",
    iconColor: "text-rose-600 bg-rose-50",
    description: "Meal selection based on beef, chicken, or vegan.",
    activityTypes: [
      { value: "meal_beef", label: "Beef-based Meal", unit: "servings" },
      { value: "meal_chicken", label: "Chicken Meal", unit: "servings" },
      { value: "meal_vegetarian", label: "Vegetarian Meal", unit: "servings" },
      { value: "meal_vegan", label: "Vegan Meal", unit: "servings" },
    ],
  },
  {
    key: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    bgGradient: "from-sky-500/10 to-blue-500/5",
    iconColor: "text-sky-600 bg-sky-50",
    description: "Clothing, electronics, or general items.",
    activityTypes: [
      { value: "electronics_purchase", label: "Electronics", unit: "amount" },
      { value: "clothing_purchase", label: "Clothing", unit: "amount" },
      { value: "household_goods", label: "Household Goods", unit: "amount" },
    ],
  },
];

const FALLBACK_FACTORS = {
  car_km_petrol: 0.21,
  car_km_diesel: 0.19,
  car_km_electric: 0.05,
  flight_short_hours: 90.5,
  flight_long_hours: 106.7,
  public_transit_km: 0.05,
  kwh_grid_avg: 0.38,
  kwh_coal: 0.95,
  kwh_natural_gas: 0.45,
  kwh_renewable: 0.05,
  meal_beef: 6.61,
  meal_chicken: 1.26,
  meal_vegetarian: 0.51,
  meal_vegan: 0.29,
  electronics_purchase: 0.25,
  clothing_purchase: 0.12,
  household_goods: 0.08,
};

export default function LogActivity() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState("transport");
  const category = CATEGORIES.find((c) => c.key === activeCategory);

  const [activityType, setActivityType] = useState(category.activityTypes[0].value);
  const [quantity, setQuantity] = useState("");
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [preview, setPreview] = useState(0);
  const [factor, setFactor] = useState(FALLBACK_FACTORS[category.activityTypes[0].value]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    const firstType = category.activityTypes[0].value;
    setActivityType(firstType);
  }, [activeCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let cancelled = false;
    async function fetchFactor() {
      try {
        const data = await getEmissionFactor(activeCategory, activityType);
        if (!cancelled) {
          setFactor(typeof data === "number" ? data : (data?.kgCo2ePerUnit ?? FALLBACK_FACTORS[activityType] ?? 0));
        }
      } catch (err) {
        if (!cancelled) setFactor(FALLBACK_FACTORS[activityType] ?? 0);
      }
    }
    fetchFactor();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, activityType]);

  useEffect(() => {
    const q = parseFloat(quantity);
    setPreview(isNaN(q) ? 0 : q * factor);
  }, [quantity, factor]);

  useEffect(() => {
    async function fetchRecent() {
      try {
        const data = await getRecentActivities(3);
        setRecentLogs(data);
      } catch (err) {
        setRecentLogs([]);
      }
    }
    fetchRecent();
  }, [success]);

  const currentUnit = category.activityTypes.find((t) => t.value === activityType)?.unit;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    try {
      await logActivity({
        category: activeCategory,
        activityType,
        quantity: parseFloat(quantity),
        unit: currentUnit,
        logDate,
      });
      setSuccess(true);
      setQuantity("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Couldn't log this activity. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Record Operational Footprint</h1>
        <p className="text-slate-500 text-sm mt-1">Log carbon variables across departments, office locations, and personal assets.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Left Side: Form Deck */}
        <div className="space-y-6">
          
          {/* Category Cards Selector Grid */}
          <div className="grid sm:grid-cols-4 gap-4">
            {CATEGORIES.map(({ key, label, icon: Icon, bgGradient, iconColor, description }) => {
              const isActive = activeCategory === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveCategory(key)}
                  className={`relative p-5 rounded-2xl border text-left flex flex-col justify-between h-40 transition duration-300 hover:shadow-sm focus:outline-none ${
                    isActive
                      ? "border-brand-800 bg-gradient-to-br from-brand-50/70 to-emerald-50/30 text-brand-900 shadow-sm font-semibold"
                      : "border-slate-200 bg-white hover:border-slate-300 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                    isActive ? "bg-brand-800 text-white" : iconColor
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block">{label}</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-1 leading-relaxed">{description}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Sparkles size={14} className="text-brand-800" />
              Configure Footprint Parameters
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Activity Vector
                </label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
                >
                  {category.activityTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                  Log Date
                </label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
                Volume / Distance Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl pl-4 pr-16 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {currentUnit}
                </span>
              </div>
            </div>

            {success && (
              <div className="p-3 bg-brand-50 border border-brand-100 text-brand-850 text-xs font-bold rounded-xl flex items-center gap-2">
                <CheckCircle2 size={14} className="text-brand-800" />
                Variable logged successfully! Dashboard summary has updated.
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || !quantity}
              className="w-full bg-brand-800 hover:bg-brand-900 text-white rounded-xl py-3 text-xs font-bold shadow-md shadow-brand-900/10 transition disabled:opacity-50"
            >
              {submitting ? "Publishing Log Details..." : "Log Activity"}
            </button>
          </form>
        </div>

        {/* Right Side: Live preview metrics */}
        <div className="space-y-6">
          <div className="bg-brand-900 text-white rounded-2xl p-6 shadow-md border border-brand-800/40 relative overflow-hidden">
            <div className="absolute right-[-10%] bottom-[-10%] w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
            
            <p className="text-xs text-brand-200 uppercase tracking-wider mb-2 font-bold">
              Carbon Equivalent Preview
            </p>
            <p className="text-3xl font-black text-white">
              {preview.toFixed(1)} <span className="text-sm font-semibold text-brand-200">kg CO₂e</span>
            </p>

            <div className="mt-5 space-y-3 pt-4 border-t border-white/10">
              <div className="flex gap-3 items-start text-xs">
                <Info size={14} className="shrink-0 text-brand-300 mt-0.5" />
                <p className="text-[11px] text-brand-100 leading-relaxed">
                  Calculated against IPCC/EPA standards using real-time local factors.
                </p>
              </div>
              
              <div className="bg-white/10 rounded-xl p-3 border border-white/5 text-[11px] text-brand-100 space-y-1.5">
                <p>💡 <strong>Equivalent offset vectors:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-[10px]">
                  <li>Charging {Math.round((preview / 0.008) || 0).toLocaleString()} smartphones</li>
                  <li>Planting {(preview * 0.05).toFixed(2)} tree saplings for 10 years</li>
                  <li>Driving {(preview * 2.5).toFixed(1)} miles in a grid-average EV</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm text-xs space-y-2">
            <p className="font-bold text-slate-800">Operational Sustainability Tips</p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Choosing renewable electricity credits or taking public transit shifts variables by up to 80% on this platform.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Logs Deck */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 text-base">Recent Logging History</h2>
            <p className="text-xs text-slate-400 mt-0.5">Your most recent carbon recordings.</p>
          </div>
          <button onClick={() => navigate("/history")} className="text-xs font-bold text-brand-850 hover:underline flex items-center gap-0.5">
            Full Audit logs
            <ChevronRight size={13} />
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-10 text-center text-xs text-slate-400">
            No logged values detected. Use parameters card above to start.
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white border border-slate-200/60 rounded-2xl p-5 flex items-start gap-3 shadow-sm hover:shadow transition"
              >
                <CategoryIcon category={log.category} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{log.activityType}</p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {log.quantity} {log.unit} · {log.logDate}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-900">{log.calculatedEmissionsKgCO2e?.toFixed(1)}</span>
                  <span className="text-[9px] text-slate-400 font-bold block">KG CO₂e</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryIcon({ category }) {
  const map = { transport: Car, electricity: Zap, food: Utensils, shopping: ShoppingBag };
  const Icon = map[category] || ShoppingBag;
  const colorMap = {
    transport: "bg-indigo-50 text-indigo-700",
    electricity: "bg-amber-50 text-amber-700",
    food: "bg-rose-50 text-rose-700",
    shopping: "bg-sky-50 text-sky-700",
  };
  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${colorMap[category] || "bg-gray-100 text-gray-500"}`}>
      <Icon size={14} />
    </div>
  );
}
