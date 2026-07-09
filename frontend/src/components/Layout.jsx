import { useState } from "react";
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
  Sliders
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState("Acme Corp ESG");
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Grouped Navigation Items
  const sections = [
    {
      title: "Core Tracking",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
        { to: "/activity", label: "Log Footprint", icon: Plus },
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
    <div className={`min-h-screen flex ${darkMode ? "dark bg-slate-950 text-slate-100" : "bg-[#f5f8f5] text-slate-900"}`}>
      
      {/* Floating Glass Sidebar */}
      <aside
        className={`relative m-4 rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-md shadow-lg flex flex-col p-4 shrink-0 transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Toggle Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 z-30 focus:outline-none"
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
              <span className="font-extrabold text-slate-900 tracking-tight text-base block">CarbonTrack</span>
              <span className="text-[10px] text-brand-700 font-bold uppercase tracking-wider">Enterprise Suite</span>
            </div>
          )}
        </div>

        {/* Workspace Switcher */}
        <div className="relative mb-5 px-1">
          <button
            onClick={() => !collapsed && setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200/50 hover:bg-slate-100/70 transition text-left focus:outline-none ${
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
                        ? "bg-brand-50 text-brand-850 font-extrabold shadow-sm border border-brand-100/50"
                        : "text-slate-655 hover:bg-slate-50 hover:text-slate-900"
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
            onClick={() => setDarkMode(!darkMode)}
            className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-50 transition focus:outline-none"
          >
            <div className="flex items-center gap-3">
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
            </div>
            {!collapsed && (
              <div className="w-8 h-4 rounded-full bg-slate-200 relative flex items-center px-0.5">
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow-sm transition-all duration-200 ${darkMode ? "translate-x-3.5 bg-brand-800" : ""}`} />
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
                  <p className="text-xs font-bold text-slate-900 truncate">
                    {user.fullName || user.username}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                </div>
              )}
              {!collapsed && (
                <button
                  onClick={logout}
                  title="Logout"
                  className="text-slate-400 hover:text-red-500 transition focus:outline-none"
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
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/50 flex items-center justify-between px-8 shrink-0 relative z-20">
          {/* Left: Global Search & AI Assistant */}
          <div className="flex items-center gap-4 w-96">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search analytics, carbon goals, activity..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
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
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 bg-slate-50 border border-slate-200/60 rounded-xl text-[11px] font-medium text-slate-600">
              <span className="flex items-center gap-1">
                <Sun size={12} className="text-amber-500" />
                22°C
              </span>
              <span className="w-px h-3 bg-slate-200" />
              <span className="flex items-center gap-1 text-brand-700">
                <Leaf size={11} />
                AQI: 38 (Excellent)
              </span>
            </div>

            {/* Carbon Score Pill */}
            <div className="px-3 py-1.5 bg-brand-50 border border-brand-100 rounded-xl text-[11px] font-extrabold text-brand-850 flex items-center gap-1.5">
              <span>Carbon Score</span>
              <span className="px-1.5 py-0.5 rounded bg-brand-800 text-white font-black text-[9px]">A+</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-slate-650 transition focus:outline-none">
              <Bell size={16} />
              <span className="absolute top-1 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
            </button>

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

    </div>
  );
}
