import React from 'react';
import { LevelOutputDef } from '../../levels/types';
import { LampMachine } from './LampMachine';
import { MotorMachine } from './MotorMachine';
import { HornMachine } from './HornMachine';

interface MachineDisplayProps {
  outputs: LevelOutputDef[];
  outputValues: Record<string, number>;
}

export const MachineDisplay: React.FC<MachineDisplayProps> = ({
  outputs,
  outputValues,
}) => {
  return (
    <div
      className="glass-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '24px',
        padding: '12px 16px',
        border: '1px solid var(--glass-border-yellow)',
        boxShadow: 'var(--glass-shadow-sm)',
        width: '100%',
        maxWidth: '480px',
        margin: '8px 0',
      }}
    >
      {outputs.map((out) => {
        const isOn = (outputValues[out.tag] ?? 0) === 1;

        if (out.type === 'lamp') {
          return <LampMachine key={out.tag} isOn={isOn} tag={out.tag} size={90} />;
        }
        if (out.type === 'motor' || out.type === 'conveyor') {
          return <MotorMachine key={out.tag} isOn={isOn} tag={out.tag} size={90} />;
        }
        if (out.type === 'horn' || out.type === 'valve') {
          return <HornMachine key={out.tag} isOn={isOn} tag={out.tag} size={90} />;
        }

        return <LampMachine key={out.tag} isOn={isOn} tag={out.tag} size={90} />;
      })}
    </div>
  );
};
