import React from 'react';

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

  let bgColor = '#17242a';
  let shadowColor = '#0d161a';
  let textColor = '#64748b';
  let borderColor = '#23353e';

  if (isCurrent) {
    bgColor = 'var(--color-2)';
    shadowColor = 'var(--color-2-dark)';
    textColor = '#ffffff';
    borderColor = 'var(--color-2-light)';
  } else if (isCompleted) {
    bgColor = 'var(--color-3)';
    shadowColor = 'var(--color-3-dark)';
    textColor = '#0d161a';
    borderColor = 'var(--color-3-light)';
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transform: `translateX(${offsetPercent}px)`,
        margin: '14px 0',
        transition: 'transform 0.2s ease',
      }}
    >
      {/* Stars earned for completed node */}
      {isCompleted && (
        <div style={{ fontSize: '0.85rem', marginBottom: '4px', letterSpacing: '2px' }}>
          {'⭐'.repeat(Math.max(1, stars))}
        </div>
      )}

      {/* Pulsing indicator tag for active level */}
      {isCurrent && (
        <div
          style={{
            backgroundColor: 'var(--color-2)',
            color: '#ffffff',
            fontSize: '0.72rem',
            fontWeight: 900,
            padding: '2px 8px',
            borderRadius: '10px',
            marginBottom: '4px',
            boxShadow: '0 2px 8px rgba(187, 101, 170, 0.5)',
          }}
        >
          START
        </div>
      )}

      {/* Circular Node Button */}
      <button
        disabled={isLocked}
        onClick={() => onClick(id)}
        style={{
          width: '68px',
          height: '68px',
          borderRadius: '50%',
          backgroundColor: bgColor,
          boxShadow: `0 6px 0 ${shadowColor}`,
          border: `3px solid ${borderColor}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          fontWeight: 900,
          color: textColor,
          cursor: isLocked ? 'not-allowed' : 'pointer',
          userSelect: 'none',
          position: 'relative',
          transition: 'transform 0.08s ease, filter 0.15s ease',
          outline: 'none',
        }}
        aria-label={`Level ${id} (${status})`}
      >
        {isLocked ? (
          <span style={{ fontSize: '1.2rem', opacity: 0.6 }}>🔒</span>
        ) : (
          <span>{id}</span>
        )}
      </button>
    </div>
  );
};
