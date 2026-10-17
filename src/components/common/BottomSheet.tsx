import React from 'react';
import { Button } from './Button';
import { Mascot } from './Mascot';

export interface BottomSheetProps {
  isOpen: boolean;
  type: 'pass' | 'fail';
  title: string;
  message: string;
  xpEarned?: number;
  stars?: number;
  onContinue: () => void;
  onRetry?: () => void;
  children?: React.ReactNode; // Optional TimingDiagram or details
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  type,
  title,
  message,
  xpEarned = 0,
  stars = 0,
  onContinue,
  onRetry,
  children,
}) => {
  if (!isOpen) return null;

  const isPass = type === 'pass';
  const bgColor = isPass ? 'var(--color-3-dark)' : '#450a0a';
  const borderColor = isPass ? 'var(--color-3)' : '#ef4444';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: bgColor,
        borderTop: `3px solid ${borderColor}`,
        boxShadow: '0 -8px 24px rgba(0, 0, 0, 0.6)',
        padding: '20px 16px 28px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        animation: 'slideUp 0.25s ease-out',
        maxWidth: '480px',
        margin: '0 auto',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Mascot mood={isPass ? 'celebrate' : 'tilt'} size={64} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff' }}>{title}</h3>
            {isPass && stars > 0 && (
              <span style={{ fontSize: '1.1rem' }}>
                {'⭐'.repeat(stars)}
              </span>
            )}
          </div>
          <p style={{ color: '#e2e8f0', fontSize: '0.95rem', marginTop: '2px' }}>{message}</p>
          {isPass && xpEarned > 0 && (
            <div style={{ marginTop: '4px', fontSize: '0.9rem', color: 'var(--color-3-light)', fontWeight: 700 }}>
              +{xpEarned} XP Earned!
            </div>
          )}
        </div>
      </div>

      {children && (
        <div style={{ width: '100%', overflowX: 'auto', margin: '4px 0' }}>
          {children}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
        {isPass ? (
          <Button variant="success" fullWidth size="lg" onClick={onContinue}>
            Continue
          </Button>
        ) : (
          <>
            {onRetry && (
              <Button variant="danger" fullWidth size="lg" onClick={onRetry}>
                Try Again
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
