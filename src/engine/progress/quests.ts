import { DailyQuestItem, DailyQuestsState, WeeklyQuestState } from './types';
import { createRng, seededShuffle } from './rng';

export const QUEST_TEMPLATE_POOL: Omit<DailyQuestItem, 'progress' | 'done'>[] = [
  {
    id: 'pass_2_levels',
    type: 'pass_levels',
    title: 'Level Master',
    description: 'Pass 2 levels or challenges',
    target: 2,
    xpReward: 20,
  },
  {
    id: 'earn_35_xp',
    type: 'earn_xp',
    title: 'XP Hunter',
    description: 'Earn 35 XP from learning',
    target: 35,
    xpReward: 25,
  },
  {
    id: 'pass_no_hints',
    type: 'no_hints',
    title: 'Self Reliant',
    description: 'Pass a level without using any hints',
    target: 1,
    xpReward: 25,
  },
  {
    id: 'earn_3_stars',
    type: 'perfect_stars',
    title: 'Precision Wiring',
    description: 'Earn 3 stars on any level',
    target: 1,
    xpReward: 30,
  },
  {
    id: 'daily_challenge',
    type: 'complete_daily_challenge',
    title: 'Challenge Tackler',
    description: "Complete today's daily challenge",
    target: 1,
    xpReward: 30,
  },
];

/**
 * Returns the YYYY-MM-DD string for Monday of the given week.
 */
export function getMondayOfWeek(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay(); // 0 is Sun, 1 is Mon...
  const diff = (day === 0 ? -6 : 1) - day;
  date.setDate(date.getDate() + diff);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayStr = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayStr}`;
}

/**
 * Generates the deterministic 3 daily quests for a given date.
 */
export function generateDailyQuests(dateStr: string): DailyQuestsState {
  const rng = createRng(`quests_${dateStr}`);
  const shuffled = seededShuffle(QUEST_TEMPLATE_POOL, rng);
  const selected = shuffled.slice(0, 3);

  const items: DailyQuestItem[] = selected.map((tpl) => ({
    ...tpl,
    progress: 0,
    done: false,
  }));

  return {
    date: dateStr,
    items,
    chestClaimed: false,
  };
}

/**
 * Generates the weekly quest starting on the Monday of the date's week.
 */
export function generateWeeklyQuest(dateStr: string): WeeklyQuestState {
  const weekMonday = getMondayOfWeek(dateStr);
  return {
    weekStart: weekMonday,
    target: 10,
    progress: 0,
    claimed: false,
    xpReward: 100,
  };
}

/**
 * Updates daily quests on user activity (level passed, XP earned, hints used, etc.).
 */
export function updateQuestsOnActivity(
  currentQuests: DailyQuestsState,
  activity: {
    xpEarned?: number;
    levelPassed?: boolean;
    hintsUsed?: number;
    starsEarned?: number;
    isDailyChallenge?: boolean;
  }
): { updatedQuests: DailyQuestsState; newlyCompletedCount: number } {
  let newlyCompletedCount = 0;

  const items = currentQuests.items.map((q) => {
    if (q.done) return q;

    let nextProgress = q.progress;

    if (q.type === 'pass_levels' && activity.levelPassed) {
      nextProgress += 1;
    } else if (q.type === 'earn_xp' && activity.xpEarned) {
      nextProgress += activity.xpEarned;
    } else if (q.type === 'no_hints' && activity.levelPassed && activity.hintsUsed === 0) {
      nextProgress += 1;
    } else if (q.type === 'perfect_stars' && (activity.starsEarned ?? 0) >= 3) {
      nextProgress += 1;
    } else if (q.type === 'complete_daily_challenge' && activity.isDailyChallenge) {
      nextProgress += 1;
    }

    const isNowDone = nextProgress >= q.target;
    if (isNowDone && !q.done) {
      newlyCompletedCount += 1;
    }

    return {
      ...q,
      progress: Math.min(q.target, nextProgress),
      done: isNowDone,
    };
  });

  return {
    updatedQuests: {
      ...currentQuests,
      items,
    },
    newlyCompletedCount,
  };
}
