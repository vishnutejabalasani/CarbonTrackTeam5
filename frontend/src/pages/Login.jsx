import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Leaf, TrendingDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    alert("Google Button Clicked");
    window.location.assign("http://localhost:8080/oauth2/authorization/google");
  };

  return (
      <div className="min-h-screen flex">
        <div className="flex-1 flex flex-col items-center justify-center px-6 bg-white">
          <div className="w-full max-w-sm">
            <div className="flex flex-col items-center mb-8">
              <div className="flex items-center gap-2 text-brand-800 font-semibold text-lg">
                <Leaf size={20} />
                CarbonTrack
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Small steps for a sustainable future.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
              <h1 className="text-xl font-semibold text-gray-900 mb-6">
                Welcome back
              </h1>

              <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-5">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-400">OR</span>
                <div className="h-px bg-gray-200 flex-1" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Email address
                  </label>
                  <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Password
                    </label>
                    <button
                        type="button"
                        className="text-xs text-brand-700 hover:underline"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-800 hover:bg-brand-900 text-white rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-5">
                Don't have an account?{" "}
                <Link
                    to="/register"
                    className="font-semibold text-brand-800 hover:underline"
                >
                  Register
                </Link>
              </p>
            </div>

            <p className="text-center text-[11px] text-gray-400 mt-6">
              🔒 SECURE AES-256 • CARBONTRUST CERTIFIED
            </p>
          </div>
        </div>

        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-brand-700 to-brand-900 items-center justify-center relative overflow-hidden">
          <div className="max-w-sm text-center px-8 relative z-10">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
              <Leaf className="text-white" size={28} />
            </div>

            <h2 className="text-2xl font-semibold text-white mb-3">
              Every byte has a footprint.
            </h2>

            <p className="text-brand-100 text-sm mb-8">
              Join 12,000+ businesses tracking and offsetting their operational
              carbon in real-time.
            </p>

            <div className="bg-white/10 rounded-xl p-4 text-left">
              <div className="flex items-center gap-2 text-brand-100 text-xs mb-1">
                <TrendingDown size={14} />
                Community Impact
              </div>

              <p className="text-2xl font-semibold text-white">-12.4%</p>

              <p className="text-xs text-brand-200">
                Average emission reduction this month
              </p>
            </div>
          </div>
        </div>
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