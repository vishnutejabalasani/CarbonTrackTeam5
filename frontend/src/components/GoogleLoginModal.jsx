import { useState, useEffect } from "react";
import { X, ExternalLink, ShieldCheck } from "lucide-react";

export default function GoogleLoginModal({ isOpen, onClose, onSelectAccount }) {
  const [clientId, setClientId] = useState(
    import.meta.env.VITE_GOOGLE_CLIENT_ID || localStorage.getItem("google_client_id") || ""
  );
  const [clientIdInput, setClientIdInput] = useState("");
  const [configError, setConfigError] = useState("");

  const [mockEmail, setMockEmail] = useState("developer@example.com");

  useEffect(() => {
    if (clientId && window.google && isOpen) {
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
  }, [clientId, isOpen]);

  if (!isOpen) return null;

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

  const handleBypassLogin = (e) => {
    e.preventDefault();
    if (mockEmail.trim()) {
      onSelectAccount("dev-token-" + mockEmail.trim().toLowerCase());
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="bg-[#131314] text-[#e3e3e3] rounded-3xl border border-zinc-800 w-full max-w-2xl min-h-[450px] flex flex-col overflow-hidden relative shadow-2xl mx-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 text-[#c4c7c5] hover:text-white transition z-10"
        >
          <X size={24} />
        </button>

        <div className="p-10 flex flex-col justify-between flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 45c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.5 35.9 26.9 37 24 37c-5.3 0-9.7-3.4-11.3-8H6v6.5C9.5 40.5 16.2 45 24 45z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-2.9 5.4-5.3 7.1l6.5 5.4C39.9 37.1 43 31 43 24c0-1.4-.1-2.7-.4-3.5z"/>
            </svg>
            <span className="text-sm font-medium text-[#c4c7c5]">Sign in with Google</span>
          </div>

          <div className="flex-grow flex flex-col justify-center">
            {!clientId ? (
              /* Google Client ID Setup form */
              <form onSubmit={handleSaveClientId} className="space-y-4 max-w-md mx-auto w-full">
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
              /* Official Google Login Button Render */
              <div className="flex flex-col items-center justify-center space-y-6">
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

            {/* Developer Bypass Option */}
            <div className="mt-8 pt-6 border-t border-zinc-800/80 text-center w-full max-w-md mx-auto">
              <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block mb-3">
                Local Dev Bypass (No Client ID Setup Required)
              </span>
              <form onSubmit={handleBypassLogin} className="flex gap-2 justify-center">
                <input
                  type="email"
                  required
                  value={mockEmail}
                  onChange={(e) => setMockEmail(e.target.value)}
                  placeholder="developer@example.com"
                  className="bg-[#1e1f20] text-white border border-zinc-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[200px]"
                />
                <button
                  type="submit"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl px-4 py-2 text-xs font-semibold border border-zinc-750 transition"
                >
                  Bypass with Mock Google Account
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
