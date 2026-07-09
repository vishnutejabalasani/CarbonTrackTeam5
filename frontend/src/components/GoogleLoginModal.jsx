import { useState, useEffect } from "react";
import { X, PlusCircle, ExternalLink, ShieldCheck, ToggleLeft, ToggleRight } from "lucide-react";

export default function GoogleLoginModal({ isOpen, onClose, onSelectAccount }) {
  const [customEmail, setCustomEmail] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  
  // Real Google Auth States
  const [useRealAuth, setUseRealAuth] = useState(false);
  const [clientId, setClientId] = useState(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem("google_client_id") || ""
  );
  const [clientIdInput, setClientIdInput] = useState("");
  const [configError, setConfigError] = useState("");

  useEffect(() => {
    if (useRealAuth && clientId && window.google && isOpen) {
      // Timeout to ensure DOM element is rendered
      const timer = setTimeout(() => {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: (response) => {
              // Send the real JWT ID Token to the parent handler
              onSelectAccount(response.credential);
              onClose();
            },
          });
          
          const btnElem = document.getElementById("google-native-signin-btn");
          if (btnElem) {
            window.google.accounts.id.renderButton(btnElem, {
              theme: "filled_blue",
              size: "large",
              width: 320,
              shape: "pill"
            });
          }
        } catch (err) {
          console.error("Failed to initialize Google Sign-In button", err);
          setConfigError("Failed to load Google Login. Verify your Client ID format.");
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [useRealAuth, clientId, isOpen]);

  if (!isOpen) return null;

  const accounts = [
    { name: "BALASANI VISHNUTEJA", email: "balasanivishnuteja@gmail.com", initial: "B", bgColor: "bg-orange-600" },
    { name: "balasani hrushikesh", email: "balasanihrushikesh13@gmail.com", initial: "B", bgColor: "bg-teal-600" },
    { name: "VISHNUTEJA BALASANI", email: "balasanivishnuteja2006@gmail.com", initial: "V", bgColor: "bg-sky-600" },
    { name: "Vijayalakshmi vangala", email: "vijayalakshmivangala476@gmail.com", initial: "V", bgColor: "bg-purple-700", status: "Signed out" },
    { name: "EduSkill", email: "eduskill18@gmail.com", initial: "E", bgColor: "bg-rose-600" },
    { name: "biscuitfallingover", email: "biscuitfallingover@gmail.com", initial: "B", bgColor: "bg-amber-800" },
    { name: "BALASANI VISHNU TEJA", email: "24eg112d43@anurag.edu.in", initial: "B", bgColor: "bg-orange-600" },
  ];

  const handleSelect = (email) => {
    onSelectAccount(`dev-token-${email}`);
    onClose();
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    if (customEmail.trim() && customEmail.includes("@")) {
      handleSelect(customEmail.trim());
    }
  };

  const handleSaveClientId = (e) => {
    e.preventDefault();
    if (clientIdInput.trim()) {
      localStorage.setItem("google_client_id", clientIdInput.trim());
      setClientId(clientIdInput.trim());
      setConfigError("");
    }
  };

  const handleClearClientId = () => {
    localStorage.removeItem("google_client_id");
    setClientId("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="bg-[#131314] text-[#e3e3e3] rounded-3xl border border-zinc-800 w-full max-w-4xl min-h-[520px] flex flex-col md:flex-row overflow-hidden relative shadow-2xl mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-[#c4c7c5] hover:text-white transition z-10"
        >
          <X size={24} />
        </button>

        {/* Left Side: Brand and Title */}
        <div className="flex-1 p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-zinc-800 bg-[#0b0b0c]">
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 45c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.5 35.9 26.9 37 24 37c-5.3 0-9.7-3.4-11.3-8H6v6.5C9.5 40.5 16.2 45 24 45z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-2.9 5.4-5.3 7.1l6.5 5.4C39.9 37.1 43 31 43 24c0-1.4-.1-2.7-.4-3.5z"/>
            </svg>
            <span className="text-sm font-medium text-[#c4c7c5]">Sign in with Google</span>
          </div>

          <div className="my-10 md:my-auto">
            {/* Logo area */}
            <div className="w-14 h-14 rounded-full bg-[#1e1f20] flex items-center justify-center mb-6">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-[#4CAF50]" fill="currentColor">
                <path d="M17,8C8,10,5.9,16.17,5.9,16.17C5.9,16.17,9,14,14,14C16,14,18,15,19,16C20,15,21,12,21,10C21,7.24,19.21,6,17,8M3,20C3,20,5.5,12,12,10C15,9.08,18,6,18,3C18,3,15.5,5,12,6C9,6.86,6,10,5,13C4.24,15.28,3,20,3,20Z" />
              </svg>
            </div>
            <h1 className="text-2xl font-normal text-white mb-2">
              {useRealAuth ? "Verify Google Account" : "Choose an account"}
            </h1>
            <p className="text-sm text-[#c4c7c5]">
              to continue to <span className="text-[#8ab4f8] font-medium hover:underline cursor-pointer">CarbonTrack</span>
            </p>
          </div>

          {/* Mode Switcher Toggle */}
          <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-zinc-800">
            <button
              onClick={() => setUseRealAuth(!useRealAuth)}
              className="flex items-center gap-2 text-sm text-[#8ab4f8] hover:text-blue-300 transition text-left"
            >
              {useRealAuth ? (
                <>
                  <ToggleRight size={24} className="text-blue-400" />
                  <span>Switch to Simulated Sandbox Mode</span>
                </>
              ) : (
                <>
                  <ToggleLeft size={24} className="text-zinc-500" />
                  <span>Switch to Real Google Login</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-[#9aa0a6] leading-tight">
              {useRealAuth 
                ? "Connecting directly to Google authentication servers." 
                : "Using a simulated sandbox environment for instant local testing."}
            </p>
          </div>
        </div>

        {/* Right Side: Action Container */}
        <div className="flex-1 p-10 flex flex-col justify-between max-h-[600px] bg-[#131314]">
          {!useRealAuth ? (
            /* Mode A: Simulated Account Chooser */
            <div className="overflow-y-auto pr-2 space-y-1 custom-scrollbar flex-1">
              {accounts.map((acc) => (
                <button
                  key={acc.email}
                  onClick={() => handleSelect(acc.email)}
                  className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-[#1e1f20] transition duration-200 text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${acc.bgColor} text-white flex items-center justify-center font-semibold text-base`}>
                      {acc.initial}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white group-hover:text-blue-400 transition">
                        {acc.name}
                      </p>
                      <p className="text-xs text-[#c4c7c5]">
                        {acc.email}
                      </p>
                    </div>
                  </div>
                  {acc.status && (
                    <span className="text-xs text-[#9aa0a6] bg-[#1e1f20] px-2.5 py-1 rounded-full">
                      {acc.status}
                    </span>
                  )}
                </button>
              ))}

              {showCustomInput ? (
                <form onSubmit={handleCustomSubmit} className="mt-4 p-4 bg-[#1e1f20] rounded-2xl border border-zinc-800">
                  <label className="block text-xs font-medium text-[#c4c7c5] mb-2">Use another Google account email</label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="name@gmail.com"
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      className="flex-1 bg-[#131314] text-white border border-zinc-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                    >
                      Next
                  </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[#1e1f20] transition duration-200 text-left text-[#c4c7c5] border border-dashed border-zinc-800 mt-2"
                >
                  <div className="w-10 h-10 rounded-full bg-[#202124] flex items-center justify-center">
                    <PlusCircle size={20} className="text-[#9aa0a6]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">Use another account</p>
                  </div>
                </button>
              )}
            </div>
          ) : (
            /* Mode B: Real Google Sign-in with OAuth Client ID */
            <div className="flex-1 flex flex-col justify-center">
              {!clientId ? (
                /* Mode B1: Google Client ID Setup form */
                <form onSubmit={handleSaveClientId} className="space-y-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium text-white">Google OAuth Setup</h3>
                    <p className="text-xs text-[#c4c7c5] mt-1">
                      Provide a Google Client ID to connect Google authentication servers.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs text-[#c4c7c5] mb-1.5 uppercase tracking-wider font-semibold">
                      OAuth Client ID
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="123456789-abc123xyz.apps.googleusercontent.com"
                      value={clientIdInput}
                      onChange={(e) => setClientIdInput(e.target.value)}
                      className="w-full bg-[#1e1f20] text-white border border-zinc-700 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                    />
                  </div>

                  <div className="bg-[#1e1f20] rounded-xl p-3.5 border border-zinc-800 text-[11px] text-[#c4c7c5] leading-relaxed">
                    <span className="font-semibold block text-white mb-1">How to create a Client ID:</span>
                    1. Open the <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-[#8ab4f8] underline inline-flex items-center gap-0.5">Google Cloud Console <ExternalLink size={10} /></a>.
                    <br />
                    2. Go to Credentials and create a Web Application Client ID.
                    <br />
                    3. Add <code>http://localhost:5173</code> to the <strong>Authorized JavaScript origins</strong>.
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-medium transition"
                  >
                    Save and Initialize
                  </button>
                </form>
              ) : (
                /* Mode B2: Official Google Login Button Render */
                <div className="flex flex-col items-center justify-center py-10 space-y-6">
                  <div className="text-center max-w-xs">
                    <ShieldCheck size={48} className="text-[#4CAF50] mx-auto mb-3" />
                    <h3 className="text-base font-semibold text-white">Google OAuth Active</h3>
                    <p className="text-xs text-[#c4c7c5] mt-1">
                      Click the official Google button below to sign in with your real Google account credentials.
                    </p>
                  </div>

                  {/* Divine location for Google SDK Button injection */}
                  <div id="google-native-signin-btn" className="my-4"></div>

                  {configError && (
                    <p className="text-xs text-red-400 text-center max-w-xs">{configError}</p>
                  )}

                  <button
                    onClick={handleClearClientId}
                    className="text-xs text-zinc-500 hover:text-zinc-300 underline transition"
                  >
                    Change / reset Google Client ID
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
