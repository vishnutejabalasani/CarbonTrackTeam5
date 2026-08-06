import { useState, useEffect } from "react";
import { 
  Users, Trophy, MessageSquare, Award, Flame, CheckCircle, Plus, Sparkles, 
  Send, Heart, Eye, ChevronDown, ChevronUp, Zap, Lightbulb, Shield, Star, 
  Check, ExternalLink, Activity, Target, X, Share2, Compass, ArrowRight,
  Search, Filter, SlidersHorizontal, ArrowUpDown, TrendingDown, RefreshCw
} from "lucide-react";
import { getLeaderboard } from "../api/analytics";
import { useAuth } from "../context/AuthContext";
import { getEarnedBadges } from "../api/badges";

import { useTranslation } from "react-i18next";

export default function Community() {
  const { t } = useTranslation();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [joinedChallenges, setJoinedChallenges] = useState([1]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [expandedUser, setExpandedUser] = useState(null); // rank or user id
  const [selectedUserForBadges, setSelectedUserForBadges] = useState(null); // user object for badge showcase modal
  const [adoptedHabits, setAdoptedHabits] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Leaderboard Filtering & Search Controls
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("rank");
  const [displayLimit, setDisplayLimit] = useState(10);

  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Sarah Jenkins",
      avatarBg: "bg-indigo-600",
      content: "Just switched all my home light bulbs to LEDs! Calculated that it will reduce my electricity carbon footprint by 15% this year. 💡🌱",
      likes: 12,
      comments: 3,
      time: "2 hours ago",
    },
    {
      id: 2,
      author: "David Chen",
      avatarBg: "bg-brand-850",
      content: "Successfully completed a week of commuting via train instead of driving my gasoline car. Saved roughly 18 kg of CO2! 🚆🙌",
      likes: 24,
      comments: 5,
      time: "5 hours ago",
    },
    {
      id: 3,
      author: "Elena Rostova",
      avatarBg: "bg-amber-600",
      content: "Tried a new vegan lasagna recipe today and it was incredible. Going plant-based for dinner three times a week is easier than I thought!",
      likes: 8,
      comments: 1,
      time: "1 day ago",
    },
  ]);
  const [newPostContent, setNewPostContent] = useState("");

  const defaultLeaderboard = [
    {
      rank: 1,
      name: "Sarah Jenkins",
      email: "sarah.jenkins@carbontrack.io",
      reduction: "42%",
      total: "85.2 kg",
      isCurrentUser: false,
      badges: [
        { id: 101, name: "Green Champion", description: "Maintained top 5% lowest emissions in the organization for 30 days.", iconUrl: "🏆", tier: "Gold", criteria: "Emissions < 90 kg CO₂e" },
        { id: 102, name: "Transport Hero", description: "Reduced transport emissions by 50% using electric train commute.", iconUrl: "🚆", tier: "Silver", criteria: "Transport reduction > 50%" },
        { id: 103, name: "Weekly Warrior", description: "Logged daily activities continuously for 14 straight days.", iconUrl: "🔥", tier: "Bronze", criteria: "14-day log streak" },
        { id: 104, name: "Carbon Saver 50kg", description: "Accumulated total carbon reductions exceeding 50 kg CO2e.", iconUrl: "🎖️", tier: "Legendary", criteria: "50 kg CO₂ saved" },
      ],
      categoryStrengths: [
        { category: "Transport", label: "Electric Rail Commuter", icon: "🚆", strengthScore: "Top 1%", impact: "-55% CO₂" },
        { category: "Electricity", label: "Smart LED & Automation", icon: "⚡", strengthScore: "Top 5%", impact: "-40% CO₂" },
      ],
      habits: [
        {
          id: "sarah-h1",
          title: "Electric Train Commute (4x/wk)",
          category: "Transport",
          impact: "-22.5 kg CO₂/wk",
          desc: "Swapped solo car commuting for regional electric rail 4 days every week.",
          tip: "Reserve 2 commute days per week for public transport or carpooling to reduce transport footprint by 40%."
        },
        {
          id: "sarah-h2",
          title: "Automated Smart Power Switch Off",
          category: "Electricity",
          impact: "-14.0 kg CO₂/wk",
          desc: "Uses timer-controlled smart outlets to shut off phantom workstation draw at night.",
          tip: "Plug home office workstation gear into a master smart switch that turns off after 8 PM."
        },
        {
          id: "sarah-h3",
          title: "Zero Food Waste Meal Prep",
          category: "Food",
          impact: "-9.8 kg CO₂/wk",
          desc: "Batch cooks plant-focused meals every Sunday to eliminate food waste completely.",
          tip: "Plan weekly meals ahead to avoid impulse food delivery and rotten produce waste."
        }
      ]
    },
    {
      rank: 2,
      name: "David Chen",
      email: "david.chen@carbontrack.io",
      reduction: "38%",
      total: "98.0 kg",
      isCurrentUser: false,
      badges: [
        { id: 201, name: "Eco Warrior", description: "Completed 5 consecutive operational sustainability challenges.", iconUrl: "🛡️", tier: "Silver", criteria: "5 challenges completed" },
        { id: 202, name: "Goal Getter", description: "Achieved 100% of set monthly reduction target.", iconUrl: "🏅", tier: "Gold", criteria: "100% target progress" },
        { id: 203, name: "Carbon Conscious", description: "Maintained baseline carbon footprint under 100 kg CO2e.", iconUrl: "✨", tier: "Bronze", criteria: "Footprint < 100 kg" },
      ],
      categoryStrengths: [
        { category: "Food", label: "Plant-Based Champion", icon: "🥗", strengthScore: "Top 2%", impact: "-50% CO₂" },
        { category: "Shopping", label: "Circular Plastic-Free", icon: "🛍️", strengthScore: "Top 8%", impact: "-35% CO₂" },
      ],
      habits: [
        {
          id: "david-h1",
          title: "Plant-Based Dinners (5x/wk)",
          category: "Food",
          impact: "-18.2 kg CO₂/wk",
          desc: "Substitutes meat with legumes, quinoa, and local seasonal veggies for dinner.",
          tip: "Swap red meat for legumes or tofu 3-4 times weekly for an immediate 35% food footprint drop."
        },
        {
          id: "david-h2",
          title: "Bulk & Refill Package-Free Shopping",
          category: "Shopping",
          impact: "-11.5 kg CO₂/wk",
          desc: "Buys grains, detergents, and pantry staples in reusable containers at co-op bulk stores.",
          tip: "Bring mesh bags and jars to local co-op stores to eliminate single-use plastic packaging."
        }
      ]
    },
    {
      rank: 3,
      name: authUser ? `${authUser.fullName || authUser.username || "You"}` : "You (Vishnu)",
      email: authUser?.email || "you@carbontrack.io",
      reduction: "35%",
      total: "102.5 kg",
      isCurrentUser: true,
      badges: [
        { id: 301, name: "First Step", description: "Logged first carbon activity on CarbonTrack.", iconUrl: "🌱", tier: "Bronze", criteria: "First activity logged" },
        { id: 302, name: "First Goal Achieved", description: "Successfully lowered weekly emissions target.", iconUrl: "🥇", tier: "Silver", criteria: "Goal accomplished" },
        { id: 303, name: "Carbon Saver 10kg", description: "Saved first 10 kg of CO2e.", iconUrl: "🥉", tier: "Bronze", criteria: "10 kg CO₂ saved" },
      ],
      categoryStrengths: [
        { category: "Electricity", label: "Smart Thermostat", icon: "⚡", strengthScore: "Top 12%", impact: "-32% CO₂" },
        { category: "Transport", label: "Carpool Supporter", icon: "🚗", strengthScore: "Top 15%", impact: "-28% CO₂" },
      ],
      habits: [
        {
          id: "you-h1",
          title: "Work-From-Home Carpool Cycle",
          category: "Transport",
          impact: "-15.0 kg CO₂/wk",
          desc: "Shares daily commute with office peers twice weekly and WFH on Fridays.",
          tip: "Coordinate ride shares with coworkers in your neighborhood to halve transit emissions."
        },
        {
          id: "you-h2",
          title: "Cold Water Laundry & Line Drying",
          category: "Electricity",
          impact: "-8.5 kg CO₂/wk",
          desc: "Washes clothing on 20°C eco cycles and air dries instead of machine drying.",
          tip: "Cold water washing saves up to 90% of energy consumed by standard washing machines."
        }
      ]
    },
    {
      rank: 4,
      name: "Elena Rostova",
      email: "elena.rostova@carbontrack.io",
      reduction: "29%",
      total: "115.1 kg",
      isCurrentUser: false,
      badges: [
        { id: 401, name: "Weekly Warrior", description: "Active activity logger for 2 straight weeks.", iconUrl: "🔥", tier: "Bronze", criteria: "14-day log streak" },
        { id: 402, name: "Carbon Saver 25kg", description: "Total reduced CO2 reached 25 kg threshold.", iconUrl: "🥈", tier: "Silver", criteria: "25 kg CO₂ saved" },
      ],
      categoryStrengths: [
        { category: "Shopping", label: "Circular Thrifting", icon: "🛍️", strengthScore: "Top 5%", impact: "-42% CO₂" },
      ],
      habits: [
        {
          id: "elena-h1",
          title: "Circular Thrifting & Repair-First Policy",
          category: "Shopping",
          impact: "-16.4 kg CO₂/wk",
          desc: "Prioritizes buying refurbished electronics and pre-owned apparel over new goods.",
          tip: "Check local circular marketplaces before purchasing new home goods or apparel."
        }
      ]
    },
    {
      rank: 5,
      name: "Marcus Aurelius",
      email: "marcus.aurelius@carbontrack.io",
      reduction: "25%",
      total: "128.4 kg",
      isCurrentUser: false,
      badges: [
        { id: 501, name: "First Step", description: "Started tracking emissions journey.", iconUrl: "🌱", tier: "Bronze", criteria: "Account onboarding" },
      ],
      categoryStrengths: [
        { category: "Electricity", label: "Solar Energy Grid", icon: "☀️", strengthScore: "Top 10%", impact: "-30% CO₂" },
      ],
      habits: [
        {
          id: "marcus-h1",
          title: "Solar Daytime Appliance Scheduling",
          category: "Electricity",
          impact: "-19.0 kg CO₂/wk",
          desc: "Runs high-load dishwashing and laundry during peak midday solar generation hours.",
          tip: "Shift energy-intensive tasks to peak solar hours (11 AM - 3 PM) if using solar tariffs."
        }
      ]
    },
    {
      rank: 6,
      name: "Priya Sharma",
      email: "priya.sharma@carbontrack.io",
      reduction: "24%",
      total: "132.0 kg",
      isCurrentUser: false,
      badges: [
        { id: 601, name: "Eco Commuter", description: "Logged 100+ km of zero-emission bicycle trips.", iconUrl: "🚲", tier: "Silver", criteria: "100km cycling" },
        { id: 602, name: "Goal Getter", description: "Hit monthly carbon reduction target.", iconUrl: "🏅", tier: "Gold", criteria: "Target 100%" }
      ],
      categoryStrengths: [
        { category: "Transport", label: "E-Bike Commuter", icon: "🚲", strengthScore: "Top 6%", impact: "-38% CO₂" }
      ],
      habits: [
        {
          id: "priya-h1",
          title: "E-Bike Daily City Transit",
          category: "Transport",
          impact: "-14.2 kg CO₂/wk",
          desc: "Uses pedal-assist e-bike for all intra-city trips under 10 kilometers.",
          tip: "Replace car trips under 5 miles with an e-bike or bicycle to slash urban emissions."
        }
      ]
    },
    {
      rank: 7,
      name: "Alex Rivera",
      email: "alex.rivera@carbontrack.io",
      reduction: "22%",
      total: "139.5 kg",
      isCurrentUser: false,
      badges: [
        { id: 701, name: "Energy Saver", description: "Optimized home energy monitor usage.", iconUrl: "💡", tier: "Bronze", criteria: "Smart meter sync" }
      ],
      categoryStrengths: [
        { category: "Electricity", label: "Heat Pump HVAC", icon: "🌡️", strengthScore: "Top 15%", impact: "-25% CO₂" }
      ],
      habits: [
        {
          id: "alex-h1",
          title: "Smart Thermostat Eco Schedule",
          category: "Electricity",
          impact: "-12.0 kg CO₂/wk",
          desc: "Automates nighttime set-back temperature to 18°C during winter months.",
          tip: "Lowering thermostat by 2°C in winter saves up to 8% on annual heating carbon footprint."
        }
      ]
    },
    {
      rank: 8,
      name: "Sophia Martinez",
      email: "sophia.m@carbontrack.io",
      reduction: "20%",
      total: "145.2 kg",
      isCurrentUser: false,
      badges: [
        { id: 801, name: "Veggie Pioneer", description: "Logged 20 vegetarian meals.", iconUrl: "🥗", tier: "Bronze", criteria: "20 veggie meals" }
      ],
      categoryStrengths: [
        { category: "Food", label: "Flexitarian Diet", icon: "🌱", strengthScore: "Top 18%", impact: "-24% CO₂" }
      ],
      habits: [
        {
          id: "sophia-h1",
          title: "Meatless Mondays & Wednesdays",
          category: "Food",
          impact: "-10.5 kg CO₂/wk",
          desc: "Prepares Mediterranean vegetarian dishes twice weekly for the family.",
          tip: "Start with 2 meatless days per week to comfortably transition eating habits."
        }
      ]
    },
    {
      rank: 9,
      name: "Liam O'Connor",
      email: "liam.oc@carbontrack.io",
      reduction: "18%",
      total: "152.8 kg",
      isCurrentUser: false,
      badges: [
        { id: 901, name: "Zero Waste", description: "Zero single-use plastics logged for 7 days.", iconUrl: "♻️", tier: "Silver", criteria: "7-day zero plastic" }
      ],
      categoryStrengths: [
        { category: "Shopping", label: "Zero-Packaging Advocate", icon: "📦", strengthScore: "Top 12%", impact: "-28% CO₂" }
      ],
      habits: [
        {
          id: "liam-h1",
          title: "Reusable Grocery Bags Policy",
          category: "Shopping",
          impact: "-7.8 kg CO₂/wk",
          desc: "Always keeps cotton tote bags in car trunk for spontaneous store stops.",
          tip: "Store compact reusable bags right by your front door so you never forget them."
        }
      ]
    },
    {
      rank: 10,
      name: "Chloe Dubois",
      email: "chloe.dubois@carbontrack.io",
      reduction: "16%",
      total: "158.4 kg",
      isCurrentUser: false,
      badges: [
        { id: 1001, name: "First Step", description: "Joined corporate sustainability initiative.", iconUrl: "🌱", tier: "Bronze", criteria: "Onboarding" }
      ],
      categoryStrengths: [
        { category: "Transport", label: "Metro Rider", icon: "🚇", strengthScore: "Top 20%", impact: "-20% CO₂" }
      ],
      habits: [
        {
          id: "chloe-h1",
          title: "Subway Pass Regular Commute",
          category: "Transport",
          impact: "-11.0 kg CO₂/wk",
          desc: "Uses monthly underground subway pass for daily office transit.",
          tip: "Public transit passes pay for themselves while keeping vehicle miles off the road."
        }
      ]
    },
    {
      rank: 11,
      name: "Carlos Santana",
      email: "carlos.santana@carbontrack.io",
      reduction: "15%",
      total: "162.1 kg",
      isCurrentUser: false,
      badges: [
        { id: 1101, name: "Carbon Saver 10kg", description: "Accumulated 10kg reduction", iconUrl: "🥉", tier: "Bronze", criteria: "10kg CO2" }
      ],
      categoryStrengths: [
        { category: "Electricity", label: "LED Lighting Home", icon: "💡", strengthScore: "Top 22%", impact: "-18% CO₂" }
      ],
      habits: [
        {
          id: "carlos-h1",
          title: "Smart Power Strips in Home Office",
          category: "Electricity",
          impact: "-6.5 kg CO₂/wk",
          desc: "Automatically cuts power to monitors when laptop sleeps.",
          tip: "Vampire power draw accounts for up to 10% of residential energy usage."
        }
      ]
    },
    {
      rank: 12,
      name: "Maya Lin",
      email: "maya.lin@carbontrack.io",
      reduction: "14%",
      total: "166.5 kg",
      isCurrentUser: false,
      badges: [
        { id: 1201, name: "Eco Warrior", description: "Active sustainability member", iconUrl: "🛡️", tier: "Silver", criteria: "5 challenges" }
      ],
      categoryStrengths: [
        { category: "Food", label: "Local Farm Sourced", icon: "🍏", strengthScore: "Top 25%", impact: "-16% CO₂" }
      ],
      habits: [
        {
          id: "maya-h1",
          title: "Weekly Farmers Market Produce",
          category: "Food",
          impact: "-8.0 kg CO₂/wk",
          desc: "Sources organic produce directly from local farms within 30 miles.",
          tip: "Buying local cuts food-mile transport emissions drastically."
        }
      ]
    }
  ];

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await getLeaderboard();
        if (data && data.length > 0) {
          const mapped = data.map((item, idx) => {
            const defaultItem = defaultLeaderboard[idx] || {};
            return {
              rank: item.rank || idx + 1,
              name: item.name,
              email: item.email,
              reduction: item.reduction || "30%",
              total: typeof item.total === "number" ? `${item.total} kg` : (item.total || "100 kg"),
              badges: (item.badges && item.badges.length > 0) ? item.badges : (defaultItem.badges || []),
              categoryStrengths: (item.categoryStrengths && item.categoryStrengths.length > 0) ? item.categoryStrengths : (defaultItem.categoryStrengths || []),
              habits: (item.habits && item.habits.length > 0) ? item.habits : (defaultItem.habits || []),
              isCurrentUser: authUser && (item.email === authUser.email || item.name === authUser.fullName || item.name === authUser.username)
            };
          });

          // Merge if backend returns fewer items than default mock to give full 50-member experience
          if (mapped.length < defaultLeaderboard.length) {
            const combined = [...mapped];
            defaultLeaderboard.slice(mapped.length).forEach((def, i) => {
              combined.push({
                ...def,
                rank: mapped.length + i + 1
              });
            });
            setLeaderboardData(combined);
          } else {
            setLeaderboardData(mapped);
          }
        } else {
          setLeaderboardData(defaultLeaderboard);
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
        setLeaderboardData(defaultLeaderboard);
      }
    }
    async function loadBadges() {
      try {
        const badges = await getEarnedBadges();
        setEarnedBadges(badges || []);
      } catch (err) {
        console.error("Failed to load badges:", err);
      }
    }
    loadLeaderboard();
    if (authUser) {
      loadBadges();
    }
  }, [authUser]);

  const challenges = [
    {
      id: 1,
      title: "Zero Transit Tuesday",
      desc: "Work from home, walk, or bike on Tuesday. Avoid all motorized transport.",
      participants: 142,
      xp: 250,
      daysLeft: 3,
    },
    {
      id: 2,
      title: "Veggie Feast Week",
      desc: "Log food activities with only vegetarian/vegan choices for 7 days straight.",
      participants: 89,
      xp: 500,
      daysLeft: 5,
    },
    {
      id: 3,
      title: "Unplugged Weekend",
      desc: "Reduce electricity consumption by 50% during the weekend by keeping devices offline.",
      participants: 204,
      xp: 350,
      daysLeft: 12,
    },
  ];

  const toggleChallenge = (id) => {
    if (joinedChallenges.includes(id)) {
      setJoinedChallenges(joinedChallenges.filter((item) => item !== id));
    } else {
      setJoinedChallenges([...joinedChallenges, id]);
    }
  };

  const toggleExpandUser = (rank) => {
    setExpandedUser(expandedUser === rank ? null : rank);
  };

  const handleAdoptHabit = (habit) => {
    if (!adoptedHabits.includes(habit.id)) {
      setAdoptedHabits([...adoptedHabits, habit.id]);
      setToastMessage(`🎉 Fantastic choice! You adopted "${habit.title}". Added to your focus plan (+50 XP)`);
      setTimeout(() => {
        setToastMessage(null);
      }, 4500);
    }
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;

    const newPost = {
      id: posts.length + 1,
      author: authUser ? (authUser.fullName || authUser.username) : "You (Vishnu)",
      avatarBg: "bg-brand-800",
      content: newPostContent,
      likes: 0,
      comments: 0,
      time: "Just now",
    };

    setPosts([newPost, ...posts]);
    setNewPostContent("");
  };

  const renderBadgeEmoji = (badgeName) => {
    if (badgeName.includes("First Step")) return "🌱";
    if (badgeName.includes("Weekly Warrior")) return "🔥";
    if (badgeName.includes("Carbon Conscious")) return "✨";
    if (badgeName.includes("Goal Getter")) return "🏅";
    if (badgeName.includes("Green Champion")) return "🏆";
    if (badgeName.includes("Eco Warrior")) return "🛡️";
    if (badgeName.includes("Transport Hero")) return "🚆";
    if (badgeName.includes("First Goal Achieved")) return "🥇";
    if (badgeName.includes("Carbon Saver 10kg")) return "🥉";
    if (badgeName.includes("Carbon Saver 25kg")) return "🥈";
    if (badgeName.includes("Carbon Saver 50kg")) return "🎖️";
    if (badgeName.includes("Eco Commuter")) return "🚲";
    if (badgeName.includes("Energy Saver")) return "💡";
    if (badgeName.includes("Veggie Pioneer")) return "🥗";
    if (badgeName.includes("Zero Waste")) return "♻️";
    return "🎖️";
  };

  // Filter and Sort Leaderboard Data
  const filteredLeaderboard = leaderboardData.filter((user) => {
    const matchesSearch = 
      !searchQuery ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "All" ||
      user.categoryStrengths?.some(s => s.category.toLowerCase() === selectedCategory.toLowerCase()) ||
      user.habits?.some(h => h.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === "reduction") {
      const redA = parseInt(a.reduction) || 0;
      const redB = parseInt(b.reduction) || 0;
      return redB - redA;
    }
    if (sortBy === "badges") {
      return (b.badges?.length || 0) - (a.badges?.length || 0);
    }
    if (sortBy === "total") {
      const totA = parseFloat(a.total) || 999;
      const totB = parseFloat(b.total) || 999;
      return totA - totB;
    }
    return a.rank - b.rank;
  });

  const displayedLeaderboard = displayLimit === "all" ? filteredLeaderboard : filteredLeaderboard.slice(0, Number(displayLimit));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-3 animate-bounce">
          <Sparkles className="text-amber-400 shrink-0" size={20} />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-emerald-300 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t("community.title")}</h1>
        <p className="text-slate-500 text-sm mt-1">
          {t("community.subtitle")}
        </p>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-slate-200">
        {[
          { key: "leaderboard", label: "Leaderboard & Standings" },
          { key: "challenges", label: "Operational Challenges" },
          { key: "posts", label: "Discussion Feed" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 px-6 text-xs font-bold border-b-2 transition -mb-px focus:outline-none ${
              activeTab === tab.key
                ? "border-brand-850 text-brand-850 font-black"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        {/* Left Side: Main Tab Content */}
        <div className="space-y-6">
          {activeTab === "leaderboard" && (
            <div className="space-y-6">
              {/* Main Leaderboard Container */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                
                {/* 1️⃣ TOP 3 PODIUM SECTION */}
                {leaderboardData.length >= 3 && (
                  <div className="bg-gradient-to-b from-slate-900 via-brand-950 to-slate-900 text-white p-6 relative overflow-hidden border-b border-slate-800">
                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 50% 30%, #10b981 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
                    
                    <div className="flex justify-center items-end gap-3 sm:gap-6 pt-4 pb-2 relative z-10">
                      {/* Rank 2 (Silver) */}
                      <div className="flex flex-col items-center animate-podium-2">
                        <div className="relative mb-2">
                          <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-sm border-2 border-slate-300 shadow-lg">
                            🥈
                          </div>
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-300 text-slate-900 text-[10px] font-black flex items-center justify-center shadow">2</span>
                        </div>
                        <p className="text-sm font-extrabold text-slate-100 px-1 text-center max-w-[130px] truncate drop-shadow-xs">{leaderboardData[1]?.name}</p>
                        <span className="text-[11px] text-emerald-400 font-black">{leaderboardData[1]?.total}</span>
                        {/* Top Category Strength Chip */}
                        {leaderboardData[1]?.categoryStrengths?.[0] && (
                          <span className="text-[9px] font-bold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full mt-1 border border-slate-700">
                            {leaderboardData[1].categoryStrengths[0].icon} {leaderboardData[1].categoryStrengths[0].label}
                          </span>
                        )}
                        <div className="w-20 sm:w-24 h-20 bg-slate-800/90 border-t-4 border-slate-300 rounded-t-xl mt-2 flex flex-col items-center justify-center shadow-lg">
                          <span className="text-lg font-black text-slate-400">#2</span>
                        </div>
                      </div>

                      {/* Rank 1 (Gold - Center Champion) */}
                      <div className="flex flex-col items-center animate-podium-1">
                        <div className="relative mb-2">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-amber-950 font-bold flex items-center justify-center text-xl border-2 border-yellow-200 shadow-xl animate-bounce">
                            👑
                          </div>
                          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 text-amber-950 text-xs font-black flex items-center justify-center shadow-md">1</span>
                        </div>
                        <p className="text-base font-black text-amber-300 px-1 text-center max-w-[150px] truncate drop-shadow-sm">{leaderboardData[0]?.name}</p>
                        <span className="text-xs text-emerald-300 font-black">{leaderboardData[0]?.total}</span>
                        {/* Top Category Strength Chip */}
                        {leaderboardData[0]?.categoryStrengths?.[0] && (
                          <span className="text-[9px] font-black text-amber-200 bg-amber-950/80 px-2 py-0.5 rounded-full mt-1 border border-amber-500/40">
                            {leaderboardData[0].categoryStrengths[0].icon} {leaderboardData[0].categoryStrengths[0].label}
                          </span>
                        )}
                        <div className="w-24 sm:w-28 h-28 bg-gradient-to-b from-amber-500/20 to-amber-900/40 border-t-4 border-amber-400 rounded-t-xl mt-2 flex flex-col items-center justify-center shadow-2xl">
                          <Trophy size={20} className="text-amber-400 mb-1 animate-pulse" />
                          <span className="text-xl font-black text-amber-300">#1</span>
                        </div>
                      </div>

                      {/* Rank 3 (Bronze) */}
                      <div className="flex flex-col items-center animate-podium-3">
                        <div className="relative mb-2">
                          <div className="w-12 h-12 rounded-full bg-amber-800 text-amber-100 font-bold flex items-center justify-center text-sm border-2 border-amber-600 shadow-lg">
                            🥉
                          </div>
                          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-700 text-white text-[10px] font-black flex items-center justify-center shadow">3</span>
                        </div>
                        <p className="text-xs font-extrabold text-amber-100 px-1 text-center max-w-[130px] truncate drop-shadow-xs">{leaderboardData[2]?.name}</p>
                        <span className="text-[11px] text-emerald-400 font-black">{leaderboardData[2]?.total}</span>
                        {/* Top Category Strength Chip */}
                        {leaderboardData[2]?.categoryStrengths?.[0] && (
                          <span className="text-[9px] font-bold text-amber-200/80 bg-amber-950/60 px-2 py-0.5 rounded-full mt-1 border border-amber-800">
                            {leaderboardData[2].categoryStrengths[0].icon} {leaderboardData[2].categoryStrengths[0].label}
                          </span>
                        )}
                        <div className="w-20 sm:w-24 h-16 bg-amber-950/60 border-t-4 border-amber-700 rounded-t-xl mt-2 flex flex-col items-center justify-center shadow-lg">
                          <span className="text-lg font-black text-amber-600">#3</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 2️⃣ SLEEK FILTER & SEARCH CONTROL TOOLBAR */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200/70 space-y-3">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-72">
                      <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search member by name or email..."
                        className="w-full pl-9 pr-8 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>

                    {/* Sorting & Limit Controls */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                        <ArrowUpDown size={14} className="text-brand-800 shrink-0" />
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="bg-white border border-slate-200 text-slate-800 text-xs font-bold rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                        >
                          <option value="rank">Sort by Rank</option>
                          <option value="total">Lowest Footprint</option>
                          <option value="reduction">Highest Reduction %</option>
                          <option value="badges">Most Badges</option>
                        </select>
                      </div>

                      {/* Display Limit Toggle */}
                      <button
                        onClick={() => setDisplayLimit(displayLimit === 10 ? "all" : 10)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl transition border ${
                          displayLimit === "all"
                            ? "bg-brand-850 text-white border-brand-850 shadow-xs"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {displayLimit === "all" ? "Showing All 50" : "Show Top 10"}
                      </button>
                    </div>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <Filter size={11} /> Filter:
                    </span>
                    {[
                      { key: "All", label: "All Members", icon: "🌐" },
                      { key: "Transport", label: "Transport", icon: "🚆" },
                      { key: "Electricity", label: "Electricity", icon: "⚡" },
                      { key: "Food", label: "Food", icon: "🥗" },
                      { key: "Shopping", label: "Shopping", icon: "🛍️" },
                    ].map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`text-[11px] font-bold px-3 py-1 rounded-full transition shrink-0 flex items-center gap-1.5 border ${
                          selectedCategory === cat.key
                            ? "bg-brand-850 text-white border-brand-850 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3️⃣ DESKTOP TABLE HEADER */}
                <div className="hidden md:grid grid-cols-[1fr_200px_140px] gap-4 px-6 py-3.5 bg-slate-100/90 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <span>Member</span>
                  <span>Annual Footprint</span>
                  <span className="text-right">Badges</span>
                </div>

                {/* 4️⃣ REFINED STANDINGS LIST (High Contrast, 3 Clean Columns) */}
                <div className="divide-y divide-slate-100">
                  {displayedLeaderboard.length > 0 ? (
                    displayedLeaderboard.map((user) => {
                      const userBadgesList = user.badges || [];
                      const initialLetter = user.name ? user.name.charAt(0).toUpperCase() : "U";

                      return (
                        <div 
                          key={user.rank} 
                          className={`transition ${
                            user.isCurrentUser 
                              ? "bg-emerald-50/40 border-l-4 border-l-brand-850" 
                              : "hover:bg-slate-50/80"
                          }`}
                        >
                          {/* Desktop Grid Layout (3 Clean Columns) */}
                          <div className="p-4 sm:px-6 flex flex-col md:grid md:grid-cols-[1fr_200px_140px] gap-4 items-center">
                            
                            {/* Column 1: Rank & Member Info */}
                            <div className="flex items-center gap-3 w-full">
                              {/* Sleek Rank Badge */}
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-xs ${
                                user.rank === 1
                                  ? "bg-amber-100 text-amber-900 border border-amber-300"
                                  : user.rank === 2
                                  ? "bg-slate-200 text-slate-800 border border-slate-300"
                                  : user.rank === 3
                                  ? "bg-amber-900/10 text-amber-800 border border-amber-700/30"
                                  : user.rank <= 5
                                  ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                                  : "bg-slate-100 text-slate-700 border border-slate-200"
                              }`}>
                                #{user.rank}
                              </div>

                              {/* Avatar Initials & Name */}
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <div className={`w-9 h-9 rounded-xl ${user.isCurrentUser ? 'bg-brand-850' : 'bg-slate-800'} text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs border border-slate-700/20`}>
                                  {initialLetter}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <h3 className={`text-sm font-black ${user.isCurrentUser ? "text-brand-900" : "text-slate-900"} tracking-tight`}>
                                      {user.name}
                                    </h3>
                                    {user.isCurrentUser && (
                                      <span className="bg-brand-850 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                        YOU
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-500 font-medium truncate">{user.email}</p>
                                </div>
                              </div>
                            </div>

                            {/* Column 2: Annual Footprint & Reduction Pace */}
                            <div className="w-full">
                              <div className="flex items-center justify-between md:justify-start gap-2">
                                <span className="text-xs font-black text-slate-900">{user.total}</span>
                                <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                                  <TrendingDown size={10} /> {user.reduction}
                                </span>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                                <div 
                                  className="bg-emerald-500 h-full rounded-full" 
                                  style={{ width: `${Math.min(100, parseInt(user.reduction) * 2 || 40)}%` }} 
                                />
                              </div>
                            </div>

                            {/* Column 3: Badge Collection Pill */}
                            <div className="w-full flex justify-start md:justify-end">
                              <button
                                onClick={() => setSelectedUserForBadges(user)}
                                className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 px-3 py-1.5 rounded-xl transition cursor-pointer shadow-xs"
                                title="Click to view full Badge Collection"
                              >
                                <Award size={13} className="text-amber-600 shrink-0" />
                                <span>{userBadgesList.length} Badges</span>
                              </button>
                            </div>

                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Search Empty State */
                    <div className="p-12 text-center space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                        <Search size={22} />
                      </div>
                      <h4 className="text-xs font-bold text-slate-800">No Corporate Members Found</h4>
                      <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                        No standings match your search term "{searchQuery}" or selected category filter.
                      </p>
                      <button
                        onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                        className="text-xs font-bold text-brand-850 hover:underline"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer Count Bar */}
                <div className="p-4 bg-slate-50/90 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold text-slate-500">
                  <span>Showing {displayedLeaderboard.length} of {filteredLeaderboard.length} corporate members</span>
                  {displayLimit !== "all" && filteredLeaderboard.length > 10 && (
                    <button
                      onClick={() => setDisplayLimit("all")}
                      className="text-brand-850 hover:text-brand-900 font-extrabold underline transition"
                    >
                      View All 50 Corporate Standings →
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "challenges" && (
            <div className="space-y-4 animate-fade-in">
              {challenges.map((c) => {
                const joined = joinedChallenges.includes(c.id);
                return (
                  <div
                    key={c.id}
                    className={`bg-white rounded-2xl border p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition ${
                      joined ? "border-brand-200 bg-brand-50/10" : "border-slate-200/60"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-base">{c.title}</h3>
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-brand-850 bg-brand-50 border border-brand-100/50 px-2 py-0.5 rounded-full">
                          <Flame size={10} className="fill-brand-850" />
                          +{c.xp} XP Points
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{c.desc}</p>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        <span>👥 {c.participants} active participants</span>
                        <span>⏳ {c.daysLeft} days remaining</span>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleChallenge(c.id)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 self-start sm:self-auto ${
                        joined
                          ? "bg-brand-50 border border-brand-200 text-brand-850 hover:bg-brand-100"
                          : "bg-brand-800 text-white hover:bg-brand-900 shadow-sm"
                      }`}
                    >
                      {joined ? "Joined Challenge" : "Join Challenge"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "posts" && (
            <div className="space-y-6 animate-fade-in">
              {/* Write Feed post */}
              <form onSubmit={handleCreatePost} className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-3 shadow-sm">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Share a sustainability success story, travel tip, or carbon reduction habit..."
                  rows="3"
                  className="w-full text-xs border border-slate-200 bg-slate-50/50 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-brand-500/25 resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-brand-800 hover:bg-brand-900 text-white rounded-xl px-4 py-2.5 text-xs font-bold shadow-sm transition"
                  >
                    Publish to Feed
                  </button>
                </div>
              </form>

              {/* Feed Streams */}
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="bg-white border border-slate-200/60 rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${post.avatarBg} text-white flex items-center justify-center font-black text-xs`}>
                        {post.author.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{post.author}</h4>
                        <p className="text-[9px] text-slate-400 font-medium">{post.time}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-slate-600 leading-relaxed">{post.content}</p>
                    
                    <div className="flex gap-6 text-[10px] font-bold text-slate-450 pt-3 border-t border-slate-100">
                      <button className="hover:text-brand-850 flex items-center gap-1.5 transition">
                        <Heart size={13} />
                        {post.likes} Likes
                      </button>
                      <button className="hover:text-brand-850 flex items-center gap-1.5 transition">
                        <MessageSquare size={13} />
                        {post.comments} Comments
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Spotlights & User Badge Cabinet Summary */}
        <div className="space-y-6">
          {/* Your Adopted Habits Focus Card */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="font-bold text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle className="text-emerald-400" size={16} />
              Your Adopted Focus Habits ({adoptedHabits.length})
            </h3>
            {adoptedHabits.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[11px] text-slate-300">Active habits you adopted from top leaders:</p>
                <div className="space-y-1.5">
                  {adoptedHabits.map((id) => (
                    <div key={id} className="bg-emerald-950/80 border border-emerald-700/50 rounded-lg p-2 text-[10px] font-bold text-emerald-200 flex items-center justify-between">
                      <span>✓ Habit #{id} Active</span>
                      <span className="text-amber-400">+50 XP</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Click <strong className="text-emerald-300">"Follow Habits"</strong> on any user in the leaderboard to adopt their habit and earn +50 XP!
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Sparkles className="text-brand-800" size={14} />
              Leader Spotlight: Community Best Practices
            </h3>
            <div className="bg-brand-50/60 border border-brand-100/50 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-brand-950">Electric Transit & Plant-Based Routine</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Top performers on CarbonTrack save up to 40 kg CO₂ per week primarily by substituting 3 red meat dinners with plant options and using regional electric rail for daily commutes.
              </p>
            </div>
          </div>

          {/* Your Earned Impact Badges Cabinet */}
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Award size={14} className="text-amber-500" />
                Your Impact Badges
              </h4>
              <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                {earnedBadges.length} Unlocked
              </span>
            </div>
            
            {earnedBadges.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {earnedBadges.map((badge) => (
                  <span
                    key={badge.id}
                    className="inline-flex items-center gap-1 text-[9px] font-bold text-brand-850 bg-brand-50 border border-brand-100/50 px-2.5 py-1 rounded-full transition hover:scale-105"
                    title={badge.description}
                  >
                    {renderBadgeEmoji(badge.name)} {badge.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400">No badges earned yet. Complete goals to unlock achievements!</p>
            )}
          </div>
        </div>
      </div>

      {/* Badge Cabinet Modal */}
      {selectedUserForBadges && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-up">
            <div className="bg-gradient-to-r from-slate-900 to-brand-950 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 font-black text-xl flex items-center justify-center border-2 border-amber-300">
                  🏆
                </div>
                <div>
                  <h3 className="text-base font-bold">{selectedUserForBadges.name}'s Badge Showcase</h3>
                  <p className="text-xs text-amber-200/80">Verified Environmental Credentials & Milestones</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserForBadges(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 pb-2 border-b border-slate-100">
                <span>Total Badges Unlocked: {selectedUserForBadges.badges?.length || 0}</span>
                <span>Standings Rank: #{selectedUserForBadges.rank}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {(selectedUserForBadges.badges || []).map((b, idx) => (
                  <div key={b.id || idx} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 flex flex-col justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{renderBadgeEmoji(b.name)}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                          b.tier === "Gold" ? "bg-amber-100 text-amber-800 border border-amber-300" :
                          b.tier === "Silver" ? "bg-slate-200 text-slate-700 border border-slate-300" :
                          b.tier === "Legendary" ? "bg-purple-100 text-purple-800 border border-purple-300" :
                          "bg-orange-100 text-orange-800 border border-orange-200"
                        }`}>
                          {b.tier || "Earned"}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{b.name}</h4>
                      <p className="text-[10px] text-slate-600 leading-relaxed">{b.description}</p>
                    </div>

                    {b.criteria && (
                      <div className="pt-2 border-t border-slate-200/60 text-[9px] font-medium text-slate-400">
                        Criteria: {b.criteria}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUserForBadges(null)}
                className="bg-brand-800 hover:bg-brand-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
              >
                Close Showcase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
