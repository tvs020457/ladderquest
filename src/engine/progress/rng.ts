/**
 * Deterministic PRNG using Mulberry32, seeded by string or number.
 * Ensures the exact same date gives the same daily quests and daily challenge.
 */

export function hashStringToSeed(str: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

export function createRng(seedInput: string | number): () => number {
  let s = typeof seedInput === 'number' ? seedInput >>> 0 : hashStringToSeed(seedInput);

  return function mulberry32() {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seededChoice<T>(list: T[], rng: () => number): T {
  const index = Math.floor(rng() * list.length);
  return list[index];
}

export function seededShuffle<T>(array: T[], rng: () => number): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
