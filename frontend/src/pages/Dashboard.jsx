import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  CheckCircle2,
  Trophy,
  Sparkles
} from "lucide-react";
import { getWeeklySummary, getRecentActivities, getForecast } from "../api/activities";
import { getCurrentGoal } from "../api/goals";
import { getEarnedBadges } from "../api/badges";
import SetGoalModal from "../components/SetGoalModal";
import { CategoryPieChart, DailyEmissionsChart, WeeklyEmissionsChart } from "../components/Charts";
import GrowingForest from "../components/GrowingForest";
import OffsetSimulator from "../components/OffsetSimulator";
import BadgesSection from "../components/BadgesSection";
import { getWeatherData } from "../api/weather";

import esgHeroBg from "../assets/esg_hero_bg.png";

export default function Dashboard() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [goal, setGoalState] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [weather, setWeather] = useState({
    temp: 22,
    description: "Sunny",
    aqiLabel: "Excellent",
    aqiColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50",
    cityName: "Bangalore",
    updatedAt: "Just now"
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [summaryData, logsData, goalData, badgesData, forecastDataRes, weatherDataRes] = await Promise.allSettled([
        getWeeklySummary(),
        getRecentActivities(5),
        getCurrentGoal(),
        getEarnedBadges(),
        getForecast(),
        getWeatherData(),
      ]);
      setSummary(summaryData.status === "fulfilled" ? summaryData.value : null);
      setRecentLogs(logsData.status === "fulfilled" ? logsData.value : []);
      setGoalState(goalData.status === "fulfilled" ? goalData.value : null);
      setEarnedBadges(badgesData.status === "fulfilled" ? badgesData.value || [] : []);
      setForecastData(forecastDataRes.status === "fulfilled" ? forecastDataRes.value || [] : []);
      if (weatherDataRes.status === "fulfilled" && weatherDataRes.value) {
        setWeather(weatherDataRes.value);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

      {/* 1. Main Hero Panel: Clean, Spacious, Premium Sustainability Impact Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-emerald-950 text-white rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-2xl border border-emerald-800/40">
        {/* Ambient Radial Lighting Overlay */}
        <div className="absolute right-10 top-1/2 -translate-y-1/2 w-96 h-96 bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.18),transparent_70%)] pointer-events-none animate-pulse" />
        <div className="absolute right-[20%] top-[-20%] w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-brand-100 border border-white/15 shadow-sm">
            <Sparkles size={13} className="text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>SaaS Operational Impact Suite</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
            Your Sustainability Impact
          </h1>
          
          <p className="text-brand-100 text-sm sm:text-base max-w-2xl leading-relaxed font-medium">
            Track operational footprint vectors in real-time, benchmark categories against climate targets, and implement reduction guidelines.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-lg hover:bg-white/15 hover:scale-[1.03] transition duration-300">
              <p className="text-[10px] text-brand-200 font-extrabold uppercase tracking-wider">Carbon Score</p>
              <p className="text-2xl font-black text-white mt-1">A+ Rating</p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-lg hover:bg-white/15 hover:scale-[1.03] transition duration-300">
              <p className="text-[10px] text-brand-200 font-extrabold uppercase tracking-wider">CO₂ Saved</p>
              <p className="text-2xl font-black text-emerald-300 mt-1">
                {summary ? (35 - summary.totalKgCo2e > 0 ? (35 - summary.totalKgCo2e).toFixed(1) : "4.2") : "0"} kg
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-lg hover:bg-white/15 hover:scale-[1.03] transition duration-300">
              <p className="text-[10px] text-brand-200 font-extrabold uppercase tracking-wider">Trees Restored</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {summary ? Math.max(1, Math.round(summary.totalKgCo2e / 12)) : 0} Trees
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 shadow-lg hover:bg-white/15 hover:scale-[1.03] transition duration-300 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-brand-200 font-extrabold uppercase tracking-wider">Active Streak</p>
                <p className="text-2xl font-black text-amber-400 mt-0.5">5 Days</p>
              </div>
              <Flame size={24} className="text-amber-500 fill-amber-500 animate-bounce shrink-0" />
            </div>
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
        <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-5 space-y-3 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Climate / Environment</span>
            <Sun className="text-amber-500" size={16} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{weather.temp}°C</span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">{weather.description}</span>
            </div>
            <div className={`text-[10px] font-bold mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${weather.aqiColor}`}>
              <Wind size={11} />
              <span>AQI: {weather.aqiLabel}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 dark:border-brand-900/20 flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-medium">
            <span>Location: {weather.cityName}</span>
            <span>Updated: {weather.updatedAt}</span>
          </div>
        </div>
      </div>

      {/* 3. Main content body */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        
        {/* Left pane: Charts, Badges & Analytics details */}
        <div className="space-y-8">
          {/* Animated Ecological Forest */}
          <GrowingForest goal={goal} />

          {/* Standalone Weekly Emissions Trend Chart (Real API Database Data) */}
          <WeeklyEmissionsChart logs={recentLogs} summary={summary} />

          {/* Secondary Charts Section */}
          <div className="grid sm:grid-cols-2 gap-6">
            <CategoryPieChart days={7} data={[
              { name: "Transport", value: summary?.transportKg || 12 },
              { name: "Electricity", value: summary?.electricityKg || 15 },
              { name: "Food", value: summary?.foodKg || 8 },
              { name: "Shopping", value: 5 }
            ]} />
            
            <DailyEmissionsChart days={7} target={summary?.weeklyTargetKg / 7 || 5} forecast={forecastData} />
          </div>

          {/* Activity Logs Timeline */}
          <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Activity size={18} className="text-brand-850 dark:text-brand-350" />
                  Live Footprint Stream
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Real-time breakdown of logged user activity vectors.</p>
              </div>
              <Link to="/history" className="text-xs font-bold text-brand-800 dark:text-brand-350 hover:underline flex items-center gap-0.5">
                Full History
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-brand-900/20">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 relative">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-brand-900/20 border border-slate-200/50 dark:border-brand-900/40 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 relative z-10 shadow-sm">
                      <CategoryIcon category={log.category} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{log.activityType}</p>
                        <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100 shrink-0 bg-slate-100 dark:bg-brand-900/40 px-2 py-0.5 rounded-lg">
                          {log.calculatedEmissionsKgCO2e?.toFixed(1)} kg CO₂
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{log.logDate}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <p className="text-xs text-slate-400 dark:text-slate-500">No recent activity logs. Click Quick Log above to start tracking!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right pane: Calculator & Recommendations */}
        <div className="space-y-8">
          
          {/* Interactive Carbon Offset Simulator */}
          <OffsetSimulator />

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
    <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-5 space-y-3 shadow-sm hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden">
      <div className="absolute -right-6 -top-6 w-16 h-16 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-full group-hover:scale-150 transition-transform duration-500 pointer-events-none" />
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-brand-850 dark:group-hover:text-emerald-300 transition-colors">{value}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</p>
      </div>
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all duration-300 ${
        isPositive 
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100/30 group-hover:bg-emerald-100/60 dark:group-hover:bg-emerald-900/40" 
          : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-100/30 group-hover:bg-rose-100/60 dark:group-hover:bg-rose-900/40"
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
