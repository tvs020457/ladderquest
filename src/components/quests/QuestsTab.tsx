import React from 'react';
import { DailyQuestsState, WeeklyQuestState, DailyChallengeState } from '../../engine/progress/types';
import { Button } from '../common/Button';

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
      <div>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>Daily Quests</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '2px' }}>
          Refreshes at midnight ({quests.date})
        </p>
      </div>

      {/* Daily Quests List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {quests.items.map((q) => {
          const pct = Math.min(100, Math.round((q.progress / q.target) * 100));
          return (
            <div
              key={q.id}
              style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderRadius: '16px',
                padding: '14px 16px',
                border: q.done ? '1.5px solid var(--color-success)' : '1px solid var(--color-bg-tertiary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc' }}>
                  {q.title}
                </span>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-2)' }}>
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
                    backgroundColor: 'var(--color-bg-canvas)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      backgroundColor: q.done ? 'var(--color-success)' : 'var(--color-2)',
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
        style={{
          backgroundColor: allDailyDone && !quests.chestClaimed ? 'var(--color-3-dark)' : 'var(--color-bg-secondary)',
          borderRadius: '16px',
          padding: '16px',
          border: allDailyDone ? '2px solid var(--color-success)' : '1px solid var(--color-bg-tertiary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }}>🎁</span>
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>Daily Bonus Chest</h4>
            <span style={{ fontSize: '0.8rem', color: 'var(--color-3-light)' }}>+50 XP & Streak Freeze</span>
          </div>
        </div>

        {quests.chestClaimed ? (
          <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-success)' }}>
            Claimed ✓
          </span>
        ) : (
          <Button
            variant={allDailyDone ? 'success' : 'secondary'}
            size="md"
            disabled={!allDailyDone}
            onClick={onClaimChest}
          >
            Claim
          </Button>
        )}
      </div>

      {/* Daily Challenge Card */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '16px',
          padding: '16px',
          border: '1.5px solid var(--color-1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-1)', textTransform: 'uppercase' }}>
            Daily Circuit Puzzle
          </span>
          {challenge.completed && (
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-success)' }}>
              Solved Today ✓
            </span>
          )}
        </div>
        <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#ffffff' }}>
          Find & Fix the Injected Fault
        </h4>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
          A real-world fault has been injected into today&apos;s circuit. Troubleshoot and solve it to earn 30 XP and maintain your streak!
        </p>

        <Button
          variant={challenge.completed ? 'secondary' : 'primary'}
          fullWidth
          size="md"
          onClick={onStartDailyChallenge}
        >
          {challenge.completed ? 'Replay Challenge' : 'Solve Daily Challenge →'}
        </Button>
      </div>

      {/* Weekly Quest */}
      <div
        style={{
          backgroundColor: 'var(--color-bg-secondary)',
          borderRadius: '16px',
          padding: '16px',
          border: '1px solid var(--color-bg-tertiary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-2)', textTransform: 'uppercase' }}>
            Weekly Goal (Starts Mon {weekly.weekStart})
          </span>
          <span style={{ fontWeight: 800, fontSize: '0.85rem', color: 'var(--color-2)' }}>
            +{weekly.xpReward} XP
          </span>
        </div>
        <h4 style={{ fontSize: '1rem', fontWeight: 900, color: '#ffffff' }}>
          Pass 10 Levels This Week
        </h4>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
          <div style={{ flex: 1, height: '8px', backgroundColor: 'var(--color-bg-canvas)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, (weekly.progress / weekly.target) * 100)}%`,
                height: '100%',
                backgroundColor: 'var(--color-2)',
              }}
            />
          </div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e2e8f0' }}>
            {weekly.progress}/{weekly.target}
          </span>
        </div>

        {weekly.progress >= weekly.target && !weekly.claimed && (
          <Button variant="success" size="md" onClick={onClaimWeekly} style={{ marginTop: '8px' }}>
            Claim Weekly Reward!
          </Button>
        )}
      </div>
    </div>
  );
};
