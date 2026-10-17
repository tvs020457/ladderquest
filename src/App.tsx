import { useState, useMemo, useEffect } from 'react';
import { getAllLoadedLevels } from './levels';
import { LevelDefinition } from './levels/types';
import { PathScreen } from './components/path/PathScreen';
import { LevelShell } from './components/level/LevelShell';
import { Header } from './components/common/Header';
import { QuestsTab } from './components/quests/QuestsTab';
import { ProfileTab } from './components/profile/ProfileTab';
import { UserProgressV1 } from './engine/progress/types';
import {
  loadUserProgress,
  saveUserProgress,
} from './engine/progress/storage';
import { recordActivity, getTodayString } from './engine/progress/streak';
import { updateQuestsOnActivity } from './engine/progress/quests';
import { generateDailyChallenge } from './engine/progress/dailyChallenge';
import { sound } from './utils/sound';
import { haptics } from './utils/haptics';
import { FrostedIcon, FrostedIconName } from './components/common/FrostedIcon';

export default function App() {
  const allLevels = useMemo(() => getAllLoadedLevels(), []);
  const today = useMemo(() => getTodayString(), []);

  // Persistent user progress state (100% local storage)
  const [progress, setProgress] = useState<UserProgressV1>(() => loadUserProgress(today));

  // Top-level Navigation & Active Screen
  const [activeTab, setActiveTab] = useState<'path' | 'quests' | 'profile'>('path');
  const [activeLevel, setActiveLevel] = useState<LevelDefinition | null>(null);

  // Sync to localStorage on progress updates
  useEffect(() => {
    saveUserProgress(progress);
  }, [progress]);

  // Determine current unlocked level
  const unlockedLevel = useMemo(() => {
    const passedIds = Object.keys(progress.levels).map(Number);
    if (passedIds.length === 0) return 1;
    return Math.max(...passedIds) + 1;
  }, [progress.levels]);

  const handleStartLevel = (id: number) => {
    const lvl = allLevels.find((l) => l.id === id);
    if (lvl) {
      setActiveLevel(lvl);
    }
  };

  const handleStartDailyChallenge = () => {
    const challenge = generateDailyChallenge(today);
    setActiveLevel(challenge.level);
  };

  const handleLevelPass = (stars: number, xp: number) => {
    if (!activeLevel) return;

    const isDailyChallenge = activeLevel.title.includes('Daily Challenge');

    // 1. Update streak
    const activityResult = recordActivity(progress.streak, today);

    // 2. Update quests
    const { updatedQuests } = updateQuestsOnActivity(progress.quests, {
      xpEarned: xp,
      levelPassed: true,
      starsEarned: stars,
      isDailyChallenge,
    });

    // 3. Update weekly quest
    const nextWeekly = {
      ...progress.weekly,
      progress: progress.weekly.progress + 1,
    };

    // 4. Update level record
    const nextLevels = { ...progress.levels };
    if (!isDailyChallenge) {
      const prevRecord = nextLevels[activeLevel.id];
      nextLevels[activeLevel.id] = {
        stars: Math.max(prevRecord?.stars ?? 0, stars),
        bestElements: Math.min(prevRecord?.bestElements ?? 999, activeLevel.parElements ?? 4),
        completedOn: today,
        hintsUsed: 0,
      };
    }

    // 5. Update daily challenge status
    const nextChallenge = {
      ...progress.dailyChallenge,
      completed: isDailyChallenge ? true : progress.dailyChallenge.completed,
    };

    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + xp,
      streak: activityResult.streak,
      quests: updatedQuests,
      weekly: nextWeekly,
      dailyChallenge: nextChallenge,
      levels: nextLevels,
    }));
  };

  const handleClaimChest = () => {
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + 50,
      streak: {
        ...prev.streak,
        freezes: Math.min(2, prev.streak.freezes + 1),
      },
      quests: {
        ...prev.quests,
        chestClaimed: true,
      },
    }));
  };

  const handleClaimWeekly = () => {
    setProgress((prev) => ({
      ...prev,
      xp: prev.xp + prev.weekly.xpReward,
      weekly: {
        ...prev.weekly,
        claimed: true,
      },
    }));
  };

  const handleUpdateSettings = (settings: UserProgressV1['settings']) => {
    setProgress((prev) => ({ ...prev, settings }));
  };

  const handleEquipCosmetic = (cosmetic: 'none' | 'hard_hat' | 'safety_glasses') => {
    setProgress((prev) => ({
      ...prev,
      cosmetics: {
        ...prev.cosmetics,
        equipped: cosmetic,
      },
    }));
  };

  const handleImportProgress = (imported: UserProgressV1) => {
    setProgress(imported);
    saveUserProgress(imported);
  };

  const completedQuestsCount = progress.quests.items.filter((q) => q.done).length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        maxWidth: '480px',
        margin: '0 auto',
        backgroundColor: 'var(--color-bg-primary)',
      }}
    >
      {/* If inside an active level or daily challenge, render LevelShell */}
      {activeLevel ? (
        <LevelShell
          level={activeLevel}
          onExit={() => setActiveLevel(null)}
          onPass={handleLevelPass}
        />
      ) : (
        /* Otherwise render the Path / Quests / Profile screens */
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          <Header
            streak={progress.settings.hideStreakUi ? 0 : progress.streak.current}
            xp={progress.xp}
            questsDoneCount={completedQuestsCount}
            totalQuests={progress.quests.items.length}
            onProfileClick={() => setActiveTab('profile')}
          />

          <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {activeTab === 'path' && (
              <PathScreen
                unlockedLevel={unlockedLevel}
                completedLevels={progress.levels}
                onSelectLevel={handleStartLevel}
              />
            )}

            {activeTab === 'quests' && (
              <QuestsTab
                quests={progress.quests}
                weekly={progress.weekly}
                challenge={progress.dailyChallenge}
                onClaimChest={handleClaimChest}
                onClaimWeekly={handleClaimWeekly}
                onStartDailyChallenge={handleStartDailyChallenge}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileTab
                progress={progress}
                onUpdateSettings={handleUpdateSettings}
                onEquipCosmetic={handleEquipCosmetic}
                onImportProgress={handleImportProgress}
              />
            )}
          </main>

          {/* Floating Luxury Frosted Glass Capsule Dock */}
          <nav
            className="glass-capsule-dock"
            style={{
              position: 'fixed',
              bottom: '16px',
              left: '16px',
              right: '16px',
              maxWidth: '430px',
              margin: '0 auto',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              padding: '7px 10px',
              zIndex: 30,
            }}
          >
            {[
              { id: 'path', label: 'Path', iconName: 'path' as FrostedIconName },
              { id: 'quests', label: 'Quests', iconName: 'quests' as FrostedIconName },
              { id: 'profile', label: 'Profile', iconName: 'profile' as FrostedIconName },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sound.playTap();
                    haptics.tap();
                    setActiveTab(tab.id as any);
                  }}
                  style={{
                    background: isActive
                      ? 'rgba(250, 204, 21, 0.16)'
                      : 'transparent',
                    border: isActive
                      ? '1px solid rgba(250, 204, 21, 0.4)'
                      : '1px solid transparent',
                    borderRadius: '24px',
                    color: isActive ? '#FEF08A' : '#94A3B8',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px 22px',
                    gap: '4px',
                    boxShadow: isActive
                      ? '0 0 20px rgba(250, 204, 21, 0.25)'
                      : 'none',
                    backdropFilter: isActive ? 'blur(10px)' : 'none',
                    WebkitBackdropFilter: isActive ? 'blur(10px)' : 'none',
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                >
                  <FrostedIcon
                    name={tab.iconName}
                    size={34}
                    iconSize={18}
                    active={isActive}
                    variant={isActive ? 'yellow' : 'neutral'}
                    glow={isActive}
                  />
                  <span style={{ fontSize: '0.78rem', letterSpacing: '0.02em', marginTop: '1px' }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}
