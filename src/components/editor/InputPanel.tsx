import React from 'react';
import { LevelInputDef } from '../../levels/types';
import { sound } from '../../utils/sound';
import { haptics } from '../../utils/haptics';

interface InputPanelProps {
  inputs: LevelInputDef[];
  values: Record<string, number>;
  onChange: (tag: string, val: number) => void;
  disabled?: boolean;
}

export const InputPanel: React.FC<InputPanelProps> = ({
  inputs,
  values,
  onChange,
  disabled = false,
}) => {
  if (inputs.length === 0) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        justifyContent: 'center',
        padding: '14px 16px',
        background: 'var(--glass-bg-card)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderRadius: '20px',
        border: '1px solid var(--glass-border-yellow)',
        boxShadow: 'var(--glass-shadow)',
        width: '100%',
        maxWidth: '480px',
        margin: '8px 0',
      }}
    >
      {inputs.map((inp) => {
        const currentVal = values[inp.tag] ?? (inp.initialValue ?? 0);
        const isNC = inp.type.includes('NC') || inp.tag === 'STOP' || inp.tag === 'E_STOP' || inp.tag === 'DOOR';

        // High-end tactile button styling
        const isEnergized = isNC ? currentVal === 1 : currentVal === 1;

        const btnBg = isEnergized
          ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.22), rgba(245, 158, 11, 0.14))'
          : 'rgba(15, 23, 42, 0.7)';
        const btnBorder = isEnergized
          ? 'rgba(250, 204, 21, 0.8)'
          : 'rgba(255, 255, 255, 0.08)';
        const btnShadow = isEnergized
          ? '0 0 16px rgba(250, 204, 21, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          : '0 4px 10px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
        const textHighlight = isEnergized ? '#FEF08A' : '#94A3B8';

        const stateLabel = isNC
          ? currentVal === 1
            ? 'NORMAL [1]'
            : 'PRESSED [0]'
          : currentVal === 1
          ? 'PRESSED [1]'
          : 'RELEASED [0]';

        return (
          <button
            key={inp.tag}
            disabled={disabled}
            onClick={() => {
              sound.playRelayClick();
              haptics.tap();
              const next = currentVal === 1 ? 0 : 1;
              onChange(inp.tag, next);
            }}
            style={{
              minHeight: '52px',
              minWidth: '110px',
              flex: '1 1 calc(50% - 12px)',
              maxWidth: '210px',
              background: btnBg,
              border: `1.5px solid ${btnBorder}`,
              borderRadius: '14px',
              color: '#ffffff',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              userSelect: 'none',
              boxShadow: btnShadow,
              transition: 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.15s ease, border-color 0.15s ease',
            }}
            aria-label={`${inp.tag} input (${stateLabel})`}
          >
            <span style={{ fontSize: '1rem', fontWeight: 900, color: textHighlight, letterSpacing: '0.02em' }}>
              {inp.tag}
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: isEnergized ? '#FACC15' : '#64748B', marginTop: '2px' }}>
              {stateLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
};
