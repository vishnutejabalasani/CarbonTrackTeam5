import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  FileSpreadsheet,
  Leaf,
  Award,
  TrendingDown,
  ArrowUpRight,
  Flame,
  Activity,
  Wind,
  Sun,
  XCircle,
  CheckCircle2,
  Trophy,
  Sparkles,
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  RefreshCw,
  Send,
  Building2,
  BarChart3,
  User,
  LayoutGrid,
} from "lucide-react";
import { getWeeklySummary, getRecentActivities, getForecast } from "../api/activities";
import { getCurrentGoal } from "../api/goals";
import { getEarnedBadges } from "../api/badges";
import { getWeatherData } from "../api/weather";
import { getDashboardMetrics, getWeeklyEmissionsData } from "../api/dashboard";
import { getEsgReport } from "../api/esg";
import { generateEsgPdfReport } from "../utils/pdfExport";
import { generateEsgExcelReport } from "../utils/excelExport";

import SetGoalModal from "../components/SetGoalModal";
import SendReportModal from "../components/SendReportModal";
import GrowingForest from "../components/GrowingForest";
import OffsetSimulator from "../components/OffsetSimulator";
import WeeklyEmissionsChart from "../components/WeeklyEmissionsChart";
import LottieAnimation from "../components/LottieAnimation";
import { sustainabilityAnimationData } from "../assets/animations/sustainabilityData";

import { useTranslation } from "react-i18next";

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [weeklyChartData, setWeeklyChartData] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [goal, setGoalState] = useState(null);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showSendReportModal, setShowSendReportModal] = useState(false);

  const [weather, setWeather] = useState({
    temp: 22,
    description: "Sunny",
    aqiLabel: "Excellent",
    aqiColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/50",
    cityName: "Bangalore",
    updatedAt: "Just now",
  });

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        dashRes,
        weeklyChartRes,
        logsData,
        goalData,
        badgesData,
        forecastRes,
        weatherRes,
      ] = await Promise.allSettled([
        getDashboardMetrics(),
        getWeeklyEmissionsData(),
        getRecentActivities(5),
        getCurrentGoal(),
        getEarnedBadges(),
        getForecast(),
        getWeatherData(),
      ]);

      if (dashRes.status === "fulfilled" && dashRes.value) {
        setSummary(dashRes.value);
      } else {
        const fallbackSummary = await getWeeklySummary().catch(() => null);
        setSummary(fallbackSummary);
      }

      if (weeklyChartRes.status === "fulfilled" && weeklyChartRes.value) {
        setWeeklyChartData(weeklyChartRes.value);
      }

      setRecentLogs(logsData.status === "fulfilled" ? logsData.value : []);
      setGoalState(goalData.status === "fulfilled" ? goalData.value : null);
      setEarnedBadges(badgesData.status === "fulfilled" ? badgesData.value || [] : []);
      setForecastData(forecastRes.status === "fulfilled" ? forecastRes.value || [] : []);

      if (weatherRes.status === "fulfilled" && weatherRes.value) {
        setWeather(weatherRes.value);
      }
    } catch (err) {
      console.error("Dashboard loading error:", err);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleDownloadPdf = async () => {
    setExportingPdf(true);
    try {
      const report = await getEsgReport(0);
      generateEsgPdfReport(report);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Unable to generate PDF report. Please check server logs.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setExportingExcel(true);
    try {
      const report = await getEsgReport(0);
      generateEsgExcelReport(report);
    } catch (err) {
      console.error("Failed to export Excel:", err);
      alert("Unable to generate Excel report. Please check server logs.");
    } finally {
      setExportingExcel(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 text-center space-y-4 animate-fade-in">
        <div className="relative">
          <LottieAnimation
            animationData={sustainabilityAnimationData}
            className="w-56 h-56"
            loop={true}
            autoplay={true}
          />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">
            Calculating Executive ESG Footprint Metrics...
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
            Fetching activity logs, computing weekly carbon totals, and preparing dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in transition-all duration-500">
      
      {/* Goal Alert Banner */}
      {goal?.alertMessage && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl flex items-start gap-3 text-rose-800 dark:text-rose-300 text-xs shadow-sm">
          <XCircle className="shrink-0 text-rose-500 mt-0.5" size={16} />
          <div>
            <p className="font-bold">Weekly Carbon Alert</p>
            <p className="text-rose-600/90 dark:text-rose-400 mt-0.5">{goal.alertMessage}</p>
          </div>
        </div>
      )}

      {/* 1. Main Hero Panel with Ambient Floating Animations */}
      <div className="bg-gradient-to-r from-[#0a2315] via-[#0d2d1b] to-[#06180d] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-emerald-800/40">
        {/* Ambient Glowing Aura */}
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.14),transparent_65%)] pointer-events-none animate-glow-pulse" />

        {/* Ambient Floating Ambient Animations */}
        <div className="absolute top-4 left-[34%] text-emerald-400/80 pointer-events-none animate-float-gentle">
          <Leaf size={24} strokeWidth={1.5} />
        </div>
        <div className="absolute top-6 right-[35%] text-amber-300/80 pointer-events-none animate-spin-slow">
          <Sun size={22} strokeWidth={1.5} />
        </div>
        <div className="absolute bottom-6 right-[26%] text-teal-300/70 pointer-events-none animate-breeze">
          <Wind size={28} strokeWidth={1.5} />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/90 border border-white/10">
              <LayoutGrid size={13} className="text-emerald-400" />
              ESG SUSTAINABILITY PLATFORM
            </div>

            {/* Quick Action Report Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadPdf}
                disabled={exportingPdf}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-lg transition duration-200 disabled:opacity-50 focus:outline-none cursor-pointer"
              >
                {exportingPdf ? <RefreshCw className="animate-spin" size={14} /> : <FileText size={14} />}
                {exportingPdf ? "Generating..." : "Download PDF Report"}
              </button>

              <button
                onClick={handleDownloadExcel}
                disabled={exportingExcel}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 px-3.5 py-2 rounded-xl text-xs font-bold backdrop-blur-md shadow-lg transition duration-200 disabled:opacity-50 focus:outline-none cursor-pointer"
              >
                {exportingExcel ? <RefreshCw className="animate-spin" size={14} /> : <FileSpreadsheet size={14} />}
                {exportingExcel ? "Exporting..." : "Download Excel"}
              </button>

              <button
                onClick={() => setShowSendReportModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg transition duration-200 focus:outline-none cursor-pointer"
              >
                <Send size={14} />
                <span>Send Report</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight flex items-center gap-2">
              {t("dashboard.title")}
              <span className="text-2xl animate-float-gentle inline-block">🌿</span>
            </h1>
            <p className="text-slate-300/90 text-sm max-w-xl leading-relaxed">
              {t("dashboard.subtitle")}
            </p>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative group hover:bg-white/10 transition duration-300">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Carbon Score</p>
                <Award size={14} className="text-emerald-400/80" />
              </div>
              <p className="text-xl font-extrabold text-white mt-1.5">A+ Rating</p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative group hover:bg-white/10 transition duration-300">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">CO₂ Saved</p>
                <TrendingDown size={14} className="text-emerald-400" />
              </div>
              <p className="text-xl font-extrabold text-emerald-400 mt-1.5">
                {summary ? (35 - (summary.totalKgCo2e || 0) > 0 ? (35 - summary.totalKgCo2e).toFixed(1) : "4.2") : "4.2"} kg
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative group hover:bg-white/10 transition duration-300">
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Trees Restored</p>
                <Leaf size={14} className="text-emerald-400/80" />
              </div>
              <p className="text-xl font-extrabold text-emerald-400 mt-1.5">
                {summary ? Math.max(1, Math.round((summary.totalKgCo2e || 10) / 12)) : 9} Trees
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative group hover:bg-white/10 transition duration-300 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Active Streak</p>
                <p className="text-xl font-extrabold text-amber-400 mt-1.5">5 Days</p>
              </div>
              <Flame size={22} className="text-amber-500 fill-amber-500 animate-bounce" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive Navigation Hub Cards with Sleek, Subtle, Non-Dominating Glassmorphism */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Sustainability Dashboard Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-emerald-500/20 dark:border-emerald-800/40 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                <User size={20} />
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Personal Dashboard
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Personal Sustainability View</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Track Today's Footprint Summary, Recharts category pie charts, Current vs Previous week dual-line comparison, and monthly cumulative targets.
            </p>
          </div>

          <button
            onClick={() => navigate("/personal-dashboard")}
            className="flex items-center justify-between w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-sm transition cursor-pointer"
          >
            <span>Open Personal Dashboard</span>
            <ArrowUpRight size={15} />
          </button>
        </div>

        {/* Organizational Total Emissions Card */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border border-emerald-500/20 dark:border-emerald-800/40 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                <Building2 size={20} />
              </div>
              <span className="text-[10px] font-extrabold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-300 px-2.5 py-1 rounded-full uppercase tracking-wider">
                Enterprise Analytics
              </span>
            </div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Organizational Total Emissions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              View enterprise-wide live category pie charts, monthly emissions bar charts, 12-week trendlines, and custom date range filters.
            </p>
          </div>

          <button
            onClick={() => navigate("/org-emissions")}
            className="flex items-center justify-between w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs shadow-sm transition cursor-pointer"
          >
            <span>Open Org Emissions</span>
            <ArrowUpRight size={15} />
          </button>
        </div>
      </div>

      {/* 3. Top KPI Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <KPICard
          title="Today's Emission"
          value={`${summary ? ((summary.totalKgCo2e || 0) / 7).toFixed(1) : "0.0"} kg`}
          subtext="Based on logged activity"
          trend="-12% vs yesterday"
          isPositive={true}
        />
        <KPICard
          title="Weekly Total"
          value={`${summary ? (summary.totalKgCo2e || 0) : "0.0"} kg`}
          subtext={`Weekly Target: ${summary?.weeklyTargetKg || 35} kg`}
          trend={`${summary ? (summary.percentChangeVsLastWeek ?? 0) : 0}% vs last week`}
          isPositive={summary ? (summary.percentChangeVsLastWeek ?? 0) <= 0 : true}
        />
        <KPICard
          title="Monthly Projection"
          value={`${summary ? ((summary.totalKgCo2e || 0) * 4.3).toFixed(0) : "0"} kg`}
          subtext="Projected monthly operations"
          trend="-4.2% overall pace"
          isPositive={true}
        />

        {/* Live Weather & AQI card */}
        <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-emerald-900/40 p-5 space-y-3 shadow-sm flex flex-col justify-between h-full">
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
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400 font-medium">
            <span>Location: {weather.cityName}</span>
            <span>Updated: {weather.updatedAt}</span>
          </div>
        </div>
      </div>

      {/* 4. Lower Sections: Forest, Footprint Stream, Simulator */}
      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          <WeeklyEmissionsChart data={weeklyChartData} loading={false} />
          <GrowingForest goal={goal} />

          {/* Live Footprint Stream */}
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-emerald-900/40 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <Activity size={18} className="text-emerald-600 dark:text-emerald-400" />
                  Live Footprint Stream
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Real-time breakdown of logged activity vectors.</p>
              </div>
              <Link to="/history" className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-0.5">
                Full History
                <ArrowUpRight size={13} />
              </Link>
            </div>

            <div className="space-y-4 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-800">
              {recentLogs.length > 0 ? (
                recentLogs.map((log) => (
                  <div key={log.id} className="flex gap-4 relative">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400 shrink-0 relative z-10 shadow-sm">
                      <CategoryIcon category={log.category} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{log.activityType}</p>
                        <span className="text-[10px] font-bold text-slate-900 dark:text-slate-100 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">
                          {log.calculatedEmissionsKgCO2e?.toFixed(1)} kg CO₂
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{log.logDate}</p>
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

        {/* Right Column */}
        <div className="space-y-8">
          
          {/* Interactive Carbon Offset Simulator */}
          <OffsetSimulator />

          {/* Strategic Recommendations Card */}
          <div className="bg-[#0f2e1c] text-white rounded-2xl p-6 space-y-4 shadow-md border border-emerald-800/40 relative overflow-hidden">
            <div className="absolute right-[-10%] top-[-10%] w-24 h-24 bg-white/5 rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <Sparkles className="text-amber-400" size={18} />
              <p className="font-bold text-sm">Strategic Recommendations</p>
            </div>

            <div className="space-y-3">
              {summary?.recommendations && summary.recommendations.length > 0 ? (
                summary.recommendations.map((rec, i) => (
                  <div key={i} className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/10 space-y-1">
                    <p className="text-xs font-bold text-white flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-emerald-300 shrink-0" />
                      {rec.title}
                    </p>
                    <p className="text-[10px] text-slate-200 leading-relaxed">{rec.desc || rec.description}</p>
                  </div>
                ))
              ) : (
                <div className="bg-white/10 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-200">Log activities to generate suggestions!</p>
                </div>
              )}
            </div>

            <button
              onClick={() => navigate("/insights")}
              className="w-full text-center text-xs font-bold text-white/90 py-2 border border-white/20 rounded-xl hover:bg-white/10 transition mt-2 focus:outline-none cursor-pointer"
            >
              Analyze Strategic Details
            </button>
          </div>

          {/* Achievement Badges Card */}
          <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-emerald-900/40 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Award className="text-emerald-600 dark:text-emerald-400" size={16} />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">Your Achievement Badges</h3>
            </div>
            
            {earnedBadges.length > 0 ? (
              <div className="grid grid-cols-4 gap-3">
                {earnedBadges.slice(0, 8).map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center justify-center p-2 rounded-xl border border-slate-150 bg-slate-50/50 hover:scale-105 transition"
                    title={`${badge.name}: ${badge.description}`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                      <Award size={18} />
                    </div>
                    <span className="text-[9px] font-bold text-slate-700 dark:text-slate-350 text-center truncate w-full mt-1.5">{badge.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 bg-slate-50/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-400">No achievements yet. Log activities to earn badges!</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {showGoalModal && (
        <SetGoalModal onClose={() => setShowGoalModal(false)} onSaved={loadDashboardData} />
      )}

      {/* Send Report Modal */}
      <SendReportModal
        isOpen={showSendReportModal}
        onClose={() => setShowSendReportModal(false)}
      />
    </div>
  );
}

function KPICard({ title, value, subtext, trend, isPositive }) {
  return (
    <div className="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/60 dark:border-emerald-900/40 p-5 space-y-3 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between h-full">
      <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      <div>
        <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{subtext}</p>
      </div>
      <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit ${
        isPositive 
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50" 
          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-100 dark:border-rose-900/50"
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
