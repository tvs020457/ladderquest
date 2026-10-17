import React from 'react';

interface UnitBannerProps {
  unitNumber: number;
  title: string;
  subtitle?: string;
  accentColor?: string;
}

export const UnitBanner: React.FC<UnitBannerProps> = ({
  unitNumber,
  title,
  subtitle,
  accentColor = '#65AABB',
}) => {
  return (
    <div
      style={{
        width: '100%',
        backgroundColor: 'var(--color-bg-secondary)',
        borderRadius: '16px',
        padding: '16px 20px',
        margin: '24px 0 16px 0',
        borderLeft: `6px solid ${accentColor}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      }}
    >
      <div
        style={{
          fontSize: '0.78rem',
          fontWeight: 800,
          color: accentColor,
          textTransform: 'uppercase',
          letterSpacing: '1px',
        }}
      >
        Unit {unitNumber}
      </div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '2px' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
