import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, ChevronDown, ChevronUp, ExternalLink, Clock, Star, Zap, Trophy, RefreshCw } from 'lucide-react';
import { WORLDS } from '../constants/worlds';
import { useGameStore } from '../store/gameStore';
import { XP_REWARDS } from '../constants/xp';
import { daysUntilDue } from '../utils/spacedRepetition';
import type { Problem, ProblemStatus } from '../types';

const STATUS_CONFIG: Record<ProblemStatus, { label: string; color: string; bg: string; icon: string }> = {
  not_started: { label: 'Not Started', color: '#64748b', bg: '#64748b20', icon: '⚪' },
  opened: { label: 'Opened', color: '#f59e0b', bg: '#f59e0b20', icon: '🟡' },
  attempted: { label: 'Attempted', color: '#3b82f6', bg: '#3b82f620', icon: '🔵' },
  solved: { label: 'Solved', color: '#10B981', bg: '#10B98120', icon: '🟢' },
  mastered: { label: 'Mastered', color: '#FFD700', bg: '#FFD70020', icon: '🏆' },
};

const DIFFICULTY_COLORS = {
  easy: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  medium: { text: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20' },
  hard: { text: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
};

function ProblemCard({ problem }: { problem: Problem }) {
  const { setProblemStatus, problemStatuses, srCards } = useGameStore();
  const [showHint, setShowHint] = useState(false);
  const status = problemStatuses[problem.id] ?? 'not_started';
  const statusConf = STATUS_CONFIG[status];
  const diffConf = DIFFICULTY_COLORS[problem.difficulty];
  const srCard = srCards[problem.id];
  const daysLeft = srCard ? daysUntilDue(srCard.dueDate) : null;
  const isOverdue = daysLeft !== null && daysLeft <= 0;
  const isDueToday = daysLeft !== null && daysLeft === 0;

  const statusOptions: ProblemStatus[] = ['not_started', 'opened', 'attempted', 'solved', 'mastered'];
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleOpenProblem = () => {
    window.open(problem.link, '_blank');
    if (status === 'not_started') {
      setProblemStatus(problem.id, 'opened');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-xl p-4 border transition-all ${
        isOverdue
          ? 'border-orange-500/40 hover:border-orange-500/60'
          : 'border-white/5 hover:border-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${diffConf.bg} ${diffConf.border} ${diffConf.text} border`}>
              {problem.difficulty.toUpperCase()}
            </span>
            <span className="text-xs text-slate-500 glass px-2 py-0.5 rounded-full border border-white/5">
              {problem.platform}
            </span>
            <span className="text-xs text-slate-600 flex items-center gap-1">
              <Clock size={10} />
              ~{problem.estimatedTime}m
            </span>
          </div>
          <h4 className="text-white font-medium text-sm mb-1 truncate">{problem.title}</h4>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{problem.pattern}</span>
            {srCard && (
              <Link
                to="/revision"
                className={`flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-md border transition-colors ${
                  isOverdue
                    ? 'text-orange-400 border-orange-500/30 bg-orange-500/10 pulse-blue'
                    : isDueToday
                    ? 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10'
                    : 'text-slate-600 border-slate-700/50 bg-white/5'
                }`}
                title={isOverdue ? 'Review overdue!' : isDueToday ? 'Due today' : `Due in ${daysLeft}d`}
              >
                <RefreshCw size={9} />
                {isOverdue ? 'Overdue' : isDueToday ? 'Due' : `${daysLeft}d`}
              </Link>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <div className="relative shrink-0">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStatusMenu(!showStatusMenu)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
            style={{ color: statusConf.color, background: statusConf.bg, borderColor: statusConf.color + '40' }}
          >
            <span>{statusConf.icon}</span>
            <span className="hidden sm:block">{statusConf.label}</span>
            <ChevronDown size={12} />
          </motion.button>

          <AnimatePresence>
            {showStatusMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                className="absolute right-0 top-full mt-1 glass-strong rounded-xl border border-white/10 overflow-hidden z-30 min-w-36"
              >
                {statusOptions.map((s) => {
                  const conf = STATUS_CONFIG[s];
                  return (
                    <button
                      key={s}
                      onClick={() => {
                        setProblemStatus(problem.id, s);
                        setShowStatusMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-white/5 transition-colors"
                      style={{ color: s === status ? conf.color : '#94a3b8' }}
                    >
                      <span>{conf.icon}</span>
                      {conf.label}
                      {s === status && <CheckCircle size={10} className="ml-auto" />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* XP reward + SR enrol notice */}
      <div className="flex items-center gap-3 mt-2">
        <div className="flex items-center gap-1 text-xs text-yellow-500/70">
          <Zap size={10} />
          +{XP_REWARDS[problem.difficulty]} XP on solve
        </div>
        {!srCard && (status === 'not_started' || status === 'opened' || status === 'attempted') && (
          <div className="flex items-center gap-1 text-xs text-slate-700">
            <RefreshCw size={9} />
            SR on solve
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleOpenProblem}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-all flex-1 justify-center"
        >
          <ExternalLink size={12} />
          Open Problem
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowHint(!showHint)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg glass border border-white/10 text-slate-400 text-xs hover:text-white transition-all"
        >
          {showHint ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          Hint
        </motion.button>
      </div>

      {/* Hint */}
      <AnimatePresence>
        {showHint && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-xs text-yellow-300/80">
              <strong className="text-yellow-400">Pattern Hint:</strong> This problem uses the <strong>{problem.pattern}</strong> pattern.
              Focus on the core technique for this pattern and try to recognize how the problem maps to it.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function PatternSection({ patternId, worldColor }: { patternId: string; worldColor: string }) {
  const { getPatternState, completedPatterns } = useGameStore();
  const world = WORLDS.flatMap((w) => w.patterns.map((p) => ({ ...p, worldColor: w.color }))).find((p) => p.id === patternId);
  const [expanded, setExpanded] = useState(true);
  if (!world) return null;

  const state = getPatternState(patternId);
  const isCompleted = completedPatterns.includes(patternId);

  const difficultyGroups = {
    easy: world.problems.filter((p) => p.difficulty === 'easy'),
    medium: world.problems.filter((p) => p.difficulty === 'medium'),
    hard: world.problems.filter((p) => p.difficulty === 'hard'),
  };

  return (
    <div className={`glass rounded-2xl border transition-all ${isCompleted ? 'border-yellow-500/30' : 'border-white/5'}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: worldColor + '20', color: worldColor, border: `1px solid ${worldColor}40` }}
          >
            {isCompleted ? '✓' : state === 'in_progress' ? '◐' : state === 'locked' ? '🔒' : '○'}
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">{world.name}</h3>
            <p className="text-slate-500 text-xs">{world.problems.length} problems</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isCompleted && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400">
              +{XP_REWARDS.pattern} XP
            </span>
          )}
          {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">{world.description}</p>
              {(['easy', 'medium', 'hard'] as const).map((diff) => {
                const probs = difficultyGroups[diff];
                if (probs.length === 0) return null;
                return (
                  <div key={diff} className="mb-4 last:mb-0">
                    <div className={`text-xs font-semibold mb-2 ${DIFFICULTY_COLORS[diff].text}`}>
                      {diff.toUpperCase()} ({probs.length})
                    </div>
                    <div className="space-y-2">
                      {probs.map((p) => <ProblemCard key={p.id} problem={p} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function WorldDetail() {
  const { worldId } = useParams<{ worldId: string }>();
  const world = WORLDS.find((w) => w.id === Number(worldId));
  const { getWorldState, completedWorlds, completedPatterns, problemStatuses } = useGameStore();

  if (!world) {
    return (
      <div className="min-h-screen bg-[#070B14] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="text-slate-400">World not found</p>
          <Link to="/map" className="text-cyan-400 mt-4 inline-block">← Back to Map</Link>
        </div>
      </div>
    );
  }

  const worldState = getWorldState(world.id);
  const totalProblems = world.patterns.flatMap((p) => p.problems).length;
  const solvedProblems = world.patterns.flatMap((p) => p.problems).filter((p) => {
    const s = problemStatuses[p.id];
    return s === 'solved' || s === 'mastered';
  }).length;
  const completedPatternCount = world.patterns.filter((p) => completedPatterns.includes(p.id)).length;

  const isLocked = worldState === 'locked';

  if (isLocked) {
    return (
      <div className="min-h-screen bg-[#070B14] pt-20 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-10 text-center max-w-md border border-white/10"
        >
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="font-orbitron text-2xl font-bold text-white mb-2">{world.name}</h2>
          <p className="text-slate-400 mb-6">Complete World {world.id - 1} to unlock this realm.</p>
          <Link to="/map">
            <button className="px-6 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-medium hover:bg-cyan-500/30 transition-all">
              Back to Map
            </button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#070B14] pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back */}
        <Link to="/map" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm mb-6">
          <ArrowLeft size={16} />
          World Map
        </Link>

        {/* World Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`glass rounded-3xl p-6 sm:p-8 mb-6 border bg-gradient-to-br ${world.bgGradient} relative overflow-hidden`}
          style={{ borderColor: world.color + '40' }}
        >
          <div className="absolute top-0 right-0 text-8xl opacity-10 pointer-events-none select-none p-4">
            {world.icon}
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">World {world.id}</span>
              {completedWorlds.includes(world.id) && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400">
                  ✓ Completed
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{world.icon}</span>
              <h1 className="font-orbitron text-2xl sm:text-3xl font-bold text-white">{world.name}</h1>
            </div>
            <p className="text-slate-400 mb-5 max-w-xl">{world.description}</p>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4">
              <div>
                <div className="text-xs text-slate-500 mb-1">Patterns</div>
                <div className="text-white font-bold">{completedPatternCount} / {world.patterns.length}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">Problems</div>
                <div className="text-white font-bold">{solvedProblems} / {totalProblems}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 mb-1">XP Available</div>
                <div className="text-yellow-400 font-bold">
                  {(world.patterns.length * XP_REWARDS.pattern + XP_REWARDS.world).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: world.color }}
                  initial={{ width: 0 }}
                  animate={{ width: totalProblems > 0 ? `${(solvedProblems / totalProblems) * 100}%` : '0%' }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Boss Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 border border-red-500/20 bg-gradient-to-r from-red-950/20 to-transparent mb-6"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-2xl shrink-0">
              ⚔️
            </div>
            <div>
              <div className="text-xs text-red-400 font-semibold mb-1">WORLD BOSS</div>
              <h3 className="text-white font-bold">{world.boss}</h3>
              <p className="text-slate-500 text-sm mt-1">{world.bossDescription}</p>
              <div className="text-xs text-yellow-500 mt-2 flex items-center gap-1">
                <Trophy size={12} />
                Defeat reward: +{XP_REWARDS.boss.toLocaleString()} XP
              </div>
            </div>
          </div>
          {completedWorlds.includes(world.id) ? (
            <div className="mt-3 flex items-center gap-2 text-yellow-400 text-sm font-semibold">
              <Star size={14} fill="currentColor" />
              Boss Defeated!
            </div>
          ) : (
            <div className="mt-3 text-slate-600 text-xs">
              Complete all patterns to challenge the boss
            </div>
          )}
        </motion.div>

        {/* Patterns */}
        <div className="space-y-4">
          {world.patterns.map((pattern, i) => (
            <motion.div
              key={pattern.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + i * 0.05 }}
            >
              <PatternSection patternId={pattern.id} worldColor={world.color} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
