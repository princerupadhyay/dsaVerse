import type { Rank } from '../types';

export const XP_REWARDS = {
  easy: 50,
  medium: 100,
  hard: 200,
  pattern: 500,
  world: 1000,
  boss: 1500,
};

export const RANK_THRESHOLDS: { rank: Rank; minXP: number }[] = [
  { rank: 'Beginner', minXP: 0 },
  { rank: 'Explorer', minXP: 500 },
  { rank: 'Apprentice', minXP: 1500 },
  { rank: 'Warrior', minXP: 3500 },
  { rank: 'Knight', minXP: 7000 },
  { rank: 'Elite', minXP: 13000 },
  { rank: 'Master', minXP: 22000 },
  { rank: 'Grandmaster', minXP: 35000 },
  { rank: 'Legend', minXP: 52000 },
  { rank: 'Mythic', minXP: 75000 },
  { rank: 'Algorithm Emperor', minXP: 100000 },
];

export function getRankFromXP(xp: number): Rank {
  let rank: Rank = 'Beginner';
  for (const t of RANK_THRESHOLDS) {
    if (xp >= t.minXP) rank = t.rank;
  }
  return rank;
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export function getXPForNextRank(xp: number): { current: Rank; next: Rank | null; progress: number; needed: number } {
  const currentRankIdx = RANK_THRESHOLDS.findIndex((t, i) => {
    const next = RANK_THRESHOLDS[i + 1];
    return xp >= t.minXP && (!next || xp < next.minXP);
  });
  const current = RANK_THRESHOLDS[currentRankIdx];
  const next = RANK_THRESHOLDS[currentRankIdx + 1];
  if (!next) return { current: current.rank, next: null, progress: 100, needed: 0 };
  const progress = ((xp - current.minXP) / (next.minXP - current.minXP)) * 100;
  return { current: current.rank, next: next.rank, progress, needed: next.minXP - xp };
}

export const PLATFORM_COLORS: Record<string, string> = {
  LeetCode: '#FFA116',
  GeeksForGeeks: '#2F8D46',
  HackerRank: '#2EC866',
  Codeforces: '#1F8ACB',
  CodeChef: '#5B4638',
  AtCoder: '#222',
  CodingNinjas: '#F0742F',
  InterviewBit: '#3C84CF',
};

export const PLATFORM_URLS: Record<string, string> = {
  LeetCode: 'https://leetcode.com',
  GeeksForGeeks: 'https://www.geeksforgeeks.org',
  HackerRank: 'https://www.hackerrank.com',
  Codeforces: 'https://codeforces.com',
  CodeChef: 'https://www.codechef.com',
  AtCoder: 'https://atcoder.jp',
  CodingNinjas: 'https://www.naukri.com/code360',
  InterviewBit: 'https://www.interviewbit.com',
};
