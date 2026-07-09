import { useState, useEffect } from "react";
import { Lightbulb, TrendingDown, ShieldAlert, Award, ArrowUpRight, BarChart3, Users, Building2, HelpCircle, Sparkles, Send, Leaf } from "lucide-react";
import { getWeeklySummary } from "../api/activities";
import { getEmissionsByCategory, getEmissionsByDate, getPeerBenchmarking, getOrganizationDashboard } from "../api/analytics";
import { CategoryPieChart, DailyEmissionsChart } from "../components/Charts";

export default function Insights() {
  const [activeTab, setActiveTab] = useState("personal");
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [dailyTrend, setDailyTrend] = useState([]);
  const [benchmark, setBenchmark] = useState(null);
  const [orgDashboard, setOrgDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // AI Assistant Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      sender: "ai",
      text: "Hello! I am your AI Sustainability Assistant. Ask me how to optimize your transport emissions or achieve your carbon targets."
    }
  ]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);
        const startDateStr = thirtyDaysAgo.toISOString().split("T")[0];
        const endDateStr = today.toISOString().split("T")[0];

        const [sumRes, catRes, trendRes, benchRes, orgRes] = await Promise.allSettled([
          getWeeklySummary(),
          getEmissionsByCategory(startDateStr, endDateStr),
          getEmissionsByDate(startDateStr, endDateStr),
          getPeerBenchmarking(),
          getOrganizationDashboard(),
        ]);

        if (sumRes.status === "fulfilled") setSummary(sumRes.value);

        if (catRes.status === "fulfilled" && catRes.value) {
          const colorMap = { transport: "#6d5fd6", electricity: "#e8a23d", food: "#e05c5c", shopping: "#3d9be8" };
          const mapped = catRes.value.map(item => ({
            name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
            value: item.emissions,
            color: colorMap[item.category.toLowerCase()] || "#a7f3d0"
          }));
          setCategoryData(mapped);
        }

        if (trendRes.status === "fulfilled" && trendRes.value) {
          const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
          const formattedTrend = trendRes.value.map(item => {
            const dateObj = new Date(item.date);
            return {
              date: daysOfWeek[dateObj.getDay()],
              emissions: item.emissions
            };
          }).slice(-7);
          setDailyTrend(formattedTrend);
        }

        if (benchRes.status === "fulfilled") setBenchmark(benchRes.value);
        if (orgRes.status === "fulfilled") setOrgDashboard(orgRes.value);
      } catch (err) {
        console.error("Failed to load insights data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { sender: "user", text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput("");

    setTimeout(() => {
      let reply = "Based on your active logs, reducing beef consumption and choosing electric commutes will decrease your footprint by 38% this week.";
      if (chatInput.toLowerCase().includes("transport")) {
        reply = "Transport accounts for a large portion of average emissions. Commuting by public transit or EV drops transport CO₂ by up to 75%.";
      } else if (chatInput.toLowerCase().includes("goal") || chatInput.toLowerCase().includes("target")) {
        reply = "Set target limits at 10% below your current weekly average to ensure achievable milestone growth.";
      }
      setChatHistory(prev => [...prev, { sender: "ai", text: reply }]);
    }, 1000);
  };

  if (loading) {
    return <InsightsSkeleton />;
  }

  const highestCategory = categoryData.reduce(
    (max, item) => (item.value > max.value ? item : max),
    { name: "None", value: 0 }
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Carbon Analytics & ESG Insights</h1>
          <p className="text-slate-500 text-sm mt-1">Deep analysis of operational carbon variables, peer averages, and AI projections.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl shrink-0 self-start">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "personal"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <BarChart3 size={14} />
            Personal
          </button>
          <button
            onClick={() => setActiveTab("organization")}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === "organization"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Building2 size={14} />
            Organization
          </button>
        </div>
      </div>

      {activeTab === "personal" ? (
        <>
          {/* Charts Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            <CategoryPieChart days={30} data={categoryData} />
            <DailyEmissionsChart
              days={7}
              data={dailyTrend}
              target={summary ? summary.weeklyTargetKg / 7 : 5}
            />
          </div>

          <div className="grid lg:grid-cols-[1fr_360px] gap-8">
            {/* Left Column: Benchmarking & Observations */}
            <div className="space-y-8">
              {/* Peer Benchmarking */}
              {benchmark && (
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <Users className="text-brand-850" size={16} />
                        Peer Benchmarking
                      </h2>
                      <p className="text-xs text-slate-400 mt-1">Compare your last 30 days of emissions against platform averages.</p>
                    </div>
                    <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-2 text-right">
                      <p className="text-[9px] uppercase font-bold text-brand-800">Your Percentile</p>
                      <p className="text-lg font-black text-brand-900">{benchmark.percentile}%</p>
                      <p className="text-[8px] text-brand-600">Lower emissions than {Math.round(100 - benchmark.percentile)}% of peers</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    {/* Horizontal Comparison Bars */}
                    <div className="space-y-4">
                      {["transport", "electricity", "food", "shopping"].map((cat) => {
                        const userVal = benchmark.userCategoryEmissions?.[cat] || 0;
                        const peerVal = benchmark.categoryAverages?.[cat] || 0;
                        const maxVal = Math.max(userVal, peerVal, 10);

                        return (
                          <div key={cat} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-bold text-slate-700">
                              <span className="capitalize">{cat}</span>
                              <span className="text-slate-400 text-[10px]">You: {userVal} kg vs Avg: {peerVal} kg</span>
                            </div>
                            <div className="space-y-1">
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-brand-800 h-full rounded-full" style={{ width: `${(userVal / maxVal) * 100}%` }} />
                              </div>
                              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-amber-500 h-full rounded-full" style={{ width: `${(peerVal / maxVal) * 100}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-5 space-y-3 text-xs leading-relaxed text-slate-600">
                      <p className="font-bold text-slate-800">How to Benchmark:</p>
                      <ul className="list-disc list-inside space-y-1.5 text-[11px]">
                        <li><strong className="text-brand-850">Emerald Bars:</strong> Your custom emissions.</li>
                        <li><strong className="text-amber-600">Amber Bars:</strong> Platform-wide peer average.</li>
                        <li>Aim to lower emerald levels to remain below peer indicators.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Actionable Observations */}
              <div className="space-y-4">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Lightbulb className="text-brand-850" size={16} />
                  Operational Observations
                </h2>

                <div className="grid md:grid-cols-3 gap-6">
                  <ObservationCard
                    icon={ShieldAlert}
                    title="Primary Emission Driver"
                    desc={highestCategory.value > 0 ? `Your largest impact source is ${highestCategory.name} contributing ${highestCategory.value.toFixed(1)} kg CO2e.` : "No major driver detected. Start logging parameters."}
                    color="bg-indigo-50 text-indigo-700"
                  />
                  <ObservationCard
                    icon={TrendingDown}
                    title="Target Pace"
                    desc={summary && summary.totalKgCo2e <= summary.weeklyTargetKg ? `Under weekly target of ${summary.weeklyTargetKg} kg. Excellent operational control.` : `Exceeding weekly limit. Optimize vehicle travel.`}
                    color="bg-amber-50 text-amber-700"
                  />
                  <ObservationCard
                    icon={Award}
                    title="Recommended Action"
                    desc={highestCategory.name === "Transport" ? "Try walking or public transit twice a week to reduce transport CO₂e by 30%." : "Choose plant-based meal variables to lower meal footprints."}
                    color="bg-emerald-50 text-emerald-700"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: AI Assistant Panel */}
            <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm flex flex-col h-[400px]">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sparkles className="text-brand-800 animate-pulse" size={16} />
                <div>
                  <h3 className="font-bold text-xs text-slate-900">AI Sustainability Assistant</h3>
                  <p className="text-[10px] text-slate-400">Ask operational sustainability questions</p>
                </div>
              </div>

              {/* Messages viewport */}
              <div className="flex-1 overflow-y-auto py-3 space-y-3 text-[11px] pr-1">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-xl px-3 py-2 ${
                      msg.sender === "user"
                        ? "bg-brand-800 text-white font-semibold"
                        : "bg-slate-100 text-slate-700 border border-slate-200/50"
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSendChat} className="flex gap-2 border-t border-slate-100 pt-3">
                <input
                  type="text"
                  placeholder="Ask AI Copilot..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                />
                <button type="submit" className="p-2 bg-brand-800 hover:bg-brand-900 text-white rounded-xl transition focus:outline-none shrink-0">
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>
        </>
      ) : (
        /* Organization dashboard */
        <div className="space-y-6">
          {orgDashboard ? (
            <>
              <div className="grid sm:grid-cols-3 gap-6">
                <OrgKPICard title="Total Active Employees" value={orgDashboard.totalEmployees} sub="Actively logging credentials" />
                <OrgKPICard title="Accumulated ESG Footprint" value={`${orgDashboard.totalEmissionsKgCO2e} kg`} sub="Operational emissions (30d)" />
                <OrgKPICard title="Org average per User" value={`${orgDashboard.averageEmissionsPerEmployee} kg`} sub="Average employee profile" />
              </div>

              <div className="grid md:grid-cols-[1fr_360px] gap-6">
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Organizational Footprint Distribution</h3>
                  
                  <div className="divide-y divide-slate-100">
                    {["transport", "electricity", "food", "shopping"].map((cat) => {
                      const val = orgDashboard.categoryTotals?.[cat] || 0;
                      const pct = orgDashboard.totalEmissionsKgCO2e > 0
                        ? Math.round((val / orgDashboard.totalEmissionsKgCO2e) * 100)
                        : 0;

                      return (
                        <div key={cat} className="flex items-center justify-between py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-brand-800" />
                            <span className="capitalize text-xs font-semibold text-slate-700">{cat}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-bold text-slate-900">{val} kg CO₂e</span>
                            <span className="text-[10px] text-slate-400 font-bold ml-2">({pct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm">Weekly Org Trends</h3>
                  <div className="space-y-4">
                    {(orgDashboard.weeklyTrends || []).map((trend, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400">
                          <span>{trend.week}</span>
                          <span>{trend.emissions} kg</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-800 h-full rounded-full"
                            style={{
                              width: `${
                                orgDashboard.totalEmissionsKgCO2e > 0
                                  ? (trend.emissions / orgDashboard.totalEmissionsKgCO2e) * 100
                                  : 0
                              }%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/60">
              <p className="text-slate-455 text-xs">No organizational data logs available.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ObservationCard({ icon: Icon, title, desc, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 space-y-3 shadow-sm">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${color}`}>
        <Icon size={15} />
      </div>
      <div>
        <h3 className="text-xs font-bold text-slate-800">{title}</h3>
        <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{desc}</p>
      </div>
    </div>
  );
}

function OrgKPICard({ title, value, sub }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-2">
      <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">{title}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
      <p className="text-[10px] text-slate-400">{sub}</p>
    </div>
  );
}

function InsightsSkeleton() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-pulse">
      <div className="h-6 w-48 bg-slate-100 rounded" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-56 bg-slate-100 rounded-2xl" />
        <div className="h-56 bg-slate-100 rounded-2xl" />
      </div>
    </div>
  );
}
