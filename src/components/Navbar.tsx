import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Map,
  LayoutDashboard,
  Trophy,
  // Settings,
  Zap,
  RefreshCw,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  {
    path: "/map",
    icon: Map,
    label: "World Map",
    mobileHidden: false,
    badge: false,
  },
  {
    path: "/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
    mobileHidden: false,
    badge: false,
  },
  {
    path: "/revision",
    icon: RefreshCw,
    label: "Revision",
    badge: true,
    mobileHidden: false,
  },
  {
    path: "/achievements",
    icon: Trophy,
    label: "Achievements",
    mobileHidden: false,
    badge: false,
  },
  // {
  //   path: "/settings",
  //   icon: Settings,
  //   label: "Progress",
  //   mobileHidden: false,
  //   badge: false,
  // },
];

export default function Navbar() {
  const location = useLocation();
  const { xp, rank, level, streak, getDueCount } = useGameStore();
  const dueCount = getDueCount();
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const firstName = user?.displayName?.split(" ")[0] || "Player";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setShowProfile(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-strong border-b border-blue-900/30">
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center glow-blue">
            <Zap size={16} className="text-white" />
          </div>
          <span className="font-orbitron text-lg font-bold gradient-text hidden sm:block">
            DSAverse
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(({ path, icon: Icon, label, badge, mobileHidden }) => {
            const active = location.pathname.startsWith(path);
            const showBadge = badge && dueCount > 0;
            return (
              <Link
                key={path}
                to={path}
                className={mobileHidden ? "hidden md:block" : ""}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    active
                      ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden lg:block">{label}</span>
                  {showBadge && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center leading-none"
                    >
                      {dueCount > 99 ? "99+" : dueCount}
                    </motion.span>
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User Stats */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Profile */}
          {!loading && user && (
            <div ref={profileRef} className="relative">
              {/* Trigger */}
              <button
                onClick={() => setShowProfile((prev) => !prev)}
                className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-white/5 transition-all"
              >
                <img
                  src={user.photoURL ?? "/default-avatar.png"}
                  alt={user.displayName ?? "User"}
                  className="w-10 h-10 rounded-full border-2 border-cyan-500 object-cover hover:ring-2 hover:ring-cyan-400/40 transition-all"
                />

                <span className="hidden md:block text-sm font-semibold text-white">
                  {firstName}
                </span>

                <motion.div
                  animate={{ rotate: showProfile ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown
                    size={16}
                    className="hidden md:block text-slate-400"
                  />
                </motion.div>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {showProfile && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 8, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 rounded-2xl overflow-hidden
                     border border-cyan-500/20
                     bg-slate-900/95 backdrop-blur-xl
                     shadow-2xl z-50"
                  >
                    {/* Header */}
                    <div className="flex flex-col items-center px-6 py-6">
                      <img
                        src={user.photoURL ?? "/default-avatar.png"}
                        alt={user.displayName ?? "User"}
                        className="w-20 h-20 rounded-full border-4 border-cyan-500 shadow-lg"
                      />

                      <h2 className="mt-4 text-xl font-bold text-white">
                        Hi, {firstName} 👋
                      </h2>

                      <p className="mt-1 text-sm text-slate-400 text-center break-all">
                        {user.email}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="border-y border-slate-700 px-6 py-5 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-400">⭐ Level</span>
                        <span className="font-semibold text-white">
                          {level}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">👑 Rank</span>
                        <span className="font-semibold text-cyan-400">
                          {rank}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">🔥 Streak</span>
                        <span className="font-semibold text-orange-400">
                          {streak} Days
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">⚡ XP</span>
                        <span className="font-semibold text-yellow-400">
                          {xp.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Sign Out */}
                    <button
                      onClick={handleSignOut}
                      className="w-full py-4 flex items-center justify-center gap-2
                       text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut size={18} />
                      <span className="font-medium">Sign Out</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
