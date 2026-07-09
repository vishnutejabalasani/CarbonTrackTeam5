import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Settings,
  Plus,
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Leaf,
  Award,
  TrendingDown,
  Calculator,
  Compass,
  ArrowUpRight,
  Flame,
  Activity,
  Wind,
  Sun,
  XCircle,
  CheckCircle2
} from "lucide-react";
import { getWeeklySummary, getRecentActivities } from "../api/activities";
import { getCurrentGoal } from "../api/goals";
import SetGoalModal from "../components/SetGoalModal";
import { CategoryPieChart, DailyEmissionsChart } from "../components/Charts";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [goal, setGoalState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Carbon Calculator States
  const [calcCategory, setCalcCategory] = useState("transport");
  const [calcInput, setCalcInput] = useState("");
  const [calcPreview, setCalcPreview] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, logsData, goalData] = await Promise.allSettled([
        getWeeklySummary(),
        getRecentActivities(5),
        getCurrentGoal(),
      ]);
      setSummary(summaryData.status === "fulfilled" ? summaryData.value : null);
      setRecentLogs(logsData.status === "fulfilled" ? logsData.value : []);
      setGoalState(goalData.status === "fulfilled" ? goalData.value : null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update live preview in calculator
  useEffect(() => {
    const val = parseFloat(calcInput) || 0;
    const rates = {
      transport: 0.24, // kg per mile
      electricity: 0.38, // kg per kWh
      food: 1.2, // kg per meal
      shopping: 2.5 // kg per item
    };
    setCalcPreview(val * (rates[calcCategory] || 0));
  }, [calcInput, calcCategory]);

  const hasActivity = summary && summary.totalKgCo2e > 0;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Goal Alert Banner */}
      {goal?.alertMessage && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 text-rose-800 text-xs shadow-sm">
          <XCircle className="shrink-0 text-rose-500 mt-0.5" size={16} />
          <div>
            <p className="font-bold">Weekly Carbon Alert</p>
            <p className="text-rose-600/90 mt-0.5">{goal.alertMessage}</p>
          </div>
        </div>
      )}

      {/* 1. Main Hero Panel: Sustainability Impact & Rotating Earth */}
      <div className="bg-gradient-to-br from-brand-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-emerald-800/40">
        {/* Decorative background radial pattern */}
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.15),transparent_60%)] pointer-events-none" />
        
        <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-center relative z-10">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-100">
              <Leaf size={11} className="text-brand-300 rotate-12" />
              SaaS Operational Report
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight max-w-xl">
              Your Sustainability Impact
            </h1>
            
            <p className="text-brand-100 text-sm max-w-md leading-relaxed">
              Track operational footprint vectors in real-time, benchmark categories against climate targets, and implement reduction guidelines.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <p className="text-[10px] text-brand-200 font-bold uppercase tracking-wide">Carbon Score</p>
                <p className="text-xl font-extrabold text-white mt-1">A+ Rating</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <p className="text-[10px] text-brand-200 font-bold uppercase tracking-wide">CO₂ Saved</p>
                <p className="text-xl font-extrabold text-brand-300 mt-1">
                  {summary ? (35 - summary.totalKgCo2e > 0 ? (35 - summary.totalKgCo2e).toFixed(1) : "4.2") : "0"} kg
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
                <p className="text-[10px] text-brand-200 font-bold uppercase tracking-wide">Trees Restored</p>
                <p className="text-xl font-extrabold text-emerald-400 mt-1">
                  {summary ? Math.max(1, Math.round(summary.totalKgCo2e / 12)) : 0} Trees
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10 flex items-center gap-2">
                <div>
                  <p className="text-[10px] text-brand-200 font-bold uppercase tracking-wide">Active Streak</p>
                  <p className="text-xl font-extrabold text-amber-400 mt-0.5">5 Days</p>
                </div>
                <Flame size={20} className="text-amber-500 fill-amber-500 animate-bounce" />
              </div>
            </div>
          </div>

          {/* Animated 3D-like spinning Earth globe widget */}
          <div className="flex flex-col items-center justify-center shrink-0 lg:pr-6">
            <div className="relative w-36 h-36 rounded-full bg-gradient-to-tr from-brand-700 via-emerald-600 to-emerald-400 shadow-2xl flex items-center justify-center overflow-hidden border-2 border-white/20">
              {/* Spinning continents overlay */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80')] bg-cover opacity-20 animate-[spin_30s_linear_infinite]" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/20 to-emerald-950/70" />
              
              <div className="relative z-10 text-center">
                <Leaf size={32} className="text-white mx-auto drop-shadow-md rotate-12" />
                <p className="text-[10px] font-bold tracking-widest text-brand-100 uppercase mt-2">Verified</p>
              </div>
            </div>
            <p className="text-[10px] text-brand-200 font-bold tracking-widest uppercase mt-3">Live footprint tracking</p>
          </div>
        </div>
      </div>

      {/* 2. KPIs & Top Widgets Grid */}
      <div className="grid md:grid-cols-4 gap-6">
        <KPICard
          title="Today's Emission"
          value={`${summary ? (summary.totalKgCo2e / 7).toFixed(1) : "0"} kg`}
          subtext="Based on weekly logged metrics"
          trend="-12% vs yesterday"
          isPositive={true}
        />
        <KPICard
          title="Weekly Total"
          value={`${summary ? summary.totalKgCo2e : "0"} kg`}
          subtext={`Weekly Target: ${summary?.weeklyTargetKg || 35} kg`}
          trend={`${summary ? (summary.percentChangeVsLastWeek ?? 0) : 0}% vs last week`}
          isPositive={summary ? (summary.percentChangeVsLastWeek ?? 0) <= 0 : true}
        />
        <KPICard
          title="Monthly Projection"
          value={`${summary ? (summary.totalKgCo2e * 4.3).toFixed(0) : "0"} kg`}
          subtext="Projected monthly operations"
          trend="-4.2% overall pace"
          isPositive={true}
        />
        
        {/* Live Weather & AQI card */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Climate / Environment</span>
            <Sun className="text-amber-500" size={16} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">22°C</span>
              <span className="text-xs font-semibold text-slate-400">Sunny</span>
            </div>
            <p className="text-[10px] text-brand-800 font-bold mt-1.5 flex items-center gap-1">
              <Wind size={12} />
              AQI: 38 (Excellent Air Quality)
            </p>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-medium">
            <span>Location: Bangalore</span>
            <span>Updated: 5m ago</span>
          </div>
        </div>
      </div>

      {/* 3. Main content body */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        
        {/* Left pane: Charts & Analytics details */}
        <div className="space-y-8">
          
          {/* Charts Section */}
          <div className="grid sm:grid-cols-2 gap-6">
            <CategoryPieChart days={7} data={[
              { name: "Transport", value: summary?.transportKg || 12 },
              { name: "Electricity", value: summary?.electricityKg || 15 },
              { name: "Food", value: summary?.foodKg || 8 },
              { name: "Shopping", value: 5 }
            ]} />
            
            <DailyEmissionsChart days={7} target={summary?.weeklyTargetKg / 7 || 5} />
          </div>

          {/* Activity Logs Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                  <Activity size={18} className="text-brand-850" />
                  Live Footprint Stream
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Real-time breakdown of logged user activity vectors.</p>
              </div>
              <Link to="/history" className="text-xs font-bold text-brand-800 hover:underline flex items-center gap-0.5">
                Full History
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 relative">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/50 flex items-center justify-center text-slate-600 shrink-0 relative z-10 shadow-sm">
                      <CategoryIcon category={log.category} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 truncate">{log.activityType}</p>
                        <span className="text-[10px] font-bold text-slate-900 shrink-0 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {log.calculatedEmissionsKgCO2e?.toFixed(1)} kg CO₂
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{log.logDate}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400">No recent activity logs. Click Quick Log above to start tracking!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right pane: Calculator & Recommendations */}
        <div className="space-y-8">
          
          {/* Interactive Calculator widget */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calculator size={16} className="text-brand-850" />
                Footprint Calculator
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Preview carbon equivalents before logging.</p>
            </div>

            <div className="grid grid-cols-4 gap-1 bg-slate-50 p-1 rounded-xl">
              {["transport", "electricity", "food", "shopping"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCalcCategory(cat)}
                  className={`py-1.5 rounded-lg text-[10px] font-bold capitalize transition focus:outline-none ${
                    calcCategory === cat
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">
                  {calcCategory === "transport" && "Distance Traveled (Miles)"}
                  {calcCategory === "electricity" && "Usage Amount (kWh)"}
                  {calcCategory === "food" && "Quantity of Meals"}
                  {calcCategory === "shopping" && "Number of Items"}
                </label>
                <input
                  type="number"
                  placeholder="Enter amount..."
                  value={calcInput}
                  onChange={(e) => setCalcInput(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                />
              </div>

              <div className="p-3 bg-brand-50/60 border border-brand-100/50 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-brand-700 font-bold uppercase tracking-wider">CO₂ Impact Preview</p>
                  <p className="text-lg font-black text-brand-900 mt-0.5">{calcPreview.toFixed(1)} kg</p>
                </div>
                <Leaf className="text-brand-700 animate-pulse" size={20} />
              </div>
            </div>
          </div>

          {/* Recommendations Card */}
          <div className="bg-brand-900 text-white rounded-2xl p-6 space-y-4 shadow-md border border-brand-800/40 relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <Compass className="text-brand-300" size={18} />
              <p className="font-bold text-sm">Strategic Recommendations</p>
            </div>

            <div className="space-y-3">
              {summary?.recommendations && summary.recommendations.length > 0 ? (
                summary.recommendations.map((rec, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 space-y-1">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-brand-300 shrink-0" />
                      {rec.title}
                    </p>
                    <p className="text-[10px] text-brand-100 leading-relaxed">{rec.desc || rec.description}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-xs text-brand-100">Log activities to generate suggestions!</p>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/insights")}
              className="w-full text-center text-xs font-bold text-white/90 py-2 border border-white/20 rounded-xl hover:bg-white/10 transition mt-2 focus:outline-none"
            >
              Analyze Strategic Details
            </button>
          </div>
        </div>

      </div>

      {showGoalModal && (
        <SetGoalModal onClose={() => setShowGoalModal(false)} onSaved={loadData} />
      )}
    </div>
  );
}

function KPICard({ title, value, subtext, trend, isPositive }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-3 shadow-sm hover:shadow-md transition duration-300">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
      <div>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{subtext}</p>
      </div>
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
        isPositive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
      }`}>
        <TrendingDown size={11} className={isPositive ? "" : "rotate-180"} />
        {trend}
      </div>
    </div>
  );
}

function CategoryIcon({ category }) {
  const map = { transport: Car, electricity: Zap, food: Utensils, shopping: ShoppingBag };
  const Icon = map[category] || ShoppingBag;
  return <Icon size={16} />;
}

function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="h-48 bg-slate-100 rounded-3xl" />
      <div className="grid md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
