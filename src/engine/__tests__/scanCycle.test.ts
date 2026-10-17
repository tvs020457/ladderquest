import { describe, it, expect } from 'vitest';
import { PlcSimulator } from '../scanCycle';
import { Rung } from '../types';

describe('PlcSimulator & Scan Cycle Rules', () => {
  it('coil new value is visible to rungs BELOW it in the same scan', () => {
    // Rung 0: XIC START -> OTE M1
    // Rung 1: XIC M1 -> OTE MOTOR
    const rungs: Rung[] = [
      {
        id: 'r0',
        branches: [[{ id: 'c0', type: 'XIC', tag: 'START' }]],
        outputs: [{ id: 'o0', type: 'OTE', tag: 'M1' }],
      },
      {
        id: 'r1',
        branches: [[{ id: 'c1', type: 'XIC', tag: 'M1' }]],
        outputs: [{ id: 'o1', type: 'OTE', tag: 'MOTOR' }],
      },
    ];

    const plc = new PlcSimulator(rungs, {
      declaredInputs: ['START'],
      declaredOutputs: ['MOTOR'],
    });

    const result = plc.step({ START: 1 });
    expect(result.memory.internal['M1']).toBe(1);
    expect(result.memory.outputs['MOTOR']).toBe(1);
  });

  it('coil new value is visible to rungs ABOVE it in the NEXT scan', () => {
    // Rung 0: XIC M2 -> OTE LAMP
    // Rung 1: XIC BUTTON -> OTE M2
    const rungs: Rung[] = [
      {
        id: 'r0',
        branches: [[{ id: 'c0', type: 'XIC', tag: 'M2' }]],
        outputs: [{ id: 'o0', type: 'OTE', tag: 'LAMP' }],
      },
      {
        id: 'r1',
        branches: [[{ id: 'c1', type: 'XIC', tag: 'BUTTON' }]],
        outputs: [{ id: 'o1', type: 'OTE', tag: 'M2' }],
      },
    ];

    const plc = new PlcSimulator(rungs, {
      declaredInputs: ['BUTTON'],
      declaredOutputs: ['LAMP'],
    });

    // Scan 1: BUTTON pressed
    const scan1 = plc.step({ BUTTON: 1 });
    // In Scan 1, Rung 0 executed before Rung 1 set M2, so LAMP should still be 0!
    expect(scan1.memory.outputs['LAMP']).toBe(0);
    expect(scan1.memory.internal['M2']).toBe(1);

    // Scan 2: BUTTON still held
    const scan2 = plc.step({ BUTTON: 1 });
    // In Scan 2, Rung 0 now sees M2=1 from previous scan -> LAMP becomes 1!
    expect(scan2.memory.outputs['LAMP']).toBe(1);
  });

  it('last OTE wins when same coil bit is used in multiple rungs, and produces warning', () => {
    // Rung 0: XIC TRUE -> OTE COIL (sets to 1)
    // Rung 1: XIC FALSE -> OTE COIL (sets to 0)
    const rungs: Rung[] = [
      {
        id: 'r0',
        branches: [[{ id: 'c0', type: 'XIC', tag: 'IN1' }]],
        outputs: [{ id: 'o0', type: 'OTE', tag: 'COIL' }],
      },
      {
        id: 'r1',
        branches: [[{ id: 'c1', type: 'XIC', tag: 'IN2' }]],
        outputs: [{ id: 'o1', type: 'OTE', tag: 'COIL' }],
      },
    ];

    const plc = new PlcSimulator(rungs, {
      declaredInputs: ['IN1', 'IN2'],
      declaredOutputs: ['COIL'],
    });

    const result = plc.step({ IN1: 1, IN2: 0 });
    // Last rung wins -> COIL is 0
    expect(result.memory.outputs['COIL']).toBe(0);
    // Must generate warning
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0].type).toBe('DUPLICATE_OTE');
    expect(result.warnings[0].tag).toBe('COIL');
    expect(result.warnings[0].rungIndices).toEqual([0, 1]);
  });

  it('correctly implements classic seal-in circuit with STOP priority', () => {
    // Rung 0: (START OR MOTOR) AND STOP_NC -> OTE MOTOR
    // Note: STOP is wired NC, so STOP_NC=1 means unpressed, STOP_NC=0 means pressed
    const rungs: Rung[] = [
      {
        id: 'r0',
        branches: [
          [
            { id: 'c_start', type: 'XIC', tag: 'START' },
            { id: 'c_stop1', type: 'XIC', tag: 'STOP_NC' },
          ],
          [
            { id: 'c_motor', type: 'XIC', tag: 'MOTOR' },
            { id: 'c_stop2', type: 'XIC', tag: 'STOP_NC' },
          ],
        ],
        outputs: [{ id: 'o_motor', type: 'OTE', tag: 'MOTOR' }],
      },
    ];

    const plc = new PlcSimulator(rungs, {
      declaredInputs: ['START', 'STOP_NC'],
      declaredOutputs: ['MOTOR'],
    });

    // Initial state: STOP unpressed (1), START unpressed (0)
    plc.step({ START: 0, STOP_NC: 1 });
    expect(plc.getOutput('MOTOR')).toBe(0);

    // Press START
    plc.step({ START: 1, STOP_NC: 1 });
    expect(plc.getOutput('MOTOR')).toBe(1);

    // Release START -> MOTOR must seal in and remain 1
    plc.step({ START: 0, STOP_NC: 1 });
    expect(plc.getOutput('MOTOR')).toBe(1);

    // Press STOP (STOP_NC becomes 0) -> MOTOR turns off
    plc.step({ START: 0, STOP_NC: 0 });
    expect(plc.getOutput('MOTOR')).toBe(0);

    // Release STOP -> MOTOR stays 0 until START is pressed again
    plc.step({ START: 0, STOP_NC: 1 });
    expect(plc.getOutput('MOTOR')).toBe(0);

    // STOP Priority: Both START and STOP pressed simultaneously -> MOTOR must remain 0
    plc.step({ START: 1, STOP_NC: 0 });
    expect(plc.getOutput('MOTOR')).toBe(0);
  });
});
