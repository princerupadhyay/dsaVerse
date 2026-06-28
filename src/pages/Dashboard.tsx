import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Flame, Star, Trophy, Zap, Target, ArrowRight, Map, TrendingUp, Award, Brain, RefreshCw } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { WORLDS } from '../constants/worlds';
import { ACHIEVEMENTS } from '../constants/achievements';
import { getXPForNextRank, RANK_THRESHOLDS } from '../constants/xp';
import { futureDateStr } from '../utils/spacedRepetition';

function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
  sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="glass rounded-2xl p-5 border border-white/5 hover:border-white/10 transition-all"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3`} style={{ background: color + '20' }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="text-2xl font-bold text-white mb-0.5">{value}</div>
      <div className="text-slate-500 text-sm">{label}</div>
      {sub && <div className="text-xs mt-1" style={{ color }}>{sub}</div>}
    </motion.div>
  );
}

export default function Dashboard() {
  const {
    xp, level, rank, streak, earnedAchievements, completedWorlds,
    completedPatterns, problemStatuses, lastActiveDate, srCards, totalReviews,
    getDueCount,
  } = useGameStore();

  const { progress, next, needed } = getXPForNextRank(xp);
  const currentRankIdx = RANK_THRESHOLDS.findIndex((t) => t.rank === rank);
  const dueCount = getDueCount();

  // SR upcoming preview (next 7 days)
  const srUpcoming = Array.from({ length: 7 }, (_, i) => ({
    dateStr: futureDateStr(i),
    count: Object.values(srCards).filter((c) => c.dueDate === futureDateStr(i)).length,
    label: i === 0 ? 'Today' : i === 1 ? 'Tmrw' : new Date(new Date().setDate(new Date().getDate() + i)).toLocaleDateString('en', { weekday: 'short' }),
  }));

  const totalProblems = WORLDS.flatMap((w) => w.patterns.flatMap((p) => p.problems)).length;
  const solvedCount = Object.values(problemStatuses).filter((s) => s === 'solved' || s === 'mastered').length;
  const attemptedCount = Object.values(problemStatuses).filter((s) => s === 'attempted').length;
  const totalPatterns = WORLDS.flatMap((w) => w.patterns).length;

  // Difficulty breakdown
  const allProblems = WORLDS.flatMap((w) => w.patterns.flatMap((p) => p.problems));
  const easySolved = allProblems.filter((p) => p.difficulty === 'easy' && (problemStatuses[p.id] === 'solved' || problemStatuses[p.id] === 'mastered')).length;
  const medSolved = allProblems.filter((p) => p.difficulty === 'medium' && (problemStatuses[p.id] === 'solved' || problemStatuses[p.id] === 'mastered')).length;
  const hardSolved = allProblems.filter((p) => p.difficulty === 'hard' && (problemStatuses[p.id] === 'solved' || problemStatuses[p.id] === 'mastered')).length;

  // Recent world
  const nextWorldId = completedWorlds.length + 1;
  const nextWorld = WORLDS.find((w) => w.id === nextWorldId);

  // Top achievements
  const recentAchievements = earnedAchievements.slice(-4).map((id) => ACHIEVEMENTS.find((a) => a.id === id)).filter(Boolean);

  return (
    <div className="min-h-screen bg-[#070B14] pt-20 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mb-1">
            Command <span className="gradient-text">Center</span>
          </h1>
          <p className="text-slate-500 text-sm">Track your algorithmic conquest</p>
        </motion.div>

        {/* Rank Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-3xl p-6 sm:p-8 border border-cyan-500/20 mb-6 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5" />
          <div className="relative z-10 flex flex-wrap items-center gap-6">
            {/* Rank Badge */}
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-700/20 border border-cyan-500/30 flex items-center justify-center text-4xl mb-2 glow-blue">
                {currentRankIdx >= 10 ? '👑' : currentRankIdx >= 8 ? '🌟' : currentRankIdx >= 6 ? '💎' : currentRankIdx >= 4 ? '🛡️' : '⭐'}
              </div>
              <div className="text-xs text-slate-500">RANK</div>
              <div className="font-orbitron text-sm font-bold text-cyan-400">{rank}</div>
            </div>

            {/* XP Progress */}
            <div className="flex-1 min-w-48">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-white font-bold text-xl">Level {level}</span>
                <span className="text-slate-400 text-sm">{xp.toLocaleString()} XP</span>
              </div>
              <div className="h-3 bg-slate-800 rounded-full overflow-hidden relative shimmer">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, delay: 0.3 }}
                />
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-xs text-slate-600">{rank}</span>
                {next ? (
                  <span className="text-xs text-slate-500">{needed.toLocaleString()} XP to {next}</span>
                ) : (
                  <span className="text-xs text-yellow-400">MAX RANK</span>
                )}
              </div>
            </div>

            {/* Streak */}
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center justify-center mb-2">
                <Flame size={20} className="text-orange-400" />
                <span className="font-orbitron text-lg font-bold text-orange-400">{streak}</span>
              </div>
              <div className="text-xs text-slate-500">Day Streak</div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <StatCard icon={Target} label="Problems Solved" value={solvedCount} color="#10B981" sub={`of ${totalProblems}`} />
          <StatCard icon={Zap} label="Patterns Done" value={completedPatterns.length} color="#00D4FF" sub={`of ${totalPatterns}`} />
          <StatCard icon={Map} label="Worlds Clear" value={completedWorlds.length} color="#FFD700" sub="of 21" />
          <StatCard icon={Trophy} label="Achievements" value={earnedAchievements.length} color="#a855f7" sub={`of ${ACHIEVEMENTS.length}`} />
        </div>

        {/* SR Due Card */}
        {Object.keys(srCards).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`glass rounded-2xl p-4 border mb-6 flex flex-wrap items-center gap-4 ${
              dueCount > 0 ? 'border-orange-500/30 bg-orange-500/5' : 'border-emerald-500/20 bg-emerald-500/5'
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              dueCount > 0 ? 'bg-orange-500/15' : 'bg-emerald-500/15'
            }`}>
              <RefreshCw size={20} className={dueCount > 0 ? 'text-orange-400' : 'text-emerald-400'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white font-semibold text-sm">
                {dueCount > 0 ? `${dueCount} problem${dueCount !== 1 ? 's' : ''} due for review` : 'All caught up!'}
              </div>
              <div className="text-slate-500 text-xs">
                {totalReviews} total reviews · {Object.keys(srCards).length} enrolled
              </div>
            </div>
            {/* 7-day mini bar chart */}
            <div className="hidden sm:flex items-end gap-1 h-8">
              {srUpcoming.map(({ count, label, dateStr }, i) => {
                const maxUpcoming = Math.max(...srUpcoming.map((u) => u.count), 1);
                return (
                  <div key={dateStr} className="flex flex-col items-center gap-0.5">
                    <div
                      className="w-4 rounded-sm"
                      style={{
                        height: `${Math.max(4, (count / maxUpcoming) * 28)}px`,
                        background: i === 0 && dueCount > 0 ? '#f97316' : `rgba(0,212,255,${0.2 + (count / maxUpcoming) * 0.6})`,
                      }}
                    />
                    <span className="text-slate-700" style={{ fontSize: 8 }}>{label.slice(0, 2)}</span>
                  </div>
                );
              })}
            </div>
            <Link to="/revision">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                  dueCount > 0
                    ? 'bg-orange-500/20 border-orange-500/30 text-orange-300 hover:bg-orange-500/30'
                    : 'glass border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Brain size={14} />
                {dueCount > 0 ? 'Review Now' : 'View Queue'}
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left col */}
          <div className="lg:col-span-2 space-y-6">
            {/* Difficulty breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-cyan-400" />
                Problem Breakdown
              </h3>
              <div className="space-y-3">
                {[
                  { label: 'Easy', count: easySolved, total: allProblems.filter((p) => p.difficulty === 'easy').length, color: '#10B981' },
                  { label: 'Medium', count: medSolved, total: allProblems.filter((p) => p.difficulty === 'medium').length, color: '#f59e0b' },
                  { label: 'Hard', count: hardSolved, total: allProblems.filter((p) => p.difficulty === 'hard').length, color: '#ef4444' },
                ].map((d) => (
                  <div key={d.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span style={{ color: d.color }} className="font-medium">{d.label}</span>
                      <span className="text-slate-400">{d.count} / {d.total}</span>
                    </div>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: d.color }}
                        initial={{ width: 0 }}
                        animate={{ width: d.total > 0 ? `${(d.count / d.total) * 100}%` : '0%' }}
                        transition={{ duration: 0.8 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* World Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl p-6 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Map size={18} className="text-cyan-400" />
                  World Conquest
                </h3>
                <Link to="/map" className="text-cyan-400 text-sm hover:text-cyan-300 flex items-center gap-1">
                  View Map <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid grid-cols-7 gap-1.5">
                {WORLDS.map((world) => {
                  const isCompleted = completedWorlds.includes(world.id);
                  const isUnlocked = world.id === 1 || completedWorlds.includes(world.id - 1);
                  return (
                    <Link key={world.id} to={`/world/${world.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.15 }}
                        className="aspect-square rounded-lg flex items-center justify-center text-sm transition-all"
                        style={{
                          background: isCompleted ? `${world.color}30` : isUnlocked ? '#1e2d45' : '#0d1424',
                          border: `1px solid ${isCompleted ? world.color + '60' : '#1e3a5f'}`,
                        }}
                        title={`W${world.id}: ${world.name}`}
                      >
                        {isCompleted ? world.icon : isUnlocked ? (
                          <span className="text-slate-600 text-xs">{world.id}</span>
                        ) : (
                          <span className="text-slate-800 text-xs">🔒</span>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Right col */}
          <div className="space-y-6">
            {/* Next World */}
            {nextWorld && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className={`glass rounded-2xl p-5 border bg-gradient-to-br ${nextWorld.bgGradient}`}
                style={{ borderColor: nextWorld.color + '40' }}
              >
                <div className="text-xs text-slate-500 font-medium mb-2">NEXT MISSION</div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{nextWorld.icon}</span>
                  <div>
                    <div className="text-white font-bold">{nextWorld.name}</div>
                    <div className="text-slate-500 text-xs">{nextWorld.patterns.length} patterns to master</div>
                  </div>
                </div>
                <div className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">{nextWorld.description}</div>
                <Link to={`/world/${nextWorld.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2 rounded-xl text-white text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${nextWorld.color}CC, ${nextWorld.color}80)` }}
                  >
                    Enter World <ArrowRight size={14} />
                  </motion.button>
                </Link>
              </motion.div>
            )}

            {/* Recent Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="glass rounded-2xl p-5 border border-white/5"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Award size={16} className="text-yellow-400" />
                  Recent Badges
                </h3>
                <Link to="/achievements" className="text-cyan-400 text-xs hover:text-cyan-300">All →</Link>
              </div>
              {recentAchievements.length === 0 ? (
                <div className="text-center py-6">
                  <div className="text-3xl mb-2">🎯</div>
                  <p className="text-slate-500 text-sm">Solve your first problem to earn achievements!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAchievements.map((ach) => ach && (
                    <div key={ach.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-xl">
                        {ach.icon}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{ach.title}</div>
                        <div className="text-slate-500 text-xs">{ach.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl p-5 border border-white/5"
            >
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Star size={16} className="text-cyan-400" />
                Activity
              </h3>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Last Active</span>
                  <span className="text-white">{lastActiveDate || 'Today'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Attempted</span>
                  <span className="text-blue-400">{attemptedCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total XP</span>
                  <span className="text-yellow-400">{xp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Completion</span>
                  <span className="text-emerald-400">{totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0}%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
