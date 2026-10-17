import { UserProgressV1 } from './types';
import { generateDailyQuests, generateWeeklyQuest } from './quests';
import { getTodayString } from './streak';

export const STORAGE_KEY = 'ladderquest_progress_v1';

export function createDefaultProgress(today: string = getTodayString()): UserProgressV1 {
  return {
    version: 1,
    xp: 0,
    streak: {
      current: 0,
      best: 0,
      lastActiveDate: null,
      freezes: 0,
      activeDays: [],
      repairAvailable: false,
      repairProgress: 0,
    },
    quests: generateDailyQuests(today),
    weekly: generateWeeklyQuest(today),
    dailyChallenge: {
      date: today,
      completed: false,
    },
    levels: {},
    badges: [],
    cosmetics: {
      owned: ['none'],
      equipped: 'none',
    },
    settings: {
      soundEnabled: false,
      hideStreakUi: false,
    },
  };
}

/**
/**
 * Sanitizes and validates an arbitrary object against the UserProgressV1 schema.
 * Discards prototype pollution keys, bounds numbers to valid non-negative ranges,
 * ensures required arrays/objects exist, and returns clean structured data.
 */
export function sanitizeUserProgress(raw: any, today: string = getTodayString()): UserProgressV1 | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return null;
  }
  if (raw.version !== 1) {
    return null;
  }

  const defaultProgress = createDefaultProgress(today);

  // Validate XP
  const xp = typeof raw.xp === 'number' && Number.isFinite(raw.xp) && raw.xp >= 0
    ? Math.floor(raw.xp)
    : 0;

  // Validate streak
  const rawStreak = typeof raw.streak === 'object' && raw.streak !== null && !Array.isArray(raw.streak) ? raw.streak : {};
  const currentStreak = typeof rawStreak.current === 'number' && Number.isFinite(rawStreak.current) && rawStreak.current >= 0
    ? Math.floor(rawStreak.current)
    : 0;
  const bestStreak = typeof rawStreak.best === 'number' && Number.isFinite(rawStreak.best) && rawStreak.best >= 0
    ? Math.max(currentStreak, Math.floor(rawStreak.best))
    : currentStreak;
  const freezes = typeof rawStreak.freezes === 'number' && Number.isFinite(rawStreak.freezes)
    ? Math.max(0, Math.min(2, Math.floor(rawStreak.freezes)))
    : 0;
  const lastActiveDate = typeof rawStreak.lastActiveDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawStreak.lastActiveDate)
    ? rawStreak.lastActiveDate
    : null;
  const activeDays = Array.isArray(rawStreak.activeDays)
    ? rawStreak.activeDays
        .filter((d: any) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d))
        .slice(-365)
    : [];

  const streak = {
    current: currentStreak,
    best: bestStreak,
    lastActiveDate,
    freezes,
    activeDays,
    repairAvailable: Boolean(rawStreak.repairAvailable),
    repairProgress: typeof rawStreak.repairProgress === 'number' && Number.isFinite(rawStreak.repairProgress)
      ? Math.max(0, Math.floor(rawStreak.repairProgress))
      : 0,
    brokenFromCount: typeof rawStreak.brokenFromCount === 'number' && Number.isFinite(rawStreak.brokenFromCount)
      ? Math.max(0, Math.floor(rawStreak.brokenFromCount))
      : undefined,
  };

  // Validate quests
  let quests = defaultProgress.quests;
  if (
    typeof raw.quests === 'object' &&
    raw.quests !== null &&
    !Array.isArray(raw.quests) &&
    raw.quests.date === today &&
    Array.isArray(raw.quests.items) &&
    raw.quests.items.length > 0
  ) {
    const validItems = raw.quests.items
      .filter((q: any) => q && typeof q === 'object' && typeof q.id === 'string' && typeof q.type === 'string')
      .map((q: any) => ({
        id: String(q.id).slice(0, 50),
        type: q.type,
        title: typeof q.title === 'string' ? q.title.slice(0, 100) : 'Daily Quest',
        description: typeof q.description === 'string' ? q.description.slice(0, 200) : '',
        target: typeof q.target === 'number' && Number.isFinite(q.target) ? Math.max(1, q.target) : 1,
        progress: typeof q.progress === 'number' && Number.isFinite(q.progress) ? Math.max(0, q.progress) : 0,
        done: Boolean(q.done),
        xpReward: typeof q.xpReward === 'number' && Number.isFinite(q.xpReward) ? Math.max(0, q.xpReward) : 20,
      }));
    if (validItems.length > 0) {
      quests = {
        date: today,
        items: validItems,
        chestClaimed: Boolean(raw.quests.chestClaimed),
      };
    }
  }

  // Validate weekly
  let weekly = defaultProgress.weekly;
  if (
    typeof raw.weekly === 'object' &&
    raw.weekly !== null &&
    !Array.isArray(raw.weekly) &&
    typeof raw.weekly.weekStart === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(raw.weekly.weekStart)
  ) {
    weekly = {
      weekStart: raw.weekly.weekStart,
      target: typeof raw.weekly.target === 'number' && Number.isFinite(raw.weekly.target) ? Math.max(1, raw.weekly.target) : 10,
      progress: typeof raw.weekly.progress === 'number' && Number.isFinite(raw.weekly.progress) ? Math.max(0, raw.weekly.progress) : 0,
      claimed: Boolean(raw.weekly.claimed),
      xpReward: typeof raw.weekly.xpReward === 'number' && Number.isFinite(raw.weekly.xpReward) ? Math.max(0, raw.weekly.xpReward) : 100,
    };
  }

  // Validate dailyChallenge
  let dailyChallenge = defaultProgress.dailyChallenge;
  if (
    typeof raw.dailyChallenge === 'object' &&
    raw.dailyChallenge !== null &&
    !Array.isArray(raw.dailyChallenge)
  ) {
    dailyChallenge = {
      date: typeof raw.dailyChallenge.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.dailyChallenge.date)
        ? raw.dailyChallenge.date
        : today,
      completed: Boolean(raw.dailyChallenge.completed),
    };
    if (dailyChallenge.date !== today) {
      dailyChallenge = { date: today, completed: false };
    }
  }

  // Validate levels (plain object, numeric keys)
  const levels: Record<number, any> = {};
  if (typeof raw.levels === 'object' && raw.levels !== null && !Array.isArray(raw.levels)) {
    for (const [key, val] of Object.entries(raw.levels)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      const numKey = Number(key);
      if (Number.isInteger(numKey) && numKey >= 1 && numKey <= 100 && val && typeof val === 'object') {
        const rVal = val as any;
        levels[numKey] = {
          stars: typeof rVal.stars === 'number' ? Math.max(1, Math.min(3, Math.floor(rVal.stars))) : 1,
          bestElements: typeof rVal.bestElements === 'number' && Number.isFinite(rVal.bestElements) ? Math.max(0, rVal.bestElements) : 0,
          completedOn: typeof rVal.completedOn === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rVal.completedOn) ? rVal.completedOn : today,
          hintsUsed: typeof rVal.hintsUsed === 'number' && Number.isFinite(rVal.hintsUsed) ? Math.max(0, rVal.hintsUsed) : 0,
        };
      }
    }
  }

  // Validate badges
  const badges = Array.isArray(raw.badges)
    ? raw.badges.filter((b: any) => typeof b === 'string' && b.length < 50)
    : [];

  // Validate cosmetics
  const rawCosmetics = typeof raw.cosmetics === 'object' && raw.cosmetics !== null && !Array.isArray(raw.cosmetics) ? raw.cosmetics : {};
  const ownedCosmetics = Array.isArray(rawCosmetics.owned)
    ? rawCosmetics.owned.filter((c: any) => typeof c === 'string')
    : ['none'];
  if (!ownedCosmetics.includes('none')) ownedCosmetics.push('none');
  const equipped = typeof rawCosmetics.equipped === 'string' && ownedCosmetics.includes(rawCosmetics.equipped)
    ? rawCosmetics.equipped
    : 'none';

  // Validate settings
  const rawSettings = typeof raw.settings === 'object' && raw.settings !== null && !Array.isArray(raw.settings) ? raw.settings : {};
  const settings = {
    soundEnabled: Boolean(rawSettings.soundEnabled),
    hideStreakUi: Boolean(rawSettings.hideStreakUi),
  };

  return {
    version: 1,
    xp,
    streak,
    quests,
    weekly,
    dailyChallenge,
    levels,
    badges,
    cosmetics: {
      owned: ownedCosmetics,
      equipped,
    },
    settings,
  };
}

/**
 * Loads user progress from localStorage wrapped in try/catch.
 * If data is corrupted or missing, safely starts fresh without crashing.
 */
export function loadUserProgress(today: string = getTodayString()): UserProgressV1 {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaultState = createDefaultProgress(today);
      saveUserProgress(defaultState);
      return defaultState;
    }

    const parsed = JSON.parse(raw);
    const sanitized = sanitizeUserProgress(parsed, today);
    if (!sanitized) {
      const defaultState = createDefaultProgress(today);
      saveUserProgress(defaultState);
      return defaultState;
    }

    return sanitized;
  } catch (err) {
    console.warn('Failed to read localStorage, falling back to default:', err);
    return createDefaultProgress(today);
  }
}

/**
 * Saves user progress to localStorage wrapped in try/catch.
 */
export function saveUserProgress(progress: UserProgressV1): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (err) {
    console.warn('Failed to write to localStorage:', err);
    return false;
  }
}

/**
 * Serializes progress for file download (Export).
 */
export function exportProgressToJson(progress: UserProgressV1): string {
  return JSON.stringify(progress, null, 2);
}

/**
 * Parses, validates, and sanitizes an imported JSON string (Import).
 */
export function importProgressFromJson(jsonStr: string): UserProgressV1 | null {
  try {
    if (!jsonStr || typeof jsonStr !== 'string' || jsonStr.length > 500_000) {
      return null;
    }
    const parsed = JSON.parse(jsonStr);
    return sanitizeUserProgress(parsed);
  } catch {
    return null;
  }
}
