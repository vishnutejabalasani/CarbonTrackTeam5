import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Leaf,
  Globe,
  TrendingDown,
  Activity,
  Award,
  Zap,
  Car,
  Utensils,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  BarChart3,
  Users,
  Building,
  Check,
  HelpCircle,
  Play
} from "lucide-react";
import heroImg from "../assets/hero.png";

export default function Landing() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);

  // Monitor scroll for header background opacity
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    
    // Trigger stats animation after load
    const timer = setTimeout(() => setAnimateStats(true), 500);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  const stats = [
    { label: "Total CO₂ Tracked", value: "14,820,400 kg", sub: "Globally since launch", icon: Globe, color: "text-blue-500 bg-blue-50" },
    { label: "Activities Logged", value: "1,240,500+", sub: "User logged data points", icon: Activity, color: "text-emerald-500 bg-emerald-50" },
    { label: "Trees Equivalent Saved", value: "450,000", sub: "Annual CO2 sequestration", icon: Leaf, color: "text-green-600 bg-green-50" },
    { label: "Active Goals", value: "12,000+", sub: "Custom user carbon reduction goals", icon: Zap, color: "text-amber-500 bg-amber-50" },
    { label: "Community Members", value: "85,000+", sub: "Active climate advocates", icon: Users, color: "text-indigo-500 bg-indigo-50" },
  ];

  const steps = [
    { title: "Log Activities", desc: "Easily input daily commuting details, household utility bills, dietary habits, and purchases.", icon: Activity },
    { title: "Calculate Emissions", desc: "Our engine uses up-to-date EPA & IPCC data to convert inputs to exact CO₂ equivalents.", icon: Zap },
    { title: "Analyze Trends", desc: "Visualize progress with high-fidelity charts, corporate ESG metrics, and comparative analytics.", icon: BarChart3 },
    { title: "Receive Recommendations", desc: "Get tailored, high-impact suggestions that make carbon reduction simple and actionable.", icon: Sparkles },
    { title: "Reduce Footprint", desc: "Complete eco goals, unlock badges, rise on the leaderboard, and make an actual impact.", icon: Award },
  ];

  const features = [
    { title: "Transport Tracking", desc: "Track car, train, and flight footprints using precise fuel type algorithms.", icon: Car, color: "text-blue-500 bg-blue-50" },
    { title: "Electricity Monitoring", desc: "Convert kWh grid usage to carbon equivalents with local grid factors.", icon: Zap, color: "text-amber-500 bg-amber-50" },
    { title: "Food Emissions", desc: "Analyze diet choices from red meat to plant-based options.", icon: Utensils, color: "text-red-500 bg-red-50" },
    { title: "Shopping Impact", desc: "Quantify lifecycle emissions of consumer electronics, apparel, and hardware.", icon: ShoppingBag, color: "text-purple-500 bg-purple-50" },
    { title: "Weekly Analytics", desc: "Receive automated personal dashboard digests mapping weekly reductions.", icon: BarChart3, color: "text-emerald-500 bg-emerald-50" },
    { title: "Goal Tracking", desc: "Set monthly limit targets with automatic pace alerts and overshoot warning banners.", icon: TargetIcon, color: "text-rose-500 bg-rose-50" },
    { title: "Achievement Badges", desc: "Gamify emissions with awards like Eco Warrior and 7-day streak badges.", icon: Award, color: "text-yellow-600 bg-yellow-50" },
    { title: "Leaderboards", desc: "Compare your standing with peers or departments on a dynamic platform scale.", icon: Users, color: "text-indigo-500 bg-indigo-50" },
    { title: "Personalized Suggestions", desc: "Decoupled advice generators targeting your highest emission categories.", icon: Sparkles, color: "text-teal-500 bg-teal-50" },
    { title: "Corporate ESG Dashboard", desc: "Scale metrics to corporate levels with multi-employee tracking dashboards.", icon: Building, color: "text-cyan-500 bg-cyan-50" },
    { title: "Real-Time Calculator", desc: "Calculate carbon instantly as you input metrics without screen reloads.", icon: Activity, color: "text-lime-500 bg-lime-50" },
    { title: "IPCC/EPA Certified Formulas", desc: "Rest assured that conversions follow strict globally accepted standards.", icon: ShieldCheck, color: "text-green-600 bg-green-50" }
  ];

  const testimonials = [
    { quote: "CarbonTrack turned ESG reporting from a nightmare into a 10-minute task. The automated summaries and visual insights are exactly what modern companies need.", author: "Sarah Jenkins", role: "Sustainability Lead, Vercel", avatarColor: "bg-indigo-600" },
    { quote: "Our family used the monthly carbon tracker to identify that our heating habits were our largest contributor. We've reduced our bill and emissions by 18%!", author: "Marcus Thorne", role: "Individual Advocate", avatarColor: "bg-teal-600" },
    { quote: "Decoupled badges and leaderboard comparison made sustainability feel like a fun game for our engineering department. Participation has been off the charts.", author: "Elena Rostova", role: "VP of Culture, Linear", avatarColor: "bg-purple-700" }
  ];

  const pricing = [
    { name: "Starter", price: "$0", desc: "Perfect for individuals starting their sustainability journey.", features: ["Daily activity logs", "Basic carbon metrics", "Personal goals", "Achievement badges", "IPCC certified formulas"], cta: "Start Free", popular: false },
    { name: "Professional", price: "$19", desc: "Ideal for conscious families and power users.", features: ["Everything in Starter", "Advanced category analytics", "Weekly/Monthly PDF reports", "Priority support", "Device sync"], cta: "Get Professional", popular: true },
    { name: "Enterprise", price: "Custom", desc: "Built for companies tracking employee footprint & ESG goals.", features: ["Everything in Professional", "Multi-employee dashboards", "Department benchmarking", "Custom API integrations", "Dedicated ESG consultant"], cta: "Contact Sales", popular: false }
  ];

  const faqs = [
    { q: "How are the carbon emission scores calculated?", a: "CarbonTrack converts your logged quantities (like car kilometers, kilowatt-hours, or meal types) into carbon dioxide equivalents (kg CO₂e) using rule-based emission factors sourced from certified IPCC and EPA datasets." },
    { q: "Can I use CarbonTrack for my company?", a: "Yes! Our Enterprise ESG Dashboard aggregates anonymous carbon footprints from all active employees, calculates total corporate output over 30 days, shows category breakdowns, and exports reports for audit filings." },
    { q: "Is there a mobile app?", a: "The CarbonTrack web platform is built with a highly responsive, mobile-first design that can be installed on your phone's home screen as a PWA, offering smooth interactions on any screen size." },
    { q: "How does the Sandbox mode work?", a: "For developers or users testing our system, our Google Authentication Modal features a 'Simulated Sandbox Mode'. You can instantly log in under pre-configured sandbox profiles to explore premium data immediately." }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-brand-500/20 selection:text-brand-900">
      
      {/* Dynamic Navigation Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled ? "bg-white/80 backdrop-blur-md border-slate-200/50 shadow-sm py-4" : "bg-transparent border-transparent py-6"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-brand-850 font-extrabold text-xl tracking-tight">
            <div className="w-9 h-9 rounded-xl bg-brand-800 flex items-center justify-center text-white shadow-md shadow-brand-800/10">
              <Leaf size={18} className="rotate-12" />
            </div>
            <span>CarbonTrack</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-650">
            <a href="#how" className="hover:text-brand-800 transition">How it Works</a>
            <a href="#features" className="hover:text-brand-800 transition">Features</a>
            <a href="#pricing" className="hover:text-brand-800 transition">Pricing</a>
            <a href="#faq" className="hover:text-brand-800 transition">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-bold text-slate-650 hover:text-brand-800 transition px-3 py-2">
              Sign In
            </Link>
            <Link to="/register" className="bg-brand-800 hover:bg-brand-900 text-white shadow-sm shadow-brand-800/10 rounded-xl px-4 py-2.5 text-sm font-semibold transition">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-[radial-gradient(circle_at_top_right,rgba(34,197,94,0.06),transparent_45%)]">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-[1fr_1.1fr] gap-16 items-center">
          <div className="space-y-8 text-left relative z-10">
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 rounded-full px-4 py-1.5 text-xs font-bold text-brand-850 uppercase tracking-wider">
              <Sparkles size={13} className="text-brand-700 animate-pulse" />
              ECO-SAAS CARBON TRACKING SYSTEM
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Understand Your Carbon Footprint. <span className="text-brand-800 block">Build a Sustainable Future.</span>
            </h1>
            
            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-lg">
              Track your daily activities, calculate CO₂ emissions in real time, receive AI-powered sustainability recommendations, and achieve your environmental goals.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link to="/register" className="bg-brand-800 hover:bg-brand-900 text-white rounded-xl px-6 py-3.5 font-bold shadow-md shadow-brand-800/10 hover:shadow transition flex items-center gap-2 group">
                Start Tracking
                <ArrowRight size={16} className="transform group-hover:translate-x-1 transition" />
              </Link>
              <Link to="/login" className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-6 py-3.5 font-bold shadow-sm hover:shadow-md transition">
                Explore Dashboard
              </Link>
              <button className="flex items-center gap-2.5 text-sm font-semibold text-slate-650 hover:text-brand-800 transition py-2 px-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700">
                  <Play size={12} fill="currentColor" />
                </div>
                Watch Demo
              </button>
            </div>
          </div>

          <div className="relative flex justify-center">
            {/* Visual background decoration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-brand-100/30 to-blue-100/30 rounded-[3rem] blur-2xl transform rotate-3" />
            
            <img
              src={heroImg}
              alt="CarbonTrack Premium Hero Illustration"
              className="relative w-full max-w-lg rounded-2xl shadow-2xl border border-white/50 object-cover object-center transform hover:scale-102 transition duration-700 hover:rotate-1"
            />
          </div>
        </div>
      </section>

      {/* Animated Stats Section */}
      <section className="bg-white border-y border-slate-200/60 py-12 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="space-y-2 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
                  </div>
                  <div>
                    <p className={`text-xl sm:text-2xl font-extrabold text-slate-900 transition-all duration-1000 ${animateStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                      {stat.value}
                    </p>
                    <p className="text-[10px] text-slate-500 font-medium mt-0.5">{stat.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-24 max-w-7xl mx-auto px-6 text-center">
        <div className="max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-800">Workflow</span>
          <h2 className="text-3xl font-black text-slate-900 mt-2 sm:text-4xl">How CarbonTrack Works</h2>
          <p className="text-slate-500 text-sm mt-3">Five simplified steps to help log, analyze, and lower your carbon emissions.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="relative group">
                <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-brand-500/20 transition duration-300 h-full flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-850 flex items-center justify-center mb-5 group-hover:scale-110 transition duration-300">
                    <Icon size={20} />
                  </div>
                  <span className="text-sm font-bold text-slate-900 mb-2">{step.title}</span>
                  <p className="text-xs text-slate-550 leading-relaxed">{step.desc}</p>
                </div>
                {idx < 4 && (
                  <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 -right-3 z-10 text-slate-300">
                    <ArrowRight size={18} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Problem & Solution Comparison Section */}
      <section className="py-20 bg-slate-100/50 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-red-600">The Problem</span>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                Emissions are invisible. That makes them hard to manage.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Daily actions—commuting, using home electronics, diet habits, and online shopping—collectively release metric tons of greenhouse gases into the atmosphere. Without a reliable metrics tracker, personal sustainability goals remain vague and unachieved.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3.5 items-start p-4 bg-white/60 rounded-xl border border-red-100">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-650 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">!</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Invisible Footprint</h4>
                    <p className="text-xs text-slate-500 mt-1">Car travel and home utilities account for over 70% of average household output.</p>
                  </div>
                </div>
                <div className="flex gap-3.5 items-start p-4 bg-white/60 rounded-xl border border-red-100">
                  <div className="w-6 h-6 rounded-full bg-red-100 text-red-650 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">!</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Lack of Structure</h4>
                    <p className="text-xs text-slate-500 mt-1">Most people fail to reach climate targets due to complex equations and lack of real-time logging.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-widest text-brand-800">The Solution</span>
              <h2 className="text-3xl font-black text-slate-900 leading-tight">
                CarbonTrack makes emission reduction visible.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                We organize carbon conversion logic into clean, visual category dashboards. Log data in under 15 seconds, track alerts if you exceed your monthly pace limits, compare metrics with peers, and receive personalized advice.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-3.5 items-start p-4 bg-white/60 rounded-xl border border-brand-100">
                  <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Actionable Insights</h4>
                    <p className="text-xs text-slate-500 mt-1">Personalized tips highlight exactly which category accounts for your highest output.</p>
                  </div>
                </div>
                <div className="flex gap-3.5 items-start p-4 bg-white/60 rounded-xl border border-brand-100">
                  <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-800 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Gamified Motivation</h4>
                    <p className="text-xs text-slate-500 mt-1">Earn badges and rise up community leaderboards to stay motivated with peers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-800">Capabilities</span>
          <h2 className="text-3xl font-black text-slate-900 mt-2 sm:text-4xl">Platform Features</h2>
          <p className="text-slate-500 text-sm mt-3">An executive-grade system built with modular sustainability tools.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition duration-300">
                <div className={`w-10 h-10 rounded-xl ${feat.color} flex items-center justify-center mb-5`}>
                  <Icon size={18} />
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-2">{feat.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-slate-100/50 border-y border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-800">Social Proof</span>
            <h2 className="text-3xl font-black text-slate-900 mt-2 sm:text-4xl">What advocates say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((test, idx) => (
              <div key={idx} className="bg-white border border-slate-200/60 rounded-2xl p-8 text-left shadow-sm flex flex-col justify-between">
                <p className="text-slate-655 text-sm italic leading-relaxed mb-6">"{test.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${test.avatarColor} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                    {test.author.charAt(0)}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{test.author}</h5>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-800">Subscription Plans</span>
          <h2 className="text-3xl font-black text-slate-900 mt-2 sm:text-4xl">SaaS Pricing</h2>
          <p className="text-slate-500 text-sm mt-3">Tailored packages for individuals, families, and businesses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricing.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl border p-8 shadow-sm flex flex-col justify-between relative transition duration-300 ${
                plan.popular
                  ? "border-brand-800 ring-2 ring-brand-800/10 scale-102"
                  : "border-slate-200/70"
              }`}
            >
              {plan.popular && (
                <span className="absolute top-4 right-4 bg-brand-800 text-white text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider">
                  Popular
                </span>
              )}
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{plan.name}</h4>
                  <p className="text-xs text-slate-500 mt-1">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-xs text-slate-400 font-semibold">/ month</span>}
                </div>

                <div className="h-px bg-slate-100" />

                <ul className="space-y-3.5 text-xs text-slate-600">
                  {plan.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <Check size={14} className="text-brand-800 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8">
                <Link
                  to="/register"
                  className={`w-full block text-center rounded-xl py-3 text-xs font-bold transition ${
                    plan.popular
                      ? "bg-brand-800 hover:bg-brand-900 text-white shadow-md shadow-brand-800/15"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 bg-slate-100/50 border-t border-slate-250/20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-800">Support</span>
            <h2 className="text-3xl font-black text-slate-900 mt-2">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="bg-white border border-slate-200/50 rounded-2xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left text-sm font-bold text-slate-900 focus:outline-none"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={16} className={`text-slate-400 transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-50 text-xs text-slate-600 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12 text-sm leading-relaxed">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 text-white font-extrabold text-lg tracking-tight">
              <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center text-white shadow-md shadow-brand-800/10">
                <Leaf size={16} className="rotate-12" />
              </div>
              <span>CarbonTrack</span>
            </div>
            <p className="text-xs text-slate-450">
              Measure Today. Reduce Tomorrow. CarbonTrack is an executive-grade ESG footprint tracker.
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Product</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#how" className="hover:text-white transition">How it Works</a></li>
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Resources</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer transition">Documentation</span></li>
              <li><span className="hover:text-white cursor-pointer transition">IPCC Emission Factors</span></li>
              <li><span className="hover:text-white cursor-pointer transition">API References</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-xs font-bold text-white uppercase tracking-wider">Company</h5>
            <ul className="space-y-2 text-xs">
              <li><span className="hover:text-white cursor-pointer transition">About Us</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Privacy Policy</span></li>
              <li><span className="hover:text-white cursor-pointer transition">Terms of Service</span></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-550 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span>© 2026 CarbonTrack. All rights reserved.</span>
          <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
            🔒 SECURE AES-256 • ESG CERTIFIED
          </span>
        </div>
      </footer>
    </div>
  );
}

// Simple internal icon helper for target
function TargetIcon({ size = 16, className = "" }) {
  return (
    <svg width={size} height={size} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}
