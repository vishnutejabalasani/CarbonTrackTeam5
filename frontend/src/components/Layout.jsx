import { NavLink, Outlet } from "react-router-dom";
import {
  Leaf,
  Plus,
  LayoutGrid,
  Flag,
  Lightbulb,
  Users,
  HelpCircle,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/activity", label: "Activity", icon: Plus },
  { to: "/goals", label: "Goals", icon: Flag },
  { to: "/insights", label: "Insights", icon: Lightbulb },
  { to: "/community", label: "Community", icon: Users },
];

export default function Layout() {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex bg-[#f7f8f7]">
      <aside className="w-60 bg-white border-r border-gray-200 flex flex-col px-4 py-5 shrink-0">
        <div className="flex items-center gap-2 px-2 mb-1">
          <Leaf className="text-brand-700" size={20} />
          <span className="font-semibold text-brand-900">CarbonTrack</span>
        </div>
        <p className="text-[11px] text-gray-400 px-2 mb-5">Eco-SaaS Tracker</p>

        <NavLink
          to="/activity"
          className="flex items-center justify-center gap-2 bg-brand-800 hover:bg-brand-900 text-white text-sm font-medium rounded-lg py-2.5 mb-6 transition"
        >
          <Plus size={16} />
          Log Activity
        </NavLink>

        <nav className="flex-1 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                  isActive
                    ? "bg-brand-50 text-brand-800 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="space-y-1 pt-4 border-t border-gray-100">
          <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition">
            <HelpCircle size={16} />
            Help
          </button>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
