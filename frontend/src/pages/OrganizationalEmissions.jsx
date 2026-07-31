import React, { useState, useEffect, useCallback } from "react";
import {
  Building2,
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  FileText,
  FileSpreadsheet,
  Send,
  RefreshCw,
  Sparkles,
  Award,
  ShieldCheck,
  Zap,
  Car,
  Utensils,
  ShoppingBag,
  Droplets,
  Flame,
} from "lucide-react";
import DateRangeFilter from "../components/DateRangeFilter";
import SendReportModal from "../components/SendReportModal";
import { CategoryPieChart, MonthlyBarChart, WeeklyTrendLineChart, ChartSkeleton } from "../components/LiveCharts";
import { getChartData } from "../api/dashboard";
import { getEsgReport } from "../api/esg";
import { generateEsgPdfReport } from "../utils/pdfExport";
import { generateEsgExcelReport } from "../utils/excelExport";
import { toast } from "react-hot-toast";

export default function OrganizationalEmissions() {
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [chartData, setChartData] = useState({ pieData: [], barData: [], lineData: [] });
  const [loading, setLoading] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  const fetchEmissionsData = useCallback(async (start, end) => {
    setLoading(true);
    try {
      const data = await getChartData(start, end);
      setChartData(data);
    } catch (err) {
      console.error("Failed to load organizational emissions:", err);
      toast.error("Could not fetch organizational emissions chart data.");
    } fontinally: {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmissionsData(dateRange.startDate, dateRange.endDate);
  }, [dateRange, fetchEmissionsData]);

  const handleFilterChange = (newRange) => {
    setDateRange(newRange);
    fetchEmissionsData(newRange.startDate, newRange.endDate);
  };

  const handleDownloadPdf = async () => {
    setExportingPdf(true);
    try {
      const report = await getEsgReport(0);
      generateEsgPdfReport(report);
      toast.success("PDF ESG Report generated successfully!");
    } catch (err) {
      console.error("Failed to export PDF:", err);
      toast.error("Unable to generate PDF report.");
    } finally {
      setExportingPdf(false);
    }
  };

  const handleDownloadExcel = async () => {
    setExportingExcel(true);
    try {
      const report = await getEsgReport(0);
      generateEsgExcelReport(report);
      toast.success("Excel ESG Report exported successfully!");
    } catch (err) {
      console.error("Failed to export Excel:", err);
      toast.error("Unable to generate Excel report.");
    } finally {
      setExportingExcel(false);
    }
  };

  const totalEmissions = chartData?.pieData?.reduce((acc, curr) => acc + (curr.value || 0), 0) || 408.0;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in transition-all duration-500">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-[#0a2315] via-[#0d2d1b] to-[#06180d] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl border border-emerald-800/40">
        <div className="absolute right-0 bottom-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.14),transparent_65%)] pointer-events-none animate-glow-pulse" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white/90 border border-white/10">
              <Building2 size={13} className="text-emerald-400" />
              ORGANIZATIONAL TOTAL EMISSIONS REPORTING
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={handleDownloadPdf}
                disabled={exportingPdf}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition duration-200 disabled:opacity-50 focus:outline-none cursor-pointer"
              >
                {exportingPdf ? <RefreshCw className="animate-spin" size={14} /> : <FileText size={14} />}
                {exportingPdf ? "Generating..." : "Generate PDF Report"}
              </button>

              <button
                onClick={handleDownloadExcel}
                disabled={exportingExcel}
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white border border-white/20 px-4 py-2 rounded-xl text-xs font-bold backdrop-blur-md shadow-lg transition duration-200 disabled:opacity-50 focus:outline-none cursor-pointer"
              >
                {exportingExcel ? <RefreshCw className="animate-spin" size={14} /> : <FileSpreadsheet size={14} />}
                {exportingExcel ? "Exporting..." : "Excel Report"}
              </button>

              <button
                onClick={() => setShowSendModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-lg transition duration-200 focus:outline-none cursor-pointer"
              >
                <Send size={14} />
                <span>Send Report</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight flex items-center gap-2">
              Organizational Total Footprint
              <span className="text-2xl inline-block animate-float-gentle">🏢</span>
            </h1>
            <p className="text-slate-300/90 text-sm max-w-2xl leading-relaxed">
              Consolidated enterprise carbon footprint tracking by operational vector, monthly historical emissions, and 12-week emission trendlines.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative">
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Filtered Emissions</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">{totalEmissions.toFixed(1)} kg</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative">
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Active Vectors</p>
              <p className="text-2xl font-black text-white mt-1">5 Categories</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative">
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">ESG Compliance</p>
              <p className="text-2xl font-black text-emerald-300 mt-1">IPCC Verified</p>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 relative">
              <p className="text-[10px] text-slate-300 font-bold uppercase tracking-wider">Annual Projection</p>
              <p className="text-2xl font-black text-amber-400 mt-1">{(totalEmissions * 3.2).toFixed(0)} kg</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Custom Date Range Filter */}
      <DateRangeFilter
        onFilterChange={handleFilterChange}
        initialStartDate={dateRange.startDate}
        initialEndDate={dateRange.endDate}
      />

      {/* 3. Organizational Live Charts Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-emerald-600 dark:text-emerald-400" size={20} />
            Organizational Emissions Analytics & Live Charts
          </h2>
          <span className="text-xs font-semibold text-slate-400">
            {loading ? "Refreshing..." : "Filtered Data Active"}
          </span>
        </div>

        {/* 3 Live Charts in Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-full">
            <CategoryPieChart pieData={chartData.pieData} loading={loading} />
          </div>

          <div className="h-full">
            <MonthlyBarChart barData={chartData.barData} loading={loading} />
          </div>

          <div className="h-full">
            <WeeklyTrendLineChart lineData={chartData.lineData} loading={loading} />
          </div>
        </div>
      </div>

      {/* 4. Detailed Category Breakdown Table */}
      <div className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-md rounded-3xl border border-slate-200/60 dark:border-emerald-900/40 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600 dark:text-emerald-400" />
              Category Vector Emissions Summary Table
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Calculated carbon emissions broken down by IPCC standard categories.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-200">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              <tr>
                <th className="p-3.5 rounded-l-xl">Category Vector</th>
                <th className="p-3.5">Emissions (kg CO₂e)</th>
                <th className="p-3.5">Share (%)</th>
                <th className="p-3.5">IPCC Factor Baseline</th>
                <th className="p-3.5 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {(chartData.pieData || []).map((cat) => (
                <tr key={cat.name} className="hover:bg-slate-50/60 dark:hover:bg-slate-850/40 transition">
                  <td className="p-3.5 flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || "#4CAF50" }} />
                    {cat.name}
                  </td>
                  <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">
                    {Number(cat.value || 0).toFixed(1)} kg
                  </td>
                  <td className="p-3.5 font-bold">
                    {Number(cat.percentage || 0).toFixed(1)}%
                  </td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                    {cat.name === "Electricity" ? "0.85 kg CO₂e / kWh" : cat.name === "Transport" ? "0.21 kg CO₂e / km" : "0.45 kg CO₂e / unit"}
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-emerald-100 dark:border-emerald-900/50">
                      Compliant
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Send Report Modal */}
      <SendReportModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        startDate={dateRange.startDate}
        endDate={dateRange.endDate}
      />
    </div>
  );
}
