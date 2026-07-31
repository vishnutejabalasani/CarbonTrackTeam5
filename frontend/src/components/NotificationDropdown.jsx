import React, { useState, useEffect } from "react";
import { Bell, Check, Award, Flag, FileText, Leaf, Calendar, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  triggerMonthlyNotification,
} from "../api/notifications";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingTrigger, setLoadingTrigger] = useState(false);

  const fetchNotifications = async () => {
    try {
      const list = await getNotifications();
      setNotifications(list || []);
      const count = await getUnreadCount();
      setUnreadCount(count || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark read:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      fetchNotifications();
      toast.success("All notifications marked as read.");
    } catch (err) {
      console.error("Failed to mark all read:", err);
    }
  };

  const handleTriggerMonthly = async () => {
    setLoadingTrigger(true);
    try {
      await triggerMonthlyNotification();
      await fetchNotifications();
      toast.success("Monthly Carbon Footprint report notification generated!");
    } catch (err) {
      console.error("Failed to trigger monthly notification:", err);
      toast.error("Could not generate notification.");
    } finally {
      setLoadingTrigger(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "monthly_report":
      case "report_sent":
        return <FileText size={15} className="text-emerald-600 dark:text-emerald-400" />;
      case "badge_earned":
        return <Award size={15} className="text-amber-500" />;
      default:
        return <Leaf size={15} className="text-emerald-600 dark:text-emerald-400" />;
    }
  };

  return (
    <div className="relative">
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50/60 dark:hover:bg-slate-800 transition focus:outline-none"
        title="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[9px] font-black text-white shadow-md animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop dismiss */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-900/50 rounded-3xl shadow-2xl z-50 overflow-hidden text-xs animate-fade-in">
            {/* Panel Header */}
            <div className="p-4 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="text-emerald-600 dark:text-emerald-400" size={16} />
                <span className="font-extrabold text-slate-900 dark:text-white">ESG Notifications</span>
                {unreadCount > 0 && (
                  <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification History List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 p-3 rounded-2xl transition duration-200 ${
                      !n.read
                        ? "bg-emerald-50/50 dark:bg-emerald-950/30 font-medium"
                        : "hover:bg-slate-50 dark:hover:bg-slate-850/40 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
                      {getNotificationIcon(n.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`leading-relaxed text-slate-800 dark:text-slate-200 ${!n.read ? "font-bold" : "font-normal"}`}>
                        {n.message}
                      </p>
                      <p className="text-[9px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    {!n.read && (
                      <button
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition"
                        title="Mark as Read"
                      >
                        <Check size={14} />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-8 text-center space-y-1">
                  <Bell className="mx-auto text-slate-300 dark:text-slate-600" size={24} />
                  <p className="text-slate-500 font-semibold text-xs">No notifications yet</p>
                  <p className="text-[10px] text-slate-400">Monthly reports and activity alerts will appear here.</p>
                </div>
              )}
            </div>

            {/* Panel Footer Action */}
            <div className="p-3 bg-slate-50/60 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                onClick={handleTriggerMonthly}
                disabled={loadingTrigger}
                className="inline-flex items-center justify-center gap-1.5 w-full bg-emerald-100/80 dark:bg-emerald-950/60 hover:bg-emerald-200/80 text-emerald-900 dark:text-emerald-300 font-bold py-2 rounded-xl text-[11px] transition"
              >
                <Sparkles size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>{loadingTrigger ? "Generating Alert..." : "Test Monthly Report Notification"}</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
