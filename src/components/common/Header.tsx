import React from 'react';

interface HeaderProps {
  streak: number;
  xp: number;
  questsDoneCount: number;
  totalQuests?: number;
  onProfileClick?: () => void;
  onCloudClick?: () => void;
  isCloudConnected?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  xp,
  questsDoneCount,
  totalQuests = 3,
  onProfileClick,
  onCloudClick,
  isCloudConnected = false,
}) => {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        backgroundColor: 'var(--color-bg-secondary)',
        borderBottom: '2px solid var(--color-bg-tertiary)',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
      <div
        onClick={onProfileClick}
        style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: onProfileClick ? 'pointer' : 'default' }}
      >
        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--color-1)' }}>
          ⚡ LadderQuest
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Streak Pill (Color 2: Magenta) */}
        <div
          title="Daily Streak"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.95rem',
            fontWeight: 800,
            color: streak > 0 ? 'var(--color-2)' : 'var(--color-text-secondary)',
          }}
        >
          <span>🔥</span>
          <span>{streak}</span>
        </div>

        {/* XP Pill (Color 1: Teal) */}
        <div
          title="Total Experience Points"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.95rem',
            fontWeight: 800,
            color: 'var(--color-1)',
          }}
        >
          <span>⚡</span>
          <span>{xp}</span>
        </div>

        {/* Daily Quests Pill (Color 3: Lime) */}
        <div
          title="Today's Quests"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.85rem',
            fontWeight: 800,
            backgroundColor: 'var(--color-bg-tertiary)',
            padding: '4px 8px',
            borderRadius: '12px',
            color: 'var(--color-3)',
            border: '1px solid var(--color-3-dark)',
          }}
        >
          <span>🎯</span>
          <span>{questsDoneCount}/{totalQuests}</span>
        </div>

        {/* Cloud Sync Button */}
        {onCloudClick && (
          <button
            onClick={onCloudClick}
            title={isCloudConnected ? 'Supabase Cloud Connected' : 'Supabase Cloud Sync'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              padding: '2px 4px',
              opacity: isCloudConnected ? 1 : 0.65,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isCloudConnected ? '☁️' : '🌥️'}
          </button>
        )}
      </div>
    </header>
  );
};
