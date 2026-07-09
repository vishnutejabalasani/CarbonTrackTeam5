import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Filter, Download, Car, Zap, Utensils, ShoppingBag, FileSpreadsheet, Eye, SlidersHorizontal } from "lucide-react";
import { getAllActivities } from "../api/activities";

const CATEGORIES = [
  { key: "transport", label: "Transport" },
  { key: "electricity", label: "Electricity" },
  { key: "food", label: "Food" },
  { key: "shopping", label: "Shopping" },
];

export default function ViewHistory() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 20, total: 0 });

  // Filters
  const [filters, setFilters] = useState({
    category: null,
    startDate: null,
    endDate: null,
    sortBy: "date",
    sortOrder: "desc",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Load activities
  useEffect(() => {
    loadActivities();
  }, [filters, pagination.page]);

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

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const exportToCSV = () => {
    if (activities.length === 0) return;
    const headers = ["ID", "Category", "Activity Type", "Quantity", "Unit", "Date", "Emissions (kg CO2e)"];
    const rows = activities.map(a => [
      a.id,
      a.category,
      a.activityType,
      a.quantity,
      a.unit,
      a.logDate,
      a.calculatedEmissionsKgCO2e?.toFixed(2)
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CarbonTrack_History_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const totalEmissions = activities.reduce(
    (sum, a) => sum + (a.calculatedEmissionsKgCO2e || 0),
    0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Footprint Ledger & History</h1>
          <p className="text-slate-500 text-sm mt-1">Audit log of corporate emissions, variables, and categories.</p>
        </div>
        <button
          onClick={exportToCSV}
          disabled={activities.length === 0}
          className="flex items-center gap-2 bg-brand-800 hover:bg-brand-900 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition disabled:opacity-50"
        >
          <FileSpreadsheet size={15} />
          Export Audit (CSV)
        </button>
      </div>

      {/* Stats KPI Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Total Logged items" value={pagination.total} color="border-l-indigo-500" />
        <StatCard label="Accumulated carbon" value={`${totalEmissions.toFixed(1)} kg`} color="border-l-emerald-600" />
        <StatCard label="Avg Emission per event" value={`${(totalEmissions / (pagination.total || 1)).toFixed(2)} kg`} color="border-l-amber-500" />
        <StatCard label="Logged this view" value={`${activities.length} logs`} color="border-l-sky-500" />
      </div>

      {/* Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 focus:outline-none"
          >
            <SlidersHorizontal size={14} className="text-brand-800" />
            {showFilters ? "Collapse Parameters" : "Filter Operations"}
          </button>
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
              className="text-[10px] font-bold text-brand-850 hover:underline focus:outline-none"
            >
              Reset Filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid sm:grid-cols-4 gap-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Category</label>
              <select
                value={filters.category || ""}
                onChange={(e) => handleFilterChange({ ...filters, category: e.target.value || null })}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Start Date</label>
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) => handleFilterChange({ ...filters, startDate: e.target.value || null })}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">End Date</label>
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) => handleFilterChange({ ...filters, endDate: e.target.value || null })}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Sort Order</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
                className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
              >
                <option value="date">Date</option>
                <option value="emissions">Emissions Value</option>
                <option value="category">Category Type</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Grid Table */}
      <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
        {loading ? (
          <ActivityTableSkeleton />
        ) : activities.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No activities matched your parameters. Try updating your filters.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-250/20 text-[10px] font-bold text-slate-450 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Activity Type</th>
                    <th className="px-6 py-4">Logged Volume</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Calculated Footprint</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-650">
                  {activities.map((activity) => (
                    <tr key={activity.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-bold text-slate-900 capitalize flex items-center gap-3">
                        <CategoryIcon category={activity.category} />
                        {activity.category}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-500">{activity.activityType}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {activity.quantity} {activity.unit}
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {new Date(activity.logDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-brand-50 text-brand-850 font-bold border border-brand-100/50">
                          {activity.calculatedEmissionsKgCO2e?.toFixed(2)} kg
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between">
              <p className="text-[11px] font-medium text-slate-400">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
                {pagination.total} operational logs
              </p>
              <div className="flex gap-2.5">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition"
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
                            ? "bg-brand-800 text-white"
                            : "border border-slate-200 hover:bg-slate-50"
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
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-50 transition"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/60 border-l-4 p-5 shadow-sm ${color}`}>
      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-extrabold text-slate-900">{value}</p>
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
    transport: "bg-indigo-50 text-indigo-700",
    electricity: "bg-amber-50 text-amber-700",
    food: "bg-rose-50 text-rose-700",
    shopping: "bg-sky-50 text-sky-700",
  };
  return (
    <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${colorMap[category] || "bg-gray-100 text-gray-500"}`}>
      <Icon size={13} />
    </div>
  );
}