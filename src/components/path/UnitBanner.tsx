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
        padding: '18px 22px',
        margin: '24px 0 16px 0',
        borderLeft: `5px solid ${accentColor}`,
        boxShadow: `0 12px 32px rgba(0, 0, 0, 0.45), 0 0 20px rgba(250, 204, 21, 0.08)`,
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
