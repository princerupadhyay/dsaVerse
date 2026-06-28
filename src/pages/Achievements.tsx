import { motion } from 'framer-motion';
import { Trophy, Lock } from 'lucide-react';
import { ACHIEVEMENTS } from '../constants/achievements';
import { useGameStore } from '../store/gameStore';

export default function Achievements() {
  const { earnedAchievements, xp, level, streak, completedWorlds, completedPatterns, problemStatuses, totalReviews } = useGameStore();

  const stats = {
    completedProblems: Object.values(problemStatuses).filter((s) => s === 'attempted' || s === 'solved' || s === 'mastered').length,
    solvedProblems: Object.values(problemStatuses).filter((s) => s === 'solved' || s === 'mastered').length,
    completedPatterns: completedPatterns.length,
    completedWorlds: completedWorlds.length,
    streak,
    level,
    xp,
    totalReviews,
  };

  const earned = ACHIEVEMENTS.filter((a) => earnedAchievements.includes(a.id));
  const locked = ACHIEVEMENTS.filter((a) => !earnedAchievements.includes(a.id));

  return (
    <div className="min-h-screen bg-[#070B14] pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-white mb-2">
            Hall of <span className="gradient-text">Achievements</span>
          </h1>
          <p className="text-slate-500 text-sm">
            {earnedAchievements.length} / {ACHIEVEMENTS.length} unlocked
          </p>

          {/* Progress bar */}
          <div className="max-w-xs mx-auto mt-4">
            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(earnedAchievements.length / ACHIEVEMENTS.length) * 100}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Earned */}
        {earned.length > 0 && (
          <div className="mb-10">
            <h2 className="text-slate-400 text-xs font-semibold tracking-widest uppercase mb-4">
              Earned ({earned.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {earned.map((ach, i) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  className="glass rounded-2xl p-5 border border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent relative overflow-hidden pulse-gold-anim"
                >
                  <div className="absolute top-2 right-2">
                    <Trophy size={14} className="text-yellow-500/30" />
                  </div>
                  <div className="text-4xl mb-3">{ach.icon}</div>
                  <h3 className="text-white font-bold text-sm mb-1">{ach.title}</h3>
                  <p className="text-slate-500 text-xs mb-3">{ach.description}</p>
                  <div className="flex items-center gap-1 text-yellow-400 text-xs font-medium">
                    <span>⚡</span>
                    +{ach.xpReward.toLocaleString()} XP
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Locked */}
        {locked.length > 0 && (
          <div>
            <h2 className="text-slate-600 text-xs font-semibold tracking-widest uppercase mb-4">
              Locked ({locked.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {locked.map((ach, i) => {
                const isClose = ach.condition({ ...stats, solvedProblems: stats.solvedProblems + 5, completedPatterns: stats.completedPatterns + 1 });
                return (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`glass rounded-2xl p-5 border transition-all ${isClose ? 'border-slate-600/30' : 'border-white/5'} opacity-50`}
                  >
                    <div className="text-4xl mb-3 grayscale">{ach.icon}</div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-slate-400 font-bold text-sm">{ach.title}</h3>
                      <Lock size={12} className="text-slate-700" />
                    </div>
                    <p className="text-slate-600 text-xs mb-3">{ach.description}</p>
                    <div className="flex items-center gap-1 text-slate-700 text-xs">
                      <span>⚡</span>
                      +{ach.xpReward.toLocaleString()} XP
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {earned.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🏅</div>
            <h2 className="text-white font-bold text-xl mb-2">Your Journey Begins</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Solve your first problem on LeetCode, GeeksForGeeks, or any other platform and
              come back to mark it as solved to earn your first achievement!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
