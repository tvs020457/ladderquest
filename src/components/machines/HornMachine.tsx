import React from 'react';

interface HornMachineProps {
  isOn: boolean;
  tag?: string;
  size?: number;
}

export const HornMachine: React.FC<HornMachineProps> = ({
  isOn,
  tag = 'BUZZER',
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
          filter: isOn ? 'drop-shadow(0 0 10px #BB65AA)' : 'none',
          transition: 'filter 0.2s ease',
        }}
      >
        {/* Mounting bracket */}
        <rect x="14" y="36" width="10" height="28" rx="2" fill="#334155" stroke="#1e293b" strokeWidth="2" />

        {/* Horn Base Driver */}
        <rect x="24" y="32" width="22" height="36" rx="4" fill="#17242a" stroke={isOn ? '#BB65AA' : '#64748b'} strokeWidth="2.5" />

        {/* Horn Flared Bell */}
        <path
          d="M 46 40 L 72 24 L 72 76 L 46 60 Z"
          fill={isOn ? '#BB65AA' : '#23353e'}
          stroke={isOn ? '#cf84c0' : '#64748b'}
          strokeWidth="3"
        />

        {/* Sound Waves when activated */}
        {isOn && (
          <g stroke="#BB65AA" strokeWidth="3" strokeLinecap="round" fill="none">
            <path d="M 78 36 A 14 14 0 0 1 78 64" />
            <path d="M 85 28 A 24 24 0 0 1 85 72" />
          </g>
        )}
      </svg>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isOn ? '#BB65AA' : '#94a3b8' }}>
        {tag}: {isOn ? 'SOUNDING (1)' : 'SILENT (0)'}
      </div>
    </div>
  );
};
