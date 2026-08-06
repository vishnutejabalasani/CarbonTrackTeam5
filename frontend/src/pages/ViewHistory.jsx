import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Trash2,
  X,
  FileText,
  FileSpreadsheet,
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Plus,
  RefreshCw,
  Award,
  Calendar,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Link } from "react-router-dom";
import { getAllActivities, deleteActivity } from "../api/activities";
import { getEsgHistory, getEsgReport } from "../api/esg";
import { generateEsgPdfReport } from "../utils/pdfExport";
import { generateEsgExcelReport } from "../utils/excelExport";
import LottieAnimation from "../components/LottieAnimation";
import { emptyHistoryAnimationData } from "../assets/animations/emptyHistoryData";
import { ecoPlanetAnimationData } from "../assets/animations/ecoPlanetData";

const CATEGORIES = [
  { key: "transport", label: "Transport" },
  { key: "electricity", label: "Electricity" },
  { key: "food", label: "Food" },
  { key: "shopping", label: "Shopping" },
];

import { useTranslation } from "react-i18next";

export default function ViewHistory() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("activities"); // "activities" | "esgReports"

  // Activity Logs state
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filters state
  const [filters, setFilters] = useState({
    category: null,
    startDate: null,
    endDate: null,
    sortBy: "date",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  // ESG Reports state (FEATURE 5)
  const [esgReports, setEsgReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [exportingReportId, setExportingReportId] = useState(null);

  // Load activity logs
  useEffect(() => {
    loadActivities();
  }, [filters, pagination.page]);

  // Load ESG reports history
  useEffect(() => {
    if (activeTab === "esgReports") {
      loadEsgReports();
    }
  }, [activeTab]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await getAllActivities({
        ...filters,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      setActivities(data.activities || []);
      setPagination((prev) => ({ ...prev, total: data.total || 0 }));
    } catch (err) {
      console.error("Failed to load activities:", err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const loadEsgReports = async () => {
    setLoadingReports(true);
    try {
      const reports = await getEsgHistory();
      setEsgReports(reports || []);
    } catch (err) {
      console.error("Failed to load ESG history:", err);
      setEsgReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmId) return;
    setDeleting(true);
    try {
      await deleteActivity(deleteConfirmId);
      setDeleteConfirmId(null);
      loadActivities();
    } catch (err) {
      console.error("Failed to delete activity:", err);
      alert("Failed to delete activity log. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Export CSV for activity logs
  const exportToCSV = () => {
    if (activities.length === 0) return;
    const headers = ["ID", "Category", "Activity Type", "Quantity", "Unit", "Date", "Emissions (kg CO2e)"];
    const rows = activities.map((a) => [
      a.id,
      a.category,
      a.activityType,
      a.quantity,
      a.unit,
      a.logDate,
      a.calculatedEmissionsKgCO2e?.toFixed(2),
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CarbonTrack_History_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // FEATURE 5: Download PDF for a specific saved ESG report
  const handleHistoricalPdfExport = async (reportId) => {
    setExportingReportId(`pdf-${reportId}`);
    try {
      const savedReport = await getEsgReport(reportId);
      generateEsgPdfReport(savedReport);
    } catch (err) {
      console.error("Historical PDF Export error:", err);
      alert("Failed to export historical PDF report.");
    } finally {
      setExportingReportId(null);
    }
  };

  // FEATURE 5: Download Excel for a specific saved ESG report
  const handleHistoricalExcelExport = async (reportId) => {
    setExportingReportId(`excel-${reportId}`);
    try {
      const savedReport = await getEsgReport(reportId);
      generateEsgExcelReport(savedReport);
    } catch (err) {
      console.error("Historical Excel Export error:", err);
      alert("Failed to export historical Excel report.");
    } finally {
      setExportingReportId(null);
    }
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const totalEmissions = activities.reduce(
    (sum, a) => sum + (a.calculatedEmissionsKgCO2e || 0),
    0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      
      {/* Header with Feature 2 Lottie Animation Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white dark:bg-brand-950/45 border border-slate-200/60 dark:border-brand-900/40 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          {/* Lottie Animation Header Badge (Feature 2 - Data exists) */}
          <div className="hidden sm:block shrink-0">
            <LottieAnimation
              animationData={ecoPlanetAnimationData}
              className="w-16 h-16"
              loop={true}
              autoplay={true}
            />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("history.title")}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              {t("history.subtitle")}
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-slate-100 dark:bg-brand-900/40 p-1 rounded-2xl border border-slate-200/50 dark:border-brand-900/40 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("activities")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-200 ${
              activeTab === "activities"
                ? "bg-white dark:bg-brand-850 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Activity Logs ({pagination.total})
          </button>
          <button
            onClick={() => setActiveTab("esgReports")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition duration-200 ${
              activeTab === "esgReports"
                ? "bg-white dark:bg-brand-850 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            Saved ESG Reports
          </button>
        </div>
      </div>

      {activeTab === "activities" ? (
        <>
          {/* Stats KPI Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard label="Total Logged Items" value={pagination.total} color="border-l-indigo-500" />
            <StatCard label="Accumulated Carbon" value={`${totalEmissions.toFixed(1)} kg`} color="border-l-emerald-600" />
            <StatCard label="Avg Emission Per Log" value={`${(totalEmissions / (pagination.total || 1)).toFixed(2)} kg`} color="border-l-amber-500" />
            <StatCard label="Logged This View" value={`${activities.length} logs`} color="border-l-sky-500" />
          </div>

          {/* Filters Bar */}
          <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 focus:outline-none"
              >
                <SlidersHorizontal size={14} className="text-emerald-600 dark:text-emerald-400" />
                {showFilters ? "Collapse Parameters" : "Filter Operations"}
              </button>
              
              <div className="flex items-center gap-3">
                {showFilters && (
                  <button
                    onClick={() =>
                      handleFilterChange({
                        category: null,
                        startDate: null,
                        endDate: null,
                        sortBy: "date",
                        sortOrder: "desc",
                      })
                    }
                    className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline focus:outline-none"
                  >
                    Reset Filters
                  </button>
                )}
                
                <button
                  onClick={exportToCSV}
                  disabled={activities.length === 0}
                  className="flex items-center gap-1.5 bg-brand-900 hover:bg-brand-850 text-white rounded-xl px-3.5 py-1.5 text-xs font-bold shadow-sm transition disabled:opacity-50"
                >
                  <FileSpreadsheet size={14} />
                  Export CSV
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="grid sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100 dark:border-brand-900/20">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Category</label>
                  <select
                    value={filters.category || ""}
                    onChange={(e) => handleFilterChange({ ...filters, category: e.target.value || null })}
                    className="w-full border border-slate-200 dark:border-brand-900/50 bg-slate-50/50 dark:bg-brand-900/20 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat.key} value={cat.key}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={filters.startDate || ""}
                    onChange={(e) => handleFilterChange({ ...filters, startDate: e.target.value || null })}
                    className="w-full border border-slate-200 dark:border-brand-900/50 bg-slate-50/50 dark:bg-brand-900/20 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">End Date</label>
                  <input
                    type="date"
                    value={filters.endDate || ""}
                    onChange={(e) => handleFilterChange({ ...filters, endDate: e.target.value || null })}
                    className="w-full border border-slate-200 dark:border-brand-900/50 bg-slate-50/50 dark:bg-brand-900/20 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Sort Order</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
                    className="w-full border border-slate-200 dark:border-brand-900/50 bg-slate-50/50 dark:bg-brand-900/20 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/25"
                  >
                    <option value="date">Date</option>
                    <option value="emissions">Emissions Value</option>
                    <option value="category">Category Type</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Grid Table or Empty Lottie State (Feature 2) */}
          <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 shadow-sm overflow-hidden">
            {loading ? (
              <ActivityTableSkeleton />
            ) : activities.length === 0 ? (
              
              /* FEATURE 2: Empty Activity History State with Lottie Animation */
              <div className="py-16 px-6 text-center flex flex-col items-center justify-center space-y-4">
                <LottieAnimation
                  animationData={emptyHistoryAnimationData}
                  className="w-48 h-48"
                  loop={true}
                  autoplay={true}
                />
                <div className="space-y-1.5 max-w-md">
                  <h3 className="text-xl font-black text-slate-800 dark:text-white">
                    No activities found
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Start logging activities to view your carbon footprint history.
                  </p>
                </div>
                <Link
                  to="/activity"
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition duration-200"
                >
                  <Plus size={16} />
                  Log Activity Now
                </Link>
              </div>

            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-brand-900/30 border-b border-slate-200/50 dark:border-brand-900/40 text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Activity Type</th>
                        <th className="px-6 py-4">Logged Volume</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4 text-right">Calculated Footprint</th>
                        <th className="px-6 py-4 text-center w-24">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-brand-900/30 text-xs text-slate-700 dark:text-slate-300">
                      {activities.map((activity) => (
                        <tr key={activity.id} className="hover:bg-slate-50/70 dark:hover:bg-brand-900/20 transition">
                          <td className="px-6 py-4 font-bold text-slate-900 dark:text-white capitalize flex items-center gap-3">
                            <CategoryIcon category={activity.category} />
                            {activity.category}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400">{activity.activityType}</td>
                          <td className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200">
                            {activity.quantity} {activity.unit}
                          </td>
                          <td className="px-6 py-4 text-slate-400 dark:text-slate-500">
                            {new Date(activity.logDate).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-100/50 dark:border-emerald-900/50">
                              {activity.calculatedEmissionsKgCO2e?.toFixed(2)} kg
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleDeleteClick(activity.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition duration-150"
                              title="Delete Activity"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="border-t border-slate-100 dark:border-brand-900/20 px-6 py-4 flex items-center justify-between">
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                    {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
                    {pagination.total} operational logs
                  </p>
                  <div className="flex gap-2.5">
                    <button
                      disabled={pagination.page === 1}
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-bold border border-slate-200 dark:border-brand-900/50 rounded-xl hover:bg-slate-50 dark:hover:bg-brand-900/20 text-slate-700 dark:text-slate-300 disabled:opacity-50 transition"
                    >
                      <ChevronLeft size={14} />
                      Prev
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                            className={`w-8 h-8 text-xs font-bold rounded-xl transition ${
                              pageNum === pagination.page
                                ? "bg-brand-900 text-white"
                                : "border border-slate-200 dark:border-brand-900/50 hover:bg-slate-50 dark:hover:bg-brand-900/20 text-slate-700 dark:text-slate-300"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      disabled={pagination.page >= totalPages}
                      onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                      className="flex items-center gap-1 px-3 py-2 text-xs font-bold border border-slate-200 dark:border-brand-900/50 rounded-xl hover:bg-slate-50 dark:hover:bg-brand-900/20 text-slate-700 dark:text-slate-300 disabled:opacity-50 transition"
                    >
                      Next
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      ) : (
        /* FEATURE 5: Saved ESG Reports History List & Single Report Downloads */
        <div className="space-y-6">
          <div className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="text-emerald-600 dark:text-emerald-400" size={18} />
              Saved Corporate ESG Audit History
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select any saved report from the database to export its specific historical values into PDF or Excel.
            </p>
          </div>

          {loadingReports ? (
            <div className="p-12 text-center text-slate-400 text-xs animate-pulse">
              Retrieving saved ESG reports from database...
            </div>
          ) : esgReports.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No saved ESG reports found.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {esgReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 p-6 shadow-sm space-y-4 hover:border-emerald-500/50 transition duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-100/50 dark:border-emerald-900/50">
                          Report #{report.id}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base mt-1.5">
                          {report.reportTitle || "ESG Performance Report"}
                        </h4>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs text-slate-400 block font-medium">Score</span>
                        <span className="text-lg font-black text-brand-900 dark:text-emerald-300">
                          {report.overallEsgScore} / 100
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-brand-900/20 p-3 rounded-xl border border-slate-100 dark:border-brand-900/40">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Audit Date</span>
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{report.auditDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Carbon</span>
                        <span className="font-semibold text-emerald-600 dark:text-emerald-400">{report.totalCarbonEmissions} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* FEATURE 5: Individual PDF & Excel Buttons per Saved Report */}
                  <div className="pt-2 flex items-center gap-3 border-t border-slate-100 dark:border-brand-900/20">
                    <button
                      onClick={() => handleHistoricalPdfExport(report.id)}
                      disabled={exportingReportId === `pdf-${report.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
                    >
                      {exportingReportId === `pdf-${report.id}` ? <RefreshCw className="animate-spin" size={13} /> : <FileText size={13} />}
                      Download PDF
                    </button>

                    <button
                      onClick={() => handleHistoricalExcelExport(report.id)}
                      disabled={exportingReportId === `excel-${report.id}`}
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-950 text-white font-bold py-2 px-3 rounded-xl text-xs shadow-sm transition disabled:opacity-50"
                    >
                      {exportingReportId === `excel-${report.id}` ? <RefreshCw className="animate-spin" size={13} /> : <FileSpreadsheet size={13} />}
                      Download Excel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 px-4 backdrop-blur-[1px] animate-fade-in">
          <div className="bg-white dark:bg-brand-950 rounded-2xl shadow-xl border border-slate-100 dark:border-brand-900/40 w-full max-w-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white text-sm">Delete Activity Log</h2>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">This action cannot be undone</p>
              </div>
              <button onClick={() => setDeleteConfirmId(null)} className="text-slate-400 hover:text-slate-650 transition">
                <X size={16} />
              </button>
            </div>

            <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-xl p-5 flex flex-col items-center mb-5 border border-rose-100/50 dark:border-rose-900/40 text-center">
              <div className="w-11 h-11 rounded-full bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center mb-2.5 text-rose-600 dark:text-rose-400">
                <Trash2 size={16} />
              </div>
              <p className="text-xs font-bold text-rose-900 dark:text-rose-300">Are you sure?</p>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 mt-1 max-w-[280px]">
                Are you sure you want to permanently delete this logged footprint from your record?
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 border border-slate-200 dark:border-brand-900/50 text-slate-600 dark:text-slate-300 rounded-xl py-2.5 text-xs font-bold hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-2.5 text-xs font-bold transition disabled:opacity-60 shadow-sm"
              >
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-white dark:bg-brand-950/45 rounded-2xl border border-slate-200/60 dark:border-brand-900/40 border-l-4 p-5 shadow-sm ${color}`}>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-extrabold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function ActivityTableSkeleton() {
  return (
    <div className="divide-y divide-slate-100 p-6 space-y-4 animate-pulse">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-slate-100 rounded flex-1" />
          <div className="h-4 bg-slate-100 rounded flex-1" />
          <div className="h-4 bg-slate-100 rounded flex-1" />
          <div className="h-4 bg-slate-100 rounded flex-1" />
        </div>
      ))}
    </div>
  );
}

function CategoryIcon({ category }) {
  const map = { transport: Car, electricity: Zap, food: Utensils, shopping: ShoppingBag };
  const Icon = map[category] || ShoppingBag;
  const colorMap = {
    transport: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300",
    electricity: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300",
    food: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300",
    shopping: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
  };
  return (
    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${colorMap[category] || "bg-gray-100 text-gray-500"}`}>
      <Icon size={13} />
    </div>
  );
}