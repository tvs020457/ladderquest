import {
  Rung,
  PlcMemoryState,
  ScanCycleResult,
  ScanWarning,
  TimerInstruction,
  CounterInstruction,
  ResetInstruction,
} from './types';
import {
  evaluateRungCondition,
  evaluateCoil,
  updateTimer,
  updateCounter,
  executeReset,
} from './elements';

export interface SimulatorOptions {
  scanMs?: number;
  declaredInputs?: string[];
  declaredOutputs?: string[];
}

export class PlcSimulator {
  public memory: PlcMemoryState;
  public rungs: Rung[];
  public scanMs: number;
  public scanCount: number;
  public virtualTimeMs: number;
  public declaredInputs: Set<string>;
  public declaredOutputs: Set<string>;

  constructor(rungs: Rung[] = [], options: SimulatorOptions = {}) {
    this.rungs = rungs;
    this.scanMs = options.scanMs ?? 10;
    this.scanCount = 0;
    this.virtualTimeMs = 0;
    this.declaredInputs = new Set(options.declaredInputs ?? []);
    this.declaredOutputs = new Set(options.declaredOutputs ?? []);

    this.memory = this.createInitialMemory();
    this.initializeTimersAndCounters();
  }

  private createInitialMemory(): PlcMemoryState {
    const inputs: Record<string, number> = {};
    const outputs: Record<string, number> = {};

    this.declaredInputs.forEach((tag) => {
      inputs[tag] = 0;
    });
    this.declaredOutputs.forEach((tag) => {
      outputs[tag] = 0;
    });

    return {
      inputs,
      outputs,
      internal: {},
      timers: {},
      counters: {},
    };
  }

  /**
   * Scans all rungs to pre-register any TON, TOF, or CTU instructions with their presets.
   */
  public initializeTimersAndCounters(): void {
    for (const rung of this.rungs) {
      for (const output of rung.outputs) {
        if (output.type === 'TON' || output.type === 'TOF') {
          const tInst = output as TimerInstruction;
          if (!this.memory.timers[tInst.tag]) {
            this.memory.timers[tInst.tag] = {
              ACC: 0,
              PRE: tInst.preset,
              EN: false,
              TT: false,
              DN: false,
            };
          } else {
            this.memory.timers[tInst.tag].PRE = tInst.preset;
          }
        } else if (output.type === 'CTU') {
          const cInst = output as CounterInstruction;
          if (!this.memory.counters[cInst.tag]) {
            this.memory.counters[cInst.tag] = {
              ACC: 0,
              PRE: cInst.preset,
              DN: false,
              prevRungState: false,
            };
          } else {
            this.memory.counters[cInst.tag].PRE = cInst.preset;
          }
        }
      }
    }
  }

  public setRungs(rungs: Rung[]): void {
    this.rungs = rungs;
    this.initializeTimersAndCounters();
  }

  public setInput(tag: string, value: number): void {
    this.memory.inputs[tag] = value ? 1 : 0;
  }

  public setInputs(inputs: Record<string, number>): void {
    for (const [tag, val] of Object.entries(inputs)) {
      this.setInput(tag, val);
    }
  }

  public getOutput(tag: string): number {
    if (this.memory.outputs[tag] !== undefined) {
      return this.memory.outputs[tag];
    }
    if (this.memory.internal[tag] !== undefined) {
      return this.memory.internal[tag];
    }
    if (this.memory.timers[tag] !== undefined) {
      return this.memory.timers[tag].DN ? 1 : 0;
    }
    if (this.memory.counters[tag] !== undefined) {
      return this.memory.counters[tag].DN ? 1 : 0;
    }
    return 0;
  }

  /**
   * Executes a single 10ms virtual scan cycle:
   * 1. Read input image (already in memory.inputs).
   * 2. Solve rungs top to bottom, each rung left to right.
   *    - A coil's new value is visible to rungs below it in the same scan.
   *    - Multiple OTEs to same tag: last rung wins, generates warning.
   * 3. Commit output image at the end of the scan.
   */
  public step(inputsToApply?: Record<string, number>): ScanCycleResult {
    // 1. Read input image
    if (inputsToApply) {
      this.setInputs(inputsToApply);
    }

    const warnings: ScanWarning[] = [];
    const oteWrites: Map<string, number[]> = new Map();

    // 2. Solve rungs top to bottom
    for (let rungIndex = 0; rungIndex < this.rungs.length; rungIndex++) {
      const rung = this.rungs[rungIndex];
      const rungPower = evaluateRungCondition(rung.branches, this.memory);

      for (const output of rung.outputs) {
        if (output.type === 'OTE') {
          const list = oteWrites.get(output.tag) ?? [];
          list.push(rungIndex);
          oteWrites.set(output.tag, list);
          evaluateCoil(output, rungPower, this.memory, this.declaredOutputs);
        } else if (output.type === 'OTL' || output.type === 'OTU') {
          evaluateCoil(output, rungPower, this.memory, this.declaredOutputs);
        } else if (output.type === 'TON' || output.type === 'TOF') {
          const timer = this.memory.timers[output.tag];
          if (timer) {
            updateTimer(timer, rungPower, this.scanMs, output.type);
          }
        } else if (output.type === 'CTU') {
          const counter = this.memory.counters[output.tag];
          if (counter) {
            updateCounter(counter, rungPower, output.type);
          }
        } else if (output.type === 'RES') {
          if (rungPower) {
            const rInst = output as ResetInstruction;
            executeReset(rInst.targetTag, this.memory);
          }
        }
      }
    }

    // Check for duplicate OTE writes
    oteWrites.forEach((indices, tag) => {
      if (indices.length > 1) {
        warnings.push({
          type: 'DUPLICATE_OTE',
          tag,
          rungIndices: indices,
          message: `The coil "${tag}" is written by multiple OTE instructions on rungs ${indices
            .map((i) => i + 1)
            .join(', ')}. In PLC logic, the last rung wins.`,
        });
      }
    });

    // Advance virtual time
    this.scanCount += 1;
    this.virtualTimeMs += this.scanMs;

    return {
      scanNumber: this.scanCount,
      virtualTimeMs: this.virtualTimeMs,
      memory: JSON.parse(JSON.stringify(this.memory)),
      warnings,
    };
  }

  /**
   * Resets the simulator to time 0 with clear memory.
   */
  public reset(): void {
    this.scanCount = 0;
    this.virtualTimeMs = 0;
    this.memory = this.createInitialMemory();
    this.initializeTimersAndCounters();
  }
}
