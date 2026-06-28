import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, CheckCircle, Circle, ArrowRight, Star, Zap } from 'lucide-react';
import { WORLDS } from '../constants/worlds';
import { useGameStore } from '../store/gameStore';
import type { World } from '../types';

function WorldNode({ world, state, onClick }: {
  world: World;
  state: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  onClick: () => void;
}) {
  const isLocked = state === 'locked';
  const isCompleted = state === 'completed';
  const isInProgress = state === 'in_progress';

  return (
    <motion.div
      className="absolute world-node"
      style={{
        left: `${world.position.x}%`,
        top: `${world.position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
      whileHover={!isLocked ? { scale: 1.15 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      onClick={!isLocked ? onClick : undefined}
    >
      {/* Connection lines handled via SVG in parent */}
      <div className="relative flex flex-col items-center gap-2">
        {/* Node circle */}
        <div
          className={`relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all
            ${isLocked ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
            ${isCompleted ? 'pulse-gold-anim' : isInProgress ? 'pulse-blue' : ''}
          `}
          style={{
            background: isLocked
              ? 'rgba(30,40,60,0.8)'
              : isCompleted
              ? `linear-gradient(135deg, ${world.color}40, ${world.color}20)`
              : `linear-gradient(135deg, ${world.color}30, ${world.color}10)`,
            border: `2px solid ${isLocked ? '#1e3a5f' : isCompleted ? world.color : world.color + '60'}`,
            boxShadow: isCompleted
              ? `0 0 20px ${world.color}60, 0 0 40px ${world.color}20`
              : isInProgress
              ? `0 0 15px rgba(0,212,255,0.4)`
              : 'none',
          }}
        >
          {isLocked ? <Lock size={20} className="text-slate-600" /> : world.icon}

          {/* Status badge */}
          {isCompleted && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
              <Star size={10} className="text-yellow-900" />
            </div>
          )}
          {isInProgress && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
              <Zap size={10} className="text-cyan-900" />
            </div>
          )}
        </div>

        {/* Label */}
        <div className="text-center pointer-events-none">
          <div className={`text-xs font-medium whitespace-nowrap ${isLocked ? 'text-slate-600' : 'text-slate-200'}`}>
            W{world.id}
          </div>
          <div
            className={`text-[10px] whitespace-nowrap max-w-[80px] truncate ${isLocked ? 'text-slate-700' : 'text-slate-400'}`}
          >
            {world.name}
          </div>
        </div>
      </div>

      {/* Fog overlay for locked */}
      {isLocked && (
        <div className="absolute inset-0 rounded-2xl fog-overlay pointer-events-none" />
      )}
    </motion.div>
  );
}

function WorldTooltip({ world, state, onClose }: {
  world: World;
  state: 'locked' | 'unlocked' | 'in_progress' | 'completed';
  onClose: () => void;
}) {
  const { completedPatterns, problemStatuses } = useGameStore();
  const totalProblems = world.patterns.flatMap((p) => p.problems).length;
  const solvedProblems = world.patterns
    .flatMap((p) => p.problems)
    .filter((p) => {
      const s = problemStatuses[p.id];
      return s === 'solved' || s === 'mastered';
    }).length;
  const completedPatternsCount = world.patterns.filter((p) => completedPatterns.includes(p.id)).length;

  const stateLabel = {
    locked: 'Locked',
    unlocked: 'Ready to Enter',
    in_progress: 'In Progress',
    completed: 'Completed',
  }[state];

  const stateColor = {
    locked: 'text-slate-500',
    unlocked: 'text-cyan-400',
    in_progress: 'text-blue-400',
    completed: 'text-yellow-400',
  }[state];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        className="relative glass-strong rounded-2xl p-6 max-w-md w-full border"
        style={{ borderColor: world.color + '40' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-3xl">{world.icon}</span>
              <div>
                <div className="text-xs text-slate-500 font-medium">WORLD {world.id}</div>
                <h3 className="text-white font-bold text-lg">{world.name}</h3>
              </div>
            </div>
            <span className={`text-sm font-medium ${stateColor}`}>{stateLabel}</span>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white text-xl leading-none">×</button>
        </div>

        <p className="text-slate-400 text-sm mb-5 leading-relaxed">{world.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-white">{world.patterns.length}</div>
            <div className="text-xs text-slate-500">Patterns</div>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xl font-bold" style={{ color: world.color }}>{solvedProblems}</div>
            <div className="text-xs text-slate-500">Solved/{totalProblems}</div>
          </div>
          <div className="glass rounded-xl p-3 text-center">
            <div className="text-xl font-bold text-purple-400">{completedPatternsCount}</div>
            <div className="text-xs text-slate-500">Patterns Done</div>
          </div>
        </div>

        {/* Boss */}
        <div className="glass rounded-xl p-3 mb-5 border border-red-500/20">
          <div className="flex items-center gap-2 text-red-400 text-sm font-semibold mb-1">
            <span>⚔️</span> Boss: {world.boss}
          </div>
          <p className="text-slate-500 text-xs">{world.bossDescription}</p>
        </div>

        {/* Patterns preview */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {world.patterns.slice(0, 4).map((p) => (
            <span key={p.id} className="text-xs px-2 py-0.5 rounded-full glass border border-white/10 text-slate-400">
              {p.name}
            </span>
          ))}
          {world.patterns.length > 4 && (
            <span className="text-xs px-2 py-0.5 text-slate-600">+{world.patterns.length - 4} more</span>
          )}
        </div>

        {state !== 'locked' && (
          <Link to={`/world/${world.id}`} onClick={onClose}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition-all"
              style={{
                background: `linear-gradient(135deg, ${world.color}CC, ${world.color}80)`,
              }}
            >
              {state === 'completed' ? 'Review World' : 'Enter World'}
              <ArrowRight size={16} />
            </motion.button>
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function GameMap() {
  const [selectedWorld, setSelectedWorld] = useState<World | null>(null);
  const [scale, setScale] = useState(1);
  const { getWorldState } = useGameStore();

  return (
    <div className="relative min-h-screen bg-[#070B14] pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-purple-500/3 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="relative z-10 pt-8 pb-4 px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-orbitron text-2xl sm:text-3xl font-bold text-white mb-1"
        >
          World <span className="gradient-text">Map</span>
        </motion.h1>
        <p className="text-slate-500 text-sm">21 worlds await your conquest</p>
      </div>

      {/* Legend */}
      <div className="relative z-10 flex items-center justify-center gap-6 pb-4 text-xs">
        {[
          { color: '#1e3a5f', label: 'Locked', icon: <Lock size={10} /> },
          { color: '#00D4FF', label: 'Available', icon: <Circle size={10} /> },
          { color: '#3b82f6', label: 'In Progress', icon: <Zap size={10} /> },
          { color: '#FFD700', label: 'Completed', icon: <CheckCircle size={10} /> },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-slate-500">
            <span style={{ color: item.color }}>{item.icon}</span>
            {item.label}
          </div>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative z-10 w-full overflow-auto" style={{ height: 'calc(100vh - 200px)' }}>
        <div
          className="relative mx-auto"
          style={{
            width: '1200px',
            height: '800px',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {/* SVG Roads */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 1200 800"
            preserveAspectRatio="none"
          >
            <defs>
              <filter id="glow-blue">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {WORLDS.slice(0, -1).map((world, i) => {
              const next = WORLDS[i + 1];
              const x1 = world.position.x * 12;
              const y1 = world.position.y * 8;
              const x2 = next.position.x * 12;
              const y2 = next.position.y * 8;
              const worldState = getWorldState(world.id);
              const isComplete = worldState === 'completed';
              const isActive = worldState !== 'locked';
              return (
                <line
                  key={`road-${world.id}`}
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={isComplete ? '#FFD700' : isActive ? '#00D4FF' : '#1e3a5f'}
                  strokeWidth={isComplete || isActive ? 2 : 1}
                  strokeDasharray={isActive ? 'none' : '4 4'}
                  opacity={isComplete ? 0.8 : isActive ? 0.5 : 0.2}
                  filter={isActive ? 'url(#glow-blue)' : undefined}
                />
              );
            })}
          </svg>

          {/* World Nodes */}
          {WORLDS.map((world) => (
            <WorldNode
              key={world.id}
              world={world}
              state={getWorldState(world.id)}
              onClick={() => setSelectedWorld(world)}
            />
          ))}

          {/* Floating clouds for ambiance */}
          {[
            { x: 30, y: 45, size: 60, opacity: 0.03, delay: 0 },
            { x: 60, y: 70, size: 80, opacity: 0.04, delay: 2 },
            { x: 75, y: 30, size: 50, opacity: 0.03, delay: 4 },
            { x: 10, y: 60, size: 70, opacity: 0.04, delay: 1 },
          ].map((cloud, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white pointer-events-none"
              style={{
                left: `${cloud.x}%`,
                top: `${cloud.y}%`,
                width: cloud.size,
                height: cloud.size / 2,
                opacity: cloud.opacity,
                filter: 'blur(20px)',
              }}
              animate={{ x: [0, 20, 0] }}
              transition={{ duration: 15, delay: cloud.delay, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="fixed bottom-6 right-6 z-20 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setScale((s) => Math.min(s + 0.1, 1.5))}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/30"
        >
          +
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setScale((s) => Math.max(s - 0.1, 0.5))}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/30"
        >
          −
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setScale(1)}
          className="w-10 h-10 glass rounded-xl flex items-center justify-center text-slate-300 hover:text-white border border-white/10 hover:border-cyan-500/30 text-xs"
        >
          1:1
        </motion.button>
      </div>

      {/* World Tooltip Modal */}
      <AnimatePresence>
        {selectedWorld && (
          <WorldTooltip
            world={selectedWorld}
            state={getWorldState(selectedWorld.id)}
            onClose={() => setSelectedWorld(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
