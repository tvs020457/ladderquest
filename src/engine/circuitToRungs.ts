import { PlacedPart, WireDef } from '../levels/types';
import {
  Rung,
  ConditionBranch,
  ContactInstruction,
  OutputInstruction,
  InstructionType,
} from './types';
import { LOAD_TYPES, getPartTerminals } from './connectionChecker';

/**
 * Converts a valid wired circuit into standard ladder Rung[] structures.
 */
export function circuitToRungs(parts: PlacedPart[], wires: WireDef[]): Rung[] {
  // Find all loads (components that act as coils/outputs)
  const loads = parts.filter((p) => LOAD_TYPES.has(p.type));
  if (loads.length === 0) return [];

  // Build adjacency list for wire nets
  const wireAdjacency = new Map<string, Set<string>>();
  function addWire(u: string, v: string) {
    if (!wireAdjacency.has(u)) wireAdjacency.set(u, new Set());
    if (!wireAdjacency.has(v)) wireAdjacency.set(v, new Set());
    wireAdjacency.get(u)!.add(v);
    wireAdjacency.get(v)!.add(u);
  }

  for (const w of wires) {
    addWire(w.from, w.to);
  }

  // Map contact parts
  const contactParts = parts.filter((p) => !LOAD_TYPES.has(p.type));
  const contactMap = new Map<string, PlacedPart>();
  for (const c of contactParts) {
    contactMap.set(c.id, c);
  }

  const rungs: Rung[] = [];

  for (let i = 0; i < loads.length; i++) {
    const load = loads[i];
    const { in: loadIn } = getPartTerminals(load);

    // Find all paths from 'L' to loadIn
    const paths = findAllContactPaths('L', loadIn, wireAdjacency, contactParts);

    // Convert paths to ConditionBranch[]
    const branches: ConditionBranch[] = [];
    for (const path of paths) {
      const branch: ContactInstruction[] = path.map((cp) => ({
        id: cp.id,
        type: (cp.type === 'XIO' ? 'XIO' : 'XIC') as 'XIC' | 'XIO',
        tag: cp.tag,
      }));
      branches.push(branch);
    }

    // Determine output instruction
    let outType: InstructionType = 'OTE';
    if (load.type === 'TON' || load.type === 'TOF' || load.type === 'CTU' || load.type === 'OTL' || load.type === 'OTU') {
      outType = load.type;
    }

    const outputInst: OutputInstruction = {
      id: `out_${load.id}`,
      type: outType as any,
      tag: load.tag,
      preset: (load as any).preset ?? (outType === 'CTU' ? 3 : 300),
    } as any;

    rungs.push({
      id: `rung_${load.id}_${i}`,
      branches,
      outputs: [outputInst],
    });
  }

  return rungs;
}

/**
 * Searches for all simple paths of contacts from start terminal to end terminal.
 */
function findAllContactPaths(
  startTerm: string,
  endTerm: string,
  wireAdjacency: Map<string, Set<string>>,
  contactParts: PlacedPart[]
): PlacedPart[][] {
  const result: PlacedPart[][] = [];
  const visitedParts = new Set<string>();

  // Check if endTerm is directly reachable from startTerm via wire net with 0 contacts
  const directNet = getWireNet(startTerm, wireAdjacency);
  if (directNet.has(endTerm)) {
    // Direct connection without contacts (always true)
    return [[]];
  }

  const MAX_PATHS = 50;
  const MAX_DEPTH = 20;

  function dfs(currentNet: Set<string>, currentPath: PlacedPart[]) {
    if (result.length >= MAX_PATHS) return;
    if (currentPath.length >= MAX_DEPTH) return;

    // If the current net touches the target terminal, we found a path!
    if (currentNet.has(endTerm)) {
      result.push([...currentPath]);
      return;
    }

    // Check each unvisited contact that has one terminal touching currentNet
    for (const cp of contactParts) {
      if (visitedParts.has(cp.id)) continue;

      const inTerm = `${cp.id}:in`;
      const outTerm = `${cp.id}:out`;

      if (currentNet.has(inTerm)) {
        // Enters via inTerm, exits via outTerm
        visitedParts.add(cp.id);
        const nextNet = getWireNet(outTerm, wireAdjacency);
        dfs(nextNet, [...currentPath, cp]);
        visitedParts.delete(cp.id);
      } else if (currentNet.has(outTerm)) {
        // Enters via outTerm, exits via inTerm
        visitedParts.add(cp.id);
        const nextNet = getWireNet(inTerm, wireAdjacency);
        dfs(nextNet, [...currentPath, cp]);
        visitedParts.delete(cp.id);
      }
    }
  }

  dfs(directNet, []);
  return result;
}

/**
 * Gets all terminals connected together by wires alone (equipotential net).
 */
function getWireNet(start: string, wireAdjacency: Map<string, Set<string>>): Set<string> {
  const net = new Set<string>();
  const queue = [start];
  net.add(start);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const neighbors = wireAdjacency.get(curr) ?? new Set();
    for (const n of neighbors) {
      if (!net.has(n)) {
        net.add(n);
        queue.push(n);
      }
    }
  }

  return net;
}
