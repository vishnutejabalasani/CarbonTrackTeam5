import { useState } from "react";
import { X, ExternalLink } from "lucide-react";

export default function GoogleConfigModal({ isOpen, onClose, onSave }) {
  const [inputVal, setInputVal] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onSave(inputVal.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 w-full max-w-md p-6 relative mx-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center mb-6">
          <svg width="32" height="32" viewBox="0 0 48 48" className="mb-2">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 45c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.5 35.9 26.9 37 24 37c-5.3 0-9.7-3.4-11.3-8H6v6.5C9.5 40.5 16.2 45 24 45z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-2.9 5.4-5.3 7.1l6.5 5.4C39.9 37.1 43 31 43 24c0-1.4-.1-2.7-.4-3.5z"/>
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 text-center">Google OAuth Setup</h2>
          <p className="text-xs text-gray-500 text-center mt-1.5 px-2">
            To use real Google Sign-In, please provide a Google OAuth Client ID.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Google OAuth Client ID
            </label>
            <input
              type="text"
              required
              placeholder="123456789-abc123xyz.apps.googleusercontent.com"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent font-mono"
            />
          </div>

          <div className="bg-brand-50 rounded-lg p-3 border border-brand-100 text-[11px] text-brand-900 leading-relaxed">
            <span className="font-semibold block mb-0.5">Need a Client ID?</span>
            1. Go to the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline font-medium inline-flex items-center gap-0.5 text-brand-700">Google Cloud Console <ExternalLink size={10} /></a>.
            <br />
            2. Configure your OAuth consent screen and create an <strong>OAuth client ID</strong> (Web Application).
            <br />
            3. Add <code>http://localhost:5173</code> to the <strong>Authorized JavaScript origins</strong>.
          </div>

          <button
            type="submit"
            className="w-full bg-brand-800 hover:bg-brand-900 text-white rounded-lg py-2 text-sm font-medium transition"
          >
            Save and Connect
          </button>
        </form>
      </div>
    </div>
  );
}
