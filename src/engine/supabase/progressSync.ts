import { UserProgressV1 } from '../progress/types';
import { sanitizeUserProgress } from '../progress/storage';
import { getSupabaseClient } from './client';

export interface SyncResult {
  success: boolean;
  progress?: UserProgressV1;
  error?: string;
  source?: 'remote' | 'local' | 'merged';
}

/**
 * Merges local and remote user progress safely to never lose completed levels or stars.
 */
export function mergeProgress(local: UserProgressV1, remote: UserProgressV1): UserProgressV1 {
  // 1. Levels merge: highest stars, best element count, union of completed levels
  const mergedLevels: Record<number, any> = { ...local.levels };
  for (const [keyStr, remoteLvl] of Object.entries(remote.levels || {})) {
    const id = Number(keyStr);
    const localLvl = mergedLevels[id];
    if (!localLvl) {
      mergedLevels[id] = remoteLvl;
    } else {
      mergedLevels[id] = {
        stars: Math.max(localLvl.stars ?? 1, remoteLvl.stars ?? 1),
        bestElements: Math.min(localLvl.bestElements ?? 999, remoteLvl.bestElements ?? 999),
        completedOn: localLvl.completedOn || remoteLvl.completedOn,
        hintsUsed: Math.min(localLvl.hintsUsed ?? 0, remoteLvl.hintsUsed ?? 0),
      };
    }
  }

  // 2. Badges merge: unique union
  const mergedBadges = Array.from(new Set([...(local.badges || []), ...(remote.badges || [])]));

  // 3. XP: maximum
  const mergedXp = Math.max(local.xp || 0, remote.xp || 0);

  // 4. Streak: pick higher current streak or higher best streak
  const activeDaysSet = new Set([...(local.streak?.activeDays || []), ...(remote.streak?.activeDays || [])]);
  const activeDaysList = Array.from(activeDaysSet).sort().slice(-365);

  const mergedStreak = {
    current: Math.max(local.streak?.current || 0, remote.streak?.current || 0),
    best: Math.max(local.streak?.best || 0, remote.streak?.best || 0),
    freezes: Math.max(local.streak?.freezes || 0, remote.streak?.freezes || 0),
    lastActiveDate:
      (local.streak?.lastActiveDate && remote.streak?.lastActiveDate)
        ? (local.streak.lastActiveDate > remote.streak.lastActiveDate ? local.streak.lastActiveDate : remote.streak.lastActiveDate)
        : (local.streak?.lastActiveDate || remote.streak?.lastActiveDate || null),
    activeDays: activeDaysList,
    repairAvailable: local.streak?.repairAvailable || remote.streak?.repairAvailable || false,
    repairProgress: Math.max(local.streak?.repairProgress || 0, remote.streak?.repairProgress || 0),
  };

  // 5. Quests and daily challenge: prefer whichever has more progress if date matches
  const mergedQuests = local.quests?.date === remote.quests?.date && remote.quests
    ? {
        ...local.quests,
        chestClaimed: local.quests.chestClaimed || remote.quests.chestClaimed,
      }
    : local.quests;

  const mergedDailyChallenge = local.dailyChallenge?.date === remote.dailyChallenge?.date && remote.dailyChallenge
    ? {
        ...local.dailyChallenge,
        completed: local.dailyChallenge.completed || remote.dailyChallenge.completed,
      }
    : local.dailyChallenge;

  const candidate: UserProgressV1 = {
    version: 1,
    xp: mergedXp,
    streak: mergedStreak,
    quests: mergedQuests,
    weekly: local.weekly.progress >= (remote.weekly?.progress ?? 0) ? local.weekly : remote.weekly,
    dailyChallenge: mergedDailyChallenge,
    levels: mergedLevels,
    badges: mergedBadges,
    cosmetics: local.cosmetics || remote.cosmetics || { equipped: 'none', unlocked: ['none'] },
    settings: { ...local.settings, ...remote.settings },
  };

  return sanitizeUserProgress(candidate) ?? local;
}

/**
 * Downloads user progress from Supabase.
 */
export async function fetchRemoteProgress(userId: string): Promise<UserProgressV1 | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('progress_data, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.warn('Error fetching remote progress from Supabase:', error.message);
      return null;
    }

    if (!data?.progress_data) return null;

    return sanitizeUserProgress(data.progress_data);
  } catch (err) {
    console.warn('Network error fetching remote progress:', err);
    return null;
  }
}

/**
 * Uploads user progress to Supabase `user_progress` table via upsert.
 */
export async function uploadRemoteProgress(userId: string, progress: UserProgressV1): Promise<SyncResult> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: false, error: 'Supabase client not initialized' };
  }

  try {
    const clean = sanitizeUserProgress(progress);
    if (!clean) {
      return { success: false, error: 'Progress validation failed' };
    }

    const { error } = await supabase
      .from('user_progress')
      .upsert(
        {
          user_id: userId,
          progress_data: clean,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

    if (error) {
      console.error('Supabase upsert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, progress: clean, source: 'remote' };
  } catch (err: any) {
    console.error('Supabase progress upload failed:', err);
    return { success: false, error: err?.message || 'Network sync failed' };
  }
}
