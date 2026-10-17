import React, { useState } from 'react';
import {
  Rung,
  InstructionType,
  LogicInstruction,
  ConditionBranch,
} from '../../engine/types';
import { LevelInputDef, LevelOutputDef } from '../../levels/types';

interface LogicEditorProps {
  rungs: Rung[];
  selectedElement: InstructionType | null;
  inputs: LevelInputDef[];
  outputs: LevelOutputDef[];
  onChangeRungs: (rungs: Rung[]) => void;
}

export const LogicEditor: React.FC<LogicEditorProps> = ({
  rungs,
  selectedElement,
  inputs,
  outputs,
  onChangeRungs,
}) => {
  const [editingInstruction, setEditingInstruction] = useState<{
    rungIdx: number;
    branchIdx?: number;
    instIdx: number;
    isOutput: boolean;
    instruction: LogicInstruction;
  } | null>(null);

  // Available tags for assignment
  const availableTags = [
    ...inputs.map((i) => i.tag),
    ...outputs.map((o) => o.tag),
    'T1.DN',
    'C1.DN',
    'M1',
    'M2',
    'FAULT',
    'RUN',
  ];

  const handleSlotClick = (
    rungIdx: number,
    branchIdx: number,
    isOutput: boolean
  ) => {
    if (!selectedElement) return;

    const newRungs = JSON.parse(JSON.stringify(rungs)) as Rung[];
    const isCoil = ['OTE', 'OTL', 'OTU', 'TON', 'TOF', 'CTU', 'RES'].includes(selectedElement);

    if (isOutput || isCoil) {
      // Add to outputs
      const defaultTag = outputs[0]?.tag || 'MOTOR';
      const newInst: any = {
        id: `inst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: selectedElement,
        tag: defaultTag,
        preset: selectedElement === 'TON' || selectedElement === 'TOF' ? 3000 : selectedElement === 'CTU' ? 5 : undefined,
        targetTag: selectedElement === 'RES' ? defaultTag : undefined,
      };
      newRungs[rungIdx].outputs.push(newInst);
    } else {
      // Add to branch
      const defaultTag = inputs[0]?.tag || 'START';
      const newInst: any = {
        id: `inst_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        type: selectedElement as 'XIC' | 'XIO',
        tag: defaultTag,
      };
      if (!newRungs[rungIdx].branches[branchIdx]) {
        newRungs[rungIdx].branches[branchIdx] = [];
      }
      newRungs[rungIdx].branches[branchIdx].push(newInst);
    }

    onChangeRungs(newRungs);
  };

  const handleDeleteInstruction = (
    rungIdx: number,
    branchIdx: number | undefined,
    instIdx: number,
    isOutput: boolean
  ) => {
    const newRungs = JSON.parse(JSON.stringify(rungs)) as Rung[];
    if (isOutput) {
      newRungs[rungIdx].outputs.splice(instIdx, 1);
    } else if (branchIdx !== undefined) {
      newRungs[rungIdx].branches[branchIdx].splice(instIdx, 1);
    }
    onChangeRungs(newRungs);
    setEditingInstruction(null);
  };

  const handleUpdateTag = (tag: string) => {
    if (!editingInstruction) return;
    const { rungIdx, branchIdx, instIdx, isOutput } = editingInstruction;
    const newRungs = JSON.parse(JSON.stringify(rungs)) as Rung[];

    if (isOutput) {
      newRungs[rungIdx].outputs[instIdx].tag = tag;
    } else if (branchIdx !== undefined) {
      newRungs[rungIdx].branches[branchIdx][instIdx].tag = tag;
    }

    onChangeRungs(newRungs);
    setEditingInstruction(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        maxWidth: '480px',
        backgroundColor: 'var(--color-bg-canvas)',
        borderRadius: '16px',
        border: '2px solid var(--color-bg-tertiary)',
        padding: '16px 10px',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {rungs.map((rung, rIdx) => {
        return (
          <div
            key={rung.id || rIdx}
            style={{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              minHeight: '74px',
              borderLeft: '4px solid var(--color-1)', // Left power rail L
              borderRight: '4px solid #64748b', // Right neutral rail R
              padding: '8px 12px',
              backgroundColor: 'var(--color-bg-secondary)',
              borderRadius: '8px',
            }}
          >
            {/* Branches Area (Left side) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rung.branches.map((branch: ConditionBranch, bIdx: number) => {
                return (
                  <div
                    key={bIdx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                    }}
                  >
                    {branch.map((inst, iIdx) => {
                      const isNC = inst.type === 'XIO';
                      return (
                        <button
                          key={inst.id || iIdx}
                          onClick={() =>
                            setEditingInstruction({
                              rungIdx: rIdx,
                              branchIdx: bIdx,
                              instIdx: iIdx,
                              isOutput: false,
                              instruction: inst,
                            })
                          }
                          style={{
                            minWidth: '58px',
                            minHeight: '44px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--color-bg-canvas)',
                            border: '1.5px solid var(--color-1)',
                            color: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '4px 6px',
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ fontSize: '0.9rem', fontWeight: 900, fontFamily: 'monospace' }}>
                            {isNC ? '—|/|—' : '—| |—'}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-2)' }}>
                            {inst.tag}
                          </span>
                        </button>
                      );
                    })}

                    {/* Slot to add contact */}
                    <button
                      onClick={() => handleSlotClick(rIdx, bIdx, false)}
                      style={{
                        minWidth: '44px',
                        minHeight: '44px',
                        borderRadius: '8px',
                        border: '1.5px dashed #475569',
                        backgroundColor: selectedElement ? 'rgba(101, 170, 187, 0.15)' : 'transparent',
                        color: '#64748b',
                        fontSize: '1rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Place contact here"
                    >
                      +
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Connecting wire line */}
            <div style={{ width: '20px', height: '2.5px', backgroundColor: '#64748b', margin: '0 6px' }} />

            {/* Outputs Area (Right side) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {rung.outputs.map((out, oIdx) => {
                const isFunctionBlock = ['TON', 'TOF', 'CTU'].includes(out.type);
                return (
                  <button
                    key={out.id || oIdx}
                    onClick={() =>
                      setEditingInstruction({
                        rungIdx: rIdx,
                        instIdx: oIdx,
                        isOutput: true,
                        instruction: out,
                      })
                    }
                    style={{
                      minWidth: isFunctionBlock ? '72px' : '60px',
                      minHeight: '46px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--color-bg-canvas)',
                      border: '1.5px solid var(--color-3)',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '4px 6px',
                      cursor: 'pointer',
                    }}
                  >
                    {isFunctionBlock ? (
                      /* IEC 61131-3 Standard Function Block Box */
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 900,
                            fontFamily: 'monospace',
                            color: 'var(--color-3)',
                            borderBottom: '1px solid #334155',
                            paddingBottom: '1px',
                            width: '100%',
                            textAlign: 'center',
                          }}
                        >
                          {out.type}
                        </div>
                        <div style={{ fontSize: '0.58rem', color: '#94a3b8', marginTop: '1px' }}>
                          {out.type === 'CTU'
                            ? `PV:${'preset' in out ? out.preset : 5}`
                            : `PT:${('preset' in out ? out.preset : 3000) / 1000}s`}
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-2)' }}>
                          {out.tag}
                        </span>
                      </div>
                    ) : (
                      /* IEC 61131-3 Coil Symbol */
                      <>
                        <span
                          style={{
                            fontSize: '0.9rem',
                            fontWeight: 900,
                            color: 'var(--color-3)',
                            fontFamily: 'monospace',
                          }}
                        >
                          {out.type === 'OTE'
                            ? '—( )—'
                            : out.type === 'OTL'
                            ? '—(S)—'
                            : out.type === 'OTU'
                            ? '—(R)—'
                            : '—(R)—'}
                        </span>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-2)' }}>
                          {out.tag}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}

              {/* Slot to add output coil if none */}
              {rung.outputs.length === 0 && (
                <button
                  onClick={() => handleSlotClick(rIdx, 0, true)}
                  style={{
                    minWidth: '44px',
                    minHeight: '44px',
                    borderRadius: '8px',
                    border: '1.5px dashed var(--color-3)',
                    backgroundColor: selectedElement ? 'rgba(170, 187, 101, 0.15)' : 'transparent',
                    color: 'var(--color-3)',
                    fontSize: '1rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Place coil / timer here"
                >
                  +
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Instruction Tag Selector Modal */}
      {editingInstruction && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            borderRadius: '14px',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            zIndex: 50,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#ffffff' }}>
              Assign Tag to {editingInstruction.instruction.type}
            </span>
            <button
              onClick={() => setEditingInstruction(null)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '1.1rem',
                cursor: 'pointer',
                minHeight: 'auto',
                minWidth: 'auto',
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleUpdateTag(tag)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '8px',
                  backgroundColor: editingInstruction.instruction.tag === tag ? 'var(--color-2)' : '#17242a',
                  color: editingInstruction.instruction.tag === tag ? '#ffffff' : '#f8fafc',
                  border: editingInstruction.instruction.tag === tag ? '1px solid var(--color-2-light)' : '1px solid #23353e',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          <button
            onClick={() =>
              handleDeleteInstruction(
                editingInstruction.rungIdx,
                editingInstruction.branchIdx,
                editingInstruction.instIdx,
                editingInstruction.isOutput
              )
            }
            style={{
              marginTop: 'auto',
              padding: '8px',
              borderRadius: '8px',
              backgroundColor: '#7f1d1d',
              color: '#ffffff',
              border: '1px solid #ef4444',
              fontWeight: 800,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            🗑 Delete Instruction
          </button>
        </div>
      )}
    </div>
  );
};
