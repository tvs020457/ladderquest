import React, { useState } from 'react';
import { UNITS, getAllLoadedLevels } from '../../levels';
import { LevelDefinition } from '../../levels/types';
import { UnitBanner } from './UnitBanner';
import { LevelNode } from './LevelNode';
import { Button } from '../common/Button';

interface PathScreenProps {
  unlockedLevel: number;
  completedLevels: Record<number, { stars: number }>;
  onSelectLevel: (levelId: number) => void;
}

export const PathScreen: React.FC<PathScreenProps> = ({
  unlockedLevel,
  completedLevels,
  onSelectLevel,
}) => {
  const allLevels = getAllLoadedLevels();
  const [previewLevel, setPreviewLevel] = useState<LevelDefinition | null>(null);

  // Unit colors cycling through triadic palette
  const unitColors = [
    '#65AABB', // Color 1: Soft Cyan-Teal
    '#BB65AA', // Color 2: Vivid Orchid-Magenta
    '#AABB65', // Color 3: Fresh Olive-Lime
    '#8ec3cf', // Color 1 Light
    '#cf84c0', // Color 2 Light
    '#c5d38c', // Color 3 Light
    '#3a7584', // Color 1 Dark
    '#833974', // Color 2 Dark
  ];

  // Calculate sinusoidal offsets for winding path effect
  const getOffset = (index: number) => {
    const cycle = index % 4;
    if (cycle === 0) return 0;
    if (cycle === 1) return 42;
    if (cycle === 2) return 0;
    if (cycle === 3) return -42;
    return 0;
  };

  const handleNodeClick = (id: number) => {
    const lvl = allLevels.find((l) => l.id === id);
    if (lvl) {
      setPreviewLevel(lvl);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '440px',
        padding: '8px 16px 80px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {UNITS.map((unit, unitIdx) => {
        const unitLevels = allLevels.filter(
          (l) => l.id >= unit.levelRange[0] && l.id <= unit.levelRange[1]
        );

        if (unitLevels.length === 0) return null;

        const color = unitColors[unitIdx % unitColors.length];

        return (
          <div key={unit.id} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <UnitBanner
              unitNumber={unit.id}
              title={unit.title}
              accentColor={color}
              subtitle={
                unit.id === 1
                  ? 'Learn power flow, continuity, and basic rails.'
                  : 'Master normally open & closed contacts.'
              }
            />

            {/* Path Nodes */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              {unitLevels.map((lvl, idx) => {
                const isCompleted = !!completedLevels[lvl.id];
                const isCurrent = lvl.id === unlockedLevel;
                const status = isCompleted ? 'completed' : isCurrent ? 'current' : 'locked';
                const stars = completedLevels[lvl.id]?.stars ?? 0;
                const offset = getOffset(idx);

                return (
                  <LevelNode
                    key={lvl.id}
                    id={lvl.id}
                    status={status}
                    stars={stars}
                    offsetPercent={offset}
                    onClick={handleNodeClick}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Level Preview Modal */}
      {previewLevel && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setPreviewLevel(null)}
        >
          <div
            style={{
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: '20px',
              padding: '24px 20px',
              width: '100%',
              maxWidth: '380px',
              border: '2px solid var(--color-bg-tertiary)',
              boxShadow: '0 12px 36px rgba(0, 0, 0, 0.7)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: 'var(--color-2)',
                  textTransform: 'uppercase',
                }}
              >
                Level {previewLevel.id} • Unit {previewLevel.unit}
              </span>
              <button
                onClick={() => setPreviewLevel(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '1.2rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  padding: '4px',
                  minHeight: 'auto',
                  minWidth: 'auto',
                }}
              >
                ✕
              </button>
            </div>

            <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#ffffff' }}>
              {previewLevel.title}
            </h3>

            <p style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: '1.4' }}>
              {previewLevel.story}
            </p>

            {completedLevels[previewLevel.id] && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1.1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8' }}>Best Score:</span>
                {'⭐'.repeat(completedLevels[previewLevel.id].stars)}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => {
                onSelectLevel(previewLevel.id);
                setPreviewLevel(null);
              }}
            >
              Start Level
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
