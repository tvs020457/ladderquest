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
  const ELEMENT_LABELS: Record<InstructionType, { symbol: string; name: string; standard: string }> = {
    XIC: { symbol: '—| |—', name: 'Normally Open', standard: 'IEC 61131-3' },
    XIO: { symbol: '—|/|—', name: 'Normally Closed', standard: 'IEC 61131-3' },
    OTE: { symbol: '—( )—', name: 'Normal Coil', standard: 'IEC 61131-3' },
    OTL: { symbol: '—(S)—', name: 'Set (Latch)', standard: 'IEC 61131-3' },
    OTU: { symbol: '—(R)—', name: 'Reset (Unlatch)', standard: 'IEC 61131-3' },
    TON: { symbol: '┌─TON─┐', name: 'On-Delay Timer', standard: 'IEC 61131-3' },
    TOF: { symbol: '┌─TOF─┐', name: 'Off-Delay Timer', standard: 'IEC 61131-3' },
    CTU: { symbol: '┌─CTU─┐', name: 'Up Counter', standard: 'IEC 61131-3' },
    RES: { symbol: '—(R)—', name: 'Reset Block', standard: 'IEC 61131-3' },
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>
            Parts Tray
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              backgroundColor: 'rgba(101, 170, 187, 0.15)',
              color: 'var(--color-1)',
              border: '1px solid var(--color-1)',
              padding: '1px 6px',
              borderRadius: '6px',
            }}
          >
            IEC 61131-3:2025
          </span>
        </div>
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
