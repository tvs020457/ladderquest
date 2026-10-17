import { describe, it, expect } from 'vitest';
import { mergeProgress } from '../progressSync';
import { createDefaultProgress } from '../../progress/storage';
import { UserProgressV1 } from '../../progress/types';

describe('Supabase progressSync: mergeProgress', () => {
  const today = '2026-10-17';

  it('merges level progress taking highest stars and union of completed levels', () => {
    const local: UserProgressV1 = {
      ...createDefaultProgress(today),
      xp: 150,
      levels: {
        1: { stars: 2, bestElements: 5, completedOn: '2026-10-15', hintsUsed: 1 },
        2: { stars: 3, bestElements: 3, completedOn: '2026-10-16', hintsUsed: 0 },
      },
    };

    const remote: UserProgressV1 = {
      ...createDefaultProgress(today),
      xp: 220,
      levels: {
        1: { stars: 3, bestElements: 4, completedOn: '2026-10-14', hintsUsed: 0 },
        3: { stars: 2, bestElements: 6, completedOn: '2026-10-16', hintsUsed: 0 },
      },
    };

    const merged = mergeProgress(local, remote);

    // Levels union
    expect(merged.levels[1].stars).toBe(3); // Higher stars from remote
    expect(merged.levels[1].bestElements).toBe(4); // Better element count from remote
    expect(merged.levels[2].stars).toBe(3); // Preserved from local
    expect(merged.levels[3].stars).toBe(2); // Preserved from remote

    // XP
    expect(merged.xp).toBe(220);
  });

  it('merges streak data taking max values and union of active calendar days', () => {
    const local: UserProgressV1 = {
      ...createDefaultProgress(today),
      streak: {
        current: 5,
        best: 10,
        freezes: 1,
        lastActiveDate: '2026-10-17',
        activeDays: ['2026-10-16', '2026-10-17'],
        repairAvailable: false,
        repairProgress: 0,
      },
    };

    const remote: UserProgressV1 = {
      ...createDefaultProgress(today),
      streak: {
        current: 6,
        best: 12,
        freezes: 2,
        lastActiveDate: '2026-10-17',
        activeDays: ['2026-10-15', '2026-10-16'],
        repairAvailable: false,
        repairProgress: 0,
      },
    };

    const merged = mergeProgress(local, remote);

    expect(merged.streak.current).toBe(6);
    expect(merged.streak.best).toBe(12);
    expect(merged.streak.freezes).toBe(2);
    expect(merged.streak.activeDays).toEqual(['2026-10-15', '2026-10-16', '2026-10-17']);
  });

  it('merges badges as a unique set', () => {
    const local: UserProgressV1 = {
      ...createDefaultProgress(today),
      badges: ['streak_3', 'streak_7'],
    };

    const remote: UserProgressV1 = {
      ...createDefaultProgress(today),
      badges: ['streak_7', 'streak_14'],
    };

    const merged = mergeProgress(local, remote);
    expect(merged.badges).toEqual(['streak_3', 'streak_7', 'streak_14']);
  });
});
