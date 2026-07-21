import { Sparkles, ArrowRight, ShieldCheck, TreePine } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "../assets/hero.png";

export default function EcoRestorationCard() {
  return (
    <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
      
      {/* Visual Image Header with Gradient Overlay */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={heroImg}
          alt="Eco Reforestation Impact"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-950 via-brand-950/50 to-transparent" />
        
        {/* Floating Glass Pill Badge */}
        <div className="absolute top-3 left-3 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
          <TreePine size={13} className="text-emerald-300" />
          <span>Global Impact Action</span>
        </div>

        {/* Caption over image */}
        <div className="absolute bottom-3 left-4 right-4 text-white space-y-0.5">
          <p className="font-extrabold text-sm leading-tight text-white drop-shadow">
            Verified Reforestation Network
          </p>
          <p className="text-[10px] text-brand-100 font-medium leading-normal line-clamp-1">
            Real-world native tree restoration funded by carbon reduction targets.
          </p>
        </div>
      </div>

      {/* Card Content Body */}
      <div className="p-5 space-y-4">
        {/* Metric Badges */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 rounded-xl p-2.5 text-center">
            <p className="text-[9px] font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">Platform Trees</p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">1,240 <span className="text-[9px] font-bold text-emerald-600">Planted</span></p>
          </div>

          <div className="bg-brand-50/70 dark:bg-brand-900/20 border border-brand-100 dark:border-brand-900/40 rounded-xl p-2.5 text-center">
            <p className="text-[9px] font-extrabold text-brand-800 dark:text-emerald-400 uppercase tracking-wide">CO₂ Neutralized</p>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">4.8 <span className="text-[9px] font-bold text-emerald-600">Tons</span></p>
          </div>
        </div>

        {/* Quick Call to Action Link */}
        <Link
          to="/community"
          className="w-full flex items-center justify-between bg-slate-50 dark:bg-brand-900/30 hover:bg-brand-800 hover:text-white dark:hover:bg-brand-900 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-brand-900/40 rounded-xl px-3.5 py-2.5 text-xs font-bold transition duration-300 group/btn"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400 group-hover/btn:text-white" />
            View Verified Projects
          </span>
          <ArrowRight size={13} className="group-hover/btn:translate-x-1 transition" />
        </Link>
      </div>
    </div>
  );
}
