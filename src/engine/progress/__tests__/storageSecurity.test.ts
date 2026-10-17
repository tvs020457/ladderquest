import { describe, it, expect, beforeEach } from 'vitest';
import {
  sanitizeUserProgress,
  importProgressFromJson,
  loadUserProgress,
  STORAGE_KEY,
} from '../storage';
import { parseDateUTC, getDaysBetween } from '../streak';

describe('Storage & Security Sanitization', () => {
  let mockStore: Record<string, string> = {};

  beforeEach(() => {
    mockStore = {};
    const mockLocalStorage = {
      getItem: (key: string) => mockStore[key] ?? null,
      setItem: (key: string, val: string) => {
        mockStore[key] = String(val);
      },
      removeItem: (key: string) => {
        delete mockStore[key];
      },
      clear: () => {
        mockStore = {};
      },
    };

    Object.defineProperty(globalThis, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
      configurable: true,
    });
  });

  it('rejects invalid JSON string in importProgressFromJson', () => {
    expect(importProgressFromJson('not a json')).toBeNull();
    expect(importProgressFromJson('{ malformed }')).toBeNull();
    expect(importProgressFromJson('')).toBeNull();
  });

  it('rejects payloads exceeding 500KB', () => {
    const hugePayload = 'a'.repeat(500_001);
    expect(importProgressFromJson(hugePayload)).toBeNull();
  });

  it('blocks prototype pollution payload', () => {
    const maliciousJson = JSON.stringify({
      version: 1,
      xp: 100,
      __proto__: { polluted: 'attacker_value' },
      constructor: { prototype: { admin: true } },
      levels: {
        __proto__: { injected: true },
        1: { stars: 3, bestElements: 2, completedOn: '2026-10-17', hintsUsed: 0 },
      },
    });

    const sanitized = importProgressFromJson(maliciousJson);
    expect(sanitized).not.toBeNull();
    expect((Object.prototype as any).polluted).toBeUndefined();
    expect((Object.prototype as any).admin).toBeUndefined();
    expect((Object.prototype as any).injected).toBeUndefined();
    expect(sanitized?.xp).toBe(100);
  });

  it('recovers safely from missing quest items without crashing', () => {
    const brokenJson = JSON.stringify({
      version: 1,
      xp: 50,
      streak: { current: 3, best: 3 },
      quests: { date: '2026-10-17', items: null }, // Malformed items array
    });

    const sanitized = importProgressFromJson(brokenJson);
    expect(sanitized).not.toBeNull();
    expect(Array.isArray(sanitized?.quests.items)).toBe(true);
    expect(sanitized?.quests.items.length).toBeGreaterThan(0);
  });

  it('sanitizes negative, NaN, and Infinity XP/streak numbers', () => {
    const badNumbers = {
      version: 1,
      xp: -500,
      streak: {
        current: -10,
        best: -5,
        freezes: 999, // Exceeds max 2
      },
    };

    const sanitized = sanitizeUserProgress(badNumbers, '2026-10-17');
    expect(sanitized).not.toBeNull();
    expect(sanitized?.xp).toBe(0);
    expect(sanitized?.streak.current).toBe(0);
    expect(sanitized?.streak.best).toBe(0);
    expect(sanitized?.streak.freezes).toBe(2); // Clamped to max 2
  });

  it('safely recovers in loadUserProgress when localStorage is corrupted', () => {
    localStorage.setItem(STORAGE_KEY, '{"version": 1, "quests": null, "levels": "broken"}');

    const loaded = loadUserProgress('2026-10-17');
    expect(loaded).toBeDefined();
    expect(loaded.version).toBe(1);
    expect(Array.isArray(loaded.quests.items)).toBe(true);
    expect(typeof loaded.levels).toBe('object');
  });

  it('handles malformed date strings in streak without NaN propagation', () => {
    expect(parseDateUTC('')).toBe(0);
    expect(parseDateUTC('invalid-date')).toBe(0);
    expect(parseDateUTC('2026-abc-def')).toBe(0);

    expect(getDaysBetween('invalid', '2026-10-17')).toBe(0);
    expect(getDaysBetween('2026-10-16', 'invalid')).toBe(0);
    expect(getDaysBetween('2026-10-16', '2026-10-17')).toBe(1);
  });
});
