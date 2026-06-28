import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ExternalLink, Calendar, Brain,
  TrendingUp, Zap, RefreshCw, Clock,
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import { WORLDS } from '../constants/worlds';
import {
  SR_RATING_CONFIG,
  SR_RATING_LABELS,
  daysUntilDue,
  futureDateStr,
} from '../utils/spacedRepetition';
import type { SpacedRepetitionCard, SRRating, SRRatingLabel } from '../types';

// Find problem metadata from store
function getProblem(problemId: string) {
  return WORLDS.flatMap((w) => w.patterns.flatMap((p) => p.problems)).find(
    (p) => p.id === problemId
  ) ?? null;
}

const DIFFICULTY_COLORS = {
  easy: { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/10' },
  medium: { text: 'text-yellow-400', border: 'border-yellow-500/20', bg: 'bg-yellow-500/10' },
  hard: { text: 'text-red-400', border: 'border-red-500/20', bg: 'bg-red-500/10' },
};

function ReviewCard({
  card,
  index,
  total,
  onRate,
}: {
  card: SpacedRepetitionCard;
  index: number;
  total: number;
  onRate: (rating: SRRating) => void;
}) {
  const [flipped, setFlipped] = useState(false);
  const problem = getProblem(card.problemId);
  const world = problem ? WORLDS.find((w) => w.id === problem.worldId) : null;
  const overdueDays = Math.abs(daysUntilDue(card.dueDate));
  const diffConf = problem ? DIFFICULTY_COLORS[problem.difficulty] : DIFFICULTY_COLORS.easy;

  const handleOpen = () => {
    if (problem) window.open(problem.link, '_blank');
  };

  if (!problem || !world) return null;

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-between mb-4 text-sm text-slate-500">
        <span>{index + 1} of {total}</span>
        <span className="flex items-center gap-1.5">
          <Clock size={12} />
          Due {overdueDays === 0 ? 'today' : `${overdueDays}d ago`}
        </span>
      </div>

      {/* Card container - perspective for 3D flip */}
      <div className="relative" style={{ perspective: 1000 }}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}
          className="relative"
        >
          {/* Front face */}
          <div
            className="glass rounded-3xl p-8 border cursor-pointer select-none"
            style={{
              borderColor: world.color + '40',
              background: `linear-gradient(135deg, ${world.color}08, transparent)`,
              backfaceVisibility: 'hidden',
            }}
            onClick={() => setFlipped(true)}
          >
            {/* World badge */}
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">{world.icon}</span>
              <span className="text-xs text-slate-500">{world.name}</span>
              <span className="ml-auto text-xs text-slate-600 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                {problem.pattern}
              </span>
            </div>

            {/* Problem title */}
            <h2 className="font-orbitron text-xl font-bold text-white mb-3 leading-tight">
              {problem.title}
            </h2>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${diffConf.bg} ${diffConf.border} ${diffConf.text}`}>
                {problem.difficulty.toUpperCase()}
              </span>
              <span className="text-xs text-slate-500 glass px-2.5 py-1 rounded-full border border-white/5">
                {problem.platform}
              </span>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <RefreshCw size={10} />
                Review #{card.reviewCount + 1}
              </span>
            </div>

            {/* SR stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-white">{card.reviewCount}</div>
                <div className="text-xs text-slate-600">Reviews</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-cyan-400">{card.interval}d</div>
                <div className="text-xs text-slate-600">Last Interval</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-yellow-400">{card.easeFactor.toFixed(1)}</div>
                <div className="text-xs text-slate-600">Ease Factor</div>
              </div>
            </div>

            {/* Hint */}
            <div className="text-center text-slate-600 text-sm flex items-center justify-center gap-2">
              <Brain size={14} />
              Recall the solution, then tap to rate yourself
            </div>
          </div>

          {/* Back face */}
          <div
            className="absolute inset-0 glass rounded-3xl p-8 border flex flex-col"
            style={{
              borderColor: world.color + '40',
              background: `linear-gradient(135deg, ${world.color}08, transparent)`,
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">{world.icon}</span>
              <span className="text-sm font-semibold text-white">{problem.title}</span>
            </div>

            <p className="text-slate-400 text-sm mb-4 leading-relaxed">
              Pattern: <span className="text-cyan-400 font-medium">{problem.pattern}</span>
              <br />
              World: <span className="text-white">{world.name}</span>
            </p>

            {/* Open problem link */}
            <button
              onClick={handleOpen}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl glass border border-white/10 text-slate-300 text-sm hover:text-white hover:border-cyan-500/30 transition-all mb-5"
            >
              <ExternalLink size={14} />
              Review on {problem.platform}
            </button>

            <div className="text-xs text-slate-600 text-center mb-4">How well did you recall it?</div>

            {/* Rating buttons */}
            <div className="grid grid-cols-5 gap-2">
              {(Object.entries(SR_RATING_CONFIG) as [SRRatingLabel, typeof SR_RATING_CONFIG[SRRatingLabel]][]).map(
                ([key, conf]) => {
                  const rating = SR_RATING_LABELS[key];
                  const nextInterval = (() => {
                    const { interval, easeFactor, reviewCount } = card;
                    if (rating < 2) return '1d';
                    if (reviewCount === 0) return '1d';
                    if (reviewCount === 1) return '6d';
                    const ef = Math.max(1.3, easeFactor + (0.1 - (4 - rating) * (0.08 + (4 - rating) * 0.02)));
                    return `${Math.max(1, Math.round(interval * ef))}d`;
                  })();
                  return (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onRate(rating)}
                      className={`flex flex-col items-center gap-1 py-3 px-1 rounded-xl border text-center transition-all ${conf.bg} ${conf.border} hover:opacity-90`}
                      title={conf.description}
                    >
                      <span className="text-lg">{conf.emoji}</span>
                      <span className="text-xs font-semibold" style={{ color: conf.color }}>{conf.label}</span>
                      <span className="text-xs text-slate-600">{nextInterval}</span>
                    </motion.button>
                  );
                }
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function UpcomingReviews() {
  const { srCards } = useGameStore();
  const days = [0, 1, 2, 3, 4, 5, 6];
  const counts = days.map((offset) => {
    const dateStr = futureDateStr(offset);
    return Object.values(srCards).filter((c) => c.dueDate === dateStr).length;
  });
  const maxCount = Math.max(...counts, 1);

  const dayLabels = days.map((offset) => {
    if (offset === 0) return 'Today';
    if (offset === 1) return 'Tmrw';
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.toLocaleDateString('en', { weekday: 'short' });
  });

  return (
    <div className="glass rounded-2xl p-5 border border-white/5">
      <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
        <Calendar size={14} className="text-cyan-400" />
        Upcoming Reviews
      </h3>
      <div className="flex items-end justify-between gap-1 h-20">
        {counts.map((count, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-slate-600">{count > 0 ? count : ''}</span>
            <div className="w-full rounded-sm flex-1 flex items-end">
              <motion.div
                className="w-full rounded-t"
                style={{
                  height: `${(count / maxCount) * 100}%`,
                  minHeight: count > 0 ? 4 : 2,
                  background: i === 0
                    ? (count > 0 ? '#ef4444' : '#1e2d45')
                    : `rgba(0,212,255,${0.3 + (count / maxCount) * 0.5})`,
                }}
                initial={{ height: 0 }}
                animate={{ height: `${(count / maxCount) * 100}%` }}
                transition={{ delay: i * 0.05 }}
              />
            </div>
            <span className={`text-xs ${i === 0 ? 'text-red-400' : 'text-slate-600'}`}>
              {dayLabels[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CompletionScreen({ sessionRatings, onDone }: { sessionRatings: SRRating[]; onDone: () => void }) {
  const avg = sessionRatings.length > 0
    ? sessionRatings.reduce((a: number, b: number) => a + b, 0) / sessionRatings.length
    : 0;
  const xpEarned = useMemo(() => {
    if (sessionRatings.length === 0) return 0;
    if (avg >= 3.5) return 50;
    if (avg >= 2.5) return 30;
    if (avg >= 1.5) return 15;
    return 5;
  }, [avg, sessionRatings.length]);

  const grade =
    avg >= 3.5 ? { label: 'Excellent!', icon: '🏆', color: 'text-yellow-400' }
    : avg >= 2.5 ? { label: 'Good Work!', icon: '✅', color: 'text-emerald-400' }
    : avg >= 1.5 ? { label: 'Keep Going!', icon: '💪', color: 'text-cyan-400' }
    : { label: 'Keep Practicing', icon: '📚', color: 'text-orange-400' };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-lg mx-auto"
    >
      <div className="glass rounded-3xl p-10 border border-cyan-500/20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', delay: 0.1 }}
          className="text-6xl mb-4"
        >
          {grade.icon}
        </motion.div>

        <h2 className={`font-orbitron text-2xl font-bold mb-1 ${grade.color}`}>
          {grade.label}
        </h2>
        <p className="text-slate-400 text-sm mb-6">Session complete</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="glass rounded-xl p-3">
            <div className="text-xl font-bold text-white">{sessionRatings.length}</div>
            <div className="text-xs text-slate-600">Reviewed</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-xl font-bold text-yellow-400">+{xpEarned}</div>
            <div className="text-xs text-slate-600">XP Earned</div>
          </div>
          <div className="glass rounded-xl p-3">
            <div className="text-xl font-bold text-cyan-400">{avg.toFixed(1)}</div>
            <div className="text-xs text-slate-600">Avg Rating</div>
          </div>
        </div>

        {/* Rating breakdown */}
        <div className="flex justify-center gap-3 mb-8">
          {(Object.entries(SR_RATING_CONFIG) as [SRRatingLabel, typeof SR_RATING_CONFIG[SRRatingLabel]][]).map(
            ([key, conf]) => {
              const count = sessionRatings.filter((r) => r === SR_RATING_LABELS[key]).length;
              if (count === 0) return null;
              return (
                <div key={key} className="text-center">
                  <div className="text-lg">{conf.emoji}</div>
                  <div className="text-xs font-bold" style={{ color: conf.color }}>{count}</div>
                </div>
              );
            }
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl glass border border-white/10 text-slate-300 text-sm font-medium hover:text-white transition-colors"
            >
              Dashboard
            </motion.button>
          </Link>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onDone}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-cyan-300 text-sm font-semibold hover:from-cyan-500/30 hover:to-blue-500/30 transition-all"
          >
            Review Again
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

export default function RevisionQueue() {
  const { getDueCards, submitReview, submitSessionReviews, srCards, totalReviews } = useGameStore();
  const dueCards = getDueCards();
  const totalCards = Object.keys(srCards).length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionRatings, setSessionRatings] = useState<SRRating[]>([]);
  const [done, setDone] = useState(false);
  const [direction, setDirection] = useState(1);

  const handleRate = (rating: SRRating) => {
    const card = dueCards[currentIndex];
    if (!card) return;

    submitReview(card.problemId, rating);
    const newRatings = [...sessionRatings, rating];
    setSessionRatings(newRatings);

    if (currentIndex + 1 >= dueCards.length) {
      submitSessionReviews(newRatings);
      setDone(true);
    } else {
      setDirection(1);
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSessionRatings([]);
    setDone(false);
  };

  const progress = dueCards.length > 0 ? (currentIndex / dueCards.length) * 100 : 100;

  return (
    <div className="min-h-screen bg-[#070B14] pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/dashboard" className="text-slate-500 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex-1">
            <h1 className="font-orbitron text-xl font-bold text-white flex items-center gap-2">
              <Brain size={20} className="text-cyan-400" />
              Revision Queue
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {totalReviews} total reviews completed
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold">
            <Zap size={14} />
            {dueCards.length} due
          </div>
        </div>

        {/* No cards enrolled yet */}
        {totalCards === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-10 border border-white/5 text-center"
          >
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-white font-bold text-xl mb-2">Nothing to Review Yet</h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-6">
              Mark problems as <strong className="text-emerald-400">Solved</strong> or{' '}
              <strong className="text-yellow-400">Mastered</strong> in any World to automatically
              enrol them in spaced repetition.
            </p>
            <Link to="/map">
              <button className="px-6 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-medium hover:bg-cyan-500/30 transition-all text-sm">
                Go to World Map
              </button>
            </Link>
          </motion.div>
        )}

        {/* No cards due today (but some enrolled) */}
        {totalCards > 0 && dueCards.length === 0 && !done && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="glass rounded-3xl p-10 border border-emerald-500/20 text-center bg-gradient-to-b from-emerald-500/5 to-transparent">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-6xl mb-4"
              >
                ✅
              </motion.div>
              <h2 className="font-orbitron text-xl font-bold text-white mb-2">All Caught Up!</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mb-2">
                No reviews due right now. You have{' '}
                <span className="text-white font-semibold">{totalCards}</span> problems enrolled.
              </p>
              <p className="text-slate-600 text-xs">Come back tomorrow for your next batch.</p>
            </div>
            <UpcomingReviews />
          </motion.div>
        )}

        {/* Active review session */}
        {dueCards.length > 0 && !done && (
          <div className="space-y-6">
            {/* Progress bar */}
            <div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden mb-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="flex justify-between text-xs text-slate-600">
                <span>{sessionRatings.length} reviewed</span>
                <span>{dueCards.length - currentIndex} remaining</span>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: direction * 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -direction * 60 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
              >
                <ReviewCard
                  card={dueCards[currentIndex]}
                  index={currentIndex}
                  total={dueCards.length}
                  onRate={handleRate}
                />
              </motion.div>
            </AnimatePresence>

            {/* Skip button */}
            {currentIndex < dueCards.length - 1 && (
              <div className="text-center">
                <button
                  onClick={() => {
                    setDirection(1);
                    setCurrentIndex((i) => i + 1);
                  }}
                  className="text-xs text-slate-700 hover:text-slate-500 transition-colors"
                >
                  Skip for now →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Session complete */}
        {done && (
          <div className="space-y-6">
            <CompletionScreen sessionRatings={sessionRatings} onDone={handleRestart} />
            <UpcomingReviews />
          </div>
        )}

        {/* Stats sidebar for enrolled cards */}
        {totalCards > 0 && dueCards.length === 0 && (
          <div className="mt-6 glass rounded-2xl p-5 border border-white/5">
            <h3 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-cyan-400" />
              Your SR Stats
            </h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-white">{totalCards}</div>
                <div className="text-xs text-slate-600">Enrolled</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-yellow-400">{totalReviews}</div>
                <div className="text-xs text-slate-600">Total Reviews</div>
              </div>
              <div className="glass rounded-xl p-3 text-center">
                <div className="text-xl font-bold text-emerald-400">
                  {Object.values(srCards).filter((c) => c.interval >= 7).length}
                </div>
                <div className="text-xs text-slate-600">Long-Term</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
