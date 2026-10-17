import React from 'react';
import { InstructionType } from '../../engine/types';

interface PartsTrayProps {
  allowedElements: InstructionType[];
  selectedElement: InstructionType | null;
  onSelectElement: (type: InstructionType | null) => void;
  onAddRung?: () => void;
  onAddBranch?: () => void;
}

export const PartsTray: React.FC<PartsTrayProps> = ({
  allowedElements,
  selectedElement,
  onSelectElement,
  onAddRung,
  onAddBranch,
}) => {
  const ELEMENT_LABELS: Record<InstructionType, { symbol: string; name: string }> = {
    XIC: { symbol: '—[ ]—', name: 'NO Contact' },
    XIO: { symbol: '—[/]—', name: 'NC Contact' },
    OTE: { symbol: '—( )—', name: 'Output Coil' },
    OTL: { symbol: '—(L)—', name: 'Latch' },
    OTU: { symbol: '—(U)—', name: 'Unlatch' },
    TON: { symbol: '[TON]', name: 'On Timer' },
    TOF: { symbol: '[TOF]', name: 'Off Timer' },
    CTU: { symbol: '[CTU]', name: 'Counter' },
    RES: { symbol: '—(R)—', name: 'Reset' },
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: '16px',
        padding: '12px 10px',
        border: '1px solid var(--color-bg-tertiary)',
        boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.4)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
          Parts Tray (Tap part, then tap rung slot)
        </span>
        {selectedElement && (
          <button
            onClick={() => onSelectElement(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-2)',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              padding: '2px',
              minHeight: 'auto',
              minWidth: 'auto',
            }}
          >
            Clear Selected ({selectedElement})
          </button>
        )}
      </div>

      {/* Allowed Instruction Buttons */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
        }}
      >
        {allowedElements.map((elem) => {
          const isSelected = selectedElement === elem;
          const info = ELEMENT_LABELS[elem] || { symbol: elem, name: elem };

          return (
            <button
              key={elem}
              onClick={() => onSelectElement(isSelected ? null : elem)}
              style={{
                minWidth: '76px',
                minHeight: '52px',
                borderRadius: '12px',
                backgroundColor: isSelected ? 'var(--color-2)' : '#0d161a',
                color: isSelected ? '#ffffff' : '#f8fafc',
                border: isSelected ? '2px solid var(--color-2-light)' : '1px solid #23353e',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: isSelected ? '0 3px 0 var(--color-2-dark)' : '0 3px 0 #091013',
                transition: 'transform 0.08s ease, background-color 0.1s ease',
              }}
              aria-label={`Select ${info.name}`}
            >
              <span style={{ fontSize: '0.9rem', fontWeight: 900, fontFamily: 'monospace' }}>
                {info.symbol}
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 700, opacity: 0.9, marginTop: '2px' }}>
                {elem}
              </span>
            </button>
          );
        })}

        {/* Structural Actions: Add Branch / Add Rung */}
        {onAddBranch && (
          <button
            onClick={onAddBranch}
            style={{
              minWidth: '68px',
              minHeight: '52px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-bg-canvas)',
              color: 'var(--color-1)',
              border: '1px dashed var(--color-1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 900 }}>⤹</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>+ Branch</span>
          </button>
        )}

        {onAddRung && (
          <button
            onClick={onAddRung}
            style={{
              minWidth: '68px',
              minHeight: '52px',
              borderRadius: '12px',
              backgroundColor: 'var(--color-bg-canvas)',
              color: 'var(--color-1)',
              border: '1px dashed var(--color-1)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '1rem', fontWeight: 900 }}>+</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 700 }}>+ Rung</span>
          </button>
        )}
      </div>
    </div>
  );
};
