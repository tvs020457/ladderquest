import { InstructionType } from '../engine/types';

export type LevelMode = 'complete' | 'build' | 'fix' | 'write';

export interface LevelInputDef {
  tag: string;
  type: 'pushbutton NO' | 'pushbutton NC-wired' | 'switch' | 'sensor';
  description?: string;
  initialValue?: number;
}

export interface LevelOutputDef {
  tag: string;
  type: 'lamp' | 'motor' | 'horn' | 'valve' | 'conveyor' | 'gate' | 'service';
  description?: string;
}

export interface TestStep {
  t: number;
  set?: Record<string, number>;
  expect?: Record<string, number>;
  explanation?: string;
}

export interface TestCase {
  name: string;
  steps: TestStep[];
}

export interface LearnCard {
  title: string;
  text: string;
  conceptAnimation?: string;
}

export interface GuidedTryConfig {
  prompt: string;
  preplacedWires?: Array<{ from: string; to: string }>;
  targetMissingWire?: { from: string; to: string };
  hint: string;
}

export interface PlacedPart {
  id: string;
  type: InstructionType | 'SWITCH' | 'LAMP' | 'MOTOR' | 'HORN' | 'BUZZER';
  tag: string;
  x: number; // grid column (0 to 6)
  y: number; // rung row (0 to 3)
}

export interface WireDef {
  id: string;
  from: string; // e.g., "L", "R", "part1_in", "part1_out"
  to: string;
}

export interface LevelDefinition {
  id: number;
  mode: LevelMode;
  unit: number;
  unitTitle: string;
  title: string;
  story: string;
  concept: string;
  inputs: LevelInputDef[];
  outputs: LevelOutputDef[];
  allowedElements: InstructionType[];
  scanMs: number;
  parElements?: number;
  learn: LearnCard[];
  guidedTry?: GuidedTryConfig;
  initialParts: PlacedPart[];
  initialWires: WireDef[];
  expectedExactWires?: WireDef[]; // For Levels 1-4
  tests: TestCase[];
  hiddenTests?: TestCase[];
  hints: [string, string, string];
}
