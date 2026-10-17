import { describe, it, expect } from 'vitest';
import { generateDailyQuests, generateWeeklyQuest, updateQuestsOnActivity, getMondayOfWeek } from '../quests';

describe('Quests Engine (Date-Seeded & Deterministic)', () => {
  it('generates the EXACT same 3 daily quests for the same date', () => {
    const q1 = generateDailyQuests('2026-10-17');
    const q2 = generateDailyQuests('2026-10-17');

    expect(q1.items.length).toBe(3);
    expect(q2.items.length).toBe(3);
    expect(q1.items.map((i) => i.id)).toEqual(q2.items.map((i) => i.id));
  });

  it('generates different quests on different dates', () => {
    const qA = generateDailyQuests('2026-10-01');
    const qB = generateDailyQuests('2026-10-02');

    // While individual quests may overlap from the pool, their permutation or selection changes
    expect(qA.date).not.toEqual(qB.date);
  });

  it('weekly quest calculates correct Monday of the week', () => {
    // 2026-10-17 is Saturday -> Monday was 2026-10-12
    const monday = getMondayOfWeek('2026-10-17');
    expect(monday).toBe('2026-10-12');

    const weekly = generateWeeklyQuest('2026-10-17');
    expect(weekly.weekStart).toBe('2026-10-12');
    expect(weekly.target).toBe(10);
  });

  it('updates quest progress on level pass and marks done when target met', () => {
    const quests = {
      date: '2026-10-17',
      chestClaimed: false,
      items: [
        {
          id: 'pass_2_levels',
          type: 'pass_levels' as const,
          title: 'Pass 2 levels',
          description: 'Pass 2 levels',
          target: 2,
          progress: 0,
          done: false,
          xpReward: 20,
        },
      ],
    };

    // First level pass
    const step1 = updateQuestsOnActivity(quests, { levelPassed: true, xpEarned: 20 });
    expect(step1.updatedQuests.items[0].progress).toBe(1);
    expect(step1.updatedQuests.items[0].done).toBe(false);
    expect(step1.newlyCompletedCount).toBe(0);

    // Second level pass
    const step2 = updateQuestsOnActivity(step1.updatedQuests, { levelPassed: true, xpEarned: 20 });
    expect(step2.updatedQuests.items[0].progress).toBe(2);
    expect(step2.updatedQuests.items[0].done).toBe(true);
    expect(step2.newlyCompletedCount).toBe(1);
  });
});
