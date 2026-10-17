import { describe, it, expect, beforeEach } from 'vitest';
import {
  evaluateContact,
  evaluateBranch,
  evaluateRungCondition,
  evaluateCoil,
  updateTimer,
  updateCounter,
  executeReset,
  readBit,
} from '../elements';
import {
  PlcMemoryState,
  TimerData,
  CounterData,
} from '../types';

describe('PLC Engine Elements', () => {
  let memory: PlcMemoryState;

  beforeEach(() => {
    memory = {
      inputs: {},
      outputs: {},
      internal: {},
      timers: {},
      counters: {},
    };
  });

  describe('XIC (Normally Open Contact)', () => {
    it('passes power when its bit is 1', () => {
      memory.inputs['START'] = 1;
      const result = evaluateContact({ id: 'c1', type: 'XIC', tag: 'START' }, memory);
      expect(result).toBe(true);
    });

    it('blocks power when its bit is 0', () => {
      memory.inputs['START'] = 0;
      const result = evaluateContact({ id: 'c1', type: 'XIC', tag: 'START' }, memory);
      expect(result).toBe(false);
    });

    it('reads timer .DN and counter .DN bits via dot notation', () => {
      memory.timers['T1'] = { ACC: 1000, PRE: 1000, EN: true, TT: false, DN: true };
      memory.counters['C1'] = { ACC: 5, PRE: 5, DN: true, prevRungState: true };

      expect(evaluateContact({ id: 'c2', type: 'XIC', tag: 'T1.DN' }, memory)).toBe(true);
      expect(evaluateContact({ id: 'c3', type: 'XIC', tag: 'C1.DN' }, memory)).toBe(true);
    });
  });

  describe('XIO (Normally Closed Contact)', () => {
    it('passes power when its bit is 0', () => {
      memory.inputs['DOOR'] = 0;
      const result = evaluateContact({ id: 'c1', type: 'XIO', tag: 'DOOR' }, memory);
      expect(result).toBe(true);
    });

    it('blocks power when its bit is 1', () => {
      memory.inputs['DOOR'] = 1;
      const result = evaluateContact({ id: 'c1', type: 'XIO', tag: 'DOOR' }, memory);
      expect(result).toBe(false);
    });
  });

  describe('Branch Logic (Series AND, Parallel OR)', () => {
    it('evaluates series contacts as AND', () => {
      memory.inputs['PB1'] = 1;
      memory.inputs['PB2'] = 0;

      const branch = [
        { id: '1', type: 'XIC' as const, tag: 'PB1' },
        { id: '2', type: 'XIC' as const, tag: 'PB2' },
      ];
      expect(evaluateBranch(branch, memory)).toBe(false);

      memory.inputs['PB2'] = 1;
      expect(evaluateBranch(branch, memory)).toBe(true);
    });

    it('evaluates parallel branches as OR', () => {
      memory.inputs['START_LOCAL'] = 0;
      memory.inputs['START_REMOTE'] = 1;

      const branches = [
        [{ id: '1', type: 'XIC' as const, tag: 'START_LOCAL' }],
        [{ id: '2', type: 'XIC' as const, tag: 'START_REMOTE' }],
      ];
      expect(evaluateRungCondition(branches, memory)).toBe(true);

      memory.inputs['START_REMOTE'] = 0;
      expect(evaluateRungCondition(branches, memory)).toBe(false);
    });
  });

  describe('Coils (OTE, OTL, OTU)', () => {
    it('OTE writes 1 when rung is true and 0 when rung is false', () => {
      evaluateCoil({ id: 'o1', type: 'OTE', tag: 'MOTOR' }, true, memory);
      expect(readBit('MOTOR', memory)).toBe(1);

      evaluateCoil({ id: 'o1', type: 'OTE', tag: 'MOTOR' }, false, memory);
      expect(readBit('MOTOR', memory)).toBe(0);
    });

    it('OTL latches 1 on true and preserves state on false', () => {
      evaluateCoil({ id: 'l1', type: 'OTL', tag: 'VALVE' }, true, memory);
      expect(readBit('VALVE', memory)).toBe(1);

      evaluateCoil({ id: 'l1', type: 'OTL', tag: 'VALVE' }, false, memory);
      expect(readBit('VALVE', memory)).toBe(1);
    });

    it('OTU unlatches 0 on true and preserves state on false', () => {
      memory.internal['VALVE'] = 1;
      evaluateCoil({ id: 'u1', type: 'OTU', tag: 'VALVE' }, false, memory);
      expect(readBit('VALVE', memory)).toBe(1);

      evaluateCoil({ id: 'u1', type: 'OTU', tag: 'VALVE' }, true, memory);
      expect(readBit('VALVE', memory)).toBe(0);
    });
  });

  describe('TON (On-Delay Timer)', () => {
    let timer: TimerData;

    beforeEach(() => {
      timer = { ACC: 0, PRE: 30, EN: false, TT: false, DN: false };
    });

    it('accumulates time when rung is true and sets .DN when ACC >= PRE', () => {
      // 10ms scan
      updateTimer(timer, true, 10, 'TON');
      expect(timer.ACC).toBe(10);
      expect(timer.EN).toBe(true);
      expect(timer.TT).toBe(true);
      expect(timer.DN).toBe(false);

      // 20ms
      updateTimer(timer, true, 10, 'TON');
      expect(timer.ACC).toBe(20);
      expect(timer.DN).toBe(false);

      // 30ms -> PRE reached
      updateTimer(timer, true, 10, 'TON');
      expect(timer.ACC).toBe(30);
      expect(timer.TT).toBe(false);
      expect(timer.DN).toBe(true);
    });

    it('resets immediately when rung goes false', () => {
      updateTimer(timer, true, 20, 'TON');
      expect(timer.ACC).toBe(20);

      // Rung drops false
      updateTimer(timer, false, 10, 'TON');
      expect(timer.ACC).toBe(0);
      expect(timer.EN).toBe(false);
      expect(timer.TT).toBe(false);
      expect(timer.DN).toBe(false);
    });
  });

  describe('TOF (Off-Delay Timer)', () => {
    let timer: TimerData;

    beforeEach(() => {
      timer = { ACC: 0, PRE: 30, EN: false, TT: false, DN: false };
    });

    it('sets .DN immediately on true and delays turning off when rung goes false', () => {
      // While rung is true: DN = 1, ACC = 0
      updateTimer(timer, true, 10, 'TOF');
      expect(timer.DN).toBe(true);
      expect(timer.ACC).toBe(0);

      // Rung goes false: begins timing, DN remains true
      updateTimer(timer, false, 10, 'TOF');
      expect(timer.ACC).toBe(10);
      expect(timer.TT).toBe(true);
      expect(timer.DN).toBe(true);

      updateTimer(timer, false, 10, 'TOF');
      expect(timer.ACC).toBe(20);
      expect(timer.DN).toBe(true);

      // Reaches PRE: DN goes false
      updateTimer(timer, false, 10, 'TOF');
      expect(timer.ACC).toBe(30);
      expect(timer.TT).toBe(false);
      expect(timer.DN).toBe(false);
    });

    it('restarting input before delay expires resets ACC and keeps DN on', () => {
      updateTimer(timer, true, 10, 'TOF');
      updateTimer(timer, false, 10, 'TOF'); // ACC = 10
      expect(timer.ACC).toBe(10);

      // Input goes true again
      updateTimer(timer, true, 10, 'TOF');
      expect(timer.ACC).toBe(0);
      expect(timer.DN).toBe(true);
    });
  });

  describe('CTU (Count Up Counter)', () => {
    let counter: CounterData;

    beforeEach(() => {
      counter = { ACC: 0, PRE: 3, DN: false, prevRungState: false };
    });

    it('increments on false-to-true edge and sets .DN at preset', () => {
      updateCounter(counter, true, 'CTU');
      expect(counter.ACC).toBe(1);
      expect(counter.DN).toBe(false);

      updateCounter(counter, false, 'CTU');
      updateCounter(counter, true, 'CTU');
      expect(counter.ACC).toBe(2);

      updateCounter(counter, false, 'CTU');
      updateCounter(counter, true, 'CTU');
      expect(counter.ACC).toBe(3);
      expect(counter.DN).toBe(true);
    });

    it('held input counts ONCE and does not increment on consecutive scans', () => {
      // First scan: edge detected -> count = 1
      updateCounter(counter, true, 'CTU');
      expect(counter.ACC).toBe(1);

      // Next 5 scans: input stays held true
      for (let i = 0; i < 5; i++) {
        updateCounter(counter, true, 'CTU');
        expect(counter.ACC).toBe(1);
      }
    });
  });

  describe('RES (Reset)', () => {
    it('clears timer and counter ACC and DN', () => {
      memory.timers['T1'] = { ACC: 500, PRE: 1000, EN: true, TT: true, DN: false };
      memory.counters['C1'] = { ACC: 4, PRE: 4, DN: true, prevRungState: true };

      executeReset('T1', memory);
      expect(memory.timers['T1'].ACC).toBe(0);
      expect(memory.timers['T1'].DN).toBe(false);

      executeReset('C1', memory);
      expect(memory.counters['C1'].ACC).toBe(0);
      expect(memory.counters['C1'].DN).toBe(false);
    });
  });
});
