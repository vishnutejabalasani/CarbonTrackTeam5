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
  Eye
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "../api/notifications";
import { chatWithGreenCoach } from "../api/activities";
import ecoSubtleBg from "../assets/eco_subtle_bg.png";

export default function Layout() {
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

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const msg = chatInput;
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: msg }]);
    setChatLoading(true);
    try {
      const res = await chatWithGreenCoach(msg);
      setChatMessages((prev) => [...prev, { sender: "bot", text: res.reply }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: "bot", text: "Sorry, I am having trouble connecting right now. Please try again later." }]);
    } finally {
      setChatLoading(false);
    }
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
      title: "Core Tracking",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
        { to: "/activity", label: "Log Footprint", icon: Plus },
        { to: "/vision", label: "Vision Analyzer", icon: Eye },
        { to: "/history", label: "Activity History", icon: History },
      ],
    },
    {
      title: "Goals & Social",
      items: [
        { to: "/goals", label: "Eco Goals", icon: Flag },
        { to: "/community", label: "Community & Standings", icon: Users },
      ],
    },
    {
      title: "Analytics",
      items: [
        { to: "/insights", label: "ESG Analytics", icon: Lightbulb },
      ],
    },
    {
      title: "Settings",
      items: [
        { to: "/settings", label: "Preferences", icon: Settings },
      ],
    },
  ];

  return (
    <div className={`min-h-screen flex relative overflow-hidden transition-colors duration-500 ${darkMode ? "dark bg-[#040c06] text-slate-100" : "bg-[#f2f7f3] text-slate-900"}`}>
      
      {/* Pleasant Eco Pattern Overlay for Side Blank Spaces */}
      <div 
        className="fixed inset-0 pointer-events-none bg-cover bg-center bg-no-repeat opacity-[0.25] dark:opacity-[0.10] transition-opacity duration-500 z-0"
        style={{ backgroundImage: `url(${ecoSubtleBg})` }}
      />

      {/* Soft Ambient Side-Margin Lighting Glows */}
      <div className="fixed -right-20 top-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-300/30 to-teal-400/20 blur-3xl pointer-events-none z-0 dark:from-emerald-900/20 dark:to-teal-900/10 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="fixed -right-10 bottom-10 w-80 h-80 rounded-full bg-gradient-to-tr from-brand-300/20 to-emerald-400/25 blur-3xl pointer-events-none z-0 dark:from-brand-900/20 dark:to-emerald-900/15" />
      <div className="fixed left-64 bottom-1/4 w-72 h-72 rounded-full bg-emerald-200/25 blur-3xl pointer-events-none z-0 dark:bg-emerald-950/20" />
      <aside
        className={`relative m-4 rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-md shadow-lg flex flex-col p-4 shrink-0 transition-all duration-300 dark:bg-brand-950/45 dark:border-brand-900/40 ${
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
        <div className="flex items-center gap-2.5 px-2 mb-6 group cursor-pointer" onClick={() => navigate("/dashboard")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 flex items-center justify-center text-white shrink-0 shadow-[0_4px_14px_rgba(30,67,34,0.35)] ring-2 ring-brand-500/20">
            <Leaf size={18} className="rotate-12 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45" />
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
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{activeWorkspace}</span>
              )}
            </div>
            {!collapsed && <ChevronDown size={12} className="text-slate-400" />}
          </button>

          {showWorkspaceDropdown && !collapsed && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 dark:bg-brand-950 dark:border-brand-900">
              {["Acme Corp ESG", "Personal Hub", "Family Team"].map((workspace) => (
                <button
                  key={workspace}
                  onClick={() => {
                    setActiveWorkspace(workspace);
                    setShowWorkspaceDropdown(false);
                  }}
                  className="w-full px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-brand-900/30 dark:hover:text-white transition text-left"
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
                    `group relative flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ease-out ${
                      isActive
                        ? "bg-gradient-to-r from-brand-100/70 to-emerald-50/40 text-brand-900 font-extrabold shadow-sm border border-brand-200/60 dark:from-brand-900/50 dark:to-emerald-950/20 dark:text-emerald-300 dark:border-brand-800/40"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-brand-900/30 hover:text-slate-900 dark:hover:text-white hover:translate-x-0.5"
                    } ${collapsed ? "justify-center" : ""}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {/* Active Signature Glowing Indicator Pill */}
                      {isActive && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-brand-600 dark:bg-emerald-400 shadow-[0_0_8px_rgba(61,131,71,0.6)]" />
                      )}
                      <Icon
                        size={15}
                        className={`transition-all duration-200 ${
                          isActive
                            ? "scale-110 text-brand-700 dark:text-emerald-400 drop-shadow-[0_0_4px_rgba(61,131,71,0.3)]"
                            : "group-hover:text-brand-600 dark:group-hover:text-emerald-400"
                        }`}
                      />
                      {!collapsed && <span>{label}</span>}
                    </>
                  )}
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
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Premium Navbar */}
        <header className="h-16 bg-white/80 dark:bg-brand-950/45 backdrop-blur-md border-b border-slate-200/50 dark:border-brand-900/40 flex items-center justify-between px-8 shrink-0 relative z-20">
          {/* Left: Global Search & AI Assistant */}
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search analytics, carbon goals, activity..."
                className="w-full bg-slate-50 dark:bg-brand-900/10 border border-slate-200 dark:border-brand-900/40 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 dark:focus:border-brand-800 focus:bg-white dark:focus:bg-brand-950 transition text-slate-800 dark:text-slate-100"
              />
            </div>
            <button
              onClick={() => navigate("/insights")}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-brand-800 to-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition shrink-0"
            >
              <Sparkles size={13} className="animate-pulse" />
              Ask AI
            </button>
          </div>

          {/* Right: Weather, Carbon Score, Notifications, Quick Add */}
          <div className="flex items-center gap-5">
            {/* Weather & AQI Widget */}
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-50 dark:bg-brand-900/10 border border-slate-200/60 dark:border-brand-900/40 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-450" title={`Weather for ${weather.cityName}`}>
              <span className="flex items-center gap-1">
                <Sun size={12} className="text-amber-500" />
                {weather.temp}°C ({weather.description})
              </span>
              <span className="w-px h-3 bg-slate-200 dark:bg-brand-900/40" />
              <span className={`flex items-center gap-1 ${weather.aqiColor.split(" ").slice(0, 2).join(" ")}`}>
                <Leaf size={11} />
                AQI: {weather.aqiLabel}
              </span>
            </div>

             {/* Carbon Score Pill */}
            <div className="px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-xl text-[11px] font-extrabold text-brand-850 flex items-center gap-1.5 dark:bg-brand-950/40 dark:border-brand-900 dark:text-brand-300">
              <span>Carbon Score</span>
              <span className="px-1.5 py-0.5 rounded bg-brand-800 text-white font-black text-[9px]">A+</span>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-slate-400 hover:text-slate-600 transition dark:hover:text-white focus:outline-none"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) fetchNotifications();
                }}
                className="relative p-2 text-slate-400 hover:text-slate-655 transition focus:outline-none"
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-brand-950 border border-slate-200 dark:border-brand-900 rounded-2xl shadow-xl z-50 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-brand-900/40 pb-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={async () => {
                          try {
                            await markAllAsRead();
                            fetchNotifications();
                          } catch (err) {
                            console.error(err);
                          }
                        }}
                        className="text-[10px] font-bold text-brand-850 dark:text-brand-350 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex items-start gap-2.5 p-2 rounded-xl transition text-[11px] ${
                            n.read
                              ? "bg-slate-50/50 dark:bg-brand-900/10 text-slate-550 dark:text-slate-400"
                              : "bg-brand-50/20 dark:bg-brand-900/25 text-slate-800 dark:text-slate-200 font-medium"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {n.type === "badge_earned" ? (
                              <Award size={13} className="text-amber-500" />
                            ) : (
                              <Flag size={13} className="text-brand-800" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="leading-relaxed break-words">{n.message}</p>
                            <p className="text-[9px] text-slate-400 mt-0.5">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          {!n.read && (
                            <button
                              onClick={async () => {
                                try {
                                  await markAsRead(n.id);
                                  fetchNotifications();
                                } catch (err) {
                                  console.error(err);
                                }
                              }}
                              className="text-slate-400 hover:text-brand-850 p-0.5"
                              title="Mark as read"
                            >
                              <Check size={11} />
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400 text-center py-4">No notifications yet.</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Add Log Activity */}
            <NavLink
              to="/activity"
              className="flex items-center gap-1 px-3 py-2 bg-brand-800 hover:bg-brand-900 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              <Plus size={14} />
              Quick Log
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
            <span>Green Coach</span>
          </button>
        ) : (
          <div className="w-80 h-96 bg-white/95 dark:bg-brand-950/95 backdrop-blur border border-slate-200 dark:border-brand-900/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-brand-900 dark:bg-brand-950 text-white p-3 flex items-center justify-between border-b border-brand-850 dark:border-brand-900">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-400" />
                <span className="text-xs font-black">AI Green Coach</span>
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
                        ? "bg-brand-800 text-white font-medium"
                        : "bg-slate-100 dark:bg-brand-900/40 text-slate-800 dark:text-slate-200 border border-slate-200/40 dark:border-brand-900/30"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
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
                placeholder="Ask me something..."
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
