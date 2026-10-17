import { LevelDefinition, PlacedPart, WireDef, TestCase } from '../levels/types';
import { checkCircuitTopology } from './connectionChecker';
import { circuitToRungs } from './circuitToRungs';
import { PlcSimulator } from './scanCycle';
import { Rung } from './types';

export interface SignalSample {
  t: number;
  signals: Record<string, number>;
}

export interface FailingStepDetail {
  timeMs: number;
  signalName: string;
  actual: number;
  expected: number;
  message: string;
}

export interface SingleTestResult {
  testName: string;
  passed: boolean;
  failure?: FailingStepDetail;
  trace: SignalSample[];
}

export interface GradingResult {
  passed: boolean;
  connectionError?: string;
  errorType?: string;
  testResults: SingleTestResult[];
  failingTest?: SingleTestResult;
  starsEarned: number;
  xpEarned: number;
}

export interface GraderOptions {
  hintsUsed?: number;
}

/**
 * Grades a wired circuit against a LevelDefinition.
 */
export function gradeCircuit(
  parts: PlacedPart[],
  wires: WireDef[],
  level: LevelDefinition,
  options: GraderOptions = {}
): GradingResult {
  // 1. Connection / Topology Checker
  const topoCheck = checkCircuitTopology(parts, wires, level);
  if (!topoCheck.valid) {
    return {
      passed: false,
      connectionError: topoCheck.message,
      errorType: topoCheck.errorType,
      testResults: [],
      starsEarned: 0,
      xpEarned: 0,
    };
  }

  // 2. Convert circuit to rungs
  const rungs = circuitToRungs(parts, wires);

  // 3. Run visible tests and hidden tests
  return gradeRungs(rungs, level, parts.length + wires.length, options);
}

/**
 * Grades rungs directly against a LevelDefinition (used for Levels 21-30).
 */
export function gradeRungs(
  rungs: Rung[],
  level: LevelDefinition,
  elementsCount: number,
  options: GraderOptions = {}
): GradingResult {
  const allTests = [...level.tests, ...(level.hiddenTests ?? [])];
  const testResults: SingleTestResult[] = [];
  const hintsUsed = options.hintsUsed ?? 0;

  for (const test of allTests) {
    const result = runSingleTest(test, rungs, level);
    testResults.push(result);
    if (!result.passed) {
      return {
        passed: false,
        testResults,
        failingTest: result,
        starsEarned: 0,
        xpEarned: 0,
      };
    }
  }

  // Calculate Stars
  // 1 star: passed
  // 2 stars: passed without hints
  // 3 stars: passed with <= parElements
  let stars = 1;
  if (hintsUsed === 0) stars = 2;
  if (level.parElements && elementsCount <= level.parElements && hintsUsed === 0) {
    stars = 3;
  }

  // Base XP
  const xp = 20 + (stars === 3 ? 15 : stars === 2 ? 10 : 5);

  return {
    passed: true,
    testResults,
    starsEarned: stars,
    xpEarned: xp,
  };
}

/**
 * Executes a single test case using the discrete 10ms virtual clock simulator.
 */
export function runSingleTest(
  test: TestCase,
  rungs: Rung[],
  level: LevelDefinition
): SingleTestResult {
  const scanMs = Math.max(1, Math.min(1000, level.scanMs || 10));
  const plc = new PlcSimulator(rungs, {
    scanMs,
    declaredInputs: level.inputs.map((i) => i.tag),
    declaredOutputs: level.outputs.map((o) => o.tag),
  });

  // Pre-seed any initial input values
  for (const inp of level.inputs) {
    if (inp.initialValue !== undefined) {
      plc.setInput(inp.tag, inp.initialValue);
    }
  }

  const sortedSteps = [...test.steps].sort((a, b) => a.t - b.t);
  const rawMaxTime = Math.max(...sortedSteps.map((s) => s.t), 0) + scanMs * 2;
  const maxTime = Math.min(60_000, Math.max(0, rawMaxTime)); // Maximum 60s simulated time ceiling

  const trace: SignalSample[] = [];
  let stepPointer = 0;
  const MAX_SCANS = 10_000; // Safeguard against unbounded simulation loops
  let scanIterations = 0;

  for (let currentT = 0; currentT <= maxTime && scanIterations < MAX_SCANS; currentT += scanMs, scanIterations++) {
    // Check if there are inputs to apply at currentT
    const stepsAtNow = sortedSteps.filter((s) => s.t === currentT && s.set);
    for (const s of stepsAtNow) {
      if (s.set) {
        plc.setInputs(s.set);
      }
    }

    // Step simulation
    plc.step();

    // Record sample
    const sampleSignals: Record<string, number> = {};
    for (const inp of level.inputs) {
      sampleSignals[inp.tag] = plc.memory.inputs[inp.tag] ?? 0;
    }
    for (const out of level.outputs) {
      sampleSignals[out.tag] = plc.getOutput(out.tag);
    }
    trace.push({
      t: currentT,
      signals: sampleSignals,
    });

    // Check expectation with 1-scan tolerance:
    // If a step expected outputs at timestamp T, check at T + scanMs
    while (stepPointer < sortedSteps.length) {
      const step = sortedSteps[stepPointer];
      const checkTime = step.t + scanMs;

      if (currentT < checkTime) {
        break; // Not time to verify yet
      }

      if (currentT === checkTime && step.expect) {
        for (const [tag, expectedVal] of Object.entries(step.expect)) {
          const actualVal = plc.getOutput(tag);
          if (actualVal !== expectedVal) {
            const defaultMsg =
              step.explanation ||
              `At ${step.t} ms, expected ${tag} to be ${expectedVal}, but it was ${actualVal}.`;

            return {
              testName: test.name,
              passed: false,
              failure: {
                timeMs: step.t,
                signalName: tag,
                actual: actualVal,
                expected: expectedVal,
                message: defaultMsg,
              },
              trace,
            };
          }
        }
      }
      stepPointer++;
    }
  }

  return {
    testName: test.name,
    passed: true,
    trace,
  };
}
