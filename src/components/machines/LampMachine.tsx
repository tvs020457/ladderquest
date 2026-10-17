import React from 'react';

interface LampMachineProps {
  isOn: boolean;
  tag?: string;
  size?: number;
}

export const LampMachine: React.FC<LampMachineProps> = ({
  isOn,
  tag = 'LAMP',
  size = 100,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: isOn ? 'drop-shadow(0 0 14px #AABB65)' : 'none',
          transition: 'filter 0.2s ease',
        }}
      >
        {/* Glow halo when on */}
        {isOn && (
          <circle cx="50" cy="45" r="38" fill="rgba(170, 187, 101, 0.22)" />
        )}

        {/* Base Socket */}
        <rect x="38" y="72" width="24" height="16" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="2" />
        <line x1="42" y1="78" x2="58" y2="78" stroke="#64748b" strokeWidth="1.5" />
        <line x1="42" y1="82" x2="58" y2="82" stroke="#64748b" strokeWidth="1.5" />

        {/* Glass Bulb */}
        <path
          d="M 32 60 C 24 50 24 32 36 20 C 44 12 56 12 64 20 C 76 32 76 50 68 60 L 62 72 L 38 72 Z"
          fill={isOn ? '#AABB65' : '#17242a'}
          stroke={isOn ? '#6e7c35' : '#64748b'}
          strokeWidth="3"
        />

        {/* Filament */}
        <path
          d="M 44 55 L 47 40 L 50 48 L 53 40 L 56 55"
          stroke={isOn ? '#ffffff' : '#475569'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Light rays when lit */}
        {isOn && (
          <g stroke="#AABB65" strokeWidth="2.5" strokeLinecap="round">
            <line x1="50" y1="8" x2="50" y2="2" />
            <line x1="20" y1="20" x2="14" y2="15" />
            <line x1="80" y1="20" x2="86" y2="15" />
            <line x1="12" y1="42" x2="4" y2="42" />
            <line x1="88" y1="42" x2="96" y2="42" />
          </g>
        )}
      </svg>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isOn ? '#AABB65' : '#94a3b8' }}>
        {tag}: {isOn ? 'ON (1)' : 'OFF (0)'}
      </div>
    </div>
  );
};
