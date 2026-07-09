import { useState } from "react";
import { User, Shield, Sparkles, Bell, ToggleLeft, ToggleRight, Check, Key, Building2, Copy, ClipboardCheck } from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile"); // "profile" | "org" | "security" | "api"

  // States
  const [profile, setProfile] = useState({
    fullName: "Test User",
    email: "testuser@example.com",
    role: "Sustainability Officer",
    weeklyTarget: "100"
  });

  const [org, setOrg] = useState({
    companyName: "Acme Corp ESG",
    department: "Sustainability Ops",
    teamSize: "250",
    complianceLevel: "Tier 1 Decarbonization"
  });

  const [notifications, setNotifications] = useState({
    overshootAlerts: true,
    weeklyDigest: true,
    badgeUnlocked: true,
  });

  const [preferences, setPreferences] = useState({
    theme: "light",
    unit: "metric",
    privacy: "public"
  });

  const [apiKeys, setApiKeys] = useState([
    { name: "Production Analytics Fetch", key: "ct_live_729482d8c304ae293b", created: "2026-06-12" },
    { name: "Dev Webhook Push", key: "ct_test_8923b3a72810ce84b1", created: "2026-07-01" }
  ]);

  const [newKeyName, setNewKeyName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  const handleSave = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const handleGenerateKey = (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    const randomHex = Array.from({ length: 18 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const newKey = {
      name: newKeyName,
      key: `ct_live_${randomHex}`,
      created: new Date().toISOString().split("T")[0]
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName("");
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(""), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Enterprise Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Manage corporate settings, profiles, ESG metrics, and developer API credentials.</p>
      </div>

      <div className="grid md:grid-cols-[240px_1fr] gap-8 items-start">
        {/* Navigation Sidebar inside Settings */}
        <div className="space-y-1 bg-white p-3 rounded-2xl border border-slate-200/60 shadow-sm">
          {[
            { key: "profile", label: "General Profile", icon: User },
            { key: "org", label: "Organization Details", icon: Building2 },
            { key: "security", label: "Privacy & Preferences", icon: Shield },
            { key: "api", label: "API Credentials", icon: Key }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-bold rounded-xl text-left transition focus:outline-none ${
                activeTab === tab.key
                  ? "bg-brand-50 text-brand-850"
                  : "text-slate-505 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Panels */}
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6">
          
          {activeTab === "profile" && (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Sparkles size={15} className="text-brand-850" />
                Profile Settings
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full border border-slate-200 bg-slate-50 text-slate-400 rounded-xl px-3.5 py-2.5 text-xs cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Role / Title</label>
                  <input
                    type="text"
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Weekly Target (kg CO₂e)</label>
                  <input
                    type="number"
                    value={profile.weeklyTarget}
                    onChange={(e) => setProfile({ ...profile, weeklyTarget: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-brand-700 font-bold bg-brand-50 px-3 py-1.5 rounded-lg">
                    <Check size={13} /> Saved successfully
                  </span>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="ml-auto bg-brand-800 hover:bg-brand-900 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm"
                >
                  {saving ? "Publishing Changes..." : "Save Settings"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "org" && (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Building2 size={15} className="text-brand-850" />
                Corporate ESG Profile
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Company Name</label>
                  <input
                    type="text"
                    value={org.companyName}
                    onChange={(e) => setOrg({ ...org, companyName: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Department</label>
                  <input
                    type="text"
                    value={org.department}
                    onChange={(e) => setOrg({ ...org, department: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Active Employees</label>
                  <input
                    type="number"
                    value={org.teamSize}
                    onChange={(e) => setOrg({ ...org, teamSize: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Compliance Designation</label>
                  <input
                    type="text"
                    disabled
                    value={org.complianceLevel}
                    className="w-full border border-slate-200 bg-slate-50 text-slate-400 rounded-xl px-3.5 py-2.5 text-xs cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-brand-700 font-bold bg-brand-50 px-3 py-1.5 rounded-lg">
                    <Check size={13} /> Org details updated
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto bg-brand-800 hover:bg-brand-900 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm"
                >
                  Save Org Details
                </button>
              </div>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleSave} className="space-y-6">
              <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <Shield size={15} className="text-brand-850" />
                Preferences & Visibilities
              </h2>

              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">System Theme</label>
                  <select
                    value={preferences.theme}
                    onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode (Beta)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Reporting Unit</label>
                  <select
                    value={preferences.unit}
                    onChange={(e) => setPreferences({ ...preferences, unit: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  >
                    <option value="metric">Metric (kg CO₂e)</option>
                    <option value="imperial">Imperial (lbs CO₂e)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Leaderboard privacy</label>
                  <select
                    value={preferences.privacy}
                    onChange={(e) => setPreferences({ ...preferences, privacy: e.target.value })}
                    className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                  >
                    <option value="public">Publicly Visible</option>
                    <option value="private">Anonymous Mode</option>
                  </select>
                </div>
              </div>

              <h3 className="font-bold text-xs text-slate-900 border-t border-slate-100 pt-4 flex items-center gap-2">
                <Bell size={14} className="text-brand-850" />
                Notification Channels
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">Weekly Target Overshoot Alerts</p>
                    <p className="text-[10px] text-slate-400">Receive alert warnings if activities exceed weekly limit pace.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifications({ ...notifications, overshootAlerts: !notifications.overshootAlerts })}
                    className="text-brand-800 focus:outline-none"
                  >
                    {notifications.overshootAlerts ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="text-gray-300" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">Weekly Eco Digest Reports</p>
                    <p className="text-[10px] text-slate-400">Get aggregated email breakdowns tracking your 7-day carbon totals.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifications({ ...notifications, weeklyDigest: !notifications.weeklyDigest })}
                    className="text-brand-800 focus:outline-none"
                  >
                    {notifications.weeklyDigest ? <ToggleRight size={24} /> : <ToggleLeft size={24} className="text-gray-300" />}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {saved && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-brand-700 font-bold bg-brand-50 px-3 py-1.5 rounded-lg">
                    <Check size={13} /> Preferences saved
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto bg-brand-800 hover:bg-brand-900 text-white rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm"
                >
                  Save System Preferences
                </button>
              </div>
            </form>
          )}

          {activeTab === "api" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Key size={15} className="text-brand-850" />
                  Developer API Keys
                </h2>
                <p className="text-xs text-slate-400 mt-1">Authenticate telemetry webhooks or stream department carbon logs to internal BI platforms.</p>
              </div>

              {/* API list */}
              <div className="space-y-3">
                {apiKeys.map((k) => (
                  <div key={k.key} className="p-4 border border-slate-200 bg-slate-50/50 rounded-2xl flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-800">{k.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono mt-1">{k.key}</p>
                    </div>
                    <button
                      onClick={() => handleCopyKey(k.key)}
                      className="p-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl transition focus:outline-none shrink-0"
                    >
                      {copiedKey === k.key ? <Check className="text-brand-800" size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                ))}
              </div>

              {/* Generate new key */}
              <form onSubmit={handleGenerateKey} className="pt-4 border-t border-slate-100 flex gap-3">
                <input
                  type="text"
                  required
                  placeholder="Key Description, e.g. AWS Webhook Push"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/25"
                />
                <button
                  type="submit"
                  className="bg-brand-800 hover:bg-brand-900 text-white rounded-xl px-4 py-2 text-xs font-bold transition shadow-sm shrink-0"
                >
                  Generate Key
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
