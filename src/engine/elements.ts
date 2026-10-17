import {
  ContactInstruction,
  CoilInstruction,
  TimerData,
  CounterData,
  PlcMemoryState,
  ConditionBranch,
  TimerType,
  CounterType,
} from './types';

/**
 * Resolves a bit or subfield from PLC memory.
 * Supports direct tags ("START", "MOTOR", "M1") and timer/counter fields ("T1.DN", "C1.ACC").
 */
export function readBit(tag: string, memory: PlcMemoryState): number {
  if (tag.includes('.')) {
    const [base, prop] = tag.split('.');
    const upperProp = prop.toUpperCase();

    if (memory.timers[base]) {
      const timer = memory.timers[base];
      if (upperProp === 'DN') return timer.DN ? 1 : 0;
      if (upperProp === 'EN') return timer.EN ? 1 : 0;
      if (upperProp === 'TT') return timer.TT ? 1 : 0;
      if (upperProp === 'ACC') return timer.ACC;
      if (upperProp === 'PRE') return timer.PRE;
    }

    if (memory.counters[base]) {
      const counter = memory.counters[base];
      if (upperProp === 'DN') return counter.DN ? 1 : 0;
      if (upperProp === 'ACC') return counter.ACC;
      if (upperProp === 'PRE') return counter.PRE;
    }
  }

  // Check inputs
  if (memory.inputs[tag] !== undefined) {
    return memory.inputs[tag] ? 1 : 0;
  }

  // Check outputs
  if (memory.outputs[tag] !== undefined) {
    return memory.outputs[tag] ? 1 : 0;
  }

  // Check internal bits
  if (memory.internal[tag] !== undefined) {
    return memory.internal[tag] ? 1 : 0;
  }

  // Shortcut for timer/counter .DN bit
  if (memory.timers[tag] !== undefined) {
    return memory.timers[tag].DN ? 1 : 0;
  }
  if (memory.counters[tag] !== undefined) {
    return memory.counters[tag].DN ? 1 : 0;
  }

  return 0;
}

/**
 * Writes a bit to output or internal memory.
 */
export function writeBit(
  tag: string,
  value: number,
  memory: PlcMemoryState,
  declaredOutputs?: Set<string>
): void {
  const normalizedVal = value ? 1 : 0;
  if (declaredOutputs && declaredOutputs.has(tag)) {
    memory.outputs[tag] = normalizedVal;
  } else if (memory.outputs[tag] !== undefined) {
    memory.outputs[tag] = normalizedVal;
  } else {
    memory.internal[tag] = normalizedVal;
  }
}

/**
 * Evaluates an XIC (Normally Open) or XIO (Normally Closed) contact.
 * XIC: conducts power when bit == 1.
 * XIO: conducts power when bit == 0.
 */
export function evaluateContact(
  contact: ContactInstruction,
  memory: PlcMemoryState
): boolean {
  const bit = readBit(contact.tag, memory);
  if (contact.type === 'XIC') {
    return bit === 1;
  }
  if (contact.type === 'XIO') {
    return bit === 0;
  }
  return false;
}

/**
 * Evaluates a series branch of contacts (AND condition).
 * Empty branch conducts power.
 */
export function evaluateBranch(
  branch: ConditionBranch,
  memory: PlcMemoryState
): boolean {
  for (const contact of branch) {
    if (!evaluateContact(contact, memory)) {
      return false;
    }
  }
  return true;
}

/**
 * Evaluates parallel condition branches (OR condition).
 * If conditionBranches is empty, power flows directly from the left rail (true).
 */
export function evaluateRungCondition(
  branches: ConditionBranch[],
  memory: PlcMemoryState
): boolean {
  if (branches.length === 0) return true;
  for (const branch of branches) {
    if (evaluateBranch(branch, memory)) {
      return true;
    }
  }
  return false;
}

/**
 * Evaluates a coil instruction (OTE, OTL, OTU).
 */
export function evaluateCoil(
  coil: CoilInstruction,
  rungPower: boolean,
  memory: PlcMemoryState,
  declaredOutputs?: Set<string>
): void {
  if (coil.type === 'OTE') {
    writeBit(coil.tag, rungPower ? 1 : 0, memory, declaredOutputs);
  } else if (coil.type === 'OTL') {
    if (rungPower) {
      writeBit(coil.tag, 1, memory, declaredOutputs);
    }
  } else if (coil.type === 'OTU') {
    if (rungPower) {
      writeBit(coil.tag, 0, memory, declaredOutputs);
    }
  }
}

/**
 * Updates a TON (On-Delay) or TOF (Off-Delay) timer.
 */
export function updateTimer(
  timer: TimerData,
  rungPower: boolean,
  scanMs: number,
  type: TimerType
): void {
  if (type === 'TON') {
    if (rungPower) {
      timer.EN = true;
      if (timer.ACC < timer.PRE) {
        timer.ACC = Math.min(timer.PRE, timer.ACC + scanMs);
        timer.TT = timer.ACC < timer.PRE;
        timer.DN = timer.ACC >= timer.PRE;
      } else {
        timer.TT = false;
        timer.DN = true;
      }
    } else {
      // TON resets immediately when rung drops false
      timer.EN = false;
      timer.TT = false;
      timer.DN = false;
      timer.ACC = 0;
    }
  } else if (type === 'TOF') {
    if (rungPower) {
      timer.EN = true;
      timer.TT = false;
      timer.DN = true;
      timer.ACC = 0;
    } else {
      timer.EN = false;
      if (timer.DN) {
        if (timer.ACC < timer.PRE) {
          timer.ACC = Math.min(timer.PRE, timer.ACC + scanMs);
          timer.TT = true;
          timer.DN = timer.ACC < timer.PRE;
          if (!timer.DN) {
            timer.TT = false;
          }
        } else {
          timer.TT = false;
          timer.DN = false;
        }
      } else {
        timer.TT = false;
        timer.DN = false;
        timer.ACC = 0;
      }
    }
  }
}

/**
 * Updates a CTU (Count Up) counter.
 * Only increments on a false-to-true transition of the rung power.
 * A held input counts once on a counter, not once per scan.
 */
export function updateCounter(
  counter: CounterData,
  rungPower: boolean,
  _type: CounterType = 'CTU'
): void {
  const edge = !counter.prevRungState && rungPower;
  if (edge) {
    counter.ACC += 1;
  }
  counter.DN = counter.ACC >= counter.PRE;
  counter.prevRungState = rungPower;
}

/**
 * Executes a RES (Reset) instruction.
 * Clears timer or counter ACC and DN.
 */
export function executeReset(
  targetTag: string,
  memory: PlcMemoryState
): void {
  if (memory.timers[targetTag]) {
    const t = memory.timers[targetTag];
    t.ACC = 0;
    t.DN = false;
    t.EN = false;
    t.TT = false;
  }
  if (memory.counters[targetTag]) {
    const c = memory.counters[targetTag];
    c.ACC = 0;
    c.DN = false;
    c.prevRungState = false;
  }
}
