import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Settings,
  Plus,
  Car,
  Zap,
  Utensils,
  ShoppingBag,
  Leaf,
  Bike,
  Thermometer,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { getWeeklySummary, getRecentActivities } from "../api/activities";
import { getCurrentGoal } from "../api/goals";
import { CategoryPieChart, DailyEmissionsChart } from "../components/Charts";
import SetGoalModal from "../components/SetGoalModal";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [goal, setGoalState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);

 const loadData = async () => {
   setLoading(true);
   try {
     const [summaryData, logsData] = await Promise.allSettled([
       getWeeklySummary(),
       getRecentActivities(4),
       // Skip goals for now - it's causing 403
       // getCurrentGoal(),
     ]);
     setSummary(summaryData.status === "fulfilled" ? summaryData.value : null);
     setRecentLogs(logsData.status === "fulfilled" ? logsData.value : []);
     // setGoalState(null);
   } finally {
     setLoading(false);
   }
 };


  useEffect(() => {
    loadData();
  }, []);

  const hasActivity = summary && summary.totalKgCo2e > 0;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-8 max-w-7xl">
      <Header title={hasActivity ? "Weekly Summary" : "Overview"} />

      {hasActivity ? (
        <PopulatedDashboard summary={summary} recentLogs={recentLogs} />
      ) : (
        <EmptyDashboard goal={goal} onSetGoal={() => setShowGoalModal(true)} />
      )}

      {showGoalModal && (
        <SetGoalModal
          onClose={() => setShowGoalModal(false)}
          onSaved={loadData}
        />
      )}
    </div>
  );
}

function Header({ title }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
        <p className="text-gray-500 text-sm mt-1">Track your environmental footprint in real-time.</p>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-gray-400 hover:text-gray-600">
          <Bell size={18} />
        </button>
        <button className="text-gray-400 hover:text-gray-600">
          <Settings size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-brand-200" />
      </div>
    </div>
  );
}

function PopulatedDashboard({ summary, recentLogs }) {
  const target = summary.weeklyTargetKg || 0;
  const percentUsed = target ? Math.min(100, Math.round((summary.totalKgCo2e / target) * 100)) : 0;
  const changeVsLastWeek = summary.percentChangeVsLastWeek ?? 0;

  return (
    <div className="space-y-6">
      {/* Current footprint card */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Current Footprint</p>
            <p className="text-3xl font-semibold text-brand-800">
              This Week: {summary.totalKgCo2e} kg CO2e
            </p>
            <p className={`text-sm mt-1 flex items-center gap-2 ${changeVsLastWeek <= 0 ? "text-brand-600" : "text-red-500"}`}>
              {changeVsLastWeek <= 0 ? (
                <TrendingDown size={16} />
              ) : (
                <TrendingUp size={16} />
              )}
              Your carbon output is {Math.abs(changeVsLastWeek)}%{" "}
              {changeVsLastWeek <= 0 ? "lower" : "higher"} than last week. Great progress towards
              your sustainability goals!
            </p>
            <div className="w-full bg-gray-100 rounded-full h-2 mt-4 max-w-md">
              <div
                className="bg-brand-700 h-2 rounded-full transition-all"
                style={{ width: `${percentUsed}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">Weekly Target Usage · {percentUsed}% Used</p>
          </div>

          <div className="space-y-2 mt-6">
            <CategoryStat icon={Car} label="Transport" value={summary.transportKg} color="category-transport" />
            <CategoryStat icon={Zap} label="Energy" value={summary.electricityKg} color="category-electricity" />
            <CategoryStat icon={Utensils} label="Food & Diet" value={summary.foodKg} color="category-food" />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <Link
            to="/activity"
            className="flex items-center justify-center gap-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg py-2.5 text-sm font-medium transition"
          >
            <Plus size={16} />
            Log Activity
          </Link>

          <div className="bg-brand-800 text-white rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Leaf size={16} />
              <p className="font-medium text-sm">Smart Recommendations</p>
            </div>
            <div className="space-y-3">
              {(summary.recommendations || []).map((rec, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-3">
                  <p className="text-sm font-medium">{rec.title}</p>
                  <p className="text-xs text-brand-100 mt-0.5">{rec.description}</p>
                </div>
              ))}
            </div>
            <button className="w-full text-center text-xs font-medium text-white/90 mt-3 py-2 border border-white/20 rounded-lg hover:bg-white/10 transition">
              Explore All Tips
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CategoryPieChart days={7} />
        <DailyEmissionsChart days={7} />
      </div>

      {/* Recent activities */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Recent Activities</h2>
          <Link to="/history" className="text-sm text-brand-700 font-medium hover:underline">
            View All
          </Link>
        </div>
        <div className="space-y-3">
          {recentLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CategoryIcon category={log.category} />
                <div>
                  <p className="text-sm font-medium text-gray-900">{log.activityType}</p>
                  <p className="text-xs text-gray-500">{log.logDate}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                {log.calculatedEmissionsKgCO2e?.toFixed(1)} kg
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyDashboard({ goal, onSetGoal }) {
  const tips = [
    { icon: Bike, title: "Switch to Biking", desc: "Replacing just one car trip a day with a bike ride can reduce your annual footprint by 0.5 tons." },
    { icon: Thermometer, title: "Smart Heating", desc: "Lowering your thermostat by just 1°C can save up to 10% on your energy bill and significantly cut emissions." },
    { icon: Utensils, title: "Plant-Based Mondays", desc: "Skipping meat one day a week saves the equivalent emissions of driving 1,160 miles in a car." },
  ];

  return (
    <div>
      <div className="grid lg:grid-cols-[1fr_320px] gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Weekly Progress</p>
          <p className="text-2xl font-semibold text-brand-800 mb-2">0 kg CO2e logged this week</p>
          <p className="text-sm text-gray-500 mb-5">
            You haven't tracked any impact yet. Start your journey toward a carbon-neutral
            lifestyle by logging your first activity today.
          </p>
          <div className="flex gap-3">
            <Link
              to="/activity"
              className="flex items-center gap-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg px-4 py-2.5 text-sm font-medium transition"
            >
              <Plus size={16} />
              Log Your First Activity
            </Link>
            <button className="border border-gray-300 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
              Browse Categories
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col items-center justify-center text-center">
          <Leaf className="text-brand-200 mb-3" size={32} />
          <p className="text-sm font-medium text-gray-700">No activities logged yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Your carbon footprint summary will appear here once you begin tracking.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-gray-900">Recommended Actions</h2>
        <button className="text-sm text-brand-700 font-medium hover:underline">View all tips</button>
      </div>
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {tips.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center mb-3">
              <Icon size={16} />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">{title}</p>
            <p className="text-xs text-gray-500 mb-2">{desc}</p>
            <button className="text-xs font-medium text-brand-700 hover:underline">Learn more</button>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="font-medium text-gray-900 mb-1">Join the Challenge</p>
          <p className="text-xs text-gray-500 mb-3">
            Join 5,000+ others in the "Zero Waste Week" community challenge.
          </p>
          <button className="bg-brand-800 hover:bg-brand-900 text-white rounded-lg px-4 py-2 text-sm font-medium transition">
            View Challenges
          </button>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
          <p className="font-medium text-gray-900 mb-1">Goal Progress</p>
          {goal ? (
            <>
              <div className="w-full bg-gray-100 rounded-full h-2 my-2">
                <div
                  className="bg-brand-700 h-2 rounded-full"
                  style={{ width: `${goal.progressPercent || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{goal.progressPercent || 0}% toward your goal.</p>
            </>
          ) : (
            <>
              <p className="text-xs text-gray-500 mb-3">
                You haven't set a goal yet. Setting a target increases your chances of success by
                40%.
              </p>
              <button
                onClick={onSetGoal}
                className="text-sm font-medium text-brand-700 hover:underline"
              >
                Set a Carbon Goal →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryStat({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
      <div className={`w-7 h-7 rounded-md flex items-center justify-center bg-${color}/10 text-${color}`}>
        <Icon size={14} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-semibold text-gray-900">{value ?? 0} kg</p>
      </div>
    </div>
  );
}

function CategoryIcon({ category }) {
  const map = { transport: Car, electricity: Zap, food: Utensils, shopping: ShoppingBag };
  const Icon = map[category] || ShoppingBag;
  return (
    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
      <Icon size={15} />
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-8 max-w-6xl animate-pulse">
      <div className="h-7 w-48 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-72 bg-gray-100 rounded mb-6" />
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="h-40 bg-gray-100 rounded-xl" />
        <div className="h-40 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}