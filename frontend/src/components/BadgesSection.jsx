import { useState } from "react";
import { Award, Sparkles, Flame, Trophy, Target, Lock, CheckCircle2, ShieldCheck, Leaf, Eye, Shield, Car, Utensils, Zap, Globe, Flag } from "lucide-react";

export default function BadgesSection({ allBadges = [], earnedBadges = [] }) {
  const [filter, setFilter] = useState("all");

  const earnedNames = new Set(earnedBadges.map((b) => b.name?.toLowerCase()));
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  // Map icon by badge name or category
  const getBadgeIcon = (name) => {
    const badgeIconMap = {
      "First Step": Leaf,
      "Weekly Warrior": Flame,
      "Carbon Conscious": Eye,
      "Goal Getter": Target,
      "Green Champion": Award,
      "Eco Warrior": Trophy,
      "Transport Hero": Car,
      "First Goal Achieved": ShieldCheck,
      "Carbon Saver 10kg": Sparkles,
      "Carbon Saver 25kg": Sparkles,
      "Carbon Saver 50kg": Trophy,
      "Meat-Free Month": Utensils,
      "Clean Energy Advocate": Zap,
      "Community Leader": Shield,
    };
    return badgeIconMap[name] || Award;
  };

  const getBadgeColor = (index) => {
    const colors = [
      "from-emerald-600 to-teal-800",
      "from-amber-500 to-emerald-600",
      "from-teal-600 to-brand-850",
      "from-emerald-500 to-cyan-700",
      "from-purple-600 to-emerald-700",
    ];
    return colors[index % colors.length];
  };

  // Build badge items strictly from real database API badges
  const badgesList = allBadges.map((badge, idx) => {
    const isEarned = earnedIds.has(badge.id) || earnedNames.has(badge.name?.toLowerCase());
    return {
      id: badge.id || badge.name,
      name: badge.name,
      description: badge.description || "Complete carbon goals to unlock.",
      criteria: badge.criteria,
      icon: getBadgeIcon(badge.name),
      status: isEarned ? "earned" : "locked",
      earnedAt: isEarned ? "Unlocked" : null,
      color: getBadgeColor(idx),
    };
  });

  const filteredBadges = badgesList.filter((b) => {
    if (filter === "earned") return b.status === "earned";
    if (filter === "locked") return b.status === "locked";
    return true;
  });

  const earnedCount = badgesList.filter((b) => b.status === "earned").length;
  const lockedCount = badgesList.filter((b) => b.status === "locked").length;

  return (
    <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-6 shadow-sm space-y-6 hover:shadow-md transition duration-300">
      
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-brand-900/30 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Award className="text-brand-850 dark:text-emerald-400 shrink-0" size={18} />
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">
              Corporate ESG Badges
            </h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
            Earned {earnedCount} of {badgesList.length} database credentials
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center gap-1 bg-slate-100/70 dark:bg-brand-900/30 p-1 rounded-xl text-xs font-bold shrink-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "all"
                ? "bg-white dark:bg-brand-950 text-slate-900 dark:text-white shadow-sm font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({badgesList.length})
          </button>
          <button
            onClick={() => setFilter("earned")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "earned"
                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 shadow-sm font-extrabold border border-emerald-200/50 dark:border-emerald-800/50"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Earned ({earnedCount})
          </button>
          <button
            onClick={() => setFilter("locked")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "locked"
                ? "bg-slate-200/60 dark:bg-brand-900/60 text-slate-700 dark:text-slate-300 shadow-sm font-extrabold"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Locked ({lockedCount})
          </button>
        </div>
      </div>

      {/* Badges Grid rendered from REAL API Data */}
      {filteredBadges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge) => {
            const Icon = badge.icon;
            const isEarned = badge.status === "earned";
            const isLocked = badge.status === "locked";

            return (
              <div
                key={badge.id}
                className={`group relative rounded-2xl border p-4 flex flex-col justify-between transition-all duration-300 ${
                  isEarned
                    ? "bg-gradient-to-br from-emerald-50/70 via-white to-brand-50/40 border-emerald-200/70 shadow-sm hover:shadow-lg hover:border-emerald-400/80 hover:-translate-y-1 dark:from-brand-950/60 dark:via-brand-900/30 dark:to-emerald-950/20 dark:border-emerald-800/50"
                    : "bg-slate-50/60 dark:bg-brand-950/20 border-slate-200/40 dark:border-brand-900/30 opacity-75 hover:opacity-100 hover:border-slate-300"
                }`}
              >
                {/* Badge Top Info & Emblem */}
                <div className="flex items-start gap-3.5">
                  {/* Emblem Icon Container */}
                  <div className="relative shrink-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110 ${
                        isEarned
                          ? `bg-gradient-to-br ${badge.color} text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-400/30`
                          : "bg-slate-200/80 dark:bg-brand-900/20 text-slate-400 border border-slate-300/50 dark:border-brand-900/40"
                      }`}
                    >
                      <Icon size={22} className={isEarned ? "drop-shadow" : ""} />
                    </div>

                    {/* Status Overlay Icon */}
                    {isEarned && (
                      <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm ring-2 ring-white dark:ring-slate-900">
                        <CheckCircle2 size={11} />
                      </div>
                    )}
                    {isLocked && (
                      <div className="absolute -bottom-1 -right-1 bg-slate-500 text-white rounded-full p-0.5 shadow-sm ring-2 ring-white dark:ring-slate-900">
                        <Lock size={10} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate group-hover:text-brand-850 dark:group-hover:text-emerald-300 transition-colors">
                        {badge.name}
                      </h4>

                      {/* Status Pill */}
                      {isEarned ? (
                        <span className="text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md shrink-0">
                          Earned
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-brand-900/30 px-2 py-0.5 rounded-md shrink-0">
                          Locked
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Earned Date / Criteria Footer */}
                <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-brand-900/30 flex items-center justify-between text-[10px] font-bold">
                  {isEarned ? (
                    <span className="flex items-center gap-1 text-emerald-800 dark:text-emerald-400">
                      <ShieldCheck size={12} className="text-emerald-600 dark:text-emerald-400" />
                      Earned & Verified
                    </span>
                  ) : (
                    <span className="text-slate-400 dark:text-slate-500 font-medium truncate">
                      {badge.criteria ? `Criteria: ${badge.criteria}` : "Lock status active"}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-50/50 dark:bg-brand-900/10 rounded-xl border border-slate-100 dark:border-brand-900/30">
          <p className="text-xs text-slate-400 dark:text-slate-500">No badges match the selected filter.</p>
        </div>
      )}
    </div>
  );
}
