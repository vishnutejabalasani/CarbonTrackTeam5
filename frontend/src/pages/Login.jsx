import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, TrendingDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GoogleLoginModal from "../components/GoogleLoginModal";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(
          err.response?.data?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGoogleModalOpen(true);
  };

  const handleSelectGoogleAccount = async (idToken) => {
    setError("");
    setLoading(true);
    try {
      await googleLogin(idToken);
      navigate("/dashboard");
    } catch (err) {
      setError(
          err.response?.data?.message ||
          "Google authentication failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Left Side: Form */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-50/40 blur-3xl" />
          
          <div className="w-full max-w-md relative z-10">
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-2.5 text-brand-800 font-extrabold text-2xl tracking-tight">
                <div className="w-10 h-10 rounded-xl bg-brand-800 flex items-center justify-center text-white shadow-md shadow-brand-800/20">
                  <Leaf size={22} className="rotate-12" />
                </div>
                CarbonTrack
              </div>
              <p className="text-xs text-gray-400 mt-2 font-medium tracking-wide uppercase">
                Eco-SaaS Carbon Footprint System
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-xl p-8 sm:p-10">
              <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900">
                  Welcome Back
                </h1>
                <p className="text-xs text-gray-500 mt-1">Sign in to track your carbon analytics dashboard.</p>
              </div>

              <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl py-3 text-sm font-semibold text-gray-700 shadow-sm transition hover:shadow duration-200"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-6">
                <div className="h-px bg-gray-200/70 flex-1" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">or</span>
                <div className="h-px bg-gray-200/70 flex-1" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">
                    Email address
                  </label>
                  <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full border border-gray-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                        type="button"
                        className="text-xs font-semibold text-brand-700 hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>

                  <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-gray-200 bg-slate-50/50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:bg-white transition"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs font-medium text-red-650">
                    {error}
                  </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-800 hover:bg-brand-900 text-white rounded-xl py-3 text-sm font-semibold shadow-md shadow-brand-900/10 transition duration-200 disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-6">
                Don't have an account yet?{" "}
                <Link
                    to="/register"
                    className="font-bold text-brand-800 hover:underline"
                >
                  Register
                </Link>
              </p>
            </div>

            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-8">
              🔒 SECURE AES-256 • CARBONTRUST CERTIFIED
            </p>
          </div>
        </div>

        {/* Right Side: Hero Pane */}
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-800 to-brand-950 items-center justify-center relative overflow-hidden">
          {/* Subtle background graphics */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.15),transparent_60%)]" />
          
          <div className="max-w-md text-center px-10 relative z-10 space-y-8">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mx-auto shadow-inner">
              <Leaf className="text-white" size={32} />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">
                Every byte has a footprint.
              </h2>
              <p className="text-brand-100 text-sm leading-relaxed">
                Join 12,000+ businesses tracking and offsetting their operational
                carbon in real-time.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-left shadow-lg">
              <div className="flex items-center gap-2 text-brand-200 text-xs font-bold uppercase tracking-wider mb-2">
                <TrendingDown size={14} className="text-brand-300" />
                Community Impact
              </div>

              <p className="text-3xl font-black text-white">-12.4%</p>

              <p className="text-xs text-brand-200/90 mt-1 font-medium">
                Average emission reduction this month
              </p>
            </div>
          </div>
        </div>
        
        <GoogleLoginModal 
          isOpen={isGoogleModalOpen} 
          onClose={() => setIsGoogleModalOpen(false)} 
          onSelectAccount={handleSelectGoogleAccount} 
        />
      </div>
  );
}

function GoogleIcon() {
  return (
      <svg width="16" height="16" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.9 1.1 8 3l6-6C34.5 5.1 29.5 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 45c5.4 0 10.3-2.1 14-5.5l-6.5-5.4C29.5 35.9 26.9 37 24 37c-5.3 0-9.7-3.4-11.3-8H6v6.5C9.5 40.5 16.2 45 24 45z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1 2.9-2.9 5.4-5.3 7.1l6.5 5.4C39.9 37.1 43 31 43 24c0-1.4-.1-2.7-.4-3.5z"/>
      </svg>
  );
}