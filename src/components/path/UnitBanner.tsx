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
  accentColor = '#FACC15',
}) => {
  return (
    <div
      className="glass-card"
      style={{
        width: '100%',
        padding: '22px 24px',
        margin: '32px 0 24px 0',
        borderLeft: `4px solid ${accentColor}`,
        boxShadow: 'var(--glass-shadow-sm)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: '0.78rem',
          fontWeight: 900,
          color: accentColor,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}
      >
        Unit {unitNumber}
      </div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#F8FAFC', marginTop: '3px' }}>
        {title}
      </h3>
      {subtitle && (
        <p style={{ fontSize: '0.86rem', color: '#94A3B8', marginTop: '3px', lineHeight: 1.45 }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
