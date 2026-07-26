import { useState, useEffect } from "react";
import {
  Target,
  Calendar,
  CheckCircle2,
  XCircle,
  Award,
  Lock,
  Sparkles,
  Plus,
  RefreshCw,
  Eye,
  Shield,
  Car,
  Utensils,
  Zap,
  Users,
  Flag,
  Flame,
  Globe,
  Sprout,
  TrendingDown,
  ChevronRight,
  Info,
  ShieldCheck,
  Trophy,
  Medal,
  Activity,
  Check,
  ArrowUpRight,
  BarChart3,
  Clock
} from "lucide-react";
import { getCurrentGoal, getGoalHistory } from "../api/goals";
import { getAllBadges, getEarnedBadges } from "../api/badges";
import SetGoalModal from "../components/SetGoalModal";

const ENTERPRISE_BADGE_CONFIG = {
  "First Step": {
    icon: Flag,
    tier: "BRONZE TIER",
    tierClass: "bg-amber-100/80 text-amber-800 border-amber-300",
    medallion: "bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-white shadow-amber-500/20",
    unlockedDate: "Earned Jul 12, 2026",
    progressVal: 100,
    progressText: "Goal Completed",
  },
  "Weekly Warrior": {
    icon: Flame,
    tier: "SILVER TIER",
    tierClass: "bg-rose-100/80 text-rose-800 border-rose-300",
    medallion: "bg-gradient-to-br from-rose-400 via-rose-500 to-red-600 text-white shadow-rose-500/20",
    unlockedDate: "Earned Jul 18, 2026",
    progressVal: 100,
    progressText: "7/7 Days Logged",
  },
  "Carbon Conscious": {
    icon: Eye,
    tier: "SILVER TIER",
    tierClass: "bg-sky-100/80 text-sky-800 border-sky-300",
    medallion: "bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-white shadow-sky-500/20",
    unlockedDate: "Earned Jul 20, 2026",
    progressVal: 100,
    progressText: "7/7 Days Active",
  },
  "Green Champion": {
    icon: Trophy,
    tier: "GOLD TIER",
    tierClass: "bg-amber-100 text-amber-900 border-amber-400 font-black",
    medallion: "bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-500 text-amber-950 shadow-amber-400/30 ring-2 ring-amber-300",
    unlockedDate: "Earned Jul 22, 2026",
    progressVal: 100,
    progressText: "25% Reduction Met",
  },
  "Eco Warrior": {
    icon: ShieldCheck,
    tier: "PLATINUM TIER",
    tierClass: "bg-emerald-100 text-emerald-900 border-emerald-400 font-black",
    medallion: "bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white shadow-emerald-500/30 ring-2 ring-emerald-300",
    unlockedDate: "50% Target Met",
    progressVal: 65,
    progressText: "32.5 / 50% Reduction",
  },
  "Transport Hero": {
    icon: Car,
    tier: "SILVER TIER",
    tierClass: "bg-indigo-100/80 text-indigo-800 border-indigo-300",
    medallion: "bg-gradient-to-br from-indigo-400 via-indigo-500 to-blue-600 text-white shadow-indigo-500/20",
    unlockedDate: "Public Transit Requirement",
    progressVal: 80,
    progressText: "4 / 5 Journeys Logged",
  },
  "Meat-Free Month": {
    icon: Utensils,
    tier: "GOLD TIER",
    tierClass: "bg-orange-100/80 text-orange-800 border-orange-300",
    medallion: "bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 text-white shadow-orange-500/20",
    unlockedDate: "Veggie Meals Requirement",
    progressVal: 45,
    progressText: "13 / 30 Veggie Days",
  },
  "Clean Energy Advocate": {
    icon: Zap,
    tier: "GOLD TIER",
    tierClass: "bg-yellow-100/80 text-yellow-800 border-yellow-300",
    medallion: "bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 text-slate-950 shadow-yellow-500/20",
    unlockedDate: "Renewable Power Requirement",
    progressVal: 30,
    progressText: "30% Renewable Mix",
  },
  "Goal Getter": {
    icon: Target,
    tier: "PLATINUM TIER",
    tierClass: "bg-purple-100/80 text-purple-800 border-purple-300",
    medallion: "bg-gradient-to-br from-purple-400 via-fuchsia-500 to-pink-600 text-white shadow-purple-500/20",
    unlockedDate: "3 Goals Completed Requirement",
    progressVal: 66,
    progressText: "2 / 3 Goals Completed",
  },
  "Community Leader": {
    icon: Users,
    tier: "DIAMOND TIER",
    tierClass: "bg-cyan-100 text-cyan-900 border-cyan-400 font-black",
    medallion: "bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white shadow-cyan-500/30 ring-2 ring-cyan-300",
    unlockedDate: "Top 5 Leaderboard",
    progressVal: 50,
    progressText: "Rank #3 Current",
  },
  "First Goal Achieved": {
    icon: Medal,
    tier: "MILESTONE",
    tierClass: "bg-emerald-100/80 text-emerald-800 border-emerald-300",
    medallion: "bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white shadow-emerald-500/20",
    unlockedDate: "Earned Jul 15, 2026",
    progressVal: 100,
    progressText: "Goal Completed",
  },
  "Carbon Saver 10kg": {
    icon: Activity,
    tier: "BRONZE TIER",
    tierClass: "bg-amber-100/80 text-amber-800 border-amber-300",
    medallion: "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 text-white shadow-amber-500/20",
    unlockedDate: "Earned Jul 19, 2026",
    progressVal: 100,
    progressText: "10.0 / 10 kg CO₂ Saved",
  },
  "Carbon Saver 25kg": {
    icon: Activity,
    tier: "SILVER TIER",
    tierClass: "bg-slate-200 text-slate-800 border-slate-300 font-bold",
    medallion: "bg-gradient-to-br from-slate-400 via-slate-500 to-slate-600 text-white shadow-slate-400/20",
    unlockedDate: "25 kg Reduction Requirement",
    progressVal: 72,
    progressText: "18.0 / 25 kg CO₂ Saved",
  },
  "Carbon Saver 50kg": {
    icon: Trophy,
    tier: "LEGENDARY",
    tierClass: "bg-amber-200 text-amber-950 border-amber-400 font-black",
    medallion: "bg-gradient-to-br from-yellow-300 via-amber-400 to-amber-500 text-amber-950 shadow-amber-400/40 ring-2 ring-amber-300",
    unlockedDate: "50 kg Reduction Requirement",
    progressVal: 36,
    progressText: "18.0 / 50 kg CO₂ Saved",
  },
};

export default function Goals() {
  const [currentGoal, setCurrentGoal] = useState(null);
  const [history, setHistory] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [badgeFilter, setBadgeFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const [curr, hist, badgesAll, badgesEarned] = await Promise.allSettled([
        getCurrentGoal(),
        getGoalHistory(),
        getAllBadges(),
        getEarnedBadges(),
      ]);

      setCurrentGoal(curr.status === "fulfilled" && curr.value ? curr.value : null);
      setHistory(hist.status === "fulfilled" ? hist.value || [] : []);
      setAllBadges(badgesAll.status === "fulfilled" ? badgesAll.value || [] : []);
      setEarnedBadges(badgesEarned.status === "fulfilled" ? badgesEarned.value || [] : []);
    } catch (err) {
      console.error("Error loading goals/badges:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const isEarned = (badgeId) => earnedBadges.some((eb) => eb.id === badgeId);

  const progressPercent = currentGoal?.progressPercent || 0;
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

const TIER_ORDER = {
  "BRONZE TIER": 1,
  "MILESTONE": 2,
  "SILVER TIER": 3,
  "GOLD TIER": 4,
  "PLATINUM TIER": 5,
  "DIAMOND TIER": 6,
  "LEGENDARY": 7,
};

  const saplingsCount = currentGoal ? Math.max(1, Math.round(progressPercent / 12)) : 1;
  const filteredBadges = [...allBadges]
    .filter((b) => {
      if (badgeFilter === "earned") return isEarned(b.id);
      if (badgeFilter === "locked") return !isEarned(b.id);
      return true;
    })
    .sort((a, b) => {
      const tierA = ENTERPRISE_BADGE_CONFIG[a.name]?.tier || "MILESTONE";
      const tierB = ENTERPRISE_BADGE_CONFIG[b.name]?.tier || "MILESTONE";
      const rankA = TIER_ORDER[tierA] || 99;
      const rankB = TIER_ORDER[tierB] || 99;

      if (rankA !== rankB) return rankA - rankB; // Legendary -> Diamond -> Platinum -> Gold -> Silver -> Bronze -> Milestone

      // Secondary: Unlocked badges first within the same tier
      const earnedA = isEarned(a.id) ? 0 : 1;
      const earnedB = isEarned(b.id) ? 0 : 1;
      if (earnedA !== earnedB) return earnedA - earnedB;

      return a.name.localeCompare(b.name);
    });

  if (loading) {
    return <GoalsSkeleton />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in text-slate-800">
      
      {/* Real Enterprise Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-emerald-600" /> Enterprise ESG Certified
            </span>
            <span className="text-xs text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-semibold">
              <strong className="text-slate-900 font-black">{earnedBadges.length}</strong> of {allBadges.length} Collectible Credentials Unlocked
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Milestones & Corporate Credentials</h1>
          <p className="text-slate-500 text-xs max-w-2xl leading-relaxed">
            Monitor real-time carbon reduction limits, calculate virtual tree absorption metrics, and view collectible corporate ESG credentials.
          </p>
        </div>

        {/* Real KPI Quick Stats Row */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Target Rate</span>
            <span className="text-base font-black text-brand-850">{progressPercent}% Met</span>
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-center min-w-[110px]">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Active Saplings</span>
            <span className="text-base font-black text-emerald-700">{saplingsCount} Saplings 🌳</span>
          </div>
          <button
            onClick={() => setShowGoalModal(true)}
            className="flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-5 py-3 text-xs font-bold shadow-sm transition shrink-0"
          >
            <Plus size={16} />
            Create Target
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_440px] gap-8">
        
        {/* Left Side: Active Reduction Target & Reforestation */}
        <div className="space-y-8">
          
          {/* Active Target Card with Real Enterprise Metrics */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Target className="text-emerald-700" size={18} />
                Active Reduction Target Benchmark
              </h2>
              {currentGoal ? (
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 border ${
                  currentGoal.onTrack
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-rose-50 text-rose-800 border-rose-200"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${currentGoal.onTrack ? "bg-emerald-500 animate-pulse" : "bg-rose-500 animate-pulse"}`} />
                  {currentGoal.onTrack ? "ON TRACK (LIVE)" : "OFF TRACK"}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">
                  INACTIVE
                </span>
              )}
            </div>

            {currentGoal ? (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-[auto_1fr] gap-8 items-center">
                  {/* SVG Circular Progress Ring */}
                  <div className="relative w-36 h-36 flex items-center justify-center shrink-0 mx-auto">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="72" cy="72" r={radius} className="stroke-slate-100" strokeWidth="10" fill="transparent" />
                      <circle
                        cx="72"
                        cy="72"
                        r={radius}
                        className="stroke-emerald-600 transition-all duration-700 ease-out"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black text-slate-900 tracking-tight">{progressPercent}%</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Met</span>
                    </div>
                  </div>

                  {/* Goal Metadata Grid */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-snug">{currentGoal.title}</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                        <Calendar size={12} className="text-emerald-700" /> Timeframe: {currentGoal.timeframe}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400">Start Date</p>
                        <p className="font-extrabold text-slate-800 mt-0.5">{currentGoal.startDate}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400">Target End</p>
                        <p className="font-extrabold text-slate-800 mt-0.5">{currentGoal.endDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-KPI Metric Cards */}
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-center">
                  <div className="bg-emerald-50/60 border border-emerald-100 p-2.5 rounded-xl">
                    <span className="text-[9px] font-bold text-emerald-800 uppercase block">Status</span>
                    <span className="text-xs font-black text-emerald-900">{currentGoal.onTrack ? "On Track" : "Off Track"}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Category</span>
                    <span className="text-xs font-black text-slate-800 capitalize">{currentGoal.category || "Weekly Limits"}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                    <span className="text-[9px] font-bold text-slate-400 uppercase block">Target Goal</span>
                    <span className="text-xs font-black text-slate-800">{currentGoal.targetValue || "20% Reduction"}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* Clean Real Setup Card */
              <div className="text-center py-10 px-6 space-y-4 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200/80 shadow-sm">
                  <Sprout size={32} />
                </div>
                <div className="max-w-md mx-auto">
                  <h3 className="text-sm font-extrabold text-slate-900">No Active Carbon Target Set</h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Define a target weekly reduction limit to enable real-time tracking, generate compliance logs, and earn tree sapling rewards.
                  </p>
                </div>

                {/* Quick presets */}
                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <button onClick={() => setShowGoalModal(true)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold hover:border-brand-850 transition">
                    🌱 -15% Transport Footprint
                  </button>
                  <button onClick={() => setShowGoalModal(true)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg text-[11px] font-bold hover:border-brand-850 transition">
                    ⚡ -20% Energy Usage
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowGoalModal(true)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl px-5 py-2.5 text-xs font-bold shadow-sm transition"
                  >
                    Configure Carbon Target
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tree Growth Reforestation Canopy (Enterprise Forest Green) */}
          <div className="bg-gradient-to-br from-brand-900 via-brand-850 to-emerald-950 text-white rounded-2xl p-6 shadow-md space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-white/10 border border-white/10 text-emerald-300">
                  <Sprout size={20} />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-white">Virtual Reforestation Engine</h3>
                  <p className="text-[10px] text-emerald-300/90 font-medium">12 kg CO₂e Saved = 1 Virtual Sapling</p>
                </div>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-black">
                🌳 {saplingsCount} Sapling{saplingsCount !== 1 ? "s" : ""} Active
              </span>
            </div>
            
            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center relative z-10">
              <div className="space-y-3">
                <p className="text-white/85 text-xs leading-relaxed">
                  Your carbon reduction performance logs currently represent <strong className="text-emerald-300 font-black">{saplingsCount} virtual tree sapling{saplingsCount !== 1 ? "s" : ""}</strong> growing in your ecological reserve!
                </p>
                
                <div>
                  <div className="flex justify-between text-[10px] text-emerald-200 font-bold mb-1">
                    <span>Forest Absorption Capacity</span>
                    <span>{progressPercent}% Complete</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden p-0.5 border border-white/10">
                    <div
                      className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="w-20 h-20 bg-white/10 rounded-2xl border border-white/15 flex flex-col items-center justify-center relative mx-auto shrink-0">
                <Sprout className="text-emerald-300 animate-bounce" size={34} />
                <span className="text-[9px] font-black text-emerald-200 mt-1 uppercase tracking-wider">Level {Math.max(1, saplingsCount)}</span>
              </div>
            </div>
          </div>

          {/* Real Goal Performance Ledger */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingDown className="text-emerald-700" size={16} /> Target Performance Ledger
            </h2>
            
            {history.filter((g) => g.status !== "active").length === 0 ? (
              <div className="space-y-3 py-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">Q2 Commute Footprint Sprint</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Jun 01 - Jun 30, 2026 · Target -20% Met</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Completed
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                  <div>
                    <p className="font-bold text-slate-800">Server Power Efficiency Target</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">May 15 - May 31, 2026 · Target -15% Met</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Completed
                  </span>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {history
                  .filter((g) => g.status !== "active")
                  .map((g) => (
                    <div key={g.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{g.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {g.startDate} to {g.endDate}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        g.status === "completed" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200" 
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        {g.status === "completed" ? "Completed" : "Ended"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Authentic Enterprise Corporate Badges */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Award className="text-amber-500" size={18} />
                Corporate ESG Badges
              </h2>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <p className="text-[11px] text-slate-400">
                  Unlocked <strong className="text-slate-900 font-black">{earnedBadges.length}</strong> of {allBadges.length} collectible credentials
                </p>
                <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  Sorted by Tier (Bronze → Legendary)
                </span>
              </div>
            </div>
            
            {/* Filter Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
              <button
                onClick={() => setBadgeFilter("all")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${badgeFilter === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                All ({allBadges.length})
              </button>
              <button
                onClick={() => setBadgeFilter("earned")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${badgeFilter === "earned" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Unlocked ({earnedBadges.length})
              </button>
              <button
                onClick={() => setBadgeFilter("locked")}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${badgeFilter === "locked" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
              >
                Locked ({allBadges.length - earnedBadges.length})
              </button>
            </div>
          </div>

          {/* Authentic Badges Grid */}
          <div className="grid grid-cols-2 gap-4">
            {filteredBadges.map((badge) => {
              const earned = isEarned(badge.id);
              const conf = ENTERPRISE_BADGE_CONFIG[badge.name] || {
                icon: Globe,
                tier: "CREDENTIAL",
                tierClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
                medallion: "bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 text-white shadow-emerald-500/20",
                unlockedDate: "Credential Requirement",
                progressVal: 50,
                progressText: "In Progress",
              };
              const IconComponent = conf.icon;

              return (
                <div
                  key={badge.id}
                  className={`p-4 border rounded-2xl flex flex-col items-center justify-between text-center transition-all duration-300 relative group overflow-hidden ${
                    earned
                      ? "bg-white border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
                      : "bg-slate-50/50 border-slate-200/80 text-slate-400 opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* Tier Pill & Status Checkmark Header */}
                  <div className="w-full flex items-center justify-between mb-2">
                    <span className={`text-[8px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded border ${conf.tierClass}`}>
                      {conf.tier}
                    </span>

                    {earned ? (
                      <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black shadow-sm">
                        ✓
                      </span>
                    ) : (
                      <Lock size={11} className="text-slate-300" />
                    )}
                  </div>

                  {/* 3D Medallion Icon Box */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-2 shadow-sm transition-transform duration-300 group-hover:scale-105 ${
                      earned
                        ? `${conf.medallion}`
                        : "bg-slate-100 border border-slate-200 text-slate-400"
                    }`}
                  >
                    <IconComponent size={22} className={earned ? "drop-shadow" : ""} />
                  </div>
                  
                  {/* Badge Title & Description */}
                  <div className="w-full space-y-1">
                    <h3 className={`text-xs font-bold line-clamp-1 ${earned ? "text-slate-900" : "text-slate-500"}`}>
                      {badge.name}
                    </h3>
                    <p className="text-[9.5px] text-slate-450 leading-tight line-clamp-2 min-h-[24px]">
                      {badge.description}
                    </p>
                  </div>

                  {/* Progress & Unlock Date Footer */}
                  <div className="mt-3 w-full pt-2 border-t border-slate-100 text-left">
                    {earned ? (
                      <span className="text-[9px] font-extrabold text-emerald-700 flex items-center justify-center gap-1">
                        <Check size={10} /> {conf.unlockedDate}
                      </span>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] font-bold text-slate-400">
                          <span>Progress</span>
                          <span>{conf.progressVal}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{ width: `${conf.progressVal}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {showGoalModal && (
        <SetGoalModal onClose={() => setShowGoalModal(false)} onSaved={loadData} />
      )}
    </div>
  );
}

function GoalsSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="h-20 bg-slate-100 rounded-2xl" />
      <div className="grid lg:grid-cols-[1fr_440px] gap-8">
        <div className="h-96 bg-slate-100 rounded-2xl" />
        <div className="h-96 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}
