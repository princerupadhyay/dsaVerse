import type { SpacedRepetitionCard, SRRating, SRRatingLabel } from '../types';

export const SR_RATING_LABELS: Record<SRRatingLabel, SRRating> = {
  forgot: 0,
  hard: 1,
  good: 2,
  easy: 3,
  mastered: 4,
};

export const SR_RATING_CONFIG: Record<SRRatingLabel, {
  label: string;
  description: string;
  color: string;
  bg: string;
  border: string;
  emoji: string;
}> = {
  forgot: {
    label: 'Forgot',
    description: 'Completely blanked',
    color: '#ef4444',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    emoji: '💀',
  },
  hard: {
    label: 'Hard',
    description: 'Barely remembered',
    color: '#f97316',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    emoji: '😓',
  },
  good: {
    label: 'Good',
    description: 'Recalled with effort',
    color: '#00D4FF',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    emoji: '👍',
  },
  easy: {
    label: 'Easy',
    description: 'Recalled smoothly',
    color: '#10B981',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    emoji: '✅',
  },
  mastered: {
    label: 'Mastered',
    description: 'Instant recall',
    color: '#FFD700',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    emoji: '⚡',
  },
};

/** Returns today as a YYYY-MM-DD string */
export function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Returns a YYYY-MM-DD string offset by `days` from today */
export function futureDateStr(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Days overdue (negative means future) */
export function daysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const now = new Date(todayStr());
  return Math.round((due.getTime() - now.getTime()) / 86400000);
}

/** True if the card is due today or earlier */
export function isDue(card: SpacedRepetitionCard): boolean {
  return daysUntilDue(card.dueDate) <= 0;
}

/**
 * SM-2 algorithm.
 * Returns updated interval, easeFactor, and next dueDate.
 *
 * rating:
 *   0 (forgot)   → reset interval to 1, ease penalty
 *   1 (hard)     → reset interval to 1, small ease penalty
 *   2 (good)     → use current interval×easeFactor, tiny ease penalty
 *   3 (easy)     → use current interval×easeFactor, ease stays
 *   4 (mastered) → use current interval×easeFactor, ease bonus
 */
export function applyReview(
  card: SpacedRepetitionCard,
  rating: SRRating
): Pick<SpacedRepetitionCard, 'interval' | 'easeFactor' | 'dueDate' | 'lastReviewDate' | 'lastRating' | 'reviewCount'> {
  const today = todayStr();
  let { interval, easeFactor } = card;

  // SM-2 ease factor update: EF' = EF + (0.1 - (4-q)*(0.08 + (4-q)*0.02))
  const q = rating;
  easeFactor = Math.max(1.3, easeFactor + (0.1 - (4 - q) * (0.08 + (4 - q) * 0.02)));

  if (rating < 2) {
    // Failed — reset
    interval = 1;
  } else if (card.reviewCount === 0) {
    interval = 1;
  } else if (card.reviewCount === 1) {
    interval = 6;
  } else {
    interval = Math.round(interval * easeFactor);
  }

  // Clamp interval to reasonable bounds
  interval = Math.max(1, Math.min(interval, 365));

  return {
    interval,
    easeFactor,
    dueDate: futureDateStr(interval),
    lastReviewDate: today,
    lastRating: rating,
    reviewCount: card.reviewCount + 1,
  };
}

/** Create a brand-new SR card for a problem (first enrolment) */
export function createSRCard(problemId: string): SpacedRepetitionCard {
  return {
    problemId,
    interval: 1,
    easeFactor: 2.5,
    dueDate: futureDateStr(1),
    reviewCount: 0,
    lastReviewDate: todayStr(),
    lastRating: 2,
  };
}

/** XP reward for completing a review session based on average quality */
export function reviewSessionXP(ratings: SRRating[]): number {
  if (ratings.length === 0) return 0;
  const avg = (ratings as number[]).reduce((a, b) => a + b, 0) / ratings.length;
  if (avg >= 3.5) return 50;
  if (avg >= 2.5) return 30;
  if (avg >= 1.5) return 15;
  return 5;
}
