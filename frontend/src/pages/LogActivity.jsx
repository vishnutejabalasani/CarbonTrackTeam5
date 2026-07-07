import { useState, useEffect } from "react";
import { Car, Zap, Utensils, ShoppingBag, Info } from "lucide-react";
import { logActivity, getRecentActivities, getEmissionFactor } from "../api/activities";

const CATEGORIES = [
  {
    key: "transport",
    label: "Transport",
    icon: Car,
    activityTypes: [
      { value: "car_km", label: "Car km (Petrol)", unit: "km" },
      { value: "flight_hours", label: "Flight hours", unit: "hours" },
      { value: "public_transit", label: "Public transit km", unit: "km" },
    ],
  },
  {
    key: "electricity",
    label: "Electricity",
    icon: Zap,
    activityTypes: [{ value: "kwh", label: "Electricity used", unit: "kWh" }],
  },
  {
    key: "food",
    label: "Food",
    icon: Utensils,
    activityTypes: [
      { value: "meal_type_meat", label: "Meat-based meal", unit: "servings" },
      { value: "meal_type_veg", label: "Vegetarian meal", unit: "servings" },
    ],
  },
  {
    key: "shopping",
    label: "Shopping",
    icon: ShoppingBag,
    activityTypes: [
      { value: "product_category_electronics", label: "Electronics", unit: "amount" },
      { value: "product_category_clothing", label: "Clothing", unit: "amount" },
    ],
  },
];

// Fallback approximate factors (kg CO2e per unit) used only if the backend
// emission-factors endpoint isn't reachable yet — replace/remove once your
// API is live. Sourced loosely from common IPCC/EPA reference tables.
const FALLBACK_FACTORS = {
  car_km: 0.192,
  flight_hours: 90,
  public_transit: 0.041,
  kwh: 0.475,
  meal_type_meat: 6.6,
  meal_type_veg: 1.5,
  product_category_electronics: 0.5,
  product_category_clothing: 0.3,
};

export default function LogActivity() {
  const [activeCategory, setActiveCategory] = useState("transport");
  const category = CATEGORIES.find((c) => c.key === activeCategory);

  const [activityType, setActivityType] = useState(category.activityTypes[0].value);
  const [quantity, setQuantity] = useState("");
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [preview, setPreview] = useState(0);
  const [factor, setFactor] = useState(FALLBACK_FACTORS[category.activityTypes[0].value]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
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
        if (!cancelled) setFactor(data.kgCo2ePerUnit);
      } catch {
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
      } catch {
        setRecentLogs([]); // backend not ready yet — empty is fine
      }
    }
    fetchRecent();
  }, [success]);

  const currentUnit = category.activityTypes.find((t) => t.value === activityType)?.unit;

  // ✅ VALIDATION: Check if quantity is valid (> 0)
  const quantityValue = parseFloat(quantity);
  const isQuantityValid = !isNaN(quantityValue) && quantityValue > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // ✅ Validate quantity before submission
    if (!isQuantityValid) {
      setError("Quantity must be greater than 0");
      return;
    }

    setSubmitting(true);
    try {
      await logActivity({
        category: activeCategory,
        activityType,
        quantity: quantityValue,
        unit: currentUnit,
        logDate,
      });
      setSuccess(true);
      setQuantity("");
      setError(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Couldn't log this activity. Please try again.";
      setError(errorMsg);
      console.error("Error logging activity:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl">
      <h1 className="text-2xl font-semibold text-gray-900">Log New Activity</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">
        Track your daily environmental impact to reach your sustainability goals.
      </p>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          {/* Category tabs */}
          <div className="flex gap-1 border-b border-gray-200 mb-6">
            {CATEGORIES.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition ${
                  activeCategory === key
                    ? "border-brand-800 text-brand-800 font-medium"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Activity Type
                </label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {category.activityTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Quantity</label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className={`w-full border rounded-lg px-3 py-2.5 pr-14 text-sm focus:outline-none focus:ring-2 ${
                    quantity && !isQuantityValid
                      ? "border-red-300 focus:ring-red-500"
                      : "border-gray-300 focus:ring-brand-500"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  {currentUnit}
                </span>
              </div>
              {/* ✅ Show validation error */}
              {quantity && !isQuantityValid && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Quantity must be greater than 0
                </p>
              )}
            </div>

            {/* ✅ Show success message */}
            {success && (
              <div className="bg-brand-50 border border-brand-200 text-brand-800 text-sm rounded-lg px-4 py-3">
                ✓ Activity logged! Your dashboard has been updated.
              </div>
            )}

            {/* ✅ Show error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 text-sm rounded-lg px-4 py-3">
                ✕ {error}
              </div>
            )}

            {/* ✅ Updated button with validation */}
            <button
              type="submit"
              disabled={submitting || !isQuantityValid}
              className="w-full bg-brand-800 hover:bg-brand-900 disabled:bg-gray-400 text-white rounded-lg py-2.5 text-sm font-medium transition"
            >
              {submitting ? "Recording..." : "Record Activity"}
            </button>
          </form>
        </div>

        {/* Live preview panel */}
        <div className="space-y-4">
          <div className="bg-brand-900 text-white rounded-xl p-5">
            <p className="text-xs text-brand-200 uppercase tracking-wide mb-2">
              Live CO2e Preview
            </p>
            <p className="text-3xl font-semibold">
              {preview.toFixed(1)} <span className="text-base font-normal text-brand-200">kg CO2e</span>
            </p>
            <div className="mt-4 bg-white/10 rounded-lg p-3 flex gap-2 items-start">
              <Info size={14} className="mt-0.5 shrink-0 text-brand-200" />
              <p className="text-xs text-brand-100">
                Equivalent to charging{" "}
                {Math.round((preview / 0.008) || 0).toLocaleString()} smartphones for one full
                cycle.
              </p>
            </div>
          </div>

          <div className="bg-brand-800 text-white rounded-xl p-4 text-xs">
            <p className="font-medium mb-1">Did you know?</p>
            <p className="text-brand-100">Walking saves 100% of transport CO2e.</p>
          </div>
        </div>
      </div>

      {/* Recent logs */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-semibold text-gray-900">Recent Logs</h2>
            <p className="text-xs text-gray-500">Your last recorded activities.</p>
          </div>
          <button className="text-sm text-brand-700 font-medium hover:underline">
            View History →
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-8 text-center text-sm text-gray-400">
            No recent activities yet — the ones you log will show up here.
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-start gap-3"
              >
                <CategoryIcon category={log.category} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{log.activityType}</p>
                  <p className="text-xs text-gray-500">
                    {log.quantity} {log.unit} • {log.logDate}
                  </p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {log.calculatedEmissionsKgCO2e?.toFixed(1)}
                  <span className="text-[10px] text-gray-400 block text-right">KG CO2E</span>
                </p>
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
    transport: "bg-category-transport/10 text-category-transport",
    electricity: "bg-category-electricity/10 text-category-electricity",
    food: "bg-category-food/10 text-category-food",
    shopping: "bg-category-shopping/10 text-category-shopping",
  };
  return (
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${colorMap[category] || "bg-gray-100 text-gray-500"}`}>
      <Icon size={16} />
    </div>
  );
}