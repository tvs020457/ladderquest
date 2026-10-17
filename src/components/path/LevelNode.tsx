import React from 'react';
import { sound } from '../../utils/sound';
import { haptics } from '../../utils/haptics';
import { FrostedIcon } from '../common/FrostedIcon';

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

  let bg = 'rgba(28, 28, 32, 0.7)';
  let border = '1px solid rgba(255, 255, 255, 0.08)';
  let shadow = '0 6px 0 #18181B, 0 8px 16px rgba(0, 0, 0, 0.45)';
  let textColor = '#64748B';

  if (isCurrent) {
    bg = '#FACC15';
    border = '2px solid #FFFFFF';
    shadow = '0 6px 0 #A16207, 0 16px 32px rgba(250, 204, 21, 0.3)';
    textColor = '#18181B';
  } else if (isCompleted) {
    bg = 'rgba(250, 204, 21, 0.12)';
    border = '1.5px solid rgba(250, 204, 21, 0.6)';
    shadow = '0 6px 0 rgba(161, 98, 7, 0.3), 0 8px 20px rgba(0, 0, 0, 0.4)';
    textColor = '#FEF08A';
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `translateX(${offsetPercent}px)`,
        margin: '22px 0',
        transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* Stars earned for completed node */}
      {isCompleted && (
        <div
          style={{
            display: 'flex',
            gap: '2px',
            marginBottom: '4px',
            filter: 'drop-shadow(0 0 6px rgba(250, 204, 21, 0.6))',
          }}
        >
          {Array.from({ length: Math.max(1, stars) }).map((_, i) => (
            <FrostedIcon key={i} name="star" size={20} iconSize={12} variant="yellow" glow />
          ))}
        </div>
      )}

      {/* Pulsing START badge for active level */}
      {isCurrent && (
        <div
          style={{
            background: '#FACC15',
            color: '#18181B',
            fontSize: '0.72rem',
            fontWeight: 900,
            padding: '4px 12px',
            borderRadius: '10px',
            marginBottom: '6px',
            boxShadow: '0 0 14px rgba(250, 204, 21, 0.6)',
            letterSpacing: '0.06em',
          }}
        >
          START
        </div>
      )}

      {/* Circular Node Button with Frosted Glass Core */}
      <button
        disabled={isLocked}
        onClick={handleClick}
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: bg,
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
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
          overflow: 'hidden',
          transition: 'transform 0.1s cubic-bezier(0.2, 0.8, 0.2, 1), filter 0.15s ease',
          outline: 'none',
        }}
        aria-label={`Level ${id} (${status})`}
      >
        {isLocked ? (
          <FrostedIcon name="lock" size={36} iconSize={18} variant="neutral" />
        ) : (
          <span style={{ position: 'relative', zIndex: 1 }}>{id}</span>
        )}
      </button>
    </div>
  );
};
