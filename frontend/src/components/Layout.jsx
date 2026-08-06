import { useState, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Leaf,
  Plus,
  LayoutGrid,
  Flag,
  Lightbulb,
  Users,
  HelpCircle,
  LogOut,
  History,
  Settings,
  Search,
  Sparkles,
  Bell,
  Sun,
  ChevronDown,
  Moon,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  Sliders,
  Award,
  Check,
  Eye,
  Building2,
  User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";
import NotificationDropdown from "./NotificationDropdown";
import { chatWithGreenCoach } from "../api/activities";
import { getWeatherData } from "../api/weather";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "../api/notifications";

export default function Layout() {
  const { t } = useTranslation();
  const { logout, user } = useAuth();
  const [weather, setWeather] = useState({
    temp: 22,
    description: "Sunny",
    aqiLabel: "Excellent",
    aqiColor: "text-emerald-600 dark:text-emerald-400",
    cityName: "Bangalore"
  });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const data = await getWeatherData();
        setWeather(data);
      } catch (err) {
        console.error("Failed to load weather:", err);
      }
    };
    fetchWeather();
  }, []);
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState("Acme Corp ESG");
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    { sender: "bot", text: "Hello! I am your Green Coach. Ask me anything about reducing your carbon footprint!" }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  const handleSendChatPrompt = async (msgText) => {
    if (!msgText || chatLoading) return;
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: msgText }]);
    setChatLoading(true);
    try {
      const res = await chatWithGreenCoach(msgText);
      setChatMessages((prev) => [...prev, { sender: "bot", text: res.reply }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: "bot", text: "Sorry, I am having trouble connecting right now. Please try again later." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    handleSendChatPrompt(chatInput);
  };

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const list = await getNotifications();
      setNotifications(list);
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Grouped Navigation Items
  const sections = [
    {
      title: t("nav.coreTracking"),
      items: [
        { to: "/dashboard", label: t("nav.dashboard"), icon: LayoutGrid },
        { to: "/personal-dashboard", label: t("nav.personalDashboard"), icon: User },
        { to: "/activity", label: t("nav.logFootprint"), icon: Plus },
        { to: "/vision", label: t("nav.visionAnalyzer"), icon: Eye },
        { to: "/history", label: t("nav.activityHistory"), icon: History },
      ],
    },
    {
      title: t("nav.goalsSocial"),
      items: [
        { to: "/goals", label: t("nav.ecoGoals"), icon: Flag },
        { to: "/community", label: t("nav.community"), icon: Users },
      ],
    },
    {
      title: t("nav.analytics"),
      items: [
        { to: "/org-emissions", label: t("nav.orgEmissions"), icon: Building2 },
        { to: "/insights", label: t("nav.esgAnalytics"), icon: Lightbulb },
      ],
    },
    {
      title: t("nav.settings"),
      items: [
        { to: "/settings", label: t("nav.preferences"), icon: Settings },
      ],
    },
  ];

  return (
    <div className={`h-screen w-screen overflow-hidden flex ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-[#f5f8f5] text-slate-900"}`}>
      
      {/* Floating Glass Sidebar (Static & Fixed) */}
      <aside
        className={`h-[calc(100vh-2rem)] m-4 rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-md shadow-lg flex flex-col p-4 shrink-0 transition-all duration-300 sticky top-4 z-30 dark:bg-brand-950/45 dark:border-brand-900/40 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full border border-slate-200 bg-white dark:bg-brand-950 dark:border-brand-900 dark:text-slate-350 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 z-30 focus:outline-none"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-2.5 px-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-brand-800 flex items-center justify-center text-white shrink-0 shadow-md shadow-brand-850/20">
            <Leaf size={18} className="rotate-12" />
          </div>
          {!collapsed && (
            <div>
              <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-base block">CarbonTrack</span>
              <span className="text-[10px] text-brand-700 dark:text-brand-350 font-bold uppercase tracking-wider">Enterprise Suite</span>
            </div>
          )}
        </div>

        {/* Workspace Switcher */}
        <div className="relative mb-5 px-1">
          <button
            onClick={() => !collapsed && setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/50 hover:bg-slate-100/70 transition text-left focus:outline-none dark:bg-brand-900/10 dark:border-brand-900/40 dark:hover:bg-brand-900/20 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-5 h-5 rounded-md bg-amber-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                A
              </div>
              {!collapsed && (
                <span className="text-xs font-bold text-slate-700 truncate">{activeWorkspace}</span>
              )}
            </div>
            {!collapsed && <ChevronDown size={12} className="text-slate-400" />}
          </button>

          {showWorkspaceDropdown && !collapsed && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50">
              {["Acme Corp ESG", "Personal Hub", "Family Team"].map((workspace) => (
                <button
                  key={workspace}
                  onClick={() => {
                    setActiveWorkspace(workspace);
                    setShowWorkspaceDropdown(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition text-left"
                >
                  {workspace}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Navigation Section Groupings */}
        <nav className="flex-1 space-y-4 overflow-y-auto pr-1">
          {sections.map((sec) => (
            <div key={sec.title} className="space-y-1">
              {!collapsed && (
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-widest px-3 mb-1">
                  {sec.title}
                </p>
              )}
              {sec.items.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? "bg-brand-50 text-brand-850 font-extrabold shadow-sm border border-brand-100/50 dark:bg-brand-900/30 dark:text-brand-300 dark:border-brand-900/50"
                        : "text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-brand-900/20 hover:text-slate-900 dark:hover:text-white"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                >
                  <Icon size={15} />
                  {!collapsed && <span>{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer Area with Dark Mode and Profile */}
        <div className="space-y-3 pt-4 border-t border-slate-100 mt-auto">
          {/* Mock Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-brand-900/30 transition focus:outline-none"
          >
            <div className="flex items-center gap-3">
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
            </div>
            {!collapsed && (
              <div className="w-8 h-4 rounded-full bg-slate-200 dark:bg-brand-900 relative flex items-center px-0.5">
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-200 ${darkMode ? "translate-x-3.5 bg-brand-850" : ""}`} />
              </div>
            )}
          </button>

          {/* User profile card */}
          {user && (
            <div className={`flex items-center gap-3 px-2 ${collapsed ? "justify-center" : ""}`}>
              <div className="w-8 h-8 rounded-xl bg-brand-800 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                {(user.fullName || user.username || "U").charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 truncate">{user.email}</p>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={logout}
                  title="Logout"
                  className="text-slate-400 dark:text-slate-400 hover:text-red-500 transition focus:outline-none"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Premium Navbar (Static & Fixed) */}
        <header className="h-16 bg-white/80 dark:bg-brand-950/45 backdrop-blur-md border-b border-slate-200/50 dark:border-brand-900/40 flex items-center justify-between px-8 shrink-0 sticky top-0 z-20">
          {/* Left: Global Search & AI Assistant */}
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={14} />
              <input
                type="text"
                placeholder={t("header.searchPlaceholder")}
                className="w-full bg-slate-50 dark:bg-brand-900/10 border border-slate-200 dark:border-brand-900/40 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-800 focus:bg-white dark:focus:bg-brand-950 transition text-slate-800 dark:text-slate-100"
              />
            </div>
            <button
              onClick={() => navigate("/insights")}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-brand-800 to-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition shrink-0"
            >
              <Sparkles size={13} className="animate-pulse" />
              {t("header.askAi")}
            </button>
          </div>

          {/* Right: Weather, Carbon Score, Language, Dark Mode, Notifications, Quick Add */}
          <div className="flex items-center gap-4">
            {/* Weather & AQI Widget */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-brand-900/10 border border-slate-200/60 dark:border-brand-900/40 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-450" title={`${t("header.weatherIn")} ${weather.cityName}`}>
              <span className="flex items-center gap-1">
                <Sun size={12} className="text-amber-500" />
                {weather.temp}°C ({weather.description})
              </span>
              <span className="w-px h-3 bg-slate-200 dark:bg-brand-900/40" />
              <span className={`flex items-center gap-1 ${weather.aqiColor.split(" ").slice(0, 2).join(" ")}`}>
                <Leaf size={11} />
                {t("header.aqi")}: {weather.aqiLabel}
              </span>
            </div>

             {/* Carbon Score Pill */}
            <div className="px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-xl text-[11px] font-extrabold text-brand-850 flex items-center gap-1.5 dark:bg-brand-950/40 dark:border-brand-900 dark:text-brand-300">
              <span>{t("header.carbonScore")}</span>
              <span className="px-1.5 py-0.5 rounded bg-brand-800 text-white font-black text-[9px]">A+</span>
            </div>

            {/* Language Selector Dropdown */}
            <LanguageSelector variant="header" />

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-400 hover:text-slate-600 transition dark:hover:text-white focus:outline-none"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Quick Add Log Activity */}
            <NavLink
              to="/activity"
              className="flex items-center gap-1 px-3 py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <Plus size={14} />
              {t("header.quickLog")}
            </NavLink>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto relative z-10">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Green Coach Chat widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {!showChat ? (
          <button
            onClick={() => setShowChat(true)}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-800 to-teal-700 text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition duration-300 font-bold text-xs"
          >
            <Sparkles size={14} className="animate-pulse" />
            <span>{t("coach.title")}</span>
          </button>
        ) : (
          <div className="w-80 h-96 bg-white/95 dark:bg-brand-950/95 backdrop-blur border border-slate-200 dark:border-brand-900/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-brand-900 dark:bg-brand-950 text-white p-3 flex items-center justify-between border-b border-brand-850 dark:border-brand-900">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-xs font-black">{t("coach.title")}</span>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-white/60 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Message Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-[11px] text-slate-800 dark:text-slate-250">
              {chatMessages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl p-2.5 leading-relaxed ${
                      m.sender === "user"
                        ? "bg-brand-800 text-white font-medium shadow-sm"
                        : "bg-slate-100 dark:bg-brand-900/40 text-slate-800 dark:text-slate-200 border border-slate-200/40 dark:border-brand-900/30 shadow-sm"
                    }`}
                  >
                    {idx === 0 && m.sender === "bot" ? t("coach.greeting") : m.text}
                  </div>
                </div>
              ))}

              {/* Quick AI Recommendation Prompts */}
              {chatMessages.length <= 1 && (
                <div className="pt-2 space-y-1.5 animate-fade-in">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 flex items-center gap-1">
                    <Sparkles size={11} className="text-amber-500" />
                    {t("coach.suggestions")}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { icon: "💡", text: t("coach.q1") },
                      { icon: "🥗", text: t("coach.q2") },
                      { icon: "⚡", text: t("coach.q3") },
                      { icon: "🌿", text: t("coach.q4") },
                    ].map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendChatPrompt(prompt.text)}
                        className="text-left bg-emerald-50/80 hover:bg-emerald-100/90 dark:bg-brand-900/40 dark:hover:bg-brand-900/70 border border-emerald-100 dark:border-brand-850/40 rounded-xl p-2 text-[10px] font-medium text-slate-700 dark:text-slate-200 transition active:scale-[0.98] flex items-center gap-2 group shadow-sm"
                      >
                        <span className="text-xs group-hover:scale-110 transition">{prompt.icon}</span>
                        <span className="flex-1 truncate">{prompt.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {chatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-100 dark:bg-brand-900/40 text-slate-400 rounded-xl px-3 py-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendChat} className="p-2 border-t border-slate-100 dark:border-brand-900/30 flex gap-1.5 bg-white dark:bg-brand-950">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder={t("coach.askSomething")}
                className="flex-1 border border-slate-200 dark:border-brand-900/40 bg-slate-50 dark:bg-brand-900/10 rounded-lg px-2.5 py-1.5 text-[11px] focus:outline-none focus:ring-1 focus:ring-brand-500 focus:bg-white dark:focus:bg-brand-950 transition text-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                disabled={chatLoading || !chatInput.trim()}
                className="bg-brand-800 hover:bg-brand-900 text-white rounded-lg px-3 text-[11px] font-bold transition disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
}
