import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Map, Brain, Trophy, Zap, Star, Target, ChevronDown, Shield, Flame, LogIn, LogOut } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import { WORLDS } from '../constants/worlds';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    icon: Map,
    title: 'Epic World Map',
    description: 'Navigate 21 worlds from Beginner Forest to the Competitive Programming Universe on an interactive RPG-style map.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: Brain,
    title: 'AI Mentor — Sensei',
    description: 'Your personal AI guide explains concepts, predicts patterns, and builds personalized revision plans.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: Trophy,
    title: 'Achievement System',
    description: 'Unlock badges, earn XP, and climb from Beginner all the way to Algorithm Emperor.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  {
    icon: Target,
    title: 'Pattern Oracle',
    description: 'Paste any coding question and get instant pattern recognition with confidence scores and similar problems.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: Flame,
    title: 'Streak & Gamification',
    description: 'Daily streaks, XP rewards, level progression, and boss battles keep you engaged every single day.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  {
    icon: Shield,
    title: 'Progress Sync',
    description: 'Sign in with Google to save your progress to the cloud. Your journey syncs across all devices automatically.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
];

const stats = [
  { value: '21', label: 'Learning Worlds' },
  { value: '100+', label: 'DSA Patterns' },
  { value: '500+', label: 'Curated Problems' },
  { value: '11', label: 'Rank Tiers' },
];

const previewWorlds = WORLDS.slice(0, 6);

export default function Landing() {
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, -80]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  return (
    <div className="relative min-h-screen bg-[#070B14] overflow-x-hidden">
      <ParticleBackground />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pt-16">
        {/* Background glow orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl" />
        </div>

        <motion.div style={{ y: heroY, opacity: heroOpacity }} className="relative z-10 max-w-5xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-8"
          >
            <Zap size={14} />
            The Ultimate DSA Learning Universe
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-orbitron text-5xl sm:text-7xl font-black leading-tight mb-6"
          >
            Master DSA
            <br />
            <span className="gradient-text">Like a Game.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Travel through algorithmic worlds, unlock powerful patterns, defeat coding bosses,
            and become an <span className="text-yellow-400 font-semibold">Algorithm Emperor</span>.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <Link to="/map">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 glow-blue transition-all hover:from-cyan-400 hover:to-blue-500"
              >
                Start Adventure
                <ArrowRight size={18} />
              </motion.button>
            </Link>
            <Link to="/map">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-slate-300 glass border border-slate-600/50 hover:border-cyan-500/40 hover:text-white transition-all"
              >
                <Map size={18} />
                Explore Roadmap
              </motion.button>
            </Link>
          </motion.div>

          {/* Auth Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6"
          >
            {loading ? (
              <div className="w-40 h-10 rounded-lg bg-slate-800/50 animate-pulse mx-auto" />
            ) : user ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={signOut}
                className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
              >
                <LogOut size={14} />
                Sign Out
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={signInWithGoogle}
                className="flex items-center gap-2 mx-auto px-6 py-2 rounded-lg bg-white/5 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all text-sm font-medium"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Sign in with Google to save progress
              </motion.button>
            )}
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ChevronDown className="text-slate-500" size={24} />
        </motion.div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-6 text-center border border-white/5 hover:border-cyan-500/20 transition-colors"
            >
              <div className="font-orbitron text-3xl font-black text-cyan-400 mb-1">{stat.value}</div>
              <div className="text-slate-400 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
              Your <span className="gradient-text">Arsenal</span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              Everything you need to go from absolute beginner to competitive programming god.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className={`glass rounded-2xl p-6 border ${feat.border} hover:border-opacity-50 transition-all`}
              >
                <div className={`w-12 h-12 rounded-xl ${feat.bg} flex items-center justify-center mb-4`}>
                  <feat.icon size={24} className={feat.color} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{feat.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feat.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* World Preview */}
      <section className="relative z-10 py-20 px-4 bg-gradient-to-b from-transparent via-cyan-950/5 to-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
              21 <span className="gradient-text">Worlds</span> Await
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              From Beginner Forest to the Competitive Programming Universe — a structured journey through every DSA concept.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {previewWorlds.map((world, i) => (
              <motion.div
                key={world.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`glass rounded-2xl p-5 border border-white/5 hover:border-opacity-50 transition-all bg-gradient-to-br ${world.bgGradient}`}
                style={{ borderColor: world.color + '30' }}
              >
                <div className="text-3xl mb-3">{world.icon}</div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-500">WORLD {world.id}</span>
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{world.name}</h3>
                <p className="text-slate-500 text-xs">{world.patterns.length} patterns</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link to="/map">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-cyan-400 glass border border-cyan-500/30 hover:border-cyan-500/60 transition-all"
              >
                View All 21 Worlds
                <ArrowRight size={16} />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Rank System */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-orbitron text-3xl sm:text-4xl font-bold text-white mb-4">
              Your <span className="gradient-text">Journey</span>
            </h2>
            <p className="text-slate-400">Rise through 11 legendary ranks from Beginner to Algorithm Emperor.</p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-3">
            {[
              { rank: 'Beginner', color: '#64748b', icon: '🌱' },
              { rank: 'Explorer', color: '#22c55e', icon: '🧭' },
              { rank: 'Apprentice', color: '#06b6d4', icon: '📚' },
              { rank: 'Warrior', color: '#3b82f6', icon: '⚔️' },
              { rank: 'Knight', color: '#8b5cf6', icon: '🛡️' },
              { rank: 'Elite', color: '#f59e0b', icon: '⭐' },
              { rank: 'Master', color: '#ef4444', icon: '🔥' },
              { rank: 'Grandmaster', color: '#ec4899', icon: '💎' },
              { rank: 'Legend', color: '#a855f7', icon: '🌟' },
              { rank: 'Mythic', color: '#00D4FF', icon: '🔱' },
              { rank: 'Algorithm Emperor', color: '#FFD700', icon: '👑' },
            ].map((r, i) => (
              <motion.div
                key={r.rank}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, type: 'spring' }}
                className="flex items-center gap-2 px-4 py-2 rounded-full glass border text-sm font-medium"
                style={{ borderColor: r.color + '40', color: r.color }}
              >
                <span>{r.icon}</span>
                {r.rank}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass rounded-3xl p-12 border border-cyan-500/20 glow-blue relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5" />
            <div className="relative z-10">
              <div className="text-5xl mb-4">👑</div>
              <h2 className="font-orbitron text-3xl font-bold text-white mb-4">
                Begin Your Quest
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
                Every Algorithm Emperor was once a beginner. Start your journey today and
                transform your DSA skills through the most gamified learning experience ever built.
              </p>
              <Link to="/map">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 glow-blue text-lg"
                >
                  Enter DSAverse
                  <Star size={20} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
