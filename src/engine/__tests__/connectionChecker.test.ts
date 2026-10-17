import { describe, it, expect } from 'vitest';
import { checkCircuitTopology } from '../connectionChecker';
import { PlacedPart, WireDef } from '../../levels/types';

describe('Connection Checker (Part 4 Rules)', () => {
  it('detects a direct short circuit between Rail L and Rail R', () => {
    const parts: PlacedPart[] = [
      { id: 'lamp1', type: 'LAMP', tag: 'LAMP', x: 3, y: 0 },
    ];
    // A wire directly connects L to R
    const wires: WireDef[] = [
      { id: 'w_short', from: 'L', to: 'R' },
      { id: 'w1', from: 'L', to: 'lamp1:in' },
      { id: 'w2', from: 'lamp1:out', to: 'R' },
    ];

    const result = checkCircuitTopology(parts, wires);
    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('SHORT_CIRCUIT');
    expect(result.message).toBe(
      'Power goes straight from the left rail to the right rail. Something needs to be in the way.'
    );
  });

  it('detects a short circuit through switches without a load in between', () => {
    const parts: PlacedPart[] = [
      { id: 'sw1', type: 'SWITCH', tag: 'START', x: 1, y: 0 },
    ];
    // L -> sw1:in, sw1:out -> R (no coil, lamp, or load in between!)
    const wires: WireDef[] = [
      { id: 'w1', from: 'L', to: 'sw1:in' },
      { id: 'w2', from: 'sw1:out', to: 'R' },
    ];

    const result = checkCircuitTopology(parts, wires);
    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('SHORT_CIRCUIT');
  });

  it('detects a floating terminal on a component', () => {
    const parts: PlacedPart[] = [
      { id: 'btn1', type: 'SWITCH', tag: 'START', x: 1, y: 0 },
      { id: 'lamp1', type: 'LAMP', tag: 'LAMP', x: 3, y: 0 },
    ];
    // lamp1:out is not wired to anything!
    const wires: WireDef[] = [
      { id: 'w1', from: 'L', to: 'btn1:in' },
      { id: 'w2', from: 'btn1:out', to: 'lamp1:in' },
    ];

    const result = checkCircuitTopology(parts, wires);
    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('FLOATING_TERMINAL');
    expect(result.message).toContain("lamp's right side isn't connected");
  });

  it('detects a coil/load wired backwards or to the wrong rail', () => {
    const parts: PlacedPart[] = [
      { id: 'lamp1', type: 'LAMP', tag: 'LAMP', x: 1, y: 0 },
      { id: 'btn1', type: 'SWITCH', tag: 'START', x: 3, y: 0 },
    ];
    // Lamp is connected to L and outputs to button, which outputs to R
    const wires: WireDef[] = [
      { id: 'w1', from: 'L', to: 'lamp1:out' },
      { id: 'w2', from: 'lamp1:in', to: 'btn1:in' },
      { id: 'w3', from: 'btn1:out', to: 'R' },
    ];

    const result = checkCircuitTopology(parts, wires);
    expect(result.valid).toBe(false);
    expect(result.errorType).toBe('WRONG_RAIL');
  });
});
