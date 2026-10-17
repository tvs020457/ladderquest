import { describe, it, expect } from 'vitest';
import { generateDailyChallenge } from '../dailyChallenge';

describe('Daily Challenge Engine', () => {
  it('generates the EXACT same challenge for the same date', () => {
    const c1 = generateDailyChallenge('2026-10-17');
    const c2 = generateDailyChallenge('2026-10-17');

    expect(c1.faultType).toBe(c2.faultType);
    expect(c1.level.id).toBe(c2.level.id);
    expect(c1.initialWires).toEqual(c2.initialWires);
  });

  it('injects exactly one deterministic fault into the circuit', () => {
    const challenge = generateDailyChallenge('2026-10-17');

    expect(['broken_wire', 'swapped_contact', 'bypass_wire']).toContain(challenge.faultType);
    expect(challenge.faultExplanation).toBeTruthy();
    expect(challenge.level.title).toContain('Daily Challenge');
  });
});
