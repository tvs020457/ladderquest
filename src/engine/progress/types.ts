export interface StreakData {
  current: number;
  best: number;
  lastActiveDate: string | null;      // YYYY-MM-DD
  freezes: number;                    // 0, 1, or 2
  activeDays: string[];               // Array of YYYY-MM-DD
  repairAvailable: boolean;           // True if free 1-time repair can be used
  repairProgress: number;             // Count of passes on the repair day (0 to 2)
  brokenFromCount?: number;           // Streak count before break (for repair restoration)
}

export type QuestType =
  | 'pass_levels'
  | 'earn_xp'
  | 'no_hints'
  | 'perfect_stars'
  | 'complete_daily_challenge';

export interface DailyQuestItem {
  id: string;
  type: QuestType;
  title: string;
  description: string;
  target: number;
  progress: number;
  done: boolean;
  xpReward: number;
}

export interface DailyQuestsState {
  date: string;                       // YYYY-MM-DD
  items: DailyQuestItem[];
  chestClaimed: boolean;
}

export interface WeeklyQuestState {
  weekStart: string;                  // YYYY-MM-DD (Monday)
  target: number;                     // E.g., 10 levels
  progress: number;
  claimed: boolean;
  xpReward: number;
}

export interface DailyChallengeDef {
  date: string;                       // YYYY-MM-DD
  baseLevelId: number;
  faultType: 'broken_wire' | 'wrong_contact' | 'bypass_wire';
  faultDescription: string;
  title: string;
  story: string;
}

export interface DailyChallengeState {
  date: string;
  completed: boolean;
}

export interface LevelProgressRecord {
  stars: number;
  bestElements: number;
  completedOn: string;
  hintsUsed: number;
}

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface UserProgressV1 {
  version: 1;
  xp: number;
  streak: StreakData;
  quests: DailyQuestsState;
  weekly: WeeklyQuestState;
  dailyChallenge: DailyChallengeState;
  levels: Record<number, LevelProgressRecord>;
  badges: string[];
  cosmetics: {
    owned: string[];
    equipped: string | null;
  };
  settings: {
    soundEnabled: boolean;
    hideStreakUi: boolean;
  };
}
