import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex flex-col">
      <div className="px-8 py-6">
        <span className="font-semibold text-brand-900 text-lg">CarbonTrack</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-center">
          {/* Left: marketing copy */}
          <div>
            <span className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-800 text-xs font-medium px-3 py-1 rounded-full mb-5">
              <Sparkles size={12} />
              JOIN 15,000+ ECO-TRACKERS
            </span>
            <h1 className="text-4xl font-bold text-brand-950 leading-tight mb-4">
              Your journey to a zero-carbon lifestyle starts here.
            </h1>
            <p className="text-gray-600 mb-8">
              Take control of your environmental impact with precision tracking, community goals,
              and personalized ecological insights.
            </p>

            <div className="bg-white rounded-xl shadow-sm p-4 inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-800 flex items-center justify-center">
                <ArrowRight className="text-white" size={16} />
              </div>
              <div>
                <p className="text-[11px] text-gray-500 uppercase tracking-wide">Potential Impact</p>
                <p className="text-lg font-semibold text-brand-900">-2.4t CO2e / yr</p>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-semibold text-gray-900">Create Account</h2>
            <p className="text-sm text-gray-500 mb-6">Fill in your details to start logging.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field
                label="Full Name"
                icon={<User size={15} />}
                type="text"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange("fullName")}
              />
              <Field
                label="Email Address"
                icon={<Mail size={15} />}
                type="email"
                placeholder="john@example.com"
                value={form.email}
                onChange={handleChange("email")}
              />
              <Field
                label="Password"
                icon={<Lock size={15} />}
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange("password")}
              />
              <Field
                label="Confirm Password"
                icon={<ShieldCheck size={15} />}
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
              />

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-brand-800 hover:bg-brand-900 text-white rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Get Started"}
                {!loading && <ArrowRight size={15} />}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="h-px bg-gray-200 flex-1" />
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px bg-gray-200 flex-1" />
            </div>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              onClick={() => alert("Google OAuth not yet wired up — connect this to your backend's OAuth2 flow.")}
            >
              <GoogleIcon />
              Sign up with Google
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-brand-800 hover:underline">
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between px-8 py-5 text-xs text-gray-400">
        <span>© 2026 CARBONTRACK. ALL RIGHTS RESERVED.</span>
        <div className="flex gap-4">
          <span>Privacy Policy</span>
          <span>Terms of Service</span>
        </div>
      </footer>
    </div>
  );
}

function Field({ label, icon, ...inputProps }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>
        <input
          required
          {...inputProps}
          className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
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
