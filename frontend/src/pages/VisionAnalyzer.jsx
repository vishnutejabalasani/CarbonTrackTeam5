import { useState, useEffect, useRef, useCallback } from "react";
import { Camera, Upload, Sparkles, Leaf, X, AlertTriangle, CheckCircle2, Edit3, Save, RotateCcw, ImagePlus, Trash2, TrendingDown, Lightbulb, Eye, ChevronDown, ChevronUp, History, Calendar, ExternalLink } from "lucide-react";
import { analyzeVisionImage, getVisionHistory, updateVisionAnalysis } from "../api/vision";
import { logActivity } from "../api/activities";

const BACKEND_URL = (import.meta.env.VITE_API_URL || "http://localhost:8080/api").replace("/api", "");

const CONFIDENCE_COLOR = (c) => {
  if (c >= 0.85) return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50";
  if (c >= 0.6) return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50";
  return "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50";
};

const CATEGORY_COLORS = {
  Transport: "from-blue-500 to-cyan-500",
  Food: "from-orange-500 to-amber-500",
  Electricity: "from-yellow-500 to-lime-500",
  Shopping: "from-purple-500 to-pink-500",
  Waste: "from-slate-500 to-gray-500",
  Industrial: "from-red-500 to-orange-500",
  Other: "from-teal-500 to-emerald-500",
};

const CATEGORY_ICONS = { Transport: "🚗", Food: "🍽️", Electricity: "⚡", Shopping: "🛍️", Waste: "♻️", Industrial: "🏭", Other: "🌿" };

export default function VisionAnalyzer() {
  const [activeTab, setActiveTab] = useState("analyze"); // "analyze" or "history"
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null); // VisionAnalysis object from backend
  const [error, setError] = useState("");
  const [editingIdx, setEditingIdx] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showRecs, setShowRecs] = useState(true);
  
  // History State
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch History
  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const data = await getVisionHistory();
      setHistory(data);
    } catch (err) {
      console.error("Error fetching vision history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  const handleFile = useCallback((file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) { setError("Please upload a PNG, JPEG, or WEBP image."); return; }
    if (file.size > 10 * 1024 * 1024) { setError("Image is too large. Max 10 MB."); return; }
    setError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    setSaved(false);
  }, []);

  const handleDrop = (e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); };
  const handleDragOver = (e) => { e.preventDefault(); setDragActive(true); };
  const handleDragLeave = () => setDragActive(false);

  const analyzeImage = async () => {
    if (!imageFile) return;
    setAnalyzing(true); setError(""); setProgress(0); setResult(null); setSaved(false);
    const timer = setInterval(() => setProgress((p) => Math.min(p + Math.random() * 12, 92)), 400);
    try {
      const data = await analyzeVisionImage(imageFile);
      clearInterval(timer); setProgress(100);
      setTimeout(() => { 
        setResult(data); 
        setAnalyzing(false); 
      }, 300);
    } catch (err) {
      clearInterval(timer); setProgress(0); setAnalyzing(false);
      setError(err?.response?.data?.error || "Analysis failed. Please try again.");
    }
  };

  const updateQuantity = async (idx, newQty) => {
    if (!result) return;
    const updated = { ...result };
    const activities = [...updated.detectedActivities];
    const act = { ...activities[idx] };
    const oldCarbon = act.estimatedCarbonKg;
    act.estimatedQuantity = parseFloat(newQty) || 0;
    act.estimatedCarbonKg = Math.round(act.estimatedQuantity * act.emissionFactor * 100) / 100;
    activities[idx] = act;
    updated.detectedActivities = activities;
    updated.totalEstimatedKgCO2e = Math.round((updated.totalEstimatedKgCO2e - oldCarbon + act.estimatedCarbonKg) * 100) / 100;
    
    // Recalculate breakdown
    const breakdown = {};
    activities.forEach((a) => { breakdown[a.category] = (breakdown[a.category] || 0) + a.estimatedCarbonKg; });
    updated.carbonBreakdown = breakdown;

    // Track user edits
    const edits = updated.userEdits ? { ...updated.userEdits } : {};
    edits[act.item] = act.estimatedQuantity;
    updated.userEdits = edits;

    setResult(updated);
    setEditingIdx(null);

    // Save changes to database
    try {
      await updateVisionAnalysis(result.id, {
        detectedActivities: activities,
        totalEstimatedKgCO2e: updated.totalEstimatedKgCO2e,
        carbonBreakdown: breakdown,
        userEdits: edits
      });
    } catch (err) {
      console.error("Failed to persist edits to DB:", err);
    }
  };

  const removeActivity = async (idx) => {
    if (!result) return;
    const updated = { ...result };
    const removed = updated.detectedActivities[idx];
    const activities = updated.detectedActivities.filter((_, i) => i !== idx);
    updated.detectedActivities = activities;
    updated.totalEstimatedKgCO2e = Math.round((updated.totalEstimatedKgCO2e - removed.estimatedCarbonKg) * 100) / 100;
    
    const breakdown = {};
    activities.forEach((a) => { breakdown[a.category] = (breakdown[a.category] || 0) + a.estimatedCarbonKg; });
    updated.carbonBreakdown = breakdown;

    setResult(updated);

    // Save changes to database
    try {
      await updateVisionAnalysis(result.id, {
        detectedActivities: activities,
        totalEstimatedKgCO2e: updated.totalEstimatedKgCO2e,
        carbonBreakdown: breakdown
      });
    } catch (err) {
      console.error("Failed to save deletion to DB:", err);
    }
  };

  const saveActivities = async () => {
    if (!result?.detectedActivities?.length) return;
    setSaving(true);
    try {
      for (const act of result.detectedActivities) {
        await logActivity({
          category: act.category.toLowerCase(),
          activityType: act.activityType,
          quantity: act.estimatedQuantity,
          unit: act.unit,
          logDate: new Date().toISOString().split("T")[0],
        });
      }
      setSaved(true);
      // Update status in DB
      await updateVisionAnalysis(result.id, { status: "saved" });
    } catch (err) {
      setError("Failed to save activities. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setImageFile(null); setImagePreview(null); setResult(null); setError(""); setProgress(0); setSaved(false);
  };

  const selectHistoryItem = (item) => {
    setResult(item);
    setImagePreview(BACKEND_URL + item.imageName);
    setSaved(item.status === "saved");
    setActiveTab("analyze");
  };

  const totalCarbon = result?.totalEstimatedKgCO2e || 0;
  const breakdown = result?.carbonBreakdown || {};
  const breakdownEntries = Object.entries(breakdown).sort((a, b) => b[1] - a[1]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Eye size={22} className="text-brand-700" /> AI Carbon Vision Analyzer
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Upload any photo to instantly detect carbon-emitting activities using Gemini Vision AI.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("analyze")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "analyze" ? "bg-brand-800 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <Sparkles size={13} className="inline mr-1.5" /> Analyze Image
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "history" ? "bg-brand-800 text-white shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <History size={13} className="inline mr-1.5" /> Past Analyses
          </button>
        </div>
      </div>

      {activeTab === "history" ? (
        // History List
        <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-2xl p-6 shadow-sm min-h-[400px]">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-1.5"><History size={16} className="text-brand-700" /> Historical Reports</h2>
          {loadingHistory ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <span className="w-8 h-8 border-4 border-brand-200 border-t-brand-800 rounded-full animate-spin" />
              <p className="text-slate-400 text-xs font-medium">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <History size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No records found</p>
                <p className="text-xs text-slate-400 mt-0.5">Analyses you perform will be saved here dynamically.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {history.map((item) => (
                <div key={item.id} className="bg-slate-50/50 dark:bg-slate-950/30 border border-slate-200/60 dark:border-slate-800/80 rounded-xl p-4 flex flex-col hover:border-brand-400 dark:hover:border-brand-650 transition cursor-pointer" onClick={() => selectHistoryItem(item)}>
                  <div className="flex gap-3">
                    <img src={BACKEND_URL + item.imageName} alt="Source" className="w-14 h-14 rounded-lg object-cover bg-slate-100 border border-slate-200/50 dark:border-slate-800 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.title}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1"><Calendar size={10} /> {new Date(item.createdAt).toLocaleDateString()}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white">{item.totalEstimatedKgCO2e} kg</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${item.status === "saved" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>{item.status === "saved" ? "Saved Log" : "Draft"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Main Analyzer Tab
        <div className={`grid gap-8 ${result ? "lg:grid-cols-[1fr_400px]" : ""}`}>
          {/* Left Column */}
          <div className="space-y-6">
            {/* Upload Area */}
            {!result && (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => !analyzing && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragActive ? "border-brand-500 bg-brand-50/50 scale-[1.01]"
                  : imagePreview ? "border-emerald-300 bg-emerald-50/30"
                  : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-brand-400 hover:bg-brand-50/20"
                }`}
              >
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
                {imagePreview ? (
                  <div className="space-y-4">
                    <img src={imagePreview} alt="Preview" className="max-h-72 mx-auto rounded-xl shadow-lg object-contain" />
                    <p className="text-xs text-slate-500 font-medium">{imageFile?.name} · {(imageFile?.size / 1024).toFixed(0)} KB</p>
                    <div className="flex justify-center gap-3">
                      <button onClick={(e) => { e.stopPropagation(); reset(); }} className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5">
                        <RotateCcw size={12} /> Change Image
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); analyzeImage(); }} disabled={analyzing} className="px-6 py-2 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold transition disabled:opacity-50 flex items-center gap-1.5 shadow-sm">
                        {analyzing ? (
                          <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analyzing...</>
                        ) : (
                          <><Sparkles size={12} /> Analyze with AI</>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 space-y-3">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-brand-100 to-emerald-100 dark:from-brand-950 dark:to-emerald-950 flex items-center justify-center text-brand-700">
                      <Camera size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Drop an image here or click to upload</p>
                      <p className="text-[11px] text-slate-400 mt-1">Supports PNG, JPEG, WEBP · Max 10 MB</p>
                    </div>
                    <div className="flex justify-center gap-2 pt-2">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg">🍔 Meals</span>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg">🚗 Vehicles</span>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg">⚡ Appliances</span>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg">🛍️ Shopping</span>
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-lg">✈️ Travel</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Progress Bar */}
            {analyzing && (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-6 shadow-sm space-y-4 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-800 to-emerald-700 flex items-center justify-center text-white shadow-sm">
                    <Sparkles size={16} className="animate-pulse" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Gemini Vision is analyzing your image...</p>
                    <p className="text-[10px] text-slate-400 font-medium">Detecting objects · Estimating emissions · Generating insights</p>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-850 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 rounded-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                  <span>{progress < 30 ? "Uploading image..." : progress < 60 ? "Detecting objects..." : progress < 90 ? "Calculating emissions..." : "Generating report..."}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 rounded-xl px-4 py-3 text-xs text-rose-700 dark:text-rose-450 animate-fade-in">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <p className="flex-1">{error}</p>
                <button onClick={() => setError("")} className="shrink-0 ml-auto"><X size={14} /></button>
              </div>
            )}

            {/* Results: Detected Activities */}
            {result && (
              <div className="space-y-6 animate-fade-in">
                {/* Summary Card */}
                <div className="bg-gradient-to-br from-brand-900 to-emerald-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                  <div className="relative z-10 flex items-start gap-4">
                    {imagePreview && <img src={imagePreview} alt="Analyzed" className="w-20 h-20 rounded-xl object-cover shadow-lg border-2 border-white/20 shrink-0 bg-slate-900" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 mb-1">AI Analysis Complete</p>
                      <h2 className="text-lg font-bold truncate">{result.title}</h2>
                      <p className="text-xs text-white/70 mt-1 line-clamp-2">{result.summary}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <div>
                          <span className="text-2xl font-black">{totalCarbon}</span>
                          <span className="text-xs ml-1 text-white/60">kg CO₂e</span>
                        </div>
                        <div className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${CONFIDENCE_COLOR(result.overallConfidence)}`}>
                          {Math.round((result.overallConfidence || 0) * 100)}% confidence
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activity Cards */}
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-1.5"><Leaf size={14} className="text-brand-700" /> Detected Activities ({result.detectedActivities?.length || 0})</h3>
                  <div className="space-y-2">
                    {result.detectedActivities?.map((act, idx) => (
                      <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 p-4 shadow-sm hover:shadow-md transition group">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${CATEGORY_COLORS[act.category] || CATEGORY_COLORS.Other} flex items-center justify-center text-white text-sm shrink-0 shadow-sm`}>
                            {CATEGORY_ICONS[act.category] || "🌿"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{act.item}</span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{act.category}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                              <span>Factor: {act.emissionFactor} kg/{act.unit}</span>
                              <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${CONFIDENCE_COLOR(act.confidence)}`}>{Math.round(act.confidence * 100)}%</span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            {editingIdx === idx ? (
                              <div className="flex items-center gap-1">
                                <input type="number" value={editValue} onChange={(e) => setEditValue(e.target.value)} className="w-16 px-2 py-1 border border-brand-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg text-xs text-right focus:outline-none focus:ring-2 focus:ring-brand-500/20" autoFocus />
                                <span className="text-[10px] text-slate-400">{act.unit}</span>
                                <button onClick={() => updateQuantity(idx, editValue)} className="p-1 text-brand-700 hover:bg-brand-50 rounded-lg"><Save size={12} /></button>
                                <button onClick={() => setEditingIdx(null)} className="p-1 text-slate-400 hover:bg-slate-50 rounded-lg"><X size={12} /></button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white">{act.estimatedCarbonKg} <span className="text-[10px] font-medium text-slate-400">kg</span></p>
                                  <p className="text-[10px] text-slate-400">{act.estimatedQuantity} {act.unit}</p>
                                </div>
                                <button onClick={() => { setEditingIdx(idx); setEditValue(String(act.estimatedQuantity)); }} className="p-1.5 text-slate-300 dark:text-slate-700 hover:text-brand-700 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-slate-850 rounded-lg transition opacity-0 group-hover:opacity-100" title="Edit quantity"><Edit3 size={12} /></button>
                                <button onClick={() => removeActivity(idx)} className="p-1.5 text-slate-300 dark:text-slate-700 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition opacity-0 group-hover:opacity-100" title="Remove"><Trash2 size={12} /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {result.recommendations?.length > 0 && (
                  <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200/55 dark:border-amber-900/30 rounded-2xl p-5">
                    <button onClick={() => setShowRecs(!showRecs)} className="w-full flex items-center justify-between text-sm font-bold text-amber-900 dark:text-amber-350">
                      <span className="flex items-center gap-1.5"><Lightbulb size={14} className="text-amber-600 dark:text-amber-450" /> AI Recommendations ({result.recommendations.length})</span>
                      {showRecs ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    {showRecs && (
                      <ul className="mt-3 space-y-2">
                        {result.recommendations.map((rec, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-amber-850 dark:text-amber-300">
                            <TrendingDown size={12} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {saved ? (
                    <div className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-xl text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                      <CheckCircle2 size={14} /> Activities Saved Successfully
                    </div>
                  ) : (
                    <button onClick={saveActivities} disabled={saving || !result.detectedActivities?.length} className="flex-1 bg-brand-800 hover:bg-brand-900 text-white rounded-xl py-3 text-xs font-bold transition disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-sm">
                      {saving ? <><span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save size={13} /> Save All Activities</>}
                    </button>
                  )}
                  <button onClick={reset} className="px-5 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5">
                    <ImagePlus size={13} /> New Image
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Breakdown */}
          {result && (
            <div className="space-y-5">
              {/* Pie-style Breakdown */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Carbon Breakdown</h3>
                <div className="space-y-3">
                  {breakdownEntries.map(([cat, val]) => (
                    <div key={cat}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">{CATEGORY_ICONS[cat] || "🌿"} {cat}</span>
                        <span className="font-black text-slate-900 dark:text-white">{val.toFixed(2)} kg</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div className={`h-full bg-gradient-to-r ${CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other} rounded-full transition-all duration-500`} style={{ width: `${totalCarbon > 0 ? (val / totalCarbon) * 100 : 0}%` }} />
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5 text-right">{totalCarbon > 0 ? ((val / totalCarbon) * 100).toFixed(1) : 0}%</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                  <span className="text-xs font-bold text-slate-500">Total Estimated</span>
                  <span className="text-xl font-black text-brand-800 dark:text-brand-400">{totalCarbon} <span className="text-xs font-medium text-slate-400">kg CO₂e</span></span>
                </div>
              </div>

              {/* Environmental Impact */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-5 shadow-sm">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Environmental Impact</h3>
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="text-lg">🌳</span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Trees Needed</p>
                      <p className="text-[10px] text-slate-400">{(totalCarbon / 21.77).toFixed(2)} trees to offset (annual)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="text-lg">📱</span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Phone Charges</p>
                      <p className="text-[10px] text-slate-400">≈ {Math.round(totalCarbon / 0.008)} smartphone charges</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="text-lg">🚿</span>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">Hot Showers</p>
                      <p className="text-[10px] text-slate-400">≈ {(totalCarbon / 0.545).toFixed(1)} eight-minute showers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Preview */}
              {imagePreview && (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-4 shadow-sm">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Source Image</h3>
                  <div className="relative group overflow-hidden rounded-xl">
                    <img src={imagePreview} alt="Analyzed" className="w-full rounded-xl object-contain max-h-48 bg-slate-900 border border-slate-200 dark:border-slate-800" />
                    <a href={imagePreview} target="_blank" rel="noreferrer" className="absolute top-2 right-2 bg-slate-950/60 hover:bg-slate-950 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition"><ExternalLink size={12} /></a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
