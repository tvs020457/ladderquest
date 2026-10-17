import React from 'react';
import { DailyQuestsState, WeeklyQuestState, DailyChallengeState } from '../../engine/progress/types';
import { Button } from '../common/Button';
import { sound } from '../../utils/sound';
import { haptics } from '../../utils/haptics';
import { FrostedIcon } from '../common/FrostedIcon';

interface QuestsTabProps {
  quests: DailyQuestsState;
  weekly: WeeklyQuestState;
  challenge: DailyChallengeState;
  onClaimChest: () => void;
  onClaimWeekly: () => void;
  onStartDailyChallenge: () => void;
}

export const QuestsTab: React.FC<QuestsTabProps> = ({
  quests,
  weekly,
  challenge,
  onClaimChest,
  onClaimWeekly,
  onStartDailyChallenge,
}) => {
  const allDailyDone = quests.items.every((q) => q.done);

  const handleClaimChest = () => {
    sound.playChestOpen();
    haptics.pulse();
    onClaimChest();
  };

  const handleClaimWeekly = () => {
    sound.playChestOpen();
    haptics.pulse();
    onClaimWeekly();
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '440px',
        padding: '24px 20px 110px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
      }}
    >
      <div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F8FAFC' }}>
          Daily Quests
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px' }}>
          Refreshes at midnight (<span style={{ color: '#FEF08A' }}>{quests.date}</span>)
        </p>
      </div>

      {/* Daily Quests List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {quests.items.map((q) => {
          const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
          return (
            <div
              key={q.id}
              className="glass-card"
              style={{
                padding: '16px',
                border: q.done ? '1.5px solid #10B981' : '1px solid var(--glass-border)',
                boxShadow: q.done ? '0 8px 24px rgba(16, 185, 129, 0.15)' : 'var(--glass-shadow-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>
                  {q.title}
                </span>
                <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#EAB308' }}>
                  +{q.xpReward} XP
                </span>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{q.description}</p>

              {/* Progress Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    flex: 1,
                    height: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.4)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: q.done ? '#10B981' : '#EAB308',
                      boxShadow: q.done ? '0 0 8px rgba(16, 185, 129, 0.4)' : '0 0 8px rgba(234, 179, 8, 0.3)',
                      transition: 'width 0.3s ease',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e2e8f0', minWidth: '40px', textAlign: 'right' }}>
                  {q.progress}/{q.target}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Daily Bonus Chest */}
      <div
        className={allDailyDone && !quests.chestClaimed ? 'glass-card-yellow' : 'glass-card'}
        style={{
          padding: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <FrostedIcon
            name="gift"
            size={46}
            iconSize={26}
            variant="yellow"
            glow={allDailyDone}
          />
          <div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff' }}>Daily Bonus Chest</h4>
            <span style={{ fontSize: '0.82rem', color: '#FEF08A' }}>+50 XP & Streak Freeze</span>
          </div>
        </div>

        {quests.chestClaimed ? (
          <span style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--color-success)' }}>
            Claimed ✓
          </span>
        ) : (
          <Button
            variant={allDailyDone ? 'primary' : 'secondary'}
            size="md"
            disabled={!allDailyDone}
            onClick={handleClaimChest}
          >
            Claim
          </Button>
        )}
      </div>

      {/* Daily Challenge Card */}
      <div
        className="glass-card-yellow"
        style={{
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#FACC15', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Daily Circuit Puzzle
          </span>
          {challenge.completed && (
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-success)' }}>
              Solved Today ✓
            </span>
          )}
        </div>
        <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
          Find & Fix the Injected Fault
        </h4>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
          A real-world fault has been injected into today&apos;s circuit. Troubleshoot and solve it to earn 30 XP and maintain your streak!
        </p>

        <Button
          variant={challenge.completed ? 'secondary' : 'primary'}
          fullWidth
          size="md"
          onClick={() => {
            sound.playTap();
            haptics.tap();
            onStartDailyChallenge();
          }}
        >
          {challenge.completed ? 'Replay Challenge' : 'Solve Daily Challenge →'}
        </Button>
      </div>

      {/* Weekly Quest */}
      <div
        className="glass-card"
        style={{
          padding: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FACC15', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Weekly Goal (Starts Mon {weekly.weekStart})
          </span>
          <span style={{ fontWeight: 900, fontSize: '0.85rem', color: '#EAB308' }}>
            +{weekly.xpReward} XP
          </span>
        </div>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#ffffff' }}>
          Pass 10 Levels This Week
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <div style={{ flex: 1, height: '8px', backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, (weekly.progress / weekly.target) * 100)}%`,
                height: '100%',
                background: '#EAB308',
                boxShadow: '0 0 8px rgba(234, 179, 8, 0.3)',
              }}
            />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e2e8f0' }}>
            {weekly.progress}/{weekly.target}
          </span>
        </div>

        {weekly.progress >= weekly.target && !weekly.claimed && (
          <Button variant="primary" size="md" onClick={handleClaimWeekly} style={{ marginTop: '8px' }}>
            Claim Weekly Reward!
          </Button>
        )}
      </div>
    </div>
  );
};
