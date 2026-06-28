import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { UserProgress, ProblemStatus, SpacedRepetitionCard, SRRating } from '../types';
import { getRankFromXP, getLevelFromXP, XP_REWARDS } from '../constants/xp';
import { ACHIEVEMENTS } from '../constants/achievements';
import { WORLDS } from '../constants/worlds';
import {
  createSRCard,
  applyReview,
  isDue,
  reviewSessionXP,
} from '../utils/spacedRepetition';

const defaultProgress: UserProgress = {
  xp: 0,
  level: 1,
  rank: 'Beginner',
  streak: 0,
  lastActiveDate: '',
  completedWorlds: [],
  completedPatterns: [],
  problemStatuses: {},
  earnedAchievements: [],
  currentWorld: 1,
  srCards: {},
  totalReviews: 0,
  preferences: {
    theme: 'dark',
    soundEnabled: true,
    animationsEnabled: true,
  },
};

interface GameStore extends UserProgress {
  isFirebaseMode: boolean;
  setFirebaseMode: (mode: boolean) => void;
  syncFromFirebase: (data: Partial<UserProgress>) => void;
  setProblemStatus: (problemId: string, status: ProblemStatus) => void;
  addXP: (amount: number) => void;
  checkAndCompletePattern: (patternId: string) => void;
  checkAndCompleteWorld: (worldId: number) => void;
  checkAchievements: () => void;
  updateStreak: () => void;
  importProgress: (data: Partial<UserProgress>) => void;
  exportProgress: () => object;
  resetProgress: () => void;
  getWorldState: (worldId: number) => 'locked' | 'unlocked' | 'in_progress' | 'completed';
  getPatternState: (patternId: string) => 'locked' | 'unlocked' | 'in_progress' | 'completed';
  scheduleForReview: (problemId: string) => void;
  submitReview: (problemId: string, rating: SRRating) => void;
  submitSessionReviews: (ratings: SRRating[]) => void;
  getDueCards: () => SpacedRepetitionCard[];
  getDueCount: () => number;
}

let onSaveToFirebase: ((data: Partial<UserProgress>) => Promise<void>) | null = null;

export const setFirebaseSaveHandler = (handler: (data: Partial<UserProgress>) => Promise<void>) => {
  onSaveToFirebase = handler;
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...defaultProgress,
      isFirebaseMode: false,

      setFirebaseMode(mode) {
        set({ isFirebaseMode: mode });
      },

      syncFromFirebase(data) {
        set({ ...defaultProgress, ...data, isFirebaseMode: true });
      },

      setProblemStatus(problemId, status) {
        set((s) => ({
          problemStatuses: { ...s.problemStatuses, [problemId]: status },
        }));
        const state = get();
        if (status === 'solved' || status === 'mastered') {
          const problem = WORLDS.flatMap((w) => w.patterns.flatMap((p) => p.problems)).find(
            (p) => p.id === problemId
          );
          if (problem) {
            const prev = state.problemStatuses[problemId];
            if (prev !== 'solved' && prev !== 'mastered') {
              state.addXP(XP_REWARDS[problem.difficulty]);
            }
            state.checkAndCompletePattern(problem.patternId);
          }
          state.scheduleForReview(problemId);
        }
        state.checkAchievements();
        state.updateStreak();
        get()._saveToFirebase();
      },

      addXP(amount) {
        set((s) => {
          const newXP = s.xp + amount;
          return {
            xp: newXP,
            level: getLevelFromXP(newXP),
            rank: getRankFromXP(newXP),
          };
        });
        get()._saveToFirebase();
      },

      checkAndCompletePattern(patternId) {
        const state = get();
        if (state.completedPatterns.includes(patternId)) return;
        const pattern = WORLDS.flatMap((w) => w.patterns).find((p) => p.id === patternId);
        if (!pattern) return;
        const allSolved = pattern.problems.every((prob) => {
          const s = state.problemStatuses[prob.id];
          return s === 'solved' || s === 'mastered';
        });
        if (allSolved) {
          set((s) => ({ completedPatterns: [...s.completedPatterns, patternId] }));
          get().addXP(XP_REWARDS.pattern);
          get().checkAndCompleteWorld(pattern.worldId);
        }
      },

      checkAndCompleteWorld(worldId) {
        const state = get();
        if (state.completedWorlds.includes(worldId)) return;
        const world = WORLDS.find((w) => w.id === worldId);
        if (!world) return;
        const allPatternsDone = world.patterns.every((p) => {
          const updated = get();
          return updated.completedPatterns.includes(p.id);
        });
        if (allPatternsDone) {
          set((s) => ({ completedWorlds: [...s.completedWorlds, worldId] }));
          get().addXP(XP_REWARDS.world);
          get().checkAchievements();
          get()._saveToFirebase();
        }
      },

      checkAchievements() {
        const state = get();
        const stats = {
          completedProblems: Object.values(state.problemStatuses).filter(
            (s) => s === 'attempted' || s === 'solved' || s === 'mastered'
          ).length,
          solvedProblems: Object.values(state.problemStatuses).filter(
            (s) => s === 'solved' || s === 'mastered'
          ).length,
          completedPatterns: state.completedPatterns.length,
          completedWorlds: state.completedWorlds.length,
          streak: state.streak,
          level: state.level,
          xp: state.xp,
          totalReviews: state.totalReviews,
        };
        const newAchievements: string[] = [];
        for (const ach of ACHIEVEMENTS) {
          if (!state.earnedAchievements.includes(ach.id) && ach.condition(stats)) {
            newAchievements.push(ach.id);
          }
        }
        if (newAchievements.length > 0) {
          const xpFromAch = newAchievements.reduce((sum, id) => {
            const ach = ACHIEVEMENTS.find((a) => a.id === id);
            return sum + (ach?.xpReward ?? 0);
          }, 0);
          set((s) => ({ earnedAchievements: [...s.earnedAchievements, ...newAchievements] }));
          if (xpFromAch > 0) get().addXP(xpFromAch);
          get()._saveToFirebase();
        }
      },

      updateStreak() {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastActiveDate === today) return;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const newStreak = state.lastActiveDate === yesterday ? state.streak + 1 : 1;
        set({ streak: newStreak, lastActiveDate: today });
        get()._saveToFirebase();
      },

      importProgress(data) {
        set({ ...defaultProgress, ...data });
        get()._saveToFirebase();
      },

      exportProgress() {
        const s = get();
        return {
          level: s.level,
          xp: s.xp,
          rank: s.rank,
          streak: s.streak,
          completedWorlds: s.completedWorlds,
          completedPatterns: s.completedPatterns,
          completedProblems: Object.entries(s.problemStatuses)
            .filter(([, v]) => v === 'solved' || v === 'mastered')
            .map(([k]) => k),
          problemStatuses: s.problemStatuses,
          earnedAchievements: s.earnedAchievements,
          lastActiveDate: s.lastActiveDate,
          srCards: s.srCards,
          totalReviews: s.totalReviews,
        };
      },

      resetProgress() {
        set(defaultProgress);
        get()._saveToFirebase();
      },

      getWorldState(worldId) {
        const s = get();
        if (s.completedWorlds.includes(worldId)) return 'completed';
        if (worldId === 1) return 'unlocked';
        const prevCompleted = s.completedWorlds.includes(worldId - 1);
        if (!prevCompleted) return 'locked';
        const world = WORLDS.find((w) => w.id === worldId);
        if (!world) return 'locked';
        const hasAnyProgress = world.patterns.some((p) =>
          p.problems.some((prob) => {
            const st = s.problemStatuses[prob.id];
            return st && st !== 'not_started';
          })
        );
        return hasAnyProgress ? 'in_progress' : 'unlocked';
      },

      getPatternState(patternId) {
        const s = get();
        if (s.completedPatterns.includes(patternId)) return 'completed';
        const pattern = WORLDS.flatMap((w) => w.patterns).find((p) => p.id === patternId);
        if (!pattern) return 'locked';
        const worldState = get().getWorldState(pattern.worldId);
        if (worldState === 'locked') return 'locked';
        const hasProgress = pattern.problems.some((p) => {
          const st = s.problemStatuses[p.id];
          return st && st !== 'not_started';
        });
        return hasProgress ? 'in_progress' : 'unlocked';
      },

      scheduleForReview(problemId) {
        const state = get();
        if (state.srCards[problemId]) return;
        set((s) => ({
          srCards: { ...s.srCards, [problemId]: createSRCard(problemId) },
        }));
        get()._saveToFirebase();
      },

      submitReview(problemId, rating) {
        const state = get();
        const card = state.srCards[problemId];
        if (!card) return;
        const updates = applyReview(card, rating);
        set((s) => ({
          srCards: { ...s.srCards, [problemId]: { ...card, ...updates } },
          totalReviews: s.totalReviews + 1,
        }));
        get().updateStreak();
        get().checkAchievements();
        get()._saveToFirebase();
      },

      submitSessionReviews(ratings) {
        if (ratings.length === 0) return;
        const xp = reviewSessionXP(ratings);
        get().addXP(xp);
        get().checkAchievements();
      },

      getDueCards() {
        const { srCards } = get();
        return Object.values(srCards)
          .filter(isDue)
          .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
      },

      getDueCount() {
        return get().getDueCards().length;
      },

      _saveToFirebase() {
        if (get().isFirebaseMode && onSaveToFirebase) {
          const state = get();
          onSaveToFirebase({
            xp: state.xp,
            level: state.level,
            rank: state.rank,
            streak: state.streak,
            lastActiveDate: state.lastActiveDate,
            completedWorlds: state.completedWorlds,
            completedPatterns: state.completedPatterns,
            problemStatuses: state.problemStatuses,
            earnedAchievements: state.earnedAchievements,
            currentWorld: state.currentWorld,
            srCards: state.srCards,
            totalReviews: state.totalReviews,
            preferences: state.preferences,
          });
        }
      },
    }),
    {
      name: 'dsaverse-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        ...state,
        isFirebaseMode: false,
      }),
    }
  )
);
