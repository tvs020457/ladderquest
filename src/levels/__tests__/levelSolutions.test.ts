import { describe, it, expect } from 'vitest';
import { getLevel } from '../index';
import { gradeCircuit } from '../../engine/grader';
import { WireDef } from '../types';

describe('Level Solutions & Failing Diagnostics (Levels 1 to 8)', () => {
  describe('Level 1: The First Wire (complete mode)', () => {
    const level = getLevel(1)!;

    it('reference solution passes with full stars', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btn1:in' },
        { id: 'w2', from: 'btn1:out', to: 'lamp1:in' },
        { id: 'w3', from: 'lamp1:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(true);
      expect(result.starsEarned).toBeGreaterThanOrEqual(2);
    });

    it('wrong solution with missing wire fails with floating terminal message', () => {
      // Only the initial wires, missing the bridge between btn1 and lamp1
      const result = gradeCircuit(level.initialParts, level.initialWires, level);
      expect(result.passed).toBe(false);
      expect(result.errorType).toBe('FLOATING_TERMINAL');
      expect(result.connectionError?.toLowerCase()).toContain("start's right side isn't connected");
    });
  });

  describe('Level 2: Two Missing Wires (complete mode)', () => {
    const level = getLevel(2)!;

    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btn1:in' },
        { id: 'w2', from: 'btn1:out', to: 'lamp1:in' },
        { id: 'w3', from: 'lamp1:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(true);
    });

    it('wrong solution missing feed from Rail L fails with floating terminal', () => {
      const wires: WireDef[] = [
        { id: 'w2', from: 'btn1:out', to: 'lamp1:in' },
        { id: 'w3', from: 'lamp1:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(false);
      expect(result.errorType).toBe('FLOATING_TERMINAL');
      expect(result.connectionError?.toLowerCase()).toContain("start's left side isn't connected");
    });
  });

  describe('Level 3: Build From Scratch (build mode)', () => {
    const level = getLevel(3)!;

    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btn1:in' },
        { id: 'w2', from: 'btn1:out', to: 'lamp1:in' },
        { id: 'w3', from: 'lamp1:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(true);
    });

    it('wrong solution connecting switch straight to R creates short circuit', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btn1:in' },
        { id: 'w2', from: 'btn1:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(false);
      expect(result.errorType).toBe('SHORT_CIRCUIT');
      expect(result.connectionError).toBe(
        'Power goes straight from the left rail to the right rail. Something needs to be in the way.'
      );
    });
  });

  describe('Level 4: Which Rail is Which? (build mode)', () => {
    const level = getLevel(4)!;

    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btn1:in' },
        { id: 'w2', from: 'btn1:out', to: 'lamp1:in' },
        { id: 'w3', from: 'lamp1:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(true);
    });

    it('wrong solution wiring lamp to Rail L fails with wrong-rail diagnostic', () => {
      // Connects lamp to L and button to R
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'lamp1:out' },
        { id: 'w2', from: 'lamp1:in', to: 'btn1:in' },
        { id: 'w3', from: 'btn1:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(false);
      expect(result.errorType).toBe('WRONG_RAIL');
      expect(result.connectionError).toContain('wired backwards');
    });
  });

  describe('Level 5: Guard Door Switch NC (build mode)', () => {
    const level = getLevel(5)!;

    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'sw1:in' },
        { id: 'w2', from: 'sw1:out', to: 'buzzer1:in' },
        { id: 'w3', from: 'buzzer1:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(true);
    });

    it('wrong solution with bypass around door switch sounds buzzer continuously', () => {
      // Direct feed to buzzer bypassing switch
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'buzzer1:in' },
        { id: 'w2', from: 'buzzer1:out', to: 'R' },
        { id: 'w3', from: 'sw1:in', to: 'sw1:out' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(false);
      // Fails behavior test because buzzer is ON when door is closed
      expect(result.failingTest).toBeDefined();
      expect(result.failingTest?.failure?.signalName).toBe('BUZZER');
    });
  });

  describe('Level 6: Two Contacts in Series AND (build mode)', () => {
    const level = getLevel(6)!;

    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'pb1:in' },
        { id: 'w2', from: 'pb1:out', to: 'pb2:in' },
        { id: 'w3', from: 'pb2:out', to: 'press1:in' },
        { id: 'w4', from: 'press1:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(true);
    });

    it('wrong solution wiring in parallel fails when single button is pressed', () => {
      // Wire in parallel: both PB1 and PB2 connected to L, and both output to press1
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'pb1:in' },
        { id: 'w2', from: 'L', to: 'pb2:in' },
        { id: 'w3', from: 'pb1:out', to: 'press1:in' },
        { id: 'w4', from: 'pb2:out', to: 'press1:in' },
        { id: 'w5', from: 'press1:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(false);
      expect(result.failingTest?.failure?.message).toContain('PRESS must NOT run');
    });
  });

  describe('Level 7: Two Contacts in Parallel OR (build mode)', () => {
    const level = getLevel(7)!;

    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btnA:in' },
        { id: 'w2', from: 'L', to: 'btnB:in' },
        { id: 'w3', from: 'btnA:out', to: 'bell1:in' },
        { id: 'w4', from: 'btnB:out', to: 'bell1:in' },
        { id: 'w5', from: 'bell1:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(true);
    });

    it('wrong solution wiring in series fails when only CALL_A is pressed', () => {
      // Wire in series instead of parallel
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btnA:in' },
        { id: 'w2', from: 'btnA:out', to: 'btnB:in' },
        { id: 'w3', from: 'btnB:out', to: 'bell1:in' },
        { id: 'w4', from: 'bell1:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(false);
      expect(result.failingTest?.failure?.signalName).toBe('BELL');
    });
  });

  describe('Level 8: Combined (A or B) and C (build mode)', () => {
    const level = getLevel(8)!;

    it('reference solution passes', () => {
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btnManual:in' },
        { id: 'w2', from: 'L', to: 'swAuto:in' },
        { id: 'w3', from: 'btnManual:out', to: 'swGate:in' },
        { id: 'w4', from: 'swAuto:out', to: 'swGate:in' },
        { id: 'w5', from: 'swGate:out', to: 'conv:in' },
        { id: 'w6', from: 'conv:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(true);
    });

    it('wrong solution bypassing gate fails safety check when gate is open', () => {
      // Bypasses GATE by wiring swAuto straight to conv
      const wires: WireDef[] = [
        { id: 'w1', from: 'L', to: 'btnManual:in' },
        { id: 'w2', from: 'L', to: 'swAuto:in' },
        { id: 'w3', from: 'btnManual:out', to: 'swGate:in' },
        { id: 'w4', from: 'swAuto:out', to: 'conv:in' }, // BYPASS!
        { id: 'w5', from: 'swGate:out', to: 'conv:in' },
        { id: 'w6', from: 'conv:out', to: 'R' },
      ];
      const result = gradeCircuit(level.initialParts, wires, level);
      expect(result.passed).toBe(false);
      expect(result.failingTest?.failure?.message).toContain('GATE open');
    });
  });
});
