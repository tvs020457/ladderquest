/**
 * Pure engine types for LadderQuest PLC simulation.
 * Zero DOM or React imports allowed.
 */

export type ContactType = 'XIC' | 'XIO';
export type CoilType = 'OTE' | 'OTL' | 'OTU';
export type TimerType = 'TON' | 'TOF';
export type CounterType = 'CTU';
export type ResetType = 'RES';

export type InstructionType =
  | ContactType
  | CoilType
  | TimerType
  | CounterType
  | ResetType;

export interface BaseInstruction {
  id: string;
  type: InstructionType;
  tag: string;
}

export interface ContactInstruction extends BaseInstruction {
  type: ContactType;
}

export interface CoilInstruction extends BaseInstruction {
  type: CoilType;
}

export interface TimerInstruction extends BaseInstruction {
  type: TimerType;
  preset: number; // Duration in ms
}

export interface CounterInstruction extends BaseInstruction {
  type: CounterType;
  preset: number; // Target count
}

export interface ResetInstruction extends BaseInstruction {
  type: ResetType;
  targetTag: string; // Timer or counter tag to reset
}

export type InputInstruction = ContactInstruction;
export type OutputInstruction =
  | CoilInstruction
  | TimerInstruction
  | CounterInstruction
  | ResetInstruction;

export type LogicInstruction = InputInstruction | OutputInstruction;

/**
 * A branch block represents parallel logic paths (OR).
 * Each inner array is a series chain of instructions (AND).
 * If conditionBranches has multiple paths, power flows if ANY path is true.
 * Within a path, all instructions must conduct power (AND).
 */
export type ConditionBranch = InputInstruction[];

export interface Rung {
  id: string;
  branches: ConditionBranch[]; // Parallel branches: [ [XIC A, XIC B], [XIC C] ] -> (A AND B) OR C
  outputs: OutputInstruction[]; // Series or parallel outputs energized when rung is true
  comment?: string;
}

export interface TimerData {
  ACC: number; // Accumulated virtual ms
  PRE: number; // Preset virtual ms
  EN: boolean; // Enable: true when rung condition is true
  TT: boolean; // Timer Timing: true while timing
  DN: boolean; // Done: true when ACC >= PRE
}

export interface CounterData {
  ACC: number; // Accumulated count
  PRE: number; // Preset count
  DN: boolean; // Done: true when ACC >= PRE
  prevRungState: boolean; // For edge detection (false-to-true)
}

export interface ScanWarning {
  type: 'DUPLICATE_OTE';
  tag: string;
  message: string;
  rungIndices: number[];
}

export interface PlcMemoryState {
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  internal: Record<string, number>;
  timers: Record<string, TimerData>;
  counters: Record<string, CounterData>;
}

export interface ScanCycleResult {
  scanNumber: number;
  virtualTimeMs: number;
  memory: PlcMemoryState;
  warnings: ScanWarning[];
}
