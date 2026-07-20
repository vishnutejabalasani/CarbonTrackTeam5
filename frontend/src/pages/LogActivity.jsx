import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Car, Zap, Utensils, ShoppingBag, Info, Sparkles, CheckCircle2, ChevronRight, Camera, Upload, Trash2, Edit3, Save, X, Lightbulb, TrendingDown } from "lucide-react";
import { logActivity, getRecentActivities, getEmissionFactor, parseNaturalLanguageLog, analyzeImageLog } from "../api/activities";
import { updateVisionAnalysis } from "../api/vision";

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

const VISION_CATEGORY_ICONS = {
  Transport: "🚗",
  Transportation: "🚗",
  Food: "🍽️",
  Electricity: "⚡",
  Shopping: "🛍️",
  Waste: "♻️",
  Industrial: "🏭",
  Other: "🌿",
};

const VISION_CATEGORY_COLORS = {
  Transport: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
  Transportation: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
  Food: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/50",
  Electricity: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/50",
  Shopping: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/50",
  Waste: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-450 dark:border-slate-850",
  Industrial: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50",
  Other: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
};

const CONFIDENCE_COLOR = (c) => {
  if (c >= 0.85) return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50";
  if (c >= 0.6) return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50";
  return "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50";
};

export default function LogActivity() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

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
  
  // Natural Language Logger state
  const [aiText, setAiText] = useState("");
  const [aiParsed, setAiParsed] = useState(null);
  const [parsing, setParsing] = useState(false);
  const [aiError, setAiError] = useState("");

  // Multimodal Vision Logger state
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [visionResult, setVisionResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");

  const handleAiParse = async () => {
    setParsing(true);
    setAiParsed(null);
    setAiError("");
    try {
      const data = await parseNaturalLanguageLog(aiText);
      if (!data || data.length === 0) {
        setAiError("Could not extract any activities from your sentence. Try being more specific (e.g. \"I drove 20km in my car\").");
        setTimeout(() => setAiError(""), 5000);
      } else {
        setAiParsed(data);
      }
    } catch (err) {
      setAiError("AI parsing temporarily unavailable. Please use the manual form below or try again in a moment.");
      setTimeout(() => setAiError(""), 5000);
    } finally {
      setParsing(false);
    }
  };

  const handleConfirmAiLog = async () => {
    if (!aiParsed || aiParsed.length === 0) return;
    setSubmitting(true);
    setAiError("");
    try {
      for (const act of aiParsed) {
        await logActivity({
          category: act.category,
          activityType: act.activityType,
          quantity: parseFloat(act.quantity),
          unit: act.unit,
          logDate: act.logDate,
        });
      }
      setSuccess(true);
      setAiText("");
      setAiParsed(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setAiError("Error logging parsed activities. Please verify the details or use the manual form.");
      setTimeout(() => setAiError(""), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  // Multimodal Image Actions
  const handleImageFile = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setAiError("Please upload a PNG, JPEG, or WEBP image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setAiError("Image is too large. Maximum size is 10 MB.");
      return;
    }
    setAiError("");
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
    setVisionResult(null);
  };

  const handlePaste = (e) => {
    const file = e.clipboardData.files[0];
    if (file && file.type.startsWith("image/")) {
      e.preventDefault();
      handleImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageFile(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    setAnalyzingImage(true);
    setAiError("");
    setVisionResult(null);
    try {
      const data = await analyzeImageLog(selectedImage);
      setVisionResult(data);
    } catch (err) {
      console.error(err);
      setAiError(err.response?.data?.error || "Failed to analyze image. Please try again.");
    } finally {
      setAnalyzingImage(false);
    }
  };

  const handleEditActivityQuantity = async (idx, newQty) => {
    if (!visionResult) return;
    const updatedActivities = [...visionResult.activities];
    const act = { ...updatedActivities[idx] };
    act.quantity = parseFloat(newQty) || 0;
    act.estimatedCarbonKg = Math.round(act.quantity * act.emissionFactor * 100) / 100;
    updatedActivities[idx] = act;

    const newTotal = Math.round(updatedActivities.reduce((acc, curr) => acc + curr.estimatedCarbonKg, 0) * 100) / 100;

    const newBreakdown = {};
    updatedActivities.forEach(a => {
      newBreakdown[a.category] = Math.round(((newBreakdown[a.category] || 0) + a.estimatedCarbonKg) * 100) / 100;
    });

    const newResult = {
      ...visionResult,
      activities: updatedActivities,
      totalEmission: newTotal,
      carbonBreakdown: newBreakdown
    };

    setVisionResult(newResult);
    setEditingIdx(null);

    try {
      await updateVisionAnalysis(visionResult.analysisId, {
        detectedActivities: updatedActivities,
        totalEstimatedKgCO2e: newTotal,
        carbonBreakdown: newBreakdown
      });
    } catch (err) {
      console.error("Failed to save edits to DB:", err);
    }
  };

  const handleRemoveActivity = async (idx) => {
    if (!visionResult) return;
    const updatedActivities = visionResult.activities.filter((_, i) => i !== idx);

    const newTotal = Math.round(updatedActivities.reduce((acc, curr) => acc + curr.estimatedCarbonKg, 0) * 100) / 100;

    const newBreakdown = {};
    updatedActivities.forEach(a => {
      newBreakdown[a.category] = Math.round(((newBreakdown[a.category] || 0) + a.estimatedCarbonKg) * 100) / 100;
    });

    const newResult = {
      ...visionResult,
      activities: updatedActivities,
      totalEmission: newTotal,
      carbonBreakdown: newBreakdown
    };

    setVisionResult(newResult);

    try {
      await updateVisionAnalysis(visionResult.analysisId, {
        detectedActivities: updatedActivities,
        totalEstimatedKgCO2e: newTotal,
        carbonBreakdown: newBreakdown
      });
    } catch (err) {
      console.error("Failed to save deletion to DB:", err);
    }
  };

  const handleSaveVisionActivities = async () => {
    if (!visionResult || !visionResult.activities) return;
    setSubmitting(true);
    setAiError("");
    try {
      for (const act of visionResult.activities) {
        await logActivity({
          category: act.category.toLowerCase(),
          activityType: act.activityType,
          quantity: act.quantity,
          unit: act.unit,
          logDate: new Date().toISOString().split("T")[0],
        });
      }
      setSuccess(true);
      await updateVisionAnalysis(visionResult.analysisId, { status: "saved" });
      
      setTimeout(() => {
        setSuccess(false);
        setSelectedImage(null);
        setImagePreview(null);
        setVisionResult(null);
      }, 3000);
    } catch (err) {
      setAiError("Failed to save vision activities. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetImageSelection = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setVisionResult(null);
    setAiError("");
  };

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
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Record Operational Footprint</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Log carbon variables across departments, office locations, and personal assets.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        {/* Left Side: Form Deck */}
        <div className="space-y-6">

          {/* Conversational AI Logging Widget */}
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`bg-gradient-to-r from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:to-teal-950/10 rounded-2xl border p-6 space-y-4 shadow-sm transition-all duration-200 ${
              dragActive ? "border-brand-500 bg-brand-50/50 scale-[1.01] dark:border-brand-600 dark:bg-brand-950/20" : "border-emerald-500/20 dark:border-emerald-900/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center text-white shadow-sm">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    Multimodal AI Logger <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-350 text-[8px] font-bold px-1.5 py-0.5 rounded-full">Gemini 2.5 Vision</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Type activity parameters or upload a photo to analyze footprint instantly.</p>
                </div>
              </div>
              
              {imagePreview && (
                <button
                  type="button"
                  onClick={resetImageSelection}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 hover:underline"
                >
                  <X size={12} /> Clear Image
                </button>
              )}
            </div>
            
            {/* Input Bar */}
            <div className="flex gap-2 items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-1.5 focus-within:ring-2 focus-within:ring-brand-500/20 focus-within:border-brand-500 transition shadow-inner">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={(e) => handleImageFile(e.target.files[0])} 
                accept="image/png,image/jpeg,image/webp" 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-650 dark:hover:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition"
                title="Upload image (or drop / paste)"
              >
                <Camera size={18} />
              </button>
              
              <input
                type="text"
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                onPaste={handlePaste}
                placeholder="e.g., I drove 45km in my electric car yesterday and ate beef food today."
                className="flex-1 bg-transparent border-none text-xs text-slate-800 dark:text-white focus:outline-none placeholder-slate-400"
              />
              
              <button
                type="button"
                onClick={handleAiParse}
                disabled={parsing || !aiText.trim() || selectedImage}
                className="bg-brand-800 hover:bg-brand-900 text-white rounded-lg px-4 py-1.5 text-xs font-bold transition disabled:opacity-50"
              >
                {parsing ? "Parsing..." : "Parse"}
              </button>
            </div>

            {/* Selected Image Local Preview Before Analysis */}
            {imagePreview && !visionResult && (
              <div className="bg-white/80 dark:bg-slate-900/60 border border-emerald-500/20 rounded-xl p-4 flex flex-col items-center space-y-3 shadow-inner animate-fade-in">
                <img 
                  src={imagePreview} 
                  alt="Selected upload" 
                  className="max-h-48 rounded-lg object-contain border border-slate-200 dark:border-slate-800 shadow-md" 
                />
                <button
                  type="button"
                  onClick={handleAnalyzeImage}
                  disabled={analyzingImage}
                  className="bg-brand-850 hover:bg-brand-900 text-white rounded-lg px-6 py-2 text-xs font-bold transition flex items-center gap-1.5 shadow"
                >
                  {analyzingImage ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Gemini is analyzing your image...
                    </>
                  ) : (
                    <>
                      <Sparkles size={13} />
                      Analyze Image
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error Message */}
            {aiError && (
              <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-xl px-4 py-3 text-xs text-rose-700 dark:text-rose-400 animate-fade-in">
                <span className="shrink-0 mt-0.5">⚠️</span>
                <p className="flex-1">{aiError}</p>
                <button onClick={() => setAiError("")} className="shrink-0 font-bold ml-auto"><X size={12} /></button>
              </div>
            )}

            {/* Text Analysis Result Cards */}
            {aiParsed && aiParsed.length > 0 && !selectedImage && (
              <div className="bg-white/80 dark:bg-slate-900/60 border border-emerald-500/20 rounded-xl p-4 space-y-3 shadow-inner animate-fade-in">
                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-350">Parsed Activities:</p>
                <div className="space-y-2">
                  {aiParsed.map((act, i) => (
                    <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800 rounded-lg p-2.5 text-xs">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">{act.category}</span>
                        <span className="text-slate-400 mx-1.5">·</span>
                        <span className="text-slate-500 dark:text-slate-400">{act.activityType}</span>
                      </div>
                      <div className="font-bold text-slate-900 dark:text-white">
                        {act.quantity} {act.unit}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setAiParsed(null)}
                    className="border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-lg px-3 py-1.5 text-[10px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmAiLog}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg px-4 py-1.5 text-[10px] font-bold shadow-sm transition"
                  >
                    Confirm & Log All
                  </button>
                </div>
              </div>
            )}

            {/* Image Analysis Results Panel */}
            {visionResult && (
              <div className="bg-white/90 dark:bg-slate-900/90 border border-emerald-500/25 rounded-2xl p-5 space-y-4 shadow-lg animate-fade-in">
                {/* Result header details */}
                <div className="flex flex-col sm:flex-row gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <img 
                    src={imagePreview} 
                    alt="Analyzed source" 
                    className="w-24 h-24 rounded-xl object-cover bg-slate-100 border border-slate-200 dark:border-slate-800 shrink-0" 
                  />
                  <div className="flex-1 space-y-1.5">
                    <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-50 text-emerald-850 dark:bg-emerald-950/40 dark:text-emerald-350">
                      Vision Result
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                      "{visionResult.summary}"
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <div>
                        <span className="text-base font-black text-slate-900 dark:text-white">
                          {visionResult.totalEmission}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-1">kg CO₂e total</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detected Items list */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                    <span>Detected Activities ({visionResult.activities?.length || 0})</span>
                  </p>
                  
                  {visionResult.activities?.map((act, idx) => (
                    <div key={idx} className="bg-slate-50 dark:bg-slate-950/30 border border-slate-200/50 dark:border-slate-800/80 rounded-xl p-3 flex justify-between items-center text-xs group">
                      <div className="flex items-center gap-2">
                        <span className="text-lg shrink-0">{VISION_CATEGORY_ICONS[act.category] || "🌿"}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{act.activity}</span>
                            <span className={`text-[8px] font-extrabold px-1 py-0.2 rounded border ${CONFIDENCE_COLOR(act.confidence)}`}>
                              {Math.round(act.confidence * 100)}% conf
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Factor: {act.emissionFactor} kg/{act.unit}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right shrink-0">
                        {editingIdx === idx ? (
                          <div className="flex items-center gap-1">
                            <input 
                              type="number" 
                              value={editValue} 
                              onChange={(e) => setEditValue(e.target.value)} 
                              className="w-14 px-1.5 py-0.5 border border-brand-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white rounded text-xs text-right" 
                              autoFocus 
                            />
                            <span className="text-[9px] text-slate-400">{act.unit}</span>
                            <button onClick={() => handleEditActivityQuantity(idx, editValue)} className="p-1 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded"><Save size={11} /></button>
                            <button onClick={() => setEditingIdx(null)} className="p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><X size={11} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div>
                              <p className="font-black text-slate-900 dark:text-white">{act.estimatedCarbonKg} kg</p>
                              <p className="text-[10px] text-slate-400">{act.quantity} {act.unit}</p>
                            </div>
                            <button onClick={() => { setEditingIdx(idx); setEditValue(String(act.quantity)); }} className="p-1 text-slate-300 hover:text-brand-850 dark:hover:text-brand-400 opacity-0 group-hover:opacity-100 transition"><Edit3 size={11} /></button>
                            <button onClick={() => handleRemoveActivity(idx)} className="p-1 text-slate-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition"><Trash2 size={11} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {visionResult.recommendations?.length > 0 && (
                  <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/50 dark:border-amber-900/20 rounded-xl p-3.5 space-y-1.5">
                    <p className="text-[10px] font-bold text-amber-800 dark:text-amber-350 uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb size={12} /> AI Suggestions
                    </p>
                    <ul className="space-y-1 text-[11px] text-amber-850 dark:text-amber-300">
                      {visionResult.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <TrendingDown size={11} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-450" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Confirm Action Button controls */}
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={resetImageSelection}
                    className="border border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 rounded-xl px-4 py-2 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                  >
                    Upload Another
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveVisionActivities}
                    disabled={submitting || !visionResult.activities?.length}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl px-5 py-2 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    {submitting ? "Saving..." : "Save Activities"}
                  </button>
                </div>
              </div>
            )}
          </div>
          
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
                      ? "border-brand-800 bg-gradient-to-br from-brand-50/70 to-emerald-50/30 dark:from-brand-950/20 dark:to-emerald-950/10 text-brand-900 dark:text-white shadow-sm font-semibold"
                      : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-650 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-sm shrink-0 ${
                    isActive ? "bg-brand-800 text-white" : iconColor
                  }`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider block">{label}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-550 font-medium block mt-1 leading-relaxed">{description}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm p-6 space-y-5">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center gap-2">
              <Sparkles size={14} className="text-brand-800 dark:text-brand-450" />
              Configure Footprint Parameters
            </h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 mb-1.5 uppercase tracking-wider">
                  Activity Vector
                </label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white transition"
                >
                  {category.activityTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 mb-1.5 uppercase tracking-wider">
                  Log Date
                </label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 mb-1.5 uppercase tracking-wider">
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
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl pl-4 pr-16 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-white transition"
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

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm text-xs space-y-2 text-slate-700 dark:text-slate-350">
            <p className="font-bold text-slate-800 dark:text-slate-200">Operational Sustainability Tips</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed">
              Choosing renewable electricity credits or taking public transit shifts variables by up to 80% on this platform.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Logs Deck */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Recent Logging History</h2>
            <p className="text-xs text-slate-450 dark:text-slate-400 mt-0.5">Your most recent carbon recordings.</p>
          </div>
          <button onClick={() => navigate("/history")} className="text-xs font-bold text-brand-850 hover:underline flex items-center gap-0.5">
            Full Audit logs
            <ChevronRight size={13} />
          </button>
        </div>

        {recentLogs.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center text-xs text-slate-400">
            No logged values detected. Use parameters card above to start.
          </div>
        ) : (
          <div className="grid sm:grid-cols-3 gap-4">
            {recentLogs.map((log) => (
              <div
                key={log.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-3 shadow-sm hover:shadow transition"
              >
                <CategoryIcon category={log.category} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-250 truncate">{log.activityType}</p>
                  <p className="text-[10px] text-slate-450 dark:text-slate-400 mt-1">
                    {log.quantity} {log.unit} · {log.logDate}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-slate-900 dark:text-white">{log.calculatedEmissionsKgCO2e?.toFixed(1)}</span>
                  <span className="text-[9px] text-slate-405 dark:text-slate-400 font-bold block">KG CO₂e</span>
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
    transport: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400",
    electricity: "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400",
    food: "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400",
    shopping: "bg-sky-50 text-sky-700 dark:bg-sky-950/20 dark:text-sky-400",
  };
  return (
    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${colorMap[category] || "bg-gray-100 text-gray-500"}`}>
      <Icon size={14} />
    </div>
  );
}
