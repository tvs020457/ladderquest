import React, { useState } from 'react';
import { sound } from '../../utils/sound';
import { haptics } from '../../utils/haptics';

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
  const [muted, setMuted] = useState(() => sound.isMuted());

  const handleToggleSound = () => {
    const isNowMuted = sound.toggleMute();
    setMuted(isNowMuted);
    haptics.tap();
    if (!isNowMuted) {
      sound.playTap();
    }
  };

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 18px',
        background: 'var(--glass-bg-primary)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        borderBottom: '1px solid var(--glass-border-yellow)',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        onClick={() => {
          sound.playTap();
          haptics.tap();
          onProfileClick?.();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: onProfileClick ? 'pointer' : 'default',
        }}
      >
        <span
          style={{
            fontSize: '1.25rem',
            fontWeight: 900,
            background: 'linear-gradient(135deg, #FEF08A, #FACC15, #F59E0B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 10px rgba(250, 204, 21, 0.4))',
            letterSpacing: '0.01em',
          }}
        >
          ⚡ LadderQuest
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Streak Pill */}
        <div
          title="Daily Streak"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.88rem',
            fontWeight: 900,
            color: streak > 0 ? '#F59E0B' : '#64748B',
            background: streak > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            padding: '4px 8px',
            borderRadius: '12px',
            border: streak > 0 ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid transparent',
          }}
        >
          <span>🔥</span>
          <span>{streak}</span>
        </div>

        {/* XP Pill */}
        <div
          title="Total Experience Points"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.88rem',
            fontWeight: 900,
            color: '#FEF08A',
            background: 'rgba(250, 204, 21, 0.12)',
            padding: '4px 8px',
            borderRadius: '12px',
            border: '1px solid rgba(250, 204, 21, 0.35)',
            boxShadow: '0 0 8px rgba(250, 204, 21, 0.15)',
          }}
        >
          <span>⚡</span>
          <span>{xp}</span>
        </div>

        {/* Daily Quests Pill */}
        <div
          title="Today's Quests"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.82rem',
            fontWeight: 800,
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            padding: '4px 8px',
            borderRadius: '12px',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}
        >
          <span>🎯</span>
          <span>{questsDoneCount}/{totalQuests}</span>
        </div>

        {/* Audio Mute/Unmute Toggle */}
        <button
          onClick={handleToggleSound}
          title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--glass-border)',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '32px',
            minWidth: '32px',
            opacity: muted ? 0.6 : 1,
            transition: 'transform 0.1s ease',
          }}
        >
          {muted ? '🔇' : '🔊'}
        </button>

        {/* Cloud Sync Button */}
        {onCloudClick && (
          <button
            onClick={() => {
              sound.playTap();
              haptics.tap();
              onCloudClick();
            }}
            title={isCloudConnected ? 'Supabase Cloud Connected' : 'Supabase Cloud Sync'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.05rem',
              padding: '2px 4px',
              opacity: isCloudConnected ? 1 : 0.65,
              display: 'flex',
              alignItems: 'center',
              minHeight: '32px',
              minWidth: '32px',
              justifyContent: 'center',
            }}
          >
            {isCloudConnected ? '☁️' : '🌥️'}
          </button>
        )}
      </div>
    </header>
  );
};
