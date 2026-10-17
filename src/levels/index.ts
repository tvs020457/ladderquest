import { LevelDefinition } from './types';

import l1 from './data/level_01.json';
import l2 from './data/level_02.json';
import l3 from './data/level_03.json';
import l4 from './data/level_04.json';
import l5 from './data/level_05.json';
import l6 from './data/level_06.json';
import l7 from './data/level_07.json';
import l8 from './data/level_08.json';
import l9 from './data/level_09.json';
import l10 from './data/level_10.json';
import l11 from './data/level_11.json';
import l12 from './data/level_12.json';
import l13 from './data/level_13.json';
import l14 from './data/level_14.json';
import l15 from './data/level_15.json';
import l16 from './data/level_16.json';
import l17 from './data/level_17.json';
import l18 from './data/level_18.json';
import l19 from './data/level_19.json';
import l20 from './data/level_20.json';
import l21 from './data/level_21.json';
import l22 from './data/level_22.json';
import l23 from './data/level_23.json';
import l24 from './data/level_24.json';
import l25 from './data/level_25.json';
import l26 from './data/level_26.json';
import l27 from './data/level_27.json';
import l28 from './data/level_28.json';
import l29 from './data/level_29.json';
import l30 from './data/level_30.json';

export const UNITS = [
  { id: 1, title: 'First Connections', levelRange: [1, 4] },
  { id: 2, title: 'Contacts', levelRange: [5, 8] },
  { id: 3, title: 'Find the Fault', levelRange: [9, 13] },
  { id: 4, title: 'Building Blocks', levelRange: [14, 20] },
  { id: 5, title: 'Memory', levelRange: [21, 25] },
  { id: 6, title: 'Timing', levelRange: [26, 27] },
  { id: 7, title: 'Counting', levelRange: [28, 28] },
  { id: 8, title: 'Sequences', levelRange: [29, 30] },
];

const levelMap: Record<number, LevelDefinition> = {
  1: l1 as unknown as LevelDefinition,
  2: l2 as unknown as LevelDefinition,
  3: l3 as unknown as LevelDefinition,
  4: l4 as unknown as LevelDefinition,
  5: l5 as unknown as LevelDefinition,
  6: l6 as unknown as LevelDefinition,
  7: l7 as unknown as LevelDefinition,
  8: l8 as unknown as LevelDefinition,
  9: l9 as unknown as LevelDefinition,
  10: l10 as unknown as LevelDefinition,
  11: l11 as unknown as LevelDefinition,
  12: l12 as unknown as LevelDefinition,
  13: l13 as unknown as LevelDefinition,
  14: l14 as unknown as LevelDefinition,
  15: l15 as unknown as LevelDefinition,
  16: l16 as unknown as LevelDefinition,
  17: l17 as unknown as LevelDefinition,
  18: l18 as unknown as LevelDefinition,
  19: l19 as unknown as LevelDefinition,
  20: l20 as unknown as LevelDefinition,
  21: l21 as unknown as LevelDefinition,
  22: l22 as unknown as LevelDefinition,
  23: l23 as unknown as LevelDefinition,
  24: l24 as unknown as LevelDefinition,
  25: l25 as unknown as LevelDefinition,
  26: l26 as unknown as LevelDefinition,
  27: l27 as unknown as LevelDefinition,
  28: l28 as unknown as LevelDefinition,
  29: l29 as unknown as LevelDefinition,
  30: l30 as unknown as LevelDefinition,
};

export function getLevel(id: number): LevelDefinition | undefined {
  return levelMap[id];
}

export function getAllLoadedLevels(): LevelDefinition[] {
  return Object.values(levelMap).sort((a, b) => a.id - b.id);
}
