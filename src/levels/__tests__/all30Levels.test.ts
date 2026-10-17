import { describe, it, expect } from 'vitest';
import { getLevel, getAllLoadedLevels } from '../index';
import { gradeCircuit, gradeRungs } from '../../engine/grader';
import { WireDef } from '../types';
import { Rung } from '../../engine/types';

describe('Complete Verification: All 30 Levels (Levels 1 to 30)', () => {
  it('loads all 30 levels successfully', () => {
    const all = getAllLoadedLevels();
    expect(all.length).toBe(30);
    for (let id = 1; id <= 30; id++) {
      const lvl = getLevel(id);
      expect(lvl).toBeDefined();
      expect(lvl?.id).toBe(id);
      expect(lvl?.tests.length).toBeGreaterThan(0);
      expect(lvl?.hints.length).toBe(3);
    }
  });

  // Verify Levels 9 to 20 (Connection / Fix mode)
  describe('Level 9: The Broken Wire (fix mode)', () => {
    const level = getLevel(9)!;
    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btn1:in' },
        { id: 'w2', from: 'btn1:out', to: 'mot1:in' },
        { id: 'w3', from: 'mot1:out', to: 'R' },
      ];
      const res = gradeCircuit(level.initialParts, wires, level);
      expect(res.passed).toBe(true);
    });

    it('unrepaired circuit fails with floating terminal', () => {
      const res = gradeCircuit(level.initialParts, level.initialWires, level);
      expect(res.passed).toBe(false);
      expect(res.errorType).toBe('FLOATING_TERMINAL');
    });
  });

  describe('Level 10: The Sneak Bypass (fix mode)', () => {
    const level = getLevel(10)!;
    it('reference solution (removing bypass) passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btn1:in' },
        { id: 'w2', from: 'btn1:out', to: 'lamp1:in' },
        { id: 'w3', from: 'lamp1:out', to: 'R' },
      ];
      const res = gradeCircuit(level.initialParts, wires, level);
      expect(res.passed).toBe(true);
    });

    it('unfixed circuit with sneak bypass fails behavior test', () => {
      const res = gradeCircuit(level.initialParts, level.initialWires, level);
      expect(res.passed).toBe(false);
      expect(res.failingTest?.failure?.signalName).toBe('LAMP');
    });
  });

  describe('Level 11: Contact in Wrong Position (fix mode)', () => {
    const level = getLevel(11)!;
    it('reference solution with series STOP passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btnStart:in' },
        { id: 'w2', from: 'btnStart:out', to: 'btnStop:in' },
        { id: 'w3', from: 'btnStop:out', to: 'mot1:in' },
        { id: 'w4', from: 'mot1:out', to: 'R' },
      ];
      const res = gradeCircuit(level.initialParts, wires, level);
      expect(res.passed).toBe(true);
    });

    it('parallel STOP fails stop priority test', () => {
      const res = gradeCircuit(level.initialParts, level.initialWires, level);
      expect(res.passed).toBe(false);
      expect(res.failingTest?.failure?.signalName).toBe('MOTOR');
    });
  });

  describe('Level 12: Parallel Outputs: Lamp and Horn', () => {
    const level = getLevel(12)!;
    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btnAlert:in' },
        { id: 'w2', from: 'btnAlert:out', to: 'lamp1:in' },
        { id: 'w3', from: 'btnAlert:out', to: 'horn1:in' },
        { id: 'w4', from: 'lamp1:out', to: 'R' },
        { id: 'w5', from: 'horn1:out', to: 'R' },
      ];
      const res = gradeCircuit(level.initialParts, wires, level);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 13: Two Independent Rungs', () => {
    const level = getLevel(13)!;
    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'pb1:in' },
        { id: 'w2', from: 'pb1:out', to: 'lamp1:in' },
        { id: 'w3', from: 'lamp1:out', to: 'R' },
        { id: 'w4', from: 'L', to: 'pb2:in' },
        { id: 'w5', from: 'pb2:out', to: 'lamp2:in' },
        { id: 'w6', from: 'lamp2:out', to: 'R' },
      ];
      const res = gradeCircuit(level.initialParts, wires, level);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 14: Seal-In Holding Branch', () => {
    const level = getLevel(14)!;
    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btnStart:in' },
        { id: 'w2', from: 'btnStart:out', to: 'btnStop:in' },
        { id: 'w3', from: 'btnStop:out', to: 'mot1:in' },
        { id: 'w4', from: 'mot1:out', to: 'R' },
        // Holding branch in parallel with btnStart
        { id: 'w5', from: 'L', to: 'auxMotor:in' },
        { id: 'w6', from: 'auxMotor:out', to: 'btnStop:in' },
      ];
      const res = gradeCircuit(level.initialParts, wires, level);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 15: Seal-In with STOP Priority', () => {
    const level = getLevel(15)!;
    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btnStart:in' },
        { id: 'w2', from: 'L', to: 'auxMotor:in' },
        { id: 'w3', from: 'btnStart:out', to: 'btnStop:in' },
        { id: 'w4', from: 'auxMotor:out', to: 'btnStop:in' },
        { id: 'w5', from: 'btnStop:out', to: 'mot1:in' },
        { id: 'w6', from: 'mot1:out', to: 'R' },
      ];
      const res = gradeCircuit(level.initialParts, wires, level);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 16: Forward / Reverse Interlock', () => {
    const level = getLevel(16)!;
    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'pbFwd:in' },
        { id: 'w2', from: 'pbFwd:out', to: 'lockRev:in' },
        { id: 'w3', from: 'lockRev:out', to: 'coilFwd:in' },
        { id: 'w4', from: 'coilFwd:out', to: 'R' },
        { id: 'w5', from: 'L', to: 'pbRev:in' },
        { id: 'w6', from: 'pbRev:out', to: 'lockFwd:in' },
        { id: 'w7', from: 'lockFwd:out', to: 'coilRev:in' },
        { id: 'w8', from: 'coilRev:out', to: 'R' },
      ];
      const res = gradeCircuit(level.initialParts, wires, level);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 17: On-Delay Timer TON', () => {
    const level = getLevel(17)!;
    it('reference solution passes', () => {
      const wires: WireDef[] = [
        ...level.initialWires,
        { id: 'w5', from: 't1Dn:out', to: 'conv:in' },
        { id: 'w6', from: 'conv:out', to: 'R' },
      ];
      const res = gradeCircuit(level.initialParts, wires, level);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 18: Pre-Start Warning Horn Sequence', () => {
    const level = getLevel(18)!;
    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btnStart:in' },
        { id: 'w2', from: 'btnStart:out', to: 'horn:in' },
        { id: 'w3', from: 'btnStart:out', to: 'conv:in' },
        { id: 'w4', from: 'horn:out', to: 'R' },
        { id: 'w5', from: 'conv:out', to: 'R' },
      ];
      const res = gradeCircuit(level.initialParts, wires, level);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 19: Counter Block CTU', () => {
    const level = getLevel(19)!;
    it('reference solution passes', () => {
      const wires: WireDef[] = [
        ...level.initialWires,
        { id: 'w5', from: 'c1Dn:out', to: 'gate:in' },
        { id: 'w6', from: 'gate:out', to: 'R' },
      ];
      const res = gradeCircuit(level.initialParts, wires, level);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 20: Capstone Tank Pump 3-Fault', () => {
    const level = getLevel(20)!;
    it('reference solution (repairing all 3 faults) passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'swRun:in' },
        { id: 'w2', from: 'swRun:out', to: 'swLow:in' },
        { id: 'w3', from: 'swLow:out', to: 'pump:in' },
        { id: 'w4', from: 'pump:out', to: 'R' },
      ];
      const res = gradeCircuit(level.initialParts, wires, level);
      expect(res.passed).toBe(true);
    });
  });

  // Verify Levels 21 to 30 (Write Logic Mode)
  describe('Level 21: Write Direct Contact and Coil', () => {
    const level = getLevel(21)!;
    it('reference rungs pass', () => {
      const rungs: Rung[] = [
        {
          id: 'r0',
          branches: [[{ id: 'c1', type: 'XIC', tag: 'START' }]],
          outputs: [{ id: 'o1', type: 'OTE', tag: 'LAMP' }],
        },
      ];
      const res = gradeRungs(rungs, level, 2);
      expect(res.passed).toBe(true);
    });

    it('wrong logic fails test', () => {
      const rungs: Rung[] = [
        {
          id: 'r0',
          branches: [[{ id: 'c1', type: 'XIO', tag: 'START' }]], // Inverted
          outputs: [{ id: 'o1', type: 'OTE', tag: 'LAMP' }],
        },
      ];
      const res = gradeRungs(rungs, level, 2);
      expect(res.passed).toBe(false);
    });
  });

  describe('Level 22: Write Normally Closed Guard Door', () => {
    const level = getLevel(22)!;
    it('reference rungs pass', () => {
      const rungs: Rung[] = [
        {
          id: 'r0',
          branches: [[{ id: 'c1', type: 'XIO', tag: 'DOOR' }]],
          outputs: [{ id: 'o1', type: 'OTE', tag: 'BUZZER' }],
        },
      ];
      const res = gradeRungs(rungs, level, 2);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 23: Write Two Hand Safety AND Press', () => {
    const level = getLevel(23)!;
    it('reference rungs pass', () => {
      const rungs: Rung[] = [
        {
          id: 'r0',
          branches: [
            [
              { id: 'c1', type: 'XIC', tag: 'PB1' },
              { id: 'c2', type: 'XIC', tag: 'PB2' },
            ],
          ],
          outputs: [{ id: 'o1', type: 'OTE', tag: 'PRESS' }],
        },
      ];
      const res = gradeRungs(rungs, level, 3);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 24: Write Start/Stop Seal-In with Priority', () => {
    const level = getLevel(24)!;
    it('reference rungs pass', () => {
      const rungs: Rung[] = [
        {
          id: 'r0',
          branches: [
            [
              { id: 'c1', type: 'XIC', tag: 'START' },
              { id: 'c2', type: 'XIC', tag: 'STOP' },
            ],
            [
              { id: 'c3', type: 'XIC', tag: 'MOTOR' },
              { id: 'c4', type: 'XIC', tag: 'STOP' },
            ],
          ],
          outputs: [{ id: 'o1', type: 'OTE', tag: 'MOTOR' }],
        },
      ];
      const res = gradeRungs(rungs, level, 5);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 25: Write Tank Latch / Unlatch (OTL / OTU)', () => {
    const level = getLevel(25)!;
    it('reference rungs pass', () => {
      const rungs: Rung[] = [
        {
          id: 'r0',
          branches: [[{ id: 'c1', type: 'XIO', tag: 'LOW' }]],
          outputs: [{ id: 'o1', type: 'OTL', tag: 'VALVE' }],
        },
        {
          id: 'r1',
          branches: [[{ id: 'c2', type: 'XIC', tag: 'HIGH' }]],
          outputs: [{ id: 'o2', type: 'OTU', tag: 'VALVE' }],
        },
      ];
      const res = gradeRungs(rungs, level, 4);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 26: Write On-Delay Conveyor Horn (TON)', () => {
    const level = getLevel(26)!;
    it('reference rungs pass', () => {
      const rungs: Rung[] = [
        {
          id: 'r0',
          branches: [[{ id: 'c1', type: 'XIC', tag: 'START' }]],
          outputs: [
            { id: 'o1', type: 'OTE', tag: 'HORN' },
            { id: 't1', type: 'TON', tag: 'T1', preset: 3000 },
          ],
        },
        {
          id: 'r1',
          branches: [[{ id: 'c2', type: 'XIC', tag: 'T1.DN' }]],
          outputs: [{ id: 'o2', type: 'OTE', tag: 'CONVEYOR' }],
        },
      ];
      const res = gradeRungs(rungs, level, 5);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 27: Write Off-Delay Fan (TOF)', () => {
    const level = getLevel(27)!;
    it('reference rungs pass', () => {
      const rungs: Rung[] = [
        {
          id: 'r0',
          branches: [[{ id: 'c1', type: 'XIC', tag: 'MOTOR_SW' }]],
          outputs: [
            { id: 'o1', type: 'OTE', tag: 'MOTOR' },
            { id: 't1', type: 'TOF', tag: 'T1', preset: 5000 },
          ],
        },
        {
          id: 'r1',
          branches: [[{ id: 'c2', type: 'XIC', tag: 'T1.DN' }]],
          outputs: [{ id: 'o2', type: 'OTE', tag: 'FAN' }],
        },
      ];
      const res = gradeRungs(rungs, level, 5);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 28: Write 5-Box Batch Counter (CTU)', () => {
    const level = getLevel(28)!;
    it('reference rungs pass', () => {
      const rungs: Rung[] = [
        {
          id: 'r0',
          branches: [[{ id: 'c1', type: 'XIC', tag: 'BOX_SENS' }]],
          outputs: [{ id: 'cnt', type: 'CTU', tag: 'C1', preset: 5 }],
        },
        {
          id: 'r1',
          branches: [[{ id: 'c2', type: 'XIC', tag: 'RESET' }]],
          outputs: [{ id: 'res', type: 'RES', tag: 'C1', targetTag: 'C1' }],
        },
        {
          id: 'r2',
          branches: [[{ id: 'c3', type: 'XIC', tag: 'C1.DN' }]],
          outputs: [{ id: 'o1', type: 'OTE', tag: 'GATE' }],
        },
      ];
      const res = gradeRungs(rungs, level, 6);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 29: Write Traffic Light Sequencer', () => {
    const level = getLevel(29)!;
    it('reference rungs pass', () => {
      const rungs: Rung[] = [
        {
          id: 'r0',
          branches: [[{ id: 'c1', type: 'XIC', tag: 'ENABLE' }]],
          outputs: [{ id: 't1', type: 'TON', tag: 'T1', preset: 5000 }],
        },
        {
          id: 'r1',
          branches: [
            [
              { id: 'c2', type: 'XIC', tag: 'ENABLE' },
              { id: 'c3', type: 'XIO', tag: 'T1.DN' },
            ],
          ],
          outputs: [{ id: 'o1', type: 'OTE', tag: 'RED' }],
        },
        {
          id: 'r2',
          branches: [
            [
              { id: 'c4', type: 'XIC', tag: 'ENABLE' },
              { id: 'c5', type: 'XIC', tag: 'T1.DN' },
            ],
          ],
          outputs: [{ id: 'o2', type: 'OTE', tag: 'GREEN' }],
        },
      ];
      const res = gradeRungs(rungs, level, 6);
      expect(res.passed).toBe(true);
    });
  });

  describe('Level 30: Capstone Tank with Pump Protection', () => {
    const level = getLevel(30)!;
    it('reference rungs pass', () => {
      const rungs: Rung[] = [
        {
          id: 'r0',
          branches: [
            [
              { id: 'c1', type: 'XIC', tag: 'RUN' },
              { id: 'c2', type: 'XIC', tag: 'E_STOP' },
              { id: 'c3', type: 'XIO', tag: 'HIGH' },
            ],
          ],
          outputs: [{ id: 'o1', type: 'OTE', tag: 'PUMP' }],
        },
        {
          id: 'r1',
          branches: [[{ id: 'c4', type: 'XIO', tag: 'E_STOP' }]],
          outputs: [{ id: 'o2', type: 'OTE', tag: 'FAULT' }],
        },
      ];
      const res = gradeRungs(rungs, level, 5);
      expect(res.passed).toBe(true);
    });
  });
});
