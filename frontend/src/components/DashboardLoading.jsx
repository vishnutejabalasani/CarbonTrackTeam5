import React, { useState, useEffect } from "react";
import { Leaf, Sun, Zap, Sparkles, Wind, Shield, Activity, BarChart3 } from "lucide-react";
import LottieAnimation from "./LottieAnimation";
import { sustainabilityAnimationData } from "../assets/animations/sustainabilityData";

export default function DashboardLoading() {
  const loadingSteps = [
    { title: "Initializing ESG Engine...", subtitle: "Connecting to CarbonTrack AI Analytics" },
    { title: "Computing Scope 1, 2 & 3 Emissions...", subtitle: "Aggregating transport, energy & food activity logs" },
    { title: "Formulating Predictive AI Models...", subtitle: "Calculating weekly reduction trajectory & carbon target" },
    { title: "Finalizing Executive Dashboard...", subtitle: "Preparing interactive metrics & ESG reports" }
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev + 1) % loadingSteps.length);
    }, 700);
    return () => clearInterval(interval);
  }, []);

  const activeStep = loadingSteps[currentStepIndex];

  return (
    <div className="min-h-[85vh] max-w-7xl mx-auto p-6 sm:p-8 space-y-8 animate-fade-in flex flex-col justify-center">
      {/* 🌟 1. Central Ambient Animated Hero Card */}
      <div className="bg-gradient-to-br from-[#06180d] via-[#0b2b18] to-[#041008] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-2xl border border-emerald-800/40 text-center flex flex-col items-center justify-center min-h-[380px]">
        
        {/* Radial Ambient Glowing Aura */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22),transparent_70%)] pointer-events-none animate-glow-pulse" />

        {/* Orbiting Ring 1 (Clockwise) */}
        <div className="absolute w-64 h-64 border border-emerald-500/20 rounded-full pointer-events-none flex items-center justify-center animate-spin-slow">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500/20 backdrop-blur-md text-emerald-400 p-2 rounded-full border border-emerald-400/40 shadow-lg shadow-emerald-500/20">
            <Leaf size={18} className="animate-bounce" />
          </div>
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-500/20 backdrop-blur-md text-amber-300 p-2 rounded-full border border-amber-400/40 shadow-lg shadow-amber-500/20">
            <Sun size={18} />
          </div>
          <div className="absolute top-1/2 -right-3 -translate-y-1/2 bg-teal-500/20 backdrop-blur-md text-teal-300 p-2 rounded-full border border-teal-400/40 shadow-lg shadow-teal-500/20">
            <Zap size={18} />
          </div>
        </div>

        {/* Orbiting Ring 2 (Counter-Clockwise Outer) */}
        <div className="absolute w-80 h-80 border border-emerald-400/10 rounded-full pointer-events-none flex items-center justify-center animate-spin-slow" style={{ animationDirection: "reverse", animationDuration: "28s" }}>
          <div className="absolute top-4 left-6 bg-emerald-600/20 text-emerald-300 p-1.5 rounded-full border border-emerald-500/30">
            <Sparkles size={16} />
          </div>
          <div className="absolute bottom-4 right-6 bg-cyan-600/20 text-cyan-300 p-1.5 rounded-full border border-cyan-500/30">
            <Wind size={16} />
          </div>
          <div className="absolute top-1/2 -left-3 -translate-y-1/2 bg-emerald-700/20 text-emerald-200 p-1.5 rounded-full border border-emerald-400/30">
            <Shield size={16} />
          </div>
        </div>

        {/* Central Lottie Globe with Glowing Aura */}
        <div className="relative z-10 my-2 scale-105">
          <div className="absolute inset-0 bg-emerald-500/30 blur-2xl rounded-full animate-pulse" />
          <LottieAnimation
            animationData={sustainabilityAnimationData}
            className="w-48 h-48 sm:w-56 sm:h-56 relative z-10 drop-shadow-2xl"
            loop={true}
            autoplay={true}
          />
        </div>

        {/* Dynamic Loading Step Text */}
        <div className="relative z-10 space-y-2 mt-2 max-w-md">
          <div className="inline-flex items-center gap-2 bg-emerald-950/80 backdrop-blur-md px-3.5 py-1 rounded-full border border-emerald-500/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider shadow-sm">
            <Activity size={12} className="animate-spin text-emerald-400" />
            <span>{activeStep.title}</span>
          </div>

          <p className="text-slate-300 text-xs sm:text-sm font-medium transition-all duration-300 h-5">
            {activeStep.subtitle}
          </p>

          {/* Animated Glowing Progress Bar */}
          <div className="w-64 sm:w-80 h-2 bg-slate-950/80 rounded-full mx-auto overflow-hidden border border-emerald-800/40 p-0.5 shadow-inner mt-4">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 rounded-full shadow-lg shadow-emerald-500/50 animate-loader-progress" />
          </div>
        </div>
      </div>

      {/* 📊 2. Shimmering Glass Skeletons Preview Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <BarChart3 size={14} className="text-emerald-500" />
            <span>Loading Dashboard Layout Preview</span>
          </div>
          <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 animate-pulse">
            Syncing Live Data...
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="relative overflow-hidden bg-white dark:bg-slate-900/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3"
            >
              {/* Shimmer Sweep overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-full animate-shimmer-sweep" />

              <div className="flex items-center justify-between">
                <div className="w-16 h-3 bg-slate-200 dark:bg-slate-800 rounded-md" />
                <div className="w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              </div>
              <div className="w-24 h-7 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <div className="w-32 h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
