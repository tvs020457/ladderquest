import { StreakData } from './types';

/**
 * Parses YYYY-MM-DD into UTC midnight timestamp to avoid DST discrepancies.
 * Safely guards against malformed strings or invalid date numbers.
 */
export function parseDateUTC(dateStr: string): number {
  if (!dateStr || typeof dateStr !== 'string') return 0;
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return 0;
  const [y, m, d] = parts;
  const ts = Date.UTC(y, m - 1, d);
  return Number.isFinite(ts) ? ts : 0;
}

/**
 * Returns number of calendar days between two YYYY-MM-DD strings (date2 - date1).
 * Safely returns 0 if either date string is invalid.
 */
export function getDaysBetween(date1: string, date2: string): number {
  const t1 = parseDateUTC(date1);
  const t2 = parseDateUTC(date2);
  if (!t1 || !t2) return 0;
  const diff = Math.round((t2 - t1) / (24 * 60 * 60 * 1000));
  return Number.isFinite(diff) ? diff : 0;
}

/**
 * Formats a Date object as local YYYY-MM-DD.
 */
export function getTodayString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100];

export function getEligibleMilestoneBadges(currentStreak: number): string[] {
  return STREAK_MILESTONES.filter((m) => currentStreak >= m).map(
    (m) => `streak_${m}`
  );
}

export interface ActivityResult {
  streak: StreakData;
  freezeUsed: boolean;
  streakRepaired: boolean;
  message?: string;
}

function addActiveDay(list: string[], day: string): string[] {
  if (list.includes(day)) return list;
  const updated = [...list, day];
  return updated.length > 365 ? updated.slice(-365) : updated;
}

/**
 * Updates streak upon passing a level or daily challenge on calendar date `today`.
 */
export function recordActivity(
  prev: StreakData,
  today: string
): ActivityResult {
  const streak: StreakData = {
    ...prev,
    activeDays: [...prev.activeDays],
  };

  // First ever day
  if (!streak.lastActiveDate) {
    streak.current = 1;
    streak.best = 1;
    streak.lastActiveDate = today;
    streak.activeDays = [today];
    return {
      streak,
      freezeUsed: false,
      streakRepaired: false,
      message: 'Started your first streak! 🔥 1 Day',
    };
  }

  const daysDiff = getDaysBetween(streak.lastActiveDate, today);

  // Clock moved backwards (travel or manual change)
  if (daysDiff < 0) {
    return {
      streak,
      freezeUsed: false,
      streakRepaired: false,
    };
  }

  // Same day pass
  if (daysDiff === 0) {
    // If streak recently broke and repair is available, check for 2-pass repair
    if (streak.repairAvailable && streak.brokenFromCount && streak.brokenFromCount > 0) {
      streak.repairProgress += 1;
      if (streak.repairProgress >= 2) {
        streak.current = streak.brokenFromCount + 1;
        streak.best = Math.max(streak.best, streak.current);
        streak.repairAvailable = false;
        streak.repairProgress = 0;
        streak.brokenFromCount = undefined;
        return {
          streak,
          freezeUsed: false,
          streakRepaired: true,
          message: `Streak restored! 🔥 ${streak.current} Days`,
        };
      }
    }
    return {
      streak,
      freezeUsed: false,
      streakRepaired: false,
    };
  }

  // Consecutive day (next day)
  if (daysDiff === 1) {
    streak.current += 1;
    streak.best = Math.max(streak.best, streak.current);
    streak.lastActiveDate = today;
    streak.activeDays = addActiveDay(streak.activeDays, today);

    // Award 1 freeze for every 7 days (holds at most 2)
    if (streak.current % 7 === 0 && streak.freezes < 2) {
      streak.freezes = Math.min(2, streak.freezes + 1);
    }

    return {
      streak,
      freezeUsed: false,
      streakRepaired: false,
      message: `Streak extended! 🔥 ${streak.current} Days`,
    };
  }

  // Missed days (daysDiff >= 2)
  const missedDays = daysDiff - 1;

  if (streak.freezes >= missedDays) {
    // Survives via streak freezes!
    streak.freezes -= missedDays;
    streak.current += 1;
    streak.best = Math.max(streak.best, streak.current);
    streak.lastActiveDate = today;
    streak.activeDays = addActiveDay(streak.activeDays, today);

    return {
      streak,
      freezeUsed: true,
      streakRepaired: false,
      message: `Streak saved by a freeze! 🔥 ${streak.current} Days`,
    };
  } else {
    // Streak breaks
    const prevCount = streak.current;
    streak.brokenFromCount = prevCount;
    streak.repairAvailable = true;
    streak.repairProgress = 1; // 1 pass completed today
    streak.current = 1;
    streak.lastActiveDate = today;
    streak.activeDays = addActiveDay(streak.activeDays, today);

    return {
      streak,
      freezeUsed: false,
      streakRepaired: false,
      message: 'Streak broken, but you can repair it by passing 1 more level today!',
    };
  }
}
