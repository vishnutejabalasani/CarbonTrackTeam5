import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Filter, Download, Car, Zap, Utensils, ShoppingBag } from "lucide-react";
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
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1
  };

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);
  const totalEmissions = activities.reduce(
    (sum, a) => sum + (a.calculatedEmissionsKgCO2e || 0),
    0
  );

  return (
    <div className="p-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Activity History</h1>
          <p className="text-gray-500 text-sm mt-1">
            View and analyze all your logged activities and emissions.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg px-4 py-2 text-sm font-medium transition">
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Activities" value={pagination.total} />
        <StatCard label="Total Emissions" value={`${totalEmissions.toFixed(1)} kg CO2e`} />
        <StatCard label="Average per Activity" value={`${(totalEmissions / (pagination.total || 1)).toFixed(2)} kg`} />
        <StatCard label="This Month" value={`${activities.length} logs`} />
      </div>

      {/* Filters and Search */}
      <FilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
      />

      {/* Activities Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <ActivityTableSkeleton />
        ) : activities.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-sm">No activities found. Try adjusting your filters.</p>
          </div>
        ) : (
          <>
            <ActivityTable activities={activities} />

            {/* Pagination */}
            <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
                {pagination.total} activities
              </p>
              <div className="flex gap-2">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPagination((prev) => ({ ...prev, page: pageNum }))}
                        className={`w-8 h-8 text-sm rounded-lg transition ${
                          pageNum === pagination.page
                            ? "bg-brand-800 text-white"
                            : "border border-gray-300 hover:bg-gray-50"
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
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function FilterPanel({ filters, onFilterChange, showFilters, onToggleFilters }) {
  return (
    <div className="mb-6">
      <button
        onClick={onToggleFilters}
        className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3 hover:text-gray-900"
      >
        <Filter size={16} />
        {showFilters ? "Hide Filters" : "Show Filters"}
      </button>

      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Category filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Category</label>
              <select
                value={filters.category || ""}
                onChange={(e) =>
                  onFilterChange({ ...filters, category: e.target.value || null })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">From</label>
              <input
                type="date"
                value={filters.startDate || ""}
                onChange={(e) =>
                  onFilterChange({ ...filters, startDate: e.target.value || null })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* End date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">To</label>
              <input
                type="date"
                value={filters.endDate || ""}
                onChange={(e) =>
                  onFilterChange({ ...filters, endDate: e.target.value || null })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Sort by */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  onFilterChange({ ...filters, sortBy: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="date">Date</option>
                <option value="emissions">Emissions</option>
                <option value="category">Category</option>
              </select>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={() =>
              onFilterChange({
                category: null,
                startDate: null,
                endDate: null,
                sortBy: "date",
                sortOrder: "desc",
              })
            }
            className="text-sm text-brand-700 font-medium hover:underline"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

function ActivityTable({ activities }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Activity
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Emissions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <tr key={activity.id} className="hover:bg-gray-50 transition">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                  <CategoryIcon category={activity.category} />
                  <span className="text-sm font-medium text-gray-900">{activity.category}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {activity.activityType}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {activity.quantity} {activity.unit}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {new Date(activity.logDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-sm font-medium">
                  {activity.calculatedEmissionsKgCO2e?.toFixed(2)} kg
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActivityTableSkeleton() {
  return (
    <div className="divide-y divide-gray-200">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-6 py-4 flex gap-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded flex-1" />
          <div className="h-4 bg-gray-200 rounded flex-1" />
          <div className="h-4 bg-gray-200 rounded flex-1" />
          <div className="h-4 bg-gray-200 rounded flex-1" />
          <div className="h-4 bg-gray-200 rounded flex-1" />
        </div>
      ))}
    </div>
  );
}

function CategoryIcon({ category }) {
  const map = { transport: Car, electricity: Zap, food: Utensils, shopping: ShoppingBag };
  const Icon = map[category] || ShoppingBag;
  const colorMap = {
    transport: "bg-category-transport/10 text-category-transport",
    electricity: "bg-category-electricity/10 text-category-electricity",
    food: "bg-category-food/10 text-category-food",
    shopping: "bg-category-shopping/10 text-category-shopping",
  };
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorMap[category] || "bg-gray-100 text-gray-500"}`}>
      <Icon size={14} />
    </div>
  );
}