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
  Sprout
} from "lucide-react";
import { getCurrentGoal, getGoalHistory } from "../api/goals";
import { getAllBadges, getEarnedBadges } from "../api/badges";
import SetGoalModal from "../components/SetGoalModal";

export default function Goals() {
  const [currentGoal, setCurrentGoal] = useState(null);
  const [history, setHistory] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);

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

  // SVG Circular Ring calculations
  const progressPercent = currentGoal?.progressPercent || 0;
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  if (loading) {
    return <GoalsSkeleton />;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Milestones & Carbon Objectives</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Set carbon limits, analyze operational targets, and earn corporate ESG badges.</p>
        </div>
        <button
          onClick={() => setShowGoalModal(true)}
          className="flex items-center gap-2 bg-brand-800 hover:bg-brand-900 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition"
        >
          <Plus size={15} />
          Create New Target
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        
        {/* Left Side: Active Goal details & Timeline */}
        <div className="space-y-8">
          
          {/* Active Target Card */}
          <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-900/30 pb-3">
              <h2 className="font-bold text-slate-950 dark:text-white text-sm flex items-center gap-2">
                <Target className="text-brand-850 dark:text-brand-350" size={16} />
                Active Reduction Target
              </h2>
              {currentGoal && (
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                  currentGoal.onTrack ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400"
                }`}>
                  {currentGoal.onTrack ? "On Track" : "Off Track"}
                </span>
              )}
            </div>

            {currentGoal ? (
              <div className="grid md:grid-cols-[auto_1fr] gap-6 items-center">
                {/* Circular SVG Progress Ring */}
                <div className="relative w-32 h-32 flex items-center justify-center shrink-0 mx-auto">
                  <svg className="w-full h-full transform -rotate-95">
                    <circle cx="64" cy="64" r={radius} className="text-slate-100 dark:text-brand-900/40" strokeWidth="8" stroke="currentColor" fill="transparent" />
                    <circle
                      cx="64"
                      cy="64"
                      r={radius}
                      className="text-brand-800 dark:text-emerald-400 transition-all duration-500 ease-out"
                      strokeWidth="8"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{progressPercent}%</span>
                    <span className="text-[8px] font-bold text-slate-400 uppercase">Target</span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-950 dark:text-white text-base">{currentGoal.title}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">
                      Timeframe: {currentGoal.timeframe}
                    </p>
                  </div>

                  <div className="flex gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Start Date</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{currentGoal.startDate}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase font-bold text-slate-400">Target End</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{currentGoal.endDate}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <Sprout className="text-slate-200 dark:text-brand-900 mx-auto" size={40} />
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">No active carbon goals.</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Define a target weekly limit to start monitoring progress.</p>
                </div>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="bg-brand-800 hover:bg-brand-900 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition focus:outline-none"
                >
                  Configure Carbon Target
                </button>
              </div>
            )}
          </div>

          {/* Tree Growing progress visualizer card */}
          <div className="bg-gradient-to-br from-emerald-800 to-brand-900 text-white rounded-2xl p-6 shadow-md border border-brand-850/40 relative overflow-hidden">
            <div className="absolute right-[-5%] bottom-[-10%] w-36 h-36 bg-white/5 rounded-full pointer-events-none" />
            <div className="flex items-center gap-2 mb-3">
              <Sprout className="text-brand-300" size={16} />
              <p className="font-bold text-sm">Your Tree Growth Status</p>
            </div>
            
            <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
              <div>
                <p className="text-brand-100 text-xs leading-relaxed">
                  Every 12 kg CO₂e saved from your target grows a virtual tree sapling. Your current active logs represent <strong>{currentGoal ? Math.max(1, Math.round(progressPercent / 12)) : 0} virtual tree saplings</strong> growing!
                </p>
                <div className="w-full bg-white/10 rounded-full h-1.5 mt-4">
                  <div
                    className="bg-emerald-400 h-1.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, progressPercent)}%` }}
                  />
                </div>
              </div>
              
              {/* Sapling growth graphics */}
              <div className="w-20 h-20 bg-white/10 rounded-full border border-white/10 flex items-center justify-center relative mx-auto">
                <Sprout className="text-emerald-400 animate-bounce" size={32} />
              </div>
            </div>
          </div>

          {/* Goal History ledger */}
          <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-900 dark:text-white text-sm">Target Performance Ledger</h2>
            
            {history.filter((g) => g.status !== "active").length === 0 ? (
              <p className="text-xs text-slate-450 dark:text-slate-500 py-6 text-center">No historical completed target logs found.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-brand-900/30">
                {history
                  .filter((g) => g.status !== "active")
                  .map((g) => (
                    <div key={g.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{g.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {g.startDate} to {g.endDate}
                        </p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                        g.status === "completed" ? "bg-brand-50 text-brand-850 dark:bg-emerald-950/30 dark:text-emerald-400" : "bg-slate-50 text-slate-400 dark:bg-brand-900/20"
                      }`}>
                        {g.status === "completed" ? "Completed" : "Abandoned"}
                      </span>
                    </div>
                  ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Collectible achievements & Badges */}
        <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-6 shadow-sm space-y-5">
          <div>
            <h2 className="font-bold text-slate-950 dark:text-white text-sm flex items-center gap-2">
              <Award className="text-brand-850 dark:text-brand-350" size={16} />
              Corporate Badges
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Earned {earnedBadges.length} of {allBadges.length} collectible credentials
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {allBadges.map((badge) => {
              const earned = isEarned(badge.id);
              const badgeIconMap = {
                "Carbon Conscious": Eye,
                "Green Champion": Award,
                "Eco Warrior": Shield,
                "Transport Hero": Car,
                "Meat-Free Month": Utensils,
                "Clean Energy Advocate": Zap,
                "Goal Getter": Target,
                "Community Leader": Users,
                "First Step": Flag,
                "Weekly Warrior": Flame
              };
              const IconComponent = badgeIconMap[badge.name] || Globe;

              return (
                <div
                  key={badge.id}
                  className={`p-4 border rounded-2xl flex flex-col items-center justify-center text-center transition duration-300 relative group overflow-hidden ${
                    earned
                      ? "border-emerald-200 bg-gradient-to-b from-brand-50/20 to-emerald-50/10 text-brand-900 shadow-sm dark:border-emerald-800/50 dark:from-brand-900/40 dark:to-emerald-950/20 dark:text-emerald-300"
                      : "border-slate-150 bg-slate-50/20 text-slate-400 opacity-60 dark:border-brand-900/30 dark:bg-brand-900/10"
                  }`}
                >
                  {/* Gold/Silver glow indicators */}
                  {earned && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition duration-300" />
                  )}

                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 shadow-sm relative z-10 transition duration-300 group-hover:scale-105 ${
                      earned ? "bg-white text-brand-800 border border-brand-100/50 dark:bg-brand-900 dark:text-emerald-300 dark:border-brand-800" : "bg-slate-100 text-slate-400 dark:bg-brand-900/20"
                    }`}
                  >
                    {earned ? <IconComponent size={15} /> : <Lock size={13} />}
                  </div>
                  
                  <h3 className="text-[10px] font-bold line-clamp-1 relative z-10">{badge.name}</h3>
                  <p className="text-[9px] text-slate-450 dark:text-slate-500 mt-1 leading-tight line-clamp-2 relative z-10">
                    {badge.description}
                  </p>
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
      <div className="h-6 w-48 bg-slate-100 rounded" />
      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="h-64 bg-slate-100 rounded-2xl" />
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}
