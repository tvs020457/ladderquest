import React, { useState } from 'react';
import { UserProgressV1 } from '../../engine/progress/types';
import { StreakCalendar } from './StreakCalendar';
import { ExportImportModal } from './ExportImportModal';
import { Mascot } from '../common/Mascot';
import { Button } from '../common/Button';
import { sound } from '../../utils/sound';
import { haptics } from '../../utils/haptics';
import { FrostedIcon, FrostedIconName } from '../common/FrostedIcon';

interface ProfileTabProps {
  progress: UserProgressV1;
  onUpdateSettings: (settings: UserProgressV1['settings']) => void;
  onEquipCosmetic: (cosmetic: 'none' | 'hard_hat' | 'safety_glasses') => void;
  onImportProgress: (imported: UserProgressV1) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  progress,
  onUpdateSettings,
  onEquipCosmetic,
  onImportProgress,
}) => {
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(() => !sound.isMuted());
  const [hapticsEnabled, setHapticsEnabled] = useState(() => haptics.isEnabled());
  const streak = progress.streak;

  const BADGES: { id: string; title: string; desc: string; iconName: FrostedIconName; variant: 'yellow' | 'amber' }[] = [
    { id: 'streak_3', title: 'Spark Starter', desc: '3-Day Streak', iconName: 'bolt', variant: 'yellow' },
    { id: 'streak_7', title: 'Circuit Apprentice', desc: '7-Day Streak', iconName: 'flame', variant: 'amber' },
    { id: 'streak_14', title: 'Relay Runner', desc: '14-Day Streak', iconName: 'trophy', variant: 'yellow' },
    { id: 'streak_30', title: 'Logic Master', desc: '30-Day Streak', iconName: 'crown', variant: 'yellow' },
  ];

  const handleToggleSound = (enabled: boolean) => {
    sound.setMuted(!enabled);
    setSoundEnabled(enabled);
    if (enabled) {
      sound.playTap();
    }
    haptics.tap();
  };

  const handleToggleHaptics = (enabled: boolean) => {
    haptics.setEnabled(enabled);
    setHapticsEnabled(enabled);
    if (enabled) {
      haptics.snap();
    }
    sound.playTap();
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '440px',
        padding: '16px 16px 90px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Profile Header & Mascot Showcase */}
      <div
        className="glass-card-yellow"
        style={{
          padding: '22px',
          display: 'flex',
          alignItems: 'center',
          gap: '18px',
        }}
      >
        <Mascot
          mood="celebrate"
          size={76}
          cosmetic={(progress.cosmetics.equipped as any) || 'none'}
        />
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>PLC Technician</h2>
          <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#FEF08A' }}>
              ⚡ {progress.xp} Total XP
            </span>
            <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#F59E0B' }}>
              🔥 {streak.current} Days
            </span>
          </div>
        </div>
      </div>

      {/* Streak Stats */}
      {!progress.settings.hideStreakUi && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}
        >
          <div
            className="glass-card"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FrostedIcon name="flame" size={36} iconSize={20} variant="amber" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em' }}>
              BEST STREAK
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F59E0B' }}>
              {streak.best} Days
            </div>
          </div>

          <div
            className="glass-card"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FrostedIcon name="snowflake" size={36} iconSize={20} variant="cyan" />
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.04em' }}>
              STREAK FREEZES
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#38BDF8' }}>
              {streak.freezes}/2
            </div>
          </div>
        </div>
      )}

      {/* Monthly Streak Calendar */}
      {!progress.settings.hideStreakUi && (
        <StreakCalendar activeDays={streak.activeDays} />
      )}

      {/* Mascot Cosmetics */}
      <div
        className="glass-card"
        style={{
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>
          Volt&apos;s Gear
        </h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          {[
            { id: 'none', label: 'Classic', iconName: 'user' as FrostedIconName, variant: 'neutral' as const },
            { id: 'hard_hat', label: 'Hard Hat', iconName: 'hat' as FrostedIconName, variant: 'yellow' as const },
            { id: 'safety_glasses', label: 'Glasses', iconName: 'glasses' as FrostedIconName, variant: 'cyan' as const },
          ].map((item) => {
            const isEquipped = (progress.cosmetics.equipped || 'none') === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playTap();
                  haptics.tap();
                  onEquipCosmetic(item.id as any);
                }}
                style={{
                  flex: 1,
                  padding: '10px 6px',
                  borderRadius: '16px',
                  background: isEquipped
                    ? 'linear-gradient(135deg, rgba(250, 204, 21, 0.22), rgba(245, 158, 11, 0.14))'
                    : 'rgba(15, 23, 42, 0.6)',
                  border: isEquipped ? '1.5px solid #FACC15' : '1px solid var(--glass-border)',
                  color: isEquipped ? '#FEF08A' : '#94a3b8',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  boxShadow: isEquipped ? '0 0 16px rgba(250, 204, 21, 0.3)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                <FrostedIcon
                  name={item.iconName}
                  size={34}
                  iconSize={18}
                  variant={isEquipped ? 'yellow' : item.variant}
                  active={isEquipped}
                />
                <span style={{ fontSize: '0.78rem', fontWeight: 800 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Badges Showcase */}
      <div
        className="glass-card"
        style={{
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>
          Badges & Milestones
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
          {BADGES.map((b) => {
            const unlocked = streak.best >= parseInt(b.id.split('_')[1] || '0');
            return (
              <div
                key={b.id}
                style={{
                  backgroundColor: unlocked ? 'rgba(250, 204, 21, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '16px',
                  padding: '12px',
                  border: unlocked ? '1.5px solid rgba(250, 204, 21, 0.4)' : '1px solid var(--glass-border)',
                  opacity: unlocked ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <FrostedIcon
                  name={b.iconName}
                  size={38}
                  iconSize={20}
                  variant={b.variant}
                  glow={unlocked}
                />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 900, color: '#f8fafc' }}>{b.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{b.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sensory & App Settings */}
      <div
        className="glass-card"
        style={{
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>
          Sensory & Tactile Settings
        </h4>

        {/* Sound Effects Toggle */}
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>Zero-Latency Sound FX 🔊</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Synthesized clicks, relay clacks, and victory fanfares</div>
          </div>
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => handleToggleSound(e.target.checked)}
            style={{ width: '22px', height: '22px', accentColor: '#FACC15' }}
          />
        </label>

        {/* Tactile Haptics Toggle */}
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>Tactile Haptics (Taptics) 📳</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Vibrations on wire placement, taps, and pass/fail</div>
          </div>
          <input
            type="checkbox"
            checked={hapticsEnabled}
            onChange={(e) => handleToggleHaptics(e.target.checked)}
            style={{ width: '22px', height: '22px', accentColor: '#FACC15' }}
          />
        </label>

        {/* Hide Streak Toggle (Honest anti-pressure design rule from Part 9.8) */}
        <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>Hide Streak UI</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Learn without streak pressure or timers</div>
          </div>
          <input
            type="checkbox"
            checked={progress.settings.hideStreakUi}
            onChange={(e) =>
              onUpdateSettings({
                ...progress.settings,
                hideStreakUi: e.target.checked,
              })
            }
            style={{ width: '22px', height: '22px', accentColor: '#FACC15' }}
          />
        </label>
      </div>

      {/* Backup & Transfer Button (100% Local JSON) */}
      <Button
        variant="primary"
        size="md"
        fullWidth
        onClick={() => {
          sound.playTap();
          haptics.tap();
          setShowBackupModal(true);
        }}
      >
        💾 Backup & Transfer Progress (Local JSON)
      </Button>

      {/* Backup Modal */}
      <ExportImportModal
        progress={progress}
        isOpen={showBackupModal}
        onClose={() => setShowBackupModal(false)}
        onImportSuccess={onImportProgress}
      />
    </div>
  );
};
