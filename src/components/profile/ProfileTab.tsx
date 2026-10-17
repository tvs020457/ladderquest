import React, { useState } from 'react';
import { UserProgressV1 } from '../../engine/progress/types';
import { StreakCalendar } from './StreakCalendar';
import { ExportImportModal } from './ExportImportModal';
import { CloudSyncModal } from './CloudSyncModal';
import { Mascot } from '../common/Mascot';
import { Button } from '../common/Button';

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
  const [showCloudSyncModal, setShowCloudSyncModal] = useState(false);
  const streak = progress.streak;

  const BADGES = [
    { id: 'streak_3', title: 'Spark Starter', desc: '3-Day Streak', icon: '⚡' },
    { id: 'streak_7', title: 'Circuit Apprentice', desc: '7-Day Streak', icon: '🔥' },
    { id: 'streak_14', title: 'Relay Runner', desc: '14-Day Streak', icon: '🏆' },
    { id: 'streak_30', title: 'Logic Master', desc: '30-Day Streak', icon: '👑' },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '440px',
        padding: '12px 16px 80px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Profile Header & Mascot Showcase */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '20px',
          padding: '20px',
          border: '1px solid var(--color-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <Mascot
          mood="celebrate"
          size={76}
          cosmetic={(progress.cosmetics.equipped as any) || 'none'}
        />
        <div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#ffffff' }}>PLC Learner</h2>
          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-1)' }}>
              ⚡ {progress.xp} Total XP
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-2)' }}>
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
            gap: '10px',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: '16px',
              padding: '14px',
              border: '1px solid var(--color-bg-tertiary)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8' }}>BEST STREAK</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-2)', marginTop: '2px' }}>
              🔥 {streak.best} Days
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: '16px',
              padding: '14px',
              border: '1px solid var(--color-bg-tertiary)',
              textAlign: 'center',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8' }}>STREAK FREEZES</span>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--color-1)', marginTop: '2px' }}>
              ❄️ {streak.freezes}/2
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
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid var(--color-bg-tertiary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>
          Volt&apos;s Gear
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'none', label: 'Classic' },
            { id: 'hard_hat', label: '👷 Hard Hat' },
            { id: 'safety_glasses', label: '👓 Glasses' },
          ].map((item) => {
            const isEquipped = (progress.cosmetics.equipped || 'none') === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onEquipCosmetic(item.id as any)}
                style={{
                  flex: 1,
                  padding: '10px 6px',
                  borderRadius: '12px',
                  backgroundColor: isEquipped ? 'var(--color-2)' : '#0d161a',
                  color: isEquipped ? '#ffffff' : '#94a3b8',
                  border: isEquipped ? '2px solid var(--color-2-light)' : '1px solid #23353e',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  minHeight: '44px',
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Badges Showcase */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid var(--color-bg-tertiary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>
          Badges & Milestones
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {BADGES.map((b) => {
            const unlocked = streak.best >= parseInt(b.id.split('_')[1] || '0');
            return (
              <div
                key={b.id}
                style={{
                  backgroundColor: 'var(--color-bg-canvas)',
                  borderRadius: '12px',
                  padding: '10px',
                  border: unlocked ? '1.5px solid var(--color-2)' : '1px solid var(--color-bg-tertiary)',
                  opacity: unlocked ? 1 : 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                }}
              >
                <span style={{ fontSize: '1.4rem' }}>{b.icon}</span>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>{b.title}</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{b.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings & Privacy */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid var(--color-bg-tertiary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>
          Settings
        </h4>

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
            style={{ width: '20px', height: '20px', accentColor: 'var(--color-1)' }}
          />
        </label>
      </div>

      {/* Cloud Sync Button */}
      <Button
        variant="primary"
        size="md"
        fullWidth
        onClick={() => setShowCloudSyncModal(true)}
      >
        ☁️ Supabase Cloud Sync
      </Button>

      {/* Backup & Transfer Button */}
      <Button
        variant="secondary"
        size="md"
        fullWidth
        onClick={() => setShowBackupModal(true)}
      >
        💾 Backup & Transfer Progress
      </Button>

      {/* Cloud Sync Modal */}
      <CloudSyncModal
        isOpen={showCloudSyncModal}
        onClose={() => setShowCloudSyncModal(false)}
        localProgress={progress}
        onSyncComplete={onImportProgress}
      />

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
