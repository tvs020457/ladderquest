import React from 'react';
import { LevelInputDef } from '../../levels/types';

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
        padding: '12px',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: '16px',
        border: '1px solid var(--color-bg-tertiary)',
        width: '100%',
        maxWidth: '480px',
        margin: '8px 0',
      }}
    >
      {inputs.map((inp) => {
        const currentVal = values[inp.tag] ?? (inp.initialValue ?? 0);
        const isNC = inp.type.includes('NC') || inp.tag === 'STOP' || inp.tag === 'E_STOP' || inp.tag === 'DOOR';

        // Styling based on NO vs NC state
        let btnBg = '#334155';
        let btnBorder = '#475569';
        let stateLabel = '';

        if (isNC) {
          // NC: 1 is Normal/Safe, 0 is Pressed/Tripped
          if (currentVal === 1) {
            btnBg = 'var(--color-3-dark)';
            btnBorder = 'var(--color-3)';
            stateLabel = 'NORMAL [1]';
          } else {
            btnBg = '#7f1d1d';
            btnBorder = '#ef4444';
            stateLabel = 'PRESSED [0]';
          }
        } else {
          // NO: 0 is Released, 1 is Pressed
          if (currentVal === 1) {
            btnBg = 'var(--color-2-dark)';
            btnBorder = 'var(--color-2)';
            stateLabel = 'PRESSED [1]';
          } else {
            btnBg = '#17242a';
            btnBorder = '#23353e';
            stateLabel = 'RELEASED [0]';
          }
        }

        return (
          <button
            key={inp.tag}
            disabled={disabled}
            onClick={() => {
              const next = currentVal === 1 ? 0 : 1;
              onChange(inp.tag, next);
            }}
            style={{
              minHeight: '48px',
              minWidth: '100px',
              flex: '1 1 calc(50% - 12px)',
              maxWidth: '200px',
              backgroundColor: btnBg,
              border: `2px solid ${btnBorder}`,
              borderRadius: '12px',
              color: '#ffffff',
              padding: '8px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: disabled ? 'not-allowed' : 'pointer',
              userSelect: 'none',
              boxShadow: '0 4px 0 rgba(0, 0, 0, 0.4)',
              transition: 'transform 0.08s ease, background-color 0.15s ease',
            }}
            aria-label={`${inp.tag} input (${stateLabel})`}
          >
            <span style={{ fontSize: '0.95rem', fontWeight: 800 }}>{inp.tag}</span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', marginTop: '2px' }}>
              {stateLabel}
            </span>
          </button>
        );
      })}
    </div>
  );
};
