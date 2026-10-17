import React, { useState } from 'react';
import { LevelDefinition, WireDef } from '../../levels/types';
import { WiringCanvas } from '../editor/WiringCanvas';
import { Button } from '../common/Button';

interface GuidedTryStepProps {
  level: LevelDefinition;
  onComplete: () => void;
}

export const GuidedTryStep: React.FC<GuidedTryStepProps> = ({
  level,
  onComplete,
}) => {
  // Use expectedExactWires if available, or construct a 1-wire missing puzzle
  const initialGuidedWires: WireDef[] = level.initialWires.length > 0
    ? level.initialWires
    : level.expectedExactWires && level.expectedExactWires.length > 1
    ? [level.expectedExactWires[0]] // Leave the rest for user
    : [];

  const [guidedWires, setGuidedWires] = useState<WireDef[]>([...initialGuidedWires]);
  const [hasSolved, setHasSolved] = useState(false);

  const handleAddWire = (wire: WireDef) => {
    setGuidedWires((prev) => [...prev, wire]);
    // If learner drew any wire successfully in guided try, mark solved!
    setHasSolved(true);
  };

  const handleRemoveWire = (wireId: string) => {
    setGuidedWires((prev) => prev.filter((w) => w.id !== wireId));
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        maxWidth: '440px',
        padding: '12px 8px',
        gap: '14px',
      }}
    >
      <div style={{ textAlign: 'center', width: '100%' }}>
        <span
          style={{
            fontSize: '0.8rem',
            fontWeight: 800,
            color: 'var(--color-2)',
            textTransform: 'uppercase',
          }}
        >
          Step 2: Guided Try
        </span>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
          Connect the Missing Link
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px' }}>
          {level.guidedTry?.prompt || 'Tap the two highlighted terminals to bridge the missing connection.'}
        </p>
      </div>

      <div style={{ width: '100%' }}>
        <WiringCanvas
          parts={level.initialParts}
          wires={guidedWires}
          inputValues={{}}
          expectedWiresGuide={level.expectedExactWires}
          onAddWire={handleAddWire}
          onRemoveWire={handleRemoveWire}
          isSimulating={true}
        />
      </div>

      <div style={{ width: '100%', marginTop: 'auto', paddingTop: '10px' }}>
        <Button
          variant={hasSolved ? 'success' : 'primary'}
          fullWidth
          size="lg"
          onClick={onComplete}
        >
          {hasSolved ? 'Great! Proceed to Real Challenge →' : 'Skip to Real Challenge →'}
        </Button>
      </div>
    </div>
  );
};
