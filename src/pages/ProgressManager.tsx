import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { useGameStore } from "../store/gameStore";
import type { UserProgress } from "../types";

export default function ProgressManager() {
  const {
    exportProgress,
    importProgress,
    resetProgress,
    xp,
    level,
    rank,
    streak,
    completedWorlds,
    completedPatterns,
    problemStatuses,
    srCards,
    totalReviews,
  } = useGameStore();
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [showReset, setShowReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const totalSolved = Object.values(problemStatuses).filter(
    (s) => s === "solved" || s === "mastered",
  ).length;
  const srEnrolled = Object.keys(srCards).length;

  const showNotif = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExport = () => {
    const data = exportProgress();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "dsaverse-progress.json";
    a.click();
    URL.revokeObjectURL(url);
    showNotif("success", "Progress exported successfully!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(
          ev.target?.result as string,
        ) as Partial<UserProgress>;
        importProgress(data);
        showNotif("success", "Progress imported successfully!");
      } catch {
        showNotif(
          "error",
          "Invalid progress file. Please use a valid dsaverse-progress.json file.",
        );
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleReset = () => {
    resetProgress();
    setShowReset(false);
    showNotif("success", "Progress reset. Your new journey begins!");
  };

  const exportData = exportProgress() as Record<string, unknown>;

  return (
    <div className="min-h-screen bg-[#070B14] pt-20 pb-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-1">
            <Settings size={20} className="text-cyan-400" />
            <h1 className="font-orbitron text-2xl font-bold text-white">
              Progress Manager
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            Export, import, and manage your DSAverse journey
          </p>
        </motion.div>

        {/* Current Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 border border-cyan-500/20 mb-6"
        >
          <h2 className="text-white font-semibold mb-4">
            Current Progress Snapshot
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "Level", value: level, color: "#00D4FF" },
              {
                label: "Total XP",
                value: xp.toLocaleString(),
                color: "#FFD700",
              },
              { label: "Streak", value: `${streak} days`, color: "#f97316" },
              { label: "Solved", value: totalSolved, color: "#10B981" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center glass rounded-xl p-3"
              >
                <div
                  className="text-xl font-bold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Rank</span>
              <span className="text-cyan-400 font-semibold">{rank}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-slate-500">Worlds Completed</span>
              <span className="text-white">{completedWorlds.length} / 21</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-slate-500">Patterns Mastered</span>
              <span className="text-white">{completedPatterns.length}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-slate-500">SR Cards Enrolled</span>
              <span className="text-cyan-400">{srEnrolled}</span>
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-slate-500">Total Reviews Done</span>
              <span className="text-purple-400">{totalReviews}</span>
            </div>
          </div>
        </motion.div>

        {/* Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 border border-white/5 mb-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <Download size={22} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Export Progress</h3>
              <p className="text-slate-500 text-sm mb-4">
                Download your progress as{" "}
                <code className="text-cyan-400 text-xs">
                  dsaverse-progress.json
                </code>
                . Save it as a backup or transfer to another device.
              </p>

              {/* Preview */}
              <div className="bg-black/30 rounded-xl p-4 font-mono text-xs text-slate-400 mb-4 border border-white/5 overflow-auto max-h-36">
                <pre>
                  {JSON.stringify(
                    {
                      level: exportData.level,
                      xp: exportData.xp,
                      rank: exportData.rank,
                      streak: exportData.streak,
                      "...": "(full progress)",
                    },
                    null,
                    2,
                  )}
                </pre>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleExport}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold hover:bg-emerald-500/30 transition-all"
              >
                <Download size={16} />
                Export Progress
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Import */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6 border border-white/5 mb-4"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Upload size={22} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Import Progress</h3>
              <p className="text-slate-500 text-sm mb-4">
                Restore your progress from a{" "}
                <code className="text-cyan-400 text-xs">
                  dsaverse-progress.json
                </code>{" "}
                file. This will replace your current progress.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-semibold hover:bg-blue-500/30 transition-all"
              >
                <Upload size={16} />
                Import Progress
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Reset */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 border border-red-500/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <RotateCcw size={22} className="text-red-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Reset Progress</h3>
              <p className="text-slate-500 text-sm mb-4">
                Completely reset all progress. This action is irreversible.
                Export first if you want a backup.
              </p>
              {!showReset ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowReset(true)}
                  className="flex items-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 transition-all"
                >
                  <RotateCcw size={16} />
                  Reset All Progress
                </motion.button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReset}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 font-semibold hover:bg-red-500/30 transition-all text-sm"
                  >
                    <AlertTriangle size={14} />
                    Confirm Reset
                  </motion.button>
                  <button
                    onClick={() => setShowReset(false)}
                    className="px-5 py-2.5 rounded-xl glass border border-white/10 text-slate-400 text-sm hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 50, x: "-50%" }}
            className="fixed bottom-8 left-1/2 z-50"
          >
            <div
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium text-sm border ${
                notification.type === "success"
                  ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/20 border-red-500/30 text-red-300"
              } glass-strong`}
            >
              {notification.type === "success" ? (
                <CheckCircle size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              {notification.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
