import React from 'react';
import { InstructionType } from '../../engine/types';
import { sound } from '../../utils/sound';
import { haptics } from '../../utils/haptics';

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

  const handleSelect = (elem: InstructionType) => {
    sound.playTap();
    haptics.tap();
    onSelectElement(selectedElement === elem ? null : elem);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        maxWidth: '480px',
        background: 'var(--glass-bg-primary)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: '20px',
        padding: '14px 12px',
        border: '1px solid var(--glass-border-yellow)',
        boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(250, 204, 21, 0.08)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#FEF08A', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Parts Tray
          </span>
          <span
            style={{
              fontSize: '0.62rem',
              fontWeight: 800,
              backgroundColor: 'rgba(250, 204, 21, 0.12)',
              color: '#FACC15',
              border: '1px solid rgba(250, 204, 21, 0.4)',
              padding: '2px 6px',
              borderRadius: '6px',
            }}
          >
            IEC 61131-3:2025
          </span>
        </div>
        {selectedElement && (
          <button
            onClick={() => {
              sound.playTap();
              haptics.tap();
              onSelectElement(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#F59E0B',
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
              onClick={() => handleSelect(elem)}
              style={{
                minWidth: '78px',
                minHeight: '54px',
                borderRadius: '14px',
                background: isSelected
                  ? 'linear-gradient(135deg, #FEF08A, #FACC15, #EAB308)'
                  : 'rgba(28, 28, 32, 0.75)',
                color: isSelected ? '#18181B' : '#f8fafc',
                border: isSelected ? '2px solid #FFFFFF' : '1px solid var(--glass-border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: isSelected
                  ? '0 0 16px rgba(250, 204, 21, 0.6), 0 4px 0 #A16207'
                  : '0 4px 0 rgba(0, 0, 0, 0.4)',
                transition: 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.15s ease',
              }}
              aria-label={`Select ${info.name}`}
            >
              <span style={{ fontSize: '0.92rem', fontWeight: 900, fontFamily: 'monospace' }}>
                {info.symbol}
              </span>
              <span style={{ fontSize: '0.68rem', fontWeight: 800, opacity: isSelected ? 1 : 0.8, marginTop: '2px' }}>
                {elem}
              </span>
            </button>
          );
        })}

        {/* Structural Actions: Add Branch / Add Rung */}
        {onAddBranch && (
          <button
            onClick={() => {
              sound.playWireConnect();
              haptics.snap();
              onAddBranch();
            }}
            style={{
              minWidth: '72px',
              minHeight: '54px',
              borderRadius: '14px',
              backgroundColor: 'rgba(250, 204, 21, 0.08)',
              color: '#FEF08A',
              border: '1.5px dashed rgba(250, 204, 21, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>⤹</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800 }}>+ Branch</span>
          </button>
        )}

        {onAddRung && (
          <button
            onClick={() => {
              sound.playWireConnect();
              haptics.snap();
              onAddRung();
            }}
            style={{
              minWidth: '72px',
              minHeight: '54px',
              borderRadius: '14px',
              backgroundColor: 'rgba(250, 204, 21, 0.08)',
              color: '#FEF08A',
              border: '1.5px dashed rgba(250, 204, 21, 0.5)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>+</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 800 }}>+ Rung</span>
          </button>
        )}
      </div>
    </div>
  );
};
