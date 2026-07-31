import React, { useState } from "react";
import { X, Send, Mail, FileText, FileSpreadsheet, Sparkles, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import { sendReportApi } from "../api/reports";

export default function SendReportModal({ isOpen, onClose, startDate, endDate }) {
  const [emailInput, setEmailInput] = useState("");
  const [emails, setEmails] = useState([]);
  const [format, setFormat] = useState("both"); // "pdf", "excel", "both"
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  };

  const handleAddEmail = (e) => {
    if (e.key === "Enter" || e.key === "," || e.key === " ") {
      e.preventDefault();
      const trimmed = emailInput.trim().replace(/,/g, "");
      if (!trimmed) return;
      if (!validateEmail(trimmed)) {
        toast.error(`Invalid email format: ${trimmed}`);
        return;
      }
      if (emails.includes(trimmed)) {
        toast.error("Email address already added");
        return;
      }
      setEmails((prev) => [...prev, trimmed]);
      setEmailInput("");
    }
  };

  const handleRemoveEmail = (target) => {
    setEmails((prev) => prev.filter((e) => e !== target));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let finalEmails = [...emails];
    
    // Check if user left text in the input box without pressing Enter
    const leftover = emailInput.trim().replace(/,/g, "");
    if (leftover) {
      if (validateEmail(leftover)) {
        if (!finalEmails.includes(leftover)) {
          finalEmails.push(leftover);
          setEmails(finalEmails);
          setEmailInput("");
        }
      } else {
        toast.error(`Invalid email format: ${leftover}`);
        return;
      }
    }

    if (finalEmails.length === 0) {
      toast.error("Please add at least one recipient email address.");
      return;
    }

    setLoading(true);
    try {
      await sendReportApi({
        emails: finalEmails,
        format,
        message,
        startDate,
        endDate,
      });
      toast.success("Carbon Footprint Report dispatched successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to send report:", err);
      toast.error(err?.response?.data?.message || "Failed to send report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-emerald-900/50 rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 transform scale-100">
        {/* Glow Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-emerald-300 shadow-inner">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold tracking-tight">Send ESG Carbon Report</h3>
                <p className="text-xs text-emerald-100/80">Dispatch compliance reports to stakeholders</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition focus:outline-none"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800 dark:text-slate-100 text-xs">
          
          {/* Recipient Emails Field */}
          <div className="space-y-2">
            <label className="font-bold flex items-center justify-between text-slate-700 dark:text-slate-300">
              <span>Recipient Email Addresses</span>
              <span className="text-[10px] text-slate-400 font-normal">Press Enter or Comma to add</span>
            </label>

            <div className="min-h-[44px] p-2 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-emerald-900/40 rounded-2xl flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-emerald-500/30 transition">
              {emails.map((email) => (
                <span
                  key={email}
                  className="inline-flex items-center gap-1 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 px-2.5 py-1 rounded-xl font-semibold text-[11px]"
                >
                  <Mail size={12} className="text-emerald-600 dark:text-emerald-400" />
                  {email}
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(email)}
                    className="hover:text-rose-500 transition ml-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={handleAddEmail}
                placeholder={emails.length === 0 ? "e.g. executive@company.com, audit@esg.org" : "Add another email..."}
                className="flex-1 min-w-[160px] bg-transparent border-none outline-none py-1 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Select Report Format */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 dark:text-slate-300">Select Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: "pdf", label: "PDF Report", icon: FileText, desc: "Official PDF" },
                { id: "excel", label: "Excel Sheet", icon: FileSpreadsheet, desc: "Raw Data XLSX" },
                { id: "both", label: "Both (PDF + XLSX)", icon: Sparkles, desc: "Full Package" },
              ].map(({ id, label, icon: Icon, desc }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setFormat(id)}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    format === id
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-300 ring-2 ring-emerald-500/20"
                      : "bg-slate-50/60 dark:bg-slate-950/30 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300"
                  }`}
                >
                  <Icon size={18} className={format === id ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"} />
                  <div className="mt-2">
                    <p className="font-extrabold text-[11px]">{label}</p>
                    <p className="text-[9px] opacity-75 font-medium">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Message Field */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300">Personal Note / Cover Message (Optional)</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add an optional message or note for the recipients..."
              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-emerald-900/40 rounded-2xl p-3 outline-none focus:ring-2 focus:ring-emerald-500/30 transition text-slate-800 dark:text-slate-100 placeholder-slate-400"
            />
          </div>

          {/* Action Footer */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800/60">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-600/20 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="animate-spin" size={14} />
                  <span>Dispatching...</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>Send Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
