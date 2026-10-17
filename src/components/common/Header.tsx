import React, { useState } from 'react';
import { sound } from '../../utils/sound';
import { haptics } from '../../utils/haptics';
import { FrostedIcon } from './FrostedIcon';

interface HeaderProps {
  streak: number;
  xp: number;
  questsDoneCount: number;
  totalQuests?: number;
  onProfileClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  streak,
  xp,
  questsDoneCount,
  totalQuests = 3,
  onProfileClick,
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
        backdropFilter: 'var(--glass-blur-heavy)',
        WebkitBackdropFilter: 'var(--glass-blur-heavy)',
        borderBottom: '1.5px solid var(--glass-border-yellow)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.7), 0 0 16px rgba(250, 204, 21, 0.1)',
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
        <FrostedIcon name="bolt" size={30} iconSize={16} variant="yellow" glow />
        <span
          style={{
            fontSize: '1.2rem',
            fontWeight: 900,
            color: '#EAB308',
            letterSpacing: '0.02em',
          }}
        >
          LadderQuest
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Streak Pill */}
        <div
          title="Daily Streak"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.88rem',
            fontWeight: 900,
            color: streak > 0 ? '#F59E0B' : '#64748B',
            background: streak > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255, 255, 255, 0.04)',
            padding: '3px 8px 3px 4px',
            borderRadius: '16px',
            border: streak > 0 ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--glass-border)',
          }}
        >
          <FrostedIcon name="flame" size={24} iconSize={14} variant="amber" />
          <span>{streak}</span>
        </div>

        {/* XP Pill */}
        <div
          title="Total Experience Points"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.88rem',
            fontWeight: 900,
            color: '#FEF08A',
            background: 'rgba(250, 204, 21, 0.12)',
            padding: '3px 8px 3px 4px',
            borderRadius: '16px',
            border: '1px solid rgba(250, 204, 21, 0.4)',
            boxShadow: '0 0 10px rgba(250, 204, 21, 0.18)',
          }}
        >
          <FrostedIcon name="bolt" size={24} iconSize={14} variant="yellow" glow />
          <span>{xp}</span>
        </div>

        {/* Daily Quests Pill */}
        <div
          title="Today's Quests"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            fontWeight: 800,
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            padding: '3px 8px 3px 4px',
            borderRadius: '16px',
            color: '#10B981',
            border: '1px solid rgba(16, 185, 129, 0.35)',
          }}
        >
          <FrostedIcon name="target" size={24} iconSize={14} variant="emerald" />
          <span>{questsDoneCount}/{totalQuests}</span>
        </div>

        {/* Audio Mute/Unmute Toggle */}
        <button
          onClick={handleToggleSound}
          title={muted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.1s ease',
          }}
        >
          <FrostedIcon
            name={muted ? 'sound-off' : 'sound-on'}
            size={32}
            iconSize={16}
            variant={muted ? 'neutral' : 'yellow'}
          />
        </button>
      </div>
    </header>
  );
};
