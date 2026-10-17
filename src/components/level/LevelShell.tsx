import React, { useState } from 'react';
import { LevelDefinition, WireDef } from '../../levels/types';
import { FrostedIcon } from '../common/FrostedIcon';
import { LearnStep } from './LearnStep';
import { GuidedTryStep } from './GuidedTryStep';
import { WiringCanvas } from '../editor/WiringCanvas';
import { LogicEditor } from '../editor/LogicEditor';
import { PartsTray } from '../editor/PartsTray';
import { InputPanel } from '../editor/InputPanel';
import { MachineDisplay } from '../machines/MachineDisplay';
import { Button } from '../common/Button';
import { BottomSheet } from '../common/BottomSheet';
import { TimingDiagram } from '../common/TimingDiagram';
import { gradeCircuit, gradeRungs, GradingResult } from '../../engine/grader';
import { circuitToRungs } from '../../engine/circuitToRungs';
import { PlcSimulator } from '../../engine/scanCycle';
import { Rung, InstructionType } from '../../engine/types';
import { sound } from '../../utils/sound';
import { haptics } from '../../utils/haptics';

interface LevelShellProps {
  level: LevelDefinition;
  onExit: () => void;
  onPass: (stars: number, xp: number) => void;
}

export const LevelShell: React.FC<LevelShellProps> = ({
  level,
  onExit,
  onPass,
}) => {
  const isWriteMode = level.mode === 'write';

  // Step state: 1 (Learn), 2 (Guided Try), 3 (Build)
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Wires state for Levels 1-20
  const [wires, setWires] = useState<WireDef[]>([...level.initialWires]);

  // Rungs state for Levels 21-30
  const [rungs, setRungs] = useState<Rung[]>(() => {
    if (isWriteMode) {
      // Initialize with 1 empty rung
      return [
        {
          id: 'rung_0',
          branches: [[]],
          outputs: [],
        },
      ];
    }
    return [];
  });

  const [selectedTrayElement, setSelectedTrayElement] = useState<InstructionType | null>(null);

  // Interactive inputs state
  const [inputStates, setInputStates] = useState<Record<string, number>>({});

  // Hints state (0 to 3)
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [showHintModal, setShowHintModal] = useState(false);

  // Grading Result
  const [gradeResult, setGradeResult] = useState<GradingResult | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Active inputs merged with defaults
  const currentInputs = React.useMemo(() => {
    const res: Record<string, number> = {};
    for (const inp of level.inputs) {
      if (inputStates[inp.tag] !== undefined) {
        res[inp.tag] = inputStates[inp.tag];
      } else {
        res[inp.tag] = inp.initialValue ?? 0;
      }
    }
    return res;
  }, [level, inputStates]);

  // Live simulation outputs computation
  const liveOutputs = React.useMemo(() => {
    const activeRungs = isWriteMode
      ? rungs
      : circuitToRungs(level.initialParts, wires);

    const plc = new PlcSimulator(activeRungs, {
      declaredInputs: level.inputs.map((i) => i.tag),
      declaredOutputs: level.outputs.map((o) => o.tag),
    });
    plc.step(currentInputs);

    const outputs: Record<string, number> = {};
    for (const out of level.outputs) {
      outputs[out.tag] = plc.getOutput(out.tag);
    }
    return outputs;
  }, [level, wires, rungs, isWriteMode, currentInputs]);

  const handleAddWire = (wire: WireDef) => {
    setWires((prev) => [...prev, wire]);
  };

  const handleRemoveWire = (wireId: string) => {
    setWires((prev) => prev.filter((w) => w.id !== wireId));
  };

  const handleReset = () => {
    sound.playTap();
    haptics.tap();
    if (isWriteMode) {
      setRungs([
        {
          id: 'rung_0',
          branches: [[]],
          outputs: [],
        },
      ]);
    } else {
      setWires([...level.initialWires]);
    }
    setInputStates({});
  };

  const handleAddRung = () => {
    sound.playWireConnect();
    haptics.snap();
    setRungs((prev) => [
      ...prev,
      {
        id: `rung_${prev.length}`,
        branches: [[]],
        outputs: [],
      },
    ]);
  };

  const handleAddBranch = () => {
    if (rungs.length === 0) return;
    sound.playWireConnect();
    haptics.snap();
    const newRungs = JSON.parse(JSON.stringify(rungs)) as Rung[];
    newRungs[newRungs.length - 1].branches.push([]);
    setRungs(newRungs);
  };

  const handleRun = () => {
    sound.playRelayClick();
    let res: GradingResult;
    if (isWriteMode) {
      const elementsCount = rungs.reduce(
        (acc, r) =>
          acc +
          r.branches.reduce((bAcc, b) => bAcc + b.length, 0) +
          r.outputs.length,
        0
      );
      res = gradeRungs(rungs, level, elementsCount, { hintsUsed: hintsRevealed });
    } else {
      res = gradeCircuit(level.initialParts, wires, level, {
        hintsUsed: hintsRevealed,
      });
    }

    setGradeResult(res);
    setIsSheetOpen(true);
    if (res.passed) {
      sound.playSuccess();
      haptics.success();
      onPass(res.starsEarned, res.xpEarned);
    } else {
      sound.playFail();
      haptics.error();
    }
  };

  const handleUnlockHint = () => {
    sound.playTap();
    haptics.tap();
    if (hintsRevealed < 3) {
      setHintsRevealed((prev) => prev + 1);
    }
    setShowHintModal(true);
  };

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
      {/* Top Navigation & 3-Step Progress Bar with Frosted Glass */}
      <header
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          padding: '14px 16px 10px 16px',
          background: 'var(--glass-bg-primary)',
          backdropFilter: 'var(--glass-blur)',
          WebkitBackdropFilter: 'var(--glass-blur)',
          borderBottom: '1px solid var(--glass-border-yellow)',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Back Button */}
          <button
            onClick={() => {
              sound.playTap();
              haptics.tap();
              onExit();
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--glass-border)',
              borderRadius: '12px',
              cursor: 'pointer',
              padding: '6px',
              minHeight: '38px',
              minWidth: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            aria-label="Back to path"
          >
            <FrostedIcon name="back" size={18} yellow />
          </button>

          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#F8FAFC', letterSpacing: '0.01em' }}>
            Level {level.id}: <span style={{ color: '#FACC15' }}>{level.title}</span>
          </span>

          {/* Hint Button */}
          <button
            onClick={handleUnlockHint}
            style={{
              background: hintsRevealed > 0 ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              border: hintsRevealed > 0 ? '1px solid #F59E0B' : '1px solid var(--glass-border)',
              color: hintsRevealed > 0 ? '#FEF08A' : '#e2e8f0',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '12px',
              minHeight: '38px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: hintsRevealed > 0 ? '0 0 10px rgba(245, 158, 11, 0.3)' : 'none',
              transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <FrostedIcon name="hint" size={18} yellow={hintsRevealed > 0} />
            <span>Hint ({hintsRevealed}/3)</span>
          </button>
        </div>

        {/* 3-Segment Step Progress Bar */}
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          {[1, 2, 3].map((s) => {
            const isCompleted = step > s;
            const isCurrent = step === s;
            return (
              <div
                key={s}
                style={{
                  flex: 1,
                  height: '6px',
                  borderRadius: '3px',
                  backgroundColor: isCompleted
                    ? 'var(--color-success)'
                    : isCurrent
                    ? '#FACC15'
                    : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: isCurrent ? '0 0 8px rgba(250, 204, 21, 0.8)' : 'none',
                  transition: 'background-color 0.3s ease, box-shadow 0.3s ease',
                }}
              />
            );
          })}
        </div>
      </header>

      {/* Step Content */}
      <main
        style={{
          flex: 1,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {step === 1 && (
          <LearnStep
            cards={level.learn}
            levelTitle={level.title}
            concept={level.concept}
            onComplete={() => {
              sound.playTap();
              haptics.tap();
              setStep(2);
            }}
          />
        )}

        {step === 2 && (
          <GuidedTryStep
            level={level}
            onComplete={() => {
              sound.playTap();
              haptics.tap();
              setStep(3);
            }}
          />
        )}

        {step === 3 && (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            {/* Story & Reset */}
            <div style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: 'var(--color-2)',
                    textTransform: 'uppercase',
                  }}
                >
                  Step 3: {isWriteMode ? 'Write Logic & Test' : 'Build & Test'}
                </span>
                <button
                  onClick={handleReset}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    padding: '4px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <FrostedIcon name="reset" size={14} />
                  <span>Reset</span>
                </button>
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.88rem', marginTop: '4px' }}>
                {level.story}
              </p>
            </div>

            {/* Machine Illustration Display */}
            <MachineDisplay
              outputs={level.outputs}
              outputValues={liveOutputs}
            />

            {/* Canvas / Editor Area */}
            {isWriteMode ? (
              // Levels 21 to 30: Ladder Rung Editor + Parts Tray
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <LogicEditor
                  rungs={rungs}
                  selectedElement={selectedTrayElement}
                  inputs={level.inputs}
                  outputs={level.outputs}
                  onChangeRungs={setRungs}
                />
                <PartsTray
                  allowedElements={level.allowedElements}
                  selectedElement={selectedTrayElement}
                  onSelectElement={setSelectedTrayElement}
                  onAddRung={handleAddRung}
                  onAddBranch={handleAddBranch}
                />
              </div>
            ) : (
              // Levels 1 to 20: Wiring Canvas
              <div style={{ width: '100%', margin: '4px 0' }}>
                <WiringCanvas
                  parts={level.initialParts}
                  wires={wires}
                  inputValues={currentInputs}
                  expectedWiresGuide={level.id <= 4 ? level.expectedExactWires : undefined}
                  onAddWire={handleAddWire}
                  onRemoveWire={handleRemoveWire}
                  isSimulating={true}
                />
                <div style={{ width: '100%', textAlign: 'center', margin: '4px 0' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    💡 Tap two terminals to wire • Tap wire to remove
                  </span>
                </div>
              </div>
            )}

            {/* Interactive Input Panel */}
            <InputPanel
              inputs={level.inputs}
              values={currentInputs}
              onChange={(tag, val) => {
                setInputStates((prev) => ({ ...prev, [tag]: val }));
              }}
            />

            {/* Run Button */}
            <div style={{ width: '100%', marginTop: 'auto', paddingTop: '6px' }}>
              <Button
                variant="success"
                fullWidth
                size="lg"
                onClick={handleRun}
              >
                ▶ Run & Check Circuit
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Hints Modal with Frosted Glass */}
      {showHintModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setShowHintModal(false)}
        >
          <div
            className="glass-panel"
            style={{
              padding: '24px 20px',
              width: '100%',
              maxWidth: '380px',
              border: '1.5px solid var(--glass-border-yellow)',
              boxShadow: 'var(--glass-shadow-glow)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-2)' }}>
                💡 Hints ({hintsRevealed}/3)
              </h3>
              <button
                onClick={() => setShowHintModal(false)}
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {level.hints.slice(0, hintsRevealed).map((hint, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'var(--color-bg-canvas)',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--color-bg-tertiary)',
                    fontSize: '0.88rem',
                    color: '#e2e8f0',
                  }}
                >
                  <strong style={{ color: 'var(--color-1)' }}>Hint {idx + 1}:</strong> {hint}
                </div>
              ))}
            </div>

            {hintsRevealed < 3 && (
              <Button
                variant="secondary"
                size="md"
                onClick={() => setHintsRevealed((prev) => prev + 1)}
              >
                Reveal Next Hint ({hintsRevealed + 1}/3)
              </Button>
            )}

            <Button
              variant="primary"
              size="md"
              onClick={() => setShowHintModal(false)}
            >
              Back to Circuit
            </Button>
          </div>
        </div>
      )}

      {/* Result Bottom Sheet */}
      {gradeResult && (
        <BottomSheet
          isOpen={isSheetOpen}
          type={gradeResult.passed ? 'pass' : 'fail'}
          title={gradeResult.passed ? 'Circuit Connected!' : 'Issue Found'}
          message={
            gradeResult.passed
              ? 'Great job! Logic and wiring passed all operational tests.'
              : gradeResult.connectionError ||
                gradeResult.failingTest?.failure?.message ||
                'The circuit did not pass all operational tests.'
          }
          stars={gradeResult.starsEarned}
          xpEarned={gradeResult.xpEarned}
          onContinue={onExit}
          onRetry={() => setIsSheetOpen(false)}
        >
          {/* On Failure: show Timing Diagram with red error marker */}
          {!gradeResult.passed && gradeResult.failingTest && (
            <TimingDiagram
              trace={gradeResult.failingTest.trace}
              failure={gradeResult.failingTest.failure}
            />
          )}
        </BottomSheet>
      )}
    </div>
  );
};
