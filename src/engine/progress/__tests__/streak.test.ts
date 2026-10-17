import { describe, it, expect } from 'vitest';
import { recordActivity } from '../streak';
import { StreakData } from '../types';

describe('Streak Engine Edge Cases (Part 9.1 Rules)', () => {
  const initialStreak: StreakData = {
    current: 0,
    best: 0,
    lastActiveDate: null,
    freezes: 0,
    activeDays: [],
    repairAvailable: false,
    repairProgress: 0,
  };

  it('1. First ever day: starts streak at 1', () => {
    const res = recordActivity(initialStreak, '2026-10-15');
    expect(res.streak.current).toBe(1);
    expect(res.streak.best).toBe(1);
    expect(res.streak.lastActiveDate).toBe('2026-10-15');
    expect(res.streak.activeDays).toEqual(['2026-10-15']);
  });

  it('2. Two passes on the same day count once', () => {
    const day1 = recordActivity(initialStreak, '2026-10-15').streak;
    const pass2 = recordActivity(day1, '2026-10-15');

    expect(pass2.streak.current).toBe(1);
    expect(pass2.streak.activeDays).toEqual(['2026-10-15']);
  });

  it('3. Consecutive days increment streak', () => {
    let s = recordActivity(initialStreak, '2026-10-15').streak;
    s = recordActivity(s, '2026-10-16').streak;
    s = recordActivity(s, '2026-10-17').streak;

    expect(s.current).toBe(3);
    expect(s.best).toBe(3);
    expect(s.activeDays).toEqual(['2026-10-15', '2026-10-16', '2026-10-17']);
  });

  it('4. Missed day with a freeze: freeze is used and streak survives', () => {
    let s = recordActivity(initialStreak, '2026-10-15').streak;
    s.freezes = 1; // Learner has 1 freeze

    // Missed 2026-10-16. Next pass on 2026-10-17 (2 days later)
    const res = recordActivity(s, '2026-10-17');

    expect(res.freezeUsed).toBe(true);
    expect(res.streak.current).toBe(2);
    expect(res.streak.freezes).toBe(0); // Freeze consumed
    expect(res.message).toContain('saved by a freeze');
  });

  it('5. Missed day without a freeze: streak breaks, but enables free repair', () => {
    let s = recordActivity(initialStreak, '2026-10-15').streak;
    s.current = 5;
    s.best = 5;
    s.freezes = 0; // No freezes

    // Missed 2026-10-16. Pass on 2026-10-17
    const res = recordActivity(s, '2026-10-17');

    expect(res.freezeUsed).toBe(false);
    expect(res.streak.current).toBe(1);
    expect(res.streak.best).toBe(5); // Best streak preserved!
    expect(res.streak.repairAvailable).toBe(true);
    expect(res.streak.brokenFromCount).toBe(5);
  });

  it('6. Free repair: passing 2 levels in 1 day restores broken streak', () => {
    let s: StreakData = {
      current: 1,
      best: 10,
      lastActiveDate: '2026-10-17',
      freezes: 0,
      activeDays: ['2026-10-15', '2026-10-17'],
      repairAvailable: true,
      repairProgress: 1, // 1st pass already recorded
      brokenFromCount: 10,
    };

    // 2nd pass on the same day completes the repair!
    const res = recordActivity(s, '2026-10-17');

    expect(res.streakRepaired).toBe(true);
    expect(res.streak.current).toBe(11); // Restored from 10 + 1!
    expect(res.streak.repairAvailable).toBe(false);
  });

  it('7. Two missed days in a row consumes 2 freezes if held', () => {
    let s = recordActivity(initialStreak, '2026-10-10').streak;
    s.freezes = 2; // Holds 2 freezes

    // Missed 11 and 12. Active on 13 (3 days later)
    const res = recordActivity(s, '2026-10-13');

    expect(res.freezeUsed).toBe(true);
    expect(res.streak.freezes).toBe(0);
    expect(res.streak.current).toBe(2);
  });

  it('8. Clock moves backwards: never reduces a streak', () => {
    let s: StreakData = {
      current: 4,
      best: 4,
      lastActiveDate: '2026-10-20',
      freezes: 1,
      activeDays: ['2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20'],
      repairAvailable: false,
      repairProgress: 0,
    };

    // User travels back in time or adjusts clock to yesterday
    const res = recordActivity(s, '2026-10-19');

    expect(res.streak.current).toBe(4);
    expect(res.streak.lastActiveDate).toBe('2026-10-20');
  });

  it('9. Earns 1 freeze every 7 days (maximum 2)', () => {
    let s = { ...initialStreak };
    for (let day = 1; day <= 14; day++) {
      const dateStr = `2026-10-${String(day).padStart(2, '0')}`;
      s = recordActivity(s, dateStr).streak;
    }

    expect(s.current).toBe(14);
    expect(s.freezes).toBe(2); // 1 at day 7, 1 at day 14 -> capped at 2
  });
});
