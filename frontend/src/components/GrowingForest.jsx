import { useState, useEffect } from "react";
import { Leaf, Sun, CloudRain, AlertTriangle, HelpCircle } from "lucide-react";
import { getForestGuardianMsg } from "../api/activities";

export default function GrowingForest({ goal }) {
  const [hoveredTree, setHoveredTree] = useState(null);
  const [guardianMessage, setGuardianMessage] = useState("");
  const [guardianLoading, setGuardianLoading] = useState(false);

  useEffect(() => {
    async function fetchGuardian() {
      setGuardianLoading(true);
      try {
        const res = await getForestGuardianMsg();
        setGuardianMessage(res.message);
      } catch (err) {
        setGuardianMessage("The trees sway peacefully. Log your footprint to help the ecosystem thrive.");
      } finally {
        setGuardianLoading(false);
      }
    }
    fetchGuardian();
  }, [goal]);
  
  // Determine states based on goal
  const hasGoal = !!goal;
  const onTrack = hasGoal ? goal.onTrack : true;
  const progress = hasGoal ? Math.min(100, Math.max(0, goal.progressPercent || 0)) : 0;
  
  return (
    <div className="bg-white dark:bg-brand-950/40 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-6 shadow-sm relative overflow-hidden transition-all duration-300">
      {/* Floating background particles */}
      {hasGoal && onTrack && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <Leaf className="absolute text-emerald-500/20 anim-leaf top-4 left-1/4" size={14} style={{ animationDelay: "0s" }} />
          <Leaf className="absolute text-brand-400/20 anim-leaf top-6 left-1/2" size={16} style={{ animationDelay: "2s" }} />
          <Leaf className="absolute text-green-500/20 anim-leaf top-2 left-3/4" size={12} style={{ animationDelay: "4.5s" }} />
        </div>
      )}

      {/* Card Header */}
      <div className="flex items-center justify-between mb-4 relative z-20">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <span className="p-1 rounded bg-brand-50 dark:bg-brand-900/30 text-brand-850 dark:text-brand-350">🌳</span>
            Your Ecological Forest
          </h3>
          <p className="text-[10px] text-slate-400 mt-0.5">
            {hasGoal 
              ? `Visual representation of "${goal.title || 'Active Goal'}"`
              : "Active goal target state indicator"
            }
          </p>
        </div>
        {hasGoal ? (
          <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
            onTrack 
              ? "text-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900"
              : "text-red-700 bg-red-50 dark:bg-red-950/30 dark:text-red-400 border border-red-100 dark:border-red-900"
          }`}>
            {onTrack ? "Lush & On-Track" : "Deforested (Off-Track)"}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
            No Active Target
          </span>
        )}
      </div>

      {/* SVG Canvas Container */}
      <div className="h-44 bg-gradient-to-b from-sky-50 to-emerald-50/20 dark:from-brand-950/20 dark:to-emerald-950/10 rounded-xl relative overflow-hidden border border-slate-100 dark:border-brand-900/30 flex items-end justify-center">
        
        {/* Dynamic Sky Elements */}
        {!hasGoal ? (
          // Dusk/Dawning twilight sky for no goal
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/20 via-purple-900/10 to-transparent pointer-events-none" />
        ) : onTrack ? (
          // Radiant glowing sun
          <div className="absolute top-4 right-6 text-amber-400 animate-pulse pointer-events-none">
            <Sun size={28} className="fill-amber-300/40" />
          </div>
        ) : (
          // Heavy storm clouds and rain vector
          <div className="absolute inset-0 bg-slate-900/10 pointer-events-none flex flex-col items-center pt-2">
            <div className="flex gap-1.5 text-slate-400/60 animate-bounce">
              <CloudRain size={20} />
            </div>
            <div className="w-full h-full opacity-20 bg-[linear-gradient(to_bottom,rgba(0,0,0,0)_95%,rgba(255,255,255,0.8)_100%)] bg-[length:4px_20px]" />
          </div>
        )}

        {/* Forest Scene rendered via SVG */}
        <svg viewBox="0 0 400 120" className="w-full h-32 relative z-10 select-none">
          {/* Ground */}
          <path 
            d="M0 110 Q100 100 200 110 T400 110 L400 120 L0 120 Z" 
            fill={!hasGoal ? "#8d9e8d" : onTrack ? "#2c5e3b" : "#6e523f"} 
            className="transition-colors duration-500"
          />
          <path 
            d="M0 115 Q120 105 240 115 T400 115 L400 120 L0 120 Z" 
            fill={!hasGoal ? "#728c72" : onTrack ? "#1e4327" : "#573f30"}
            className="transition-colors duration-500"
          />

          {/* Render Trees based on state */}
          {!hasGoal ? (
            // A single small hopeful sapling
            <g transform="translate(200, 110)" className="cursor-pointer group">
              <line x1="0" y1="0" x2="0" y2="-20" stroke="#5c4033" strokeWidth="2.5" />
              <line x1="0" y1="-10" x2="6" y2="-14" stroke="#5c4033" strokeWidth="1.5" />
              <line x1="0" y1="-15" x2="-5" y2="-18" stroke="#5c4033" strokeWidth="1.5" />
              {/* Leaves */}
              <circle cx="0" cy="-22" r="6" fill="#8fbc8f" className="group-hover:scale-110 transition duration-300" />
              <circle cx="6" cy="-15" r="4" fill="#a2cca2" />
              <circle cx="-5" cy="-19" r="4" fill="#a2cca2" />
            </g>
          ) : onTrack ? (
            // Lush, green, thriving forest trees (5 trees)
            <>
              {/* Tree 1 (Left) */}
              <g 
                transform="translate(80, 110)" 
                className="cursor-help"
                onMouseEnter={() => setHoveredTree(1)}
                onMouseLeave={() => setHoveredTree(null)}
              >
                <rect x="-3" y="-35" width="6" height="35" fill="#4d2f1b" rx="2" />
                <circle cx="0" cy="-35" r="18" fill="#1e4d2b" className="transition-all duration-300 hover:scale-105" />
                <circle cx="-10" cy="-40" r="12" fill="#2d6a4f" />
                <circle cx="10" cy="-32" r="14" fill="#1b4332" />
              </g>
              {/* Tree 2 (Mid Left) */}
              <g 
                transform="translate(140, 112)" 
                className="cursor-help"
                onMouseEnter={() => setHoveredTree(2)}
                onMouseLeave={() => setHoveredTree(null)}
              >
                <rect x="-4" y="-45" width="8" height="45" fill="#4d2f1b" rx="2" />
                <polygon points="0,-55 -22,-20 22,-20" fill="#2d6a4f" className="transition-all duration-300 hover:scale-105" />
                <polygon points="0,-68 -16,-38 16,-38" fill="#40916c" />
                <polygon points="0,-78 -10,-55 10,-55" fill="#52b788" />
              </g>
              {/* Tree 3 (Center - Focus Tree) */}
              <g 
                transform="translate(200, 114)" 
                className="cursor-help"
                onMouseEnter={() => setHoveredTree(3)}
                onMouseLeave={() => setHoveredTree(null)}
              >
                <rect x="-5" y="-55" width="10" height="55" fill="#3a2212" rx="2" />
                {/* Layered canopy */}
                <circle cx="0" cy="-55" r="24" fill="#1b4332" className="transition-all duration-300 hover:scale-105" />
                <circle cx="-14" cy="-62" r="16" fill="#2d6a4f" />
                <circle cx="14" cy="-52" r="18" fill="#40916c" />
                <circle cx="0" cy="-75" r="15" fill="#52b788" />
                {/* Apples/Fruits on the tree indicating health */}
                <circle cx="-8" cy="-52" r="2.5" fill="#e05c5c" />
                <circle cx="10" cy="-60" r="2.5" fill="#e05c5c" />
                <circle cx="2" cy="-42" r="2.5" fill="#e05c5c" />
              </g>
              {/* Tree 4 (Mid Right) */}
              <g 
                transform="translate(260, 111)" 
                className="cursor-help"
                onMouseEnter={() => setHoveredTree(4)}
                onMouseLeave={() => setHoveredTree(null)}
              >
                <rect x="-4" y="-40" width="8" height="40" fill="#4d2f1b" rx="2" />
                <circle cx="0" cy="-40" r="20" fill="#1b4332" className="transition-all duration-300 hover:scale-105" />
                <circle cx="12" cy="-45" r="14" fill="#2d6a4f" />
                <circle cx="-12" cy="-35" r="12" fill="#40916c" />
              </g>
              {/* Tree 5 (Right) */}
              <g 
                transform="translate(320, 113)" 
                className="cursor-help"
                onMouseEnter={() => setHoveredTree(5)}
                onMouseLeave={() => setHoveredTree(null)}
              >
                <rect x="-3" y="-30" width="6" height="30" fill="#4d2f1b" rx="2" />
                <polygon points="0,-42 -15,-15 15,-15" fill="#2d6a4f" className="transition-all duration-300 hover:scale-105" />
                <polygon points="0,-52 -10,-28 10,-28" fill="#40916c" />
              </g>

              {/* Wildlife: Birds flying */}
              <path d="M 50,25 Q 55,20 60,25 Q 65,20 70,25" fill="none" stroke="#2d6a4f" strokeWidth="1.5" className="animate-pulse" />
              <path d="M 280,35 Q 285,30 290,35 Q 295,30 300,35" fill="none" stroke="#2d6a4f" strokeWidth="1.5" />
            </>
          ) : (
            // Withered, dry, barren trees indicating off-track status
            <>
              {/* Withered Tree 1 */}
              <g transform="translate(90, 110)">
                <path d="M0,0 Q-5,-20 -2,-40 Q0,-45 -5,-50" fill="none" stroke="#573f30" strokeWidth="3" />
                <path d="M-3,-22 Q-15,-28 -20,-22" fill="none" stroke="#573f30" strokeWidth="2" />
                <path d="M-1,-32 Q12,-38 18,-35" fill="none" stroke="#573f30" strokeWidth="1.5" />
                <circle cx="-20" cy="-22" r="2" fill="#a0522d" />
              </g>
              {/* Withered Tree 2 */}
              <g transform="translate(170, 112)">
                <path d="M0,0 Q2,-25 -1,-50 Q-3,-55 3,-62" fill="none" stroke="#573f30" strokeWidth="3.5" />
                <path d="M1,-28 Q15,-35 25,-42" fill="none" stroke="#573f30" strokeWidth="2.5" />
                <path d="M-1,-40 Q-12,-48 -22,-45" fill="none" stroke="#573f30" strokeWidth="2" />
              </g>
              {/* Withered Tree 3 (Center) */}
              <g transform="translate(230, 111)">
                <path d="M0,0 Q3,-30 -2,-60 Q-5,-68 4,-75" fill="none" stroke="#5a4537" strokeWidth="4.5" />
                <path d="M2,-35 Q-18,-42 -28,-50" fill="none" stroke="#5a4537" strokeWidth="2.5" />
                <path d="M1,-48 Q20,-58 28,-54" fill="none" stroke="#5a4537" strokeWidth="2" />
              </g>
              {/* Withered Tree 4 */}
              <g transform="translate(310, 113)">
                <path d="M0,0 Q-2,-20 -1,-40 Q2,-45 -2,-52" fill="none" stroke="#573f30" strokeWidth="3" />
                <path d="M-1,-20 Q12,-25 18,-20" fill="none" stroke="#573f30" strokeWidth="2" />
              </g>
            </>
          )}
        </svg>

        {/* Hover overlay panel */}
        {hoveredTree && (
          <div className="absolute top-2 left-2 bg-slate-900/90 text-white text-[10px] px-2 py-1 rounded border border-slate-700 shadow-md backdrop-blur pointer-events-none z-30">
            🌳 Healthy Canopy: +{(progress * 0.8).toFixed(0)}% absorption rate
          </div>
        )}
      </div>

      {/* Guardian Speech Bubble */}
      <div className="bg-emerald-50/50 dark:bg-brand-900/10 border border-emerald-100/50 dark:border-brand-900/30 rounded-xl p-3 text-[11px] text-slate-700 dark:text-slate-350 flex gap-2 items-start mt-3">
        <span className="text-base shrink-0">🧙‍♂️</span>
        <div className="min-w-0">
          <p className="font-extrabold text-emerald-800 dark:text-brand-300 flex items-center gap-1.5 leading-none">
            Forest Guardian
            {guardianLoading && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />}
          </p>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed italic mt-1 font-medium select-none">
            "{guardianMessage || 'The ecosystem rests. Track carbon to guide my advice.'}"
          </p>
        </div>
      </div>

      {/* Target status details footer */}
      <div className="mt-4 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
        {hasGoal ? (
          <>
            <span>Progress: {progress.toFixed(0)}%</span>
            <span>Target: -{goal.targetReductionPercent}% CO₂e</span>
          </>
        ) : (
          <span className="text-[10px] text-slate-400">Set a carbon savings goal to start growing trees in your interactive workspace forest!</span>
        )}
      </div>
    </div>
  );
}
