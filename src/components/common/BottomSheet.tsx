import React from 'react';
import { Button } from './Button';
import { Mascot } from './Mascot';
import { sound } from '../../utils/sound';
import { haptics } from '../../utils/haptics';

export interface BottomSheetProps {
  isOpen: boolean;
  type: 'pass' | 'fail';
  title: string;
  message: string;
  xpEarned?: number;
  stars?: number;
  onContinue: () => void;
  onRetry?: () => void;
  children?: React.ReactNode;
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
  const bg = isPass
    ? 'rgba(15, 23, 42, 0.92)'
    : 'rgba(30, 15, 20, 0.92)';
  const borderColor = isPass ? 'rgba(250, 204, 21, 0.6)' : 'rgba(239, 68, 68, 0.6)';
  const glow = isPass
    ? '0 -16px 40px rgba(250, 204, 21, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
    : '0 -16px 40px rgba(239, 68, 68, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: bg,
        backdropFilter: 'var(--glass-blur-heavy)',
        WebkitBackdropFilter: 'var(--glass-blur-heavy)',
        borderTop: `2px solid ${borderColor}`,
        boxShadow: glow,
        borderTopLeftRadius: '28px',
        borderTopRightRadius: '28px',
        padding: '24px 20px 32px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        animation: 'slideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '480px',
        margin: '0 auto',
      }}
      role="dialog"
      aria-modal="true"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Mascot mood={isPass ? 'celebrate' : 'tilt'} size={68} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>
              {title}
            </h3>
            {isPass && stars > 0 && (
              <span style={{ fontSize: '1.2rem', filter: 'drop-shadow(0 0 8px rgba(250, 204, 21, 0.8))' }}>
                {'⭐'.repeat(stars)}
              </span>
            )}
          </div>
          <p style={{ color: '#e2e8f0', fontSize: '0.95rem', marginTop: '4px', lineHeight: 1.45 }}>
            {message}
          </p>
          {isPass && xpEarned > 0 && (
            <div style={{ marginTop: '6px', fontSize: '0.95rem', color: '#FEF08A', fontWeight: 900 }}>
              ⚡ +{xpEarned} XP Earned!
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
          <Button
            variant="primary"
            fullWidth
            size="lg"
            onClick={() => {
              sound.playTap();
              haptics.tap();
              onContinue();
            }}
          >
            Continue ➔
          </Button>
        ) : (
          <>
            {onRetry && (
              <Button
                variant="danger"
                fullWidth
                size="lg"
                onClick={() => {
                  sound.playTap();
                  haptics.tap();
                  onRetry();
                }}
              >
                Try Again ↺
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
