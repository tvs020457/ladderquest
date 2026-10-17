import { LevelDefinition, WireDef } from '../../levels/types';
import { getLevel } from '../../levels';
import { createRng } from './rng';

export interface DailyChallengePuzzle {
  date: string;
  level: LevelDefinition;
  faultType: 'broken_wire' | 'swapped_contact' | 'bypass_wire';
  faultExplanation: string;
  initialWires: WireDef[];
}

/**
 * Deterministically generates today's Daily Challenge by taking a base level
 * (Levels 1 to 8) and injecting exactly one fault.
 */
export function generateDailyChallenge(dateStr: string): DailyChallengePuzzle {
  const rng = createRng(`challenge_${dateStr}`);

  // Pick base level (1 to 8)
  const baseLevelId = 1 + Math.floor(rng() * 8);
  const baseLevel = JSON.parse(JSON.stringify(getLevel(baseLevelId)!)) as LevelDefinition;

  // Decide fault type
  const faultChoices: ('broken_wire' | 'swapped_contact' | 'bypass_wire')[] = [
    'broken_wire',
    'swapped_contact',
    'bypass_wire',
  ];
  const faultType = faultChoices[Math.floor(rng() * faultChoices.length)];

  const referenceWires: WireDef[] = baseLevel.expectedExactWires && baseLevel.expectedExactWires.length > 0
    ? [...baseLevel.expectedExactWires]
    : baseLevel.initialWires.length > 0
    ? [...baseLevel.initialWires]
    : [
        { id: 'w1', from: 'L', to: `${baseLevel.initialParts[0]?.id}:in` },
        { id: 'w2', from: `${baseLevel.initialParts[0]?.id}:out`, to: `${baseLevel.initialParts[1]?.id}:in` },
        { id: 'w3', from: `${baseLevel.initialParts[1]?.id}:out`, to: 'R' },
      ];

  let challengeWires: WireDef[] = [...referenceWires];
  let faultExplanation = '';

  if (faultType === 'broken_wire') {
    // Break / remove one wire
    if (challengeWires.length > 0) {
      const breakIdx = Math.floor(rng() * challengeWires.length);
      challengeWires.splice(breakIdx, 1);
    }
    faultExplanation = 'One broken wire was found in the control circuit. Find the open circuit and reconnect it!';
  } else if (faultType === 'swapped_contact') {
    // Invert a contact from XIC to XIO or vice versa
    const contact = baseLevel.initialParts.find((p) => p.type === 'XIC' || p.type === 'XIO' || p.type === 'SWITCH');
    if (contact) {
      contact.type = contact.type === 'XIO' ? 'XIC' : 'XIO';
    }
    faultExplanation = 'A contact has the wrong state type (normally open vs normally closed). Correct the wiring!';
  } else if (faultType === 'bypass_wire') {
    // Add a bypass wire directly around a component
    if (baseLevel.initialParts.length > 0) {
      const part = baseLevel.initialParts[0];
      challengeWires.push({
        id: 'bypass_fault',
        from: `${part.id}:in`,
        to: `${part.id}:out`,
      });
    }
    faultExplanation = 'A sneak circuit / bypass jumper is shorting across a contact. Locate and remove the faulty wire!';
  }

  return {
    date: dateStr,
    level: {
      ...baseLevel,
      title: `Daily Challenge (${dateStr})`,
      story: faultExplanation,
      initialWires: challengeWires,
    },
    faultType,
    faultExplanation,
    initialWires: challengeWires,
  };
}
