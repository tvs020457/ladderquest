import React from 'react';

interface MotorMachineProps {
  isOn: boolean;
  tag?: string;
  size?: number;
}

export const MotorMachine: React.FC<MotorMachineProps> = ({
  isOn,
  tag = 'MOTOR',
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
          filter: isOn ? 'drop-shadow(0 0 10px #AABB65)' : 'none',
          transition: 'filter 0.2s ease',
        }}
      >
        {/* Motor Foot Mounting Base */}
        <rect x="20" y="80" width="60" height="10" rx="3" fill="#334155" stroke="#1e293b" strokeWidth="2" />
        <circle cx="28" cy="85" r="2.5" fill="#64748b" />
        <circle cx="72" cy="85" r="2.5" fill="#64748b" />

        {/* Motor Stator Body */}
        <rect x="22" y="25" width="56" height="55" rx="10" fill="#17242a" stroke={isOn ? '#AABB65' : '#475569'} strokeWidth="3" />

        {/* Cooling Fins */}
        <line x1="28" y1="28" x2="28" y2="76" stroke="#23353e" strokeWidth="2" />
        <line x1="36" y1="28" x2="36" y2="76" stroke="#23353e" strokeWidth="2" />
        <line x1="64" y1="28" x2="64" y2="76" stroke="#23353e" strokeWidth="2" />
        <line x1="72" y1="28" x2="72" y2="76" stroke="#23353e" strokeWidth="2" />

        {/* Rotor Center Disc */}
        <circle cx="50" cy="52" r="16" fill="#0d161a" stroke={isOn ? '#AABB65' : '#64748b'} strokeWidth="2.5" />

        {/* Rotating Shaft Blades */}
        <g
          transform="translate(50, 52)"
          style={{
            transformOrigin: '50px 52px',
            animation: isOn ? 'spinMotor 0.6s linear infinite' : 'none',
          }}
        >
          <line x1="-12" y1="0" x2="12" y2="0" stroke={isOn ? '#AABB65' : '#94a3b8'} strokeWidth="4" strokeLinecap="round" />
          <line x1="0" y1="-12" x2="0" y2="12" stroke={isOn ? '#AABB65' : '#94a3b8'} strokeWidth="4" strokeLinecap="round" />
          <circle cx="0" cy="0" r="4" fill="#BB65AA" />
        </g>
      </svg>
      <div style={{ fontSize: '0.85rem', fontWeight: 700, color: isOn ? '#AABB65' : '#94a3b8' }}>
        {tag}: {isOn ? 'RUNNING (1)' : 'STOPPED (0)'}
      </div>
    </div>
  );
};
