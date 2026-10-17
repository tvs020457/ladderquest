import { PlacedPart, WireDef, LevelDefinition } from '../levels/types';

export interface TopologyCheckResult {
  valid: boolean;
  errorType?: 'SHORT_CIRCUIT' | 'FLOATING_TERMINAL' | 'WRONG_RAIL' | 'EXACT_LAYOUT_MISMATCH';
  message?: string;
  failingComponentId?: string;
  failingTerminalId?: string;
}

export const LOAD_TYPES = new Set([
  'OTE', 'OTL', 'OTU', 'TON', 'TOF', 'CTU', 'LAMP', 'MOTOR', 'HORN', 'BUZZER'
]);

export const CONTACT_TYPES = new Set([
  'XIC', 'XIO', 'SWITCH'
]);

/**
 * Normalizes terminal names: "L", "R", or "${partId}:in", "${partId}:out".
 */
export function getPartTerminals(part: PlacedPart): { in: string; out: string } {
  return {
    in: `${part.id}:in`,
    out: `${part.id}:out`,
  };
}

/**
 * Checks circuit topology in exact Part 4 order:
 * 1. Short circuit: path from L to R passing through no load (coil, lamp, motor, timer, etc.)
 * 2. Floating terminal: a placed part has a terminal with no wires connected
 * 3. Wrong rail: a load wired to L instead of R
 * (And for Levels 1-4: exact wire photo match)
 */
export function checkCircuitTopology(
  parts: PlacedPart[],
  wires: WireDef[],
  level?: LevelDefinition
): TopologyCheckResult {
  // Build adjacency list for wires
  const adjacency = new Map<string, Set<string>>();

  function addEdge(u: string, v: string) {
    if (!adjacency.has(u)) adjacency.set(u, new Set());
    if (!adjacency.has(v)) adjacency.set(v, new Set());
    adjacency.get(u)!.add(v);
    adjacency.get(v)!.add(u);
  }

  for (const wire of wires) {
    addEdge(wire.from, wire.to);
  }

  // 1. Short circuit check:
  // Can power flow from 'L' to 'R' through only contacts/switches and wires, without passing through any load?
  // We do BFS/DFS from 'L' traversing wires and contact conductances (in <-> out for contacts).
  // Loads DO NOT pass power to R without being loads.
  const visitedNoLoad = new Set<string>();
  const queueNoLoad: string[] = ['L'];
  visitedNoLoad.add('L');

  while (queueNoLoad.length > 0) {
    const curr = queueNoLoad.shift()!;
    if (curr === 'R') {
      return {
        valid: false,
        errorType: 'SHORT_CIRCUIT',
        message: 'Power goes straight from the left rail to the right rail. Something needs to be in the way.',
      };
    }

    // Traverse connected wires
    const neighbors = adjacency.get(curr) ?? new Set();
    for (const next of neighbors) {
      if (!visitedNoLoad.has(next)) {
        visitedNoLoad.add(next);
        queueNoLoad.push(next);
      }
    }

    // If curr is a contact's terminal, it can conduct through the contact to the other terminal
    if (curr.includes(':')) {
      const [partId, term] = curr.split(':');
      const part = parts.find((p) => p.id === partId);
      if (part && !LOAD_TYPES.has(part.type)) {
        // It is a contact/switch -> conducts across its two terminals
        const otherTerm = term === 'in' ? `${partId}:out` : `${partId}:in`;
        if (!visitedNoLoad.has(otherTerm)) {
          visitedNoLoad.add(otherTerm);
          queueNoLoad.push(otherTerm);
        }
      }
    }
  }

  // 2. Floating terminal check:
  // Every placed part must have both its in and out terminals connected to at least one wire
  for (const part of parts) {
    const { in: inTerm, out: outTerm } = getPartTerminals(part);
    const inConnected = (adjacency.get(inTerm)?.size ?? 0) > 0;
    const outConnected = (adjacency.get(outTerm)?.size ?? 0) > 0;

    if (!inConnected || !outConnected) {
      const termName = !inConnected ? 'left side' : 'right side';
      const partName = (part.tag || part.type).toLowerCase();
      return {
        valid: false,
        errorType: 'FLOATING_TERMINAL',
        failingComponentId: part.id,
        failingTerminalId: !inConnected ? inTerm : outTerm,
        message: `The ${partName}'s ${termName} isn't connected.`,
      };
    }
  }

  // 3. Wrong rail check:
  // Loads (coils, lamps, timers, motors) must have their output terminal connected to the right rail 'R',
  // and NOT their input directly connected to 'R' while output connects to 'L'.
  // Also: load's in terminal should not be wired directly to R, nor out terminal to L.
  for (const part of parts) {
    if (LOAD_TYPES.has(part.type)) {
      const { in: inTerm, out: outTerm } = getPartTerminals(part);

      // Check if output terminal reaches 'R' (direct or via wire net)
      const reachableFromOut = getConnectedComponent(outTerm, adjacency);
      const reachableFromIn = getConnectedComponent(inTerm, adjacency);

      // If out reaches L, or in reaches R without L, it's reversed / wrong rail
      if (reachableFromOut.has('L') && !reachableFromOut.has('R')) {
        const partName = (part.tag || part.type).toLowerCase();
        return {
          valid: false,
          errorType: 'WRONG_RAIL',
          failingComponentId: part.id,
          message: `The ${partName} is wired backwards. The output must reach the right rail (R).`,
        };
      }

      if (reachableFromIn.has('R') && reachableFromOut.has('L')) {
        const partName = (part.tag || part.type).toLowerCase();
        return {
          valid: false,
          errorType: 'WRONG_RAIL',
          failingComponentId: part.id,
          message: `The ${partName} is wired to the wrong rail. Outputs go to the right rail, not the left rail.`,
        };
      }
    }
  }

  // Check for Levels 1-4 photo match if expectedExactWires is present
  if (level && level.id >= 1 && level.id <= 4 && level.expectedExactWires) {
    const exactMatch = checkExactWires(wires, level.expectedExactWires);
    if (!exactMatch) {
      return {
        valid: false,
        errorType: 'EXACT_LAYOUT_MISMATCH',
        message: 'The circuit behaves similarly, but connect the terminals exactly along the dotted guides to learn the standard wiring layout.',
      };
    }
  }

  return { valid: true };
}

/**
 * Returns all terminals in the same electrical net (connected by wires only).
 */
export function getConnectedComponent(start: string, adjacency: Map<string, Set<string>>): Set<string> {
  const visited = new Set<string>();
  const queue = [start];
  visited.add(start);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = adjacency.get(curr) ?? new Set();
    for (const next of neighbors) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }

  return visited;
}

/**
 * Helper to test exact wire matching for Levels 1-4.
 */
function checkExactWires(userWires: WireDef[], expectedWires: WireDef[]): boolean {
  if (userWires.length !== expectedWires.length) return false;

  const normalizePair = (a: string, b: string) => (a < b ? `${a}--${b}` : `${b}--${a}`);

  const userPairs = new Set(userWires.map((w) => normalizePair(w.from, w.to)));
  for (const exp of expectedWires) {
    if (!userPairs.has(normalizePair(exp.from, exp.to))) {
      return false;
    }
  }
  return true;
}
