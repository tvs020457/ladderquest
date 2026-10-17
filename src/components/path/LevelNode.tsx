import React from 'react';
import { sound } from '../../utils/sound';
import { haptics } from '../../utils/haptics';

export type NodeStatus = 'locked' | 'current' | 'completed';

interface LevelNodeProps {
  id: number;
  status: NodeStatus;
  stars?: number;
  offsetPercent?: number; // Sinusoidal horizontal offset (-30 to +30%)
  onClick: (id: number) => void;
}

export const LevelNode: React.FC<LevelNodeProps> = ({
  id,
  status,
  stars = 0,
  offsetPercent = 0,
  onClick,
}) => {
  const isLocked = status === 'locked';
  const isCurrent = status === 'current';
  const isCompleted = status === 'completed';

  const handleClick = () => {
    if (isLocked) return;
    sound.playTap();
    haptics.tap();
    onClick(id);
  };

  let bg = 'rgba(15, 23, 42, 0.65)';
  let border = '1px solid rgba(255, 255, 255, 0.07)';
  let shadow = '0 6px 0 #05080E, 0 8px 16px rgba(0, 0, 0, 0.4)';
  let textColor = '#64748B';

  if (isCurrent) {
    bg = 'linear-gradient(135deg, #FEF08A 0%, #FACC15 50%, #EAB308 100%)';
    border = '2.5px solid #FFFFFF';
    shadow = '0 6px 0 #A16207, 0 16px 32px rgba(250, 204, 21, 0.45)';
    textColor = '#05080E';
  } else if (isCompleted) {
    bg = 'linear-gradient(135deg, rgba(250, 204, 21, 0.16), rgba(245, 158, 11, 0.06))';
    border = '2px solid rgba(250, 204, 21, 0.75)';
    shadow = '0 6px 0 rgba(161, 98, 7, 0.5), 0 8px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)';
    textColor = '#FEF08A';
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `translateX(${offsetPercent}px)`,
        margin: '14px 0',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Stars earned for completed node */}
      {isCompleted && (
        <div
          style={{
            fontSize: '0.88rem',
            marginBottom: '4px',
            letterSpacing: '2px',
            filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.6))',
          }}
        >
          {'⭐'.repeat(Math.max(1, stars))}
        </div>
      )}

      {/* Pulsing START badge for active level */}
      {isCurrent && (
        <div
          style={{
            background: 'linear-gradient(90deg, #F59E0B, #FACC15)',
            color: '#05080E',
            fontSize: '0.72rem',
            fontWeight: 900,
            padding: '3px 10px',
            borderRadius: '10px',
            marginBottom: '4px',
            boxShadow: '0 0 14px rgba(250, 204, 21, 0.8)',
            letterSpacing: '0.06em',
          }}
        >
          START
        </div>
      )}

      {/* Circular Node Button */}
      <button
        disabled={isLocked}
        onClick={handleClick}
        style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          background: bg,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: shadow,
          border: border,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.45rem',
          fontWeight: 900,
          color: textColor,
          cursor: isLocked ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          position: 'relative',
          transition: 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.15s ease',
          outline: 'none',
        }}
        aria-label={`Level ${id} (${status})`}
      >
        {isLocked ? (
          <span style={{ fontSize: '1.2rem', opacity: 0.5 }}>🔒</span>
        ) : (
          <span>{id}</span>
        )}
      </button>
    </div>
  );
};
