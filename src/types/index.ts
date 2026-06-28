export type Difficulty = 'easy' | 'medium' | 'hard';

export type Platform =
  | 'LeetCode'
  | 'GeeksForGeeks'
  | 'HackerRank'
  | 'Codeforces'
  | 'CodeChef'
  | 'AtCoder'
  | 'CodingNinjas'
  | 'InterviewBit';

export type ProblemStatus = 'not_started' | 'opened' | 'attempted' | 'solved' | 'mastered';

export type NodeState = 'locked' | 'unlocked' | 'in_progress' | 'completed';

// SM-2 rating scale (0 = complete blackout, 4 = perfect recall)
export type SRRating = 0 | 1 | 2 | 3 | 4;
export type SRRatingLabel = 'forgot' | 'hard' | 'good' | 'easy' | 'mastered';

export interface SpacedRepetitionCard {
  problemId: string;
  interval: number;       // days until next review
  easeFactor: number;     // SM-2 ease factor (starts at 2.5)
  dueDate: string;        // ISO date string (YYYY-MM-DD)
  reviewCount: number;
  lastReviewDate: string; // ISO date string
  lastRating: SRRating;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: Difficulty;
  platform: Platform;
  pattern: string;
  estimatedTime: number;
  link: string;
  worldId: number;
  patternId: string;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  worldId: number;
  problems: Problem[];
}

export interface World {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  bgGradient: string;
  patterns: Pattern[];
  boss: string;
  bossDescription: string;
  position: { x: number; y: number };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  completedProblems: number;
  solvedProblems: number;
  completedPatterns: number;
  completedWorlds: number;
  streak: number;
  level: number;
  xp: number;
  totalReviews: number;
}

export type Rank =
  | 'Beginner'
  | 'Explorer'
  | 'Apprentice'
  | 'Warrior'
  | 'Knight'
  | 'Elite'
  | 'Master'
  | 'Grandmaster'
  | 'Legend'
  | 'Mythic'
  | 'Algorithm Emperor';

export interface UserProgress {
  xp: number;
  level: number;
  rank: Rank;
  streak: number;
  lastActiveDate: string;
  completedWorlds: number[];
  completedPatterns: string[];
  problemStatuses: Record<string, ProblemStatus>;
  earnedAchievements: string[];
  currentWorld: number;
  srCards: Record<string, SpacedRepetitionCard>;
  totalReviews: number;
  preferences: {
    theme: 'dark';
    soundEnabled: boolean;
    animationsEnabled: boolean;
  };
}
