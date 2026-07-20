import { useState, useEffect } from "react";
import { Users, Trophy, MessageSquare, Award, Flame, CheckCircle, Plus, Sparkles, Send, Heart, Eye } from "lucide-react";
import { getLeaderboard } from "../api/analytics";
import { useAuth } from "../context/AuthContext";
import { getEarnedBadges } from "../api/badges";

export default function Community() {
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [joinedChallenges, setJoinedChallenges] = useState([1]);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [posts, setPosts] = useState([
    {
      id: 1,
      author: "Sarah Jenkins",
      avatarBg: "bg-indigo-650",
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
    { rank: 1, name: "Sarah Jenkins", reduction: "42%", total: "85.2 kg", badges: [], isCurrentUser: false },
    { rank: 2, name: "David Chen", reduction: "38%", total: "98.0 kg", badges: [], isCurrentUser: false },
    { rank: 3, name: authUser ? `${authUser.fullName || authUser.username || "You"}` : "You (Vishnu)", reduction: "35%", total: "102.5 kg", badges: [], isCurrentUser: true },
    { rank: 4, name: "Elena Rostova", reduction: "29%", total: "115.1 kg", badges: [], isCurrentUser: false },
    { rank: 5, name: "Marcus Aurelius", reduction: "25%", total: "128.4 kg", badges: [], isCurrentUser: false },
  ];

  useEffect(() => {
    async function loadLeaderboard() {
      try {
        const data = await getLeaderboard();
        if (data && data.length > 0) {
          const mapped = data.map(item => ({
            rank: item.rank,
            name: item.name,
            reduction: item.reduction,
            total: `${item.total} kg`,
            badges: item.badges || [],
            isCurrentUser: authUser && (item.email === authUser.email || item.name === authUser.fullName || item.name === authUser.username)
          }));
          setLeaderboardData(mapped);
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

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Community Standings & Feed</h1>
        <p className="text-slate-500 text-sm mt-1">Connect with corporate peers, join weekly ecological challenges, and share reduction wins.</p>
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
        {/* Left Side: Tabs Pane */}
        <div className="space-y-6">
          {activeTab === "leaderboard" && (
            <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Trophy className="text-brand-800" size={16} />
                  Top Environmental Savers
                </h2>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Refreshes in 3d</span>
              </div>
              
              <div className="divide-y divide-slate-100">
                {leaderboardData.map((user) => (
                  <div
                    key={user.rank}
                    className={`flex items-center justify-between p-5 transition ${
                      user.isCurrentUser ? "bg-brand-50/20" : "hover:bg-slate-50/40"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                        user.rank === 1
                          ? "bg-amber-100 text-amber-600 border border-amber-200"
                          : user.rank === 2
                          ? "bg-slate-100 text-slate-500 border border-slate-200"
                          : user.rank === 3
                          ? "bg-orange-100 text-orange-700 border border-orange-200"
                          : "text-slate-400 bg-slate-50 border border-slate-150"
                      }`}>
                        #{user.rank}
                      </div>
                      <div>
                        <p className={`text-xs font-bold flex items-center gap-1.5 flex-wrap ${user.isCurrentUser ? "text-brand-900" : "text-slate-800"}`}>
                          <span>{user.name}</span>
                          {user.badges && user.badges.map(b => (
                            <span
                              key={b.id}
                              className="text-[10px] select-none cursor-help bg-slate-100 hover:bg-slate-200 px-1 rounded transition"
                              title={`${b.name}: ${b.description}`}
                            >
                              {b.name.includes("First Step") ? "🌱" :
                               b.name.includes("Weekly Warrior") ? "🔥" :
                               b.name.includes("Carbon Conscious") ? "✨" :
                               b.name.includes("Goal Getter") ? "🏅" :
                               b.name.includes("Green Champion") ? "🏆" :
                               b.name.includes("Eco Warrior") ? "🛡️" :
                               b.name.includes("Transport Hero") ? "🚗" :
                               b.name.includes("First Goal Achieved") ? "🥇" :
                               b.name.includes("Carbon Saver 10kg") ? "🥉" :
                               b.name.includes("Carbon Saver 25kg") ? "🥈" :
                               b.name.includes("Carbon Saver 50kg") ? "🏆" :
                               "🎖️"}
                            </span>
                          ))}
                        </p>
                        <p className="text-[10px] text-slate-450 mt-0.5">Reduction Pace: {user.reduction}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-slate-900">{user.total}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">Total Emissions</p>
                    </div>
                  </div>
                ))}
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
                  placeholder="Share a sustainability success story, travel tip, or carbon reduction variable..."
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

        {/* Right Side: Tips and badges */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-2">
              <Sparkles className="text-brand-800" size={14} />
              Sustainability Spotlight
            </h3>
            <div className="bg-brand-50/60 border border-brand-100/50 rounded-xl p-4 space-y-2">
              <h4 className="text-xs font-bold text-brand-950">Carpool Workspace Initiative</h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Carpooling reduces transport emissions by up to 50% per trip! Share your daily commute variables with colleagues to boost peer rankings.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Your Impact Badges</h4>
            {earnedBadges.length > 0 ? (
              <div className="flex gap-2 flex-wrap">
                {earnedBadges.map((badge) => {
                  const emojiMap = {
                    "First Step": "🌱",
                    "Weekly Warrior": "🔥",
                    "Carbon Conscious": "✨",
                    "Goal Getter": "🏅",
                    "Green Champion": "🏆",
                    "Eco Warrior": "🛡️",
                    "Transport Hero": "🚗",
                    "First Goal Achieved": "🥇",
                    "Carbon Saver 10kg": "🥉",
                    "Carbon Saver 25kg": "🥈",
                    "Carbon Saver 50kg": "🏆",
                  };
                  const emoji = emojiMap[badge.name] || "🎖️";
                  return (
                    <span
                      key={badge.id}
                      className="inline-flex items-center gap-1 text-[9px] font-bold text-brand-850 bg-brand-50 border border-brand-100/50 px-2.5 py-1 rounded-full transition hover:scale-105"
                      title={badge.description}
                    >
                      {emoji} {badge.name}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400">No badges earned yet. Complete goals to unlock achievements!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
