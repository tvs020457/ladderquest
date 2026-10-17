import React, { useState } from 'react';
import { PlacedPart, WireDef } from '../../levels/types';
import { LOAD_TYPES, getPartTerminals } from '../../engine/connectionChecker';

export interface WiringCanvasProps {
  parts: PlacedPart[];
  wires: WireDef[];
  inputValues: Record<string, number>;
  expectedWiresGuide?: WireDef[];
  onAddWire: (wire: WireDef) => void;
  onRemoveWire: (wireId: string) => void;
  isSimulating?: boolean;
}

interface Point {
  x: number;
  y: number;
}

export const WiringCanvas: React.FC<WiringCanvasProps> = ({
  parts,
  wires,
  inputValues,
  expectedWiresGuide,
  onAddWire,
  onRemoveWire,
  isSimulating = true,
}) => {
  const [selectedTerminal, setSelectedTerminal] = useState<string | null>(null);

  // SVG Dimensions & Grid Layout
  const railLX = 36;
  const railRX = 324;
  const rowHeight = 70;
  const startY = 55;

  // Compute number of rows needed
  const maxRow = Math.max(...parts.map((p) => p.y ?? 0), 1);
  const canvasHeight = Math.max(200, startY + (maxRow + 1) * rowHeight);

  // Calculate terminal absolute positions
  function getTerminalCoord(termId: string): Point {
    if (termId === 'L' || termId.startsWith('L:')) {
      const row = termId.includes(':') ? parseInt(termId.split(':')[1]) || 0 : 0;
      return { x: railLX, y: startY + row * rowHeight };
    }
    if (termId === 'R' || termId.startsWith('R:')) {
      const row = termId.includes(':') ? parseInt(termId.split(':')[1]) || 0 : 0;
      return { x: railRX, y: startY + row * rowHeight };
    }

    const [partId, side] = termId.split(':');
    const part = parts.find((p) => p.id === partId);
    if (!part) return { x: 0, y: 0 };

    const partY = startY + (part.y ?? 0) * rowHeight;
    // Map column x: 0 -> 90, 1 -> 150, 2 -> 210, 3 -> 270
    const colStep = (railRX - railLX - 40) / 4;
    const partCenterX = railLX + 30 + (part.x ?? 1) * colStep;

    const termOffset = side === 'in' ? -22 : 22;
    return { x: partCenterX + termOffset, y: partY };
  }

  // Determine which terminals and wires are currently POWERED
  const poweredTerminals = new Set<string>();
  const poweredWires = new Set<string>();

  if (isSimulating) {
    // Rail L is always energized
    poweredTerminals.add('L');
    for (let r = 0; r <= maxRow; r++) {
      poweredTerminals.add(`L:${r}`);
    }

    // Build wire adjacency
    const wireAdj = new Map<string, WireDef[]>();
    for (const w of wires) {
      if (!wireAdj.has(w.from)) wireAdj.set(w.from, []);
      if (!wireAdj.has(w.to)) wireAdj.set(w.to, []);
      wireAdj.get(w.from)!.push(w);
      wireAdj.get(w.to)!.push(w);
    }

    // Propagate power from L through wires and closed contacts
    const queue: string[] = ['L'];
    for (let r = 0; r <= maxRow; r++) queue.push(`L:${r}`);

    const visited = new Set<string>(queue);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      poweredTerminals.add(curr);

      // Propagate across wires connected to curr
      const neighborWires = wireAdj.get(curr) ?? [];
      for (const w of neighborWires) {
        poweredWires.add(w.id);
        const other = w.from === curr ? w.to : w.from;
        if (!visited.has(other)) {
          visited.add(other);
          queue.push(other);
        }
      }

      // If curr is a contact terminal, check if contact conducts
      if (curr.includes(':')) {
        const [partId, side] = curr.split(':');
        const part = parts.find((p) => p.id === partId);
        if (part && !LOAD_TYPES.has(part.type)) {
          const bitVal = inputValues[part.tag] ?? 0;
          const conducts = part.type === 'XIO' ? bitVal === 0 : bitVal === 1;

          if (conducts) {
            const otherSide = side === 'in' ? `${partId}:out` : `${partId}:in`;
            if (!visited.has(otherSide)) {
              visited.add(otherSide);
              queue.push(otherSide);
            }
          }
        }
      }
    }
  }

  // Count degree of each terminal for junction dots and unconnected pulsing
  const terminalDegrees = new Map<string, number>();
  for (const w of wires) {
    terminalDegrees.set(w.from, (terminalDegrees.get(w.from) ?? 0) + 1);
    terminalDegrees.set(w.to, (terminalDegrees.get(w.to) ?? 0) + 1);
  }

  const handleTerminalTap = (termId: string) => {
    if (!selectedTerminal) {
      setSelectedTerminal(termId);
      return;
    }

    if (selectedTerminal === termId) {
      setSelectedTerminal(null);
      return;
    }

    // Normalize terminal ID if connecting to rail
    let from = selectedTerminal;
    let to = termId;

    if (from.startsWith('L:')) from = 'L';
    if (to.startsWith('L:')) to = 'L';
    if (from.startsWith('R:')) from = 'R';
    if (to.startsWith('R:')) to = 'R';

    // Prevent duplicate wire
    const exists = wires.some(
      (w) =>
        (w.from === from && w.to === to) || (w.from === to && w.to === from)
    );

    if (!exists) {
      onAddWire({
        id: `wire_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        from,
        to,
      });
    }

    setSelectedTerminal(null);
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--color-bg-canvas)',
        borderRadius: '16px',
        border: '2px solid var(--color-bg-tertiary)',
        overflow: 'hidden',
        touchAction: 'none',
        userSelect: 'none',
      }}
    >
      <svg
        viewBox={`0 0 360 ${canvasHeight}`}
        width="100%"
        height="100%"
        style={{ display: 'block' }}
      >
        {/* Background Grid Dots */}
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#17242a" />
        </pattern>
        <rect width="360" height={canvasHeight} fill="url(#grid)" />

        {/* Left Power Rail (L) */}
        <line
          x1={railLX}
          y1={20}
          x2={railLX}
          y2={canvasHeight - 20}
          stroke="#65AABB"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <text
          x={railLX}
          y={15}
          fill="#65AABB"
          fontSize="11"
          fontWeight="900"
          textAnchor="middle"
        >
          L (24V)
        </text>

        {/* Right Neutral Rail (R) */}
        <line
          x1={railRX}
          y1={20}
          x2={railRX}
          y2={canvasHeight - 20}
          stroke="#64748b"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <text
          x={railRX}
          y={15}
          fill="#64748b"
          fontSize="11"
          fontWeight="900"
          textAnchor="middle"
        >
          R (0V)
        </text>

        {/* Rail Tap Terminals for Each Row */}
        {Array.from({ length: maxRow + 1 }).map((_, r) => {
          const lCoord = getTerminalCoord(`L:${r}`);
          const rCoord = getTerminalCoord(`R:${r}`);

          const isLSelected = selectedTerminal === 'L' || selectedTerminal === `L:${r}`;
          const isRSelected = selectedTerminal === 'R' || selectedTerminal === `R:${r}`;

          return (
            <g key={`rail_terms_${r}`}>
              {/* Rail L Terminal */}
              <circle
                cx={lCoord.x}
                cy={lCoord.y}
                r="6"
                fill={isLSelected ? '#BB65AA' : '#65AABB'}
                stroke="#0d161a"
                strokeWidth="2"
              />
              {/* Minimum 44x44px touch hit target */}
              <circle
                cx={lCoord.x}
                cy={lCoord.y}
                r="22"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onClick={() => handleTerminalTap(`L:${r}`)}
              />

              {/* Rail R Terminal */}
              <circle
                cx={rCoord.x}
                cy={rCoord.y}
                r="6"
                fill={isRSelected ? '#BB65AA' : '#94a3b8'}
                stroke="#0d161a"
                strokeWidth="2"
              />
              <circle
                cx={rCoord.x}
                cy={rCoord.y}
                r="22"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onClick={() => handleTerminalTap(`R:${r}`)}
              />
            </g>
          );
        })}

        {/* Expected Wire Guide Lines (Dotted) for Levels 1-4 */}
        {expectedWiresGuide &&
          expectedWiresGuide.map((guide, idx) => {
            const p1 = getTerminalCoord(guide.from);
            const p2 = getTerminalCoord(guide.to);
            return (
              <line
                key={`guide_${idx}`}
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="#65AABB"
                strokeWidth="2"
                strokeDasharray="4 4"
                strokeOpacity="0.4"
              />
            );
          })}

        {/* Placed Components */}
        {parts.map((part) => {
          const { in: inTerm, out: outTerm } = getPartTerminals(part);
          const pIn = getTerminalCoord(inTerm);
          const pOut = getTerminalCoord(outTerm);
          const centerX = (pIn.x + pOut.x) / 2;
          const centerY = pIn.y;
          const isLoad = LOAD_TYPES.has(part.type);

          const bitVal = inputValues[part.tag] ?? 0;
          const conducts = isLoad
            ? false
            : part.type === 'XIO'
            ? bitVal === 0
            : bitVal === 1;

          return (
            <g key={part.id}>
              {/* Component Label */}
              <text
                x={centerX}
                y={centerY - 18}
                fill={conducts ? '#BB65AA' : '#94a3b8'}
                fontSize="11"
                fontWeight="800"
                textAnchor="middle"
              >
                {part.tag}
              </text>

              {/* Contact / Load Symbol */}
              {isLoad ? (
                // Coil / Lamp / Motor Symbol: ( )
                <g>
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r="14"
                    fill="#17242a"
                    stroke={poweredTerminals.has(inTerm) ? '#AABB65' : '#64748b'}
                    strokeWidth="3"
                  />
                  <text
                    x={centerX}
                    y={centerY + 4}
                    fill={poweredTerminals.has(inTerm) ? '#AABB65' : '#e2e8f0'}
                    fontSize="10"
                    fontWeight="900"
                    textAnchor="middle"
                  >
                    {part.type === 'LAMP'
                      ? '💡'
                      : part.type === 'MOTOR'
                      ? 'M'
                      : part.type === 'HORN' || part.type === 'BUZZER'
                      ? '🔊'
                      : 'OUT'}
                  </text>
                  {/* Lead stubs */}
                  <line x1={pIn.x} y1={centerY} x2={centerX - 14} y2={centerY} stroke="#64748b" strokeWidth="2.5" />
                  <line x1={centerX + 14} y1={centerY} x2={pOut.x} y2={centerY} stroke="#64748b" strokeWidth="2.5" />
                </g>
              ) : (
                // Contact Symbol: | | (XIC) or |/| (XIO)
                <g>
                  {/* Left lead */}
                  <line x1={pIn.x} y1={centerY} x2={centerX - 8} y2={centerY} stroke={conducts ? '#BB65AA' : '#64748b'} strokeWidth="2.5" />
                  {/* Right lead */}
                  <line x1={centerX + 8} y1={centerY} x2={pOut.x} y2={centerY} stroke={conducts ? '#BB65AA' : '#64748b'} strokeWidth="2.5" />
                  {/* Contact plates */}
                  <line x1={centerX - 8} y1={centerY - 12} x2={centerX - 8} y2={centerY + 12} stroke={conducts ? '#BB65AA' : '#94a3b8'} strokeWidth="3" />
                  <line x1={centerX + 8} y1={centerY - 12} x2={centerX + 8} y2={centerY + 12} stroke={conducts ? '#BB65AA' : '#94a3b8'} strokeWidth="3" />
                  {/* Diagonal slash for XIO */}
                  {part.type === 'XIO' && (
                    <line x1={centerX - 10} y1={centerY + 14} x2={centerX + 10} y2={centerY - 14} stroke={conducts ? '#BB65AA' : '#ef4444'} strokeWidth="2.5" />
                  )}
                </g>
              )}

              {/* Component Terminals */}
              {[
                { termId: inTerm, coord: pIn, side: 'in' },
                { termId: outTerm, coord: pOut, side: 'out' },
              ].map(({ termId, coord }) => {
                const isSelected = selectedTerminal === termId;
                const deg = terminalDegrees.get(termId) ?? 0;
                const isUnconnected = deg === 0;
                const isPowered = poweredTerminals.has(termId);

                return (
                  <g key={termId}>
                    {/* Unconnected Terminal Pulse Animation */}
                    {isUnconnected && (
                      <circle
                        cx={coord.x}
                        cy={coord.y}
                        r="6"
                        fill="none"
                        stroke="#BB65AA"
                        strokeWidth="2"
                        style={{
                          animation: 'pulseTerminal 1.4s ease-in-out infinite',
                        }}
                      />
                    )}

                    {/* Terminal Circle */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r={isSelected ? '6.5' : '4.5'}
                      fill={
                        isSelected
                          ? '#BB65AA'
                          : isPowered
                          ? '#BB65AA'
                          : isUnconnected
                          ? '#ef4444'
                          : '#65AABB'
                      }
                      stroke="#0d161a"
                      strokeWidth="2"
                    />

                    {/* Touch Target (Minimum 44x44px) */}
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r="22"
                      fill="transparent"
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleTerminalTap(termId)}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* Drawn Wires */}
        {wires.map((wire) => {
          const p1 = getTerminalCoord(wire.from);
          const p2 = getTerminalCoord(wire.to);
          const isPowered = poweredWires.has(wire.id);

          // Orthogonal path routing
          let pathD = '';
          if (p1.y === p2.y) {
            pathD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
          } else if (p1.x === p2.x) {
            pathD = `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
          } else {
            const midX = (p1.x + p2.x) / 2;
            pathD = `M ${p1.x} ${p1.y} L ${midX} ${p1.y} L ${midX} ${p2.y} L ${p2.x} ${p2.y}`;
          }

          return (
            <g key={wire.id}>
              {/* Visible Wire */}
              <path
                d={pathD}
                fill="none"
                stroke={isPowered ? '#BB65AA' : '#64748b'}
                strokeWidth={isPowered ? '3.5' : '2.5'}
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  filter: isPowered ? 'drop-shadow(0 0 6px #BB65AA)' : 'none',
                  transition: 'stroke 0.15s ease',
                }}
              />

              {/* Wire Click Hit Area (44px width for effortless tap-to-delete) */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth="44"
                style={{ cursor: 'pointer' }}
                onClick={() => onRemoveWire(wire.id)}
              />
            </g>
          );
        })}

        {/* Junction Dots at Branch Intersections (Degree >= 2 or junction nodes) */}
        {Array.from(terminalDegrees.entries()).map(([termId, deg]) => {
          if (deg >= 2) {
            const coord = getTerminalCoord(termId);
            const isPowered = poweredTerminals.has(termId);
            return (
              <circle
                key={`junction_${termId}`}
                cx={coord.x}
                cy={coord.y}
                r="5"
                fill={isPowered ? '#BB65AA' : '#65AABB'}
                stroke="#0d161a"
                strokeWidth="1.5"
              />
            );
          }
          return null;
        })}
      </svg>
    </div>
  );
};
