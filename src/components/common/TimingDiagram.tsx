import React from 'react';
import { SignalSample, FailingStepDetail } from '../../engine/grader';

interface TimingDiagramProps {
  trace: SignalSample[];
  failure?: FailingStepDetail;
  width?: number;
}

export const TimingDiagram: React.FC<TimingDiagramProps> = ({
  trace,
  failure,
}) => {
  if (trace.length === 0) return null;

  const signalNames = Object.keys(trace[0].signals);
  if (signalNames.length === 0) return null;

  const maxTime = Math.max(...trace.map((s) => s.t), 100);
  const rowHeight = 36;
  const labelWidth = 65;
  const plotWidth = 260;
  const svgWidth = labelWidth + plotWidth + 20;
  const svgHeight = signalNames.length * rowHeight + 25;

  const timeToX = (t: number) => {
    return labelWidth + (t / maxTime) * plotWidth;
  };

  return (
    <div
      style={{
        backgroundColor: '#090d16',
        borderRadius: '12px',
        padding: '10px 8px',
        border: '1px solid #334155',
        overflowX: 'auto',
        width: '100%',
        maxWidth: '440px',
      }}
    >
      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', marginBottom: '6px' }}>
        TIMING DIAGRAM (Signal States Over Time)
      </div>

      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{ display: 'block' }}
      >
        {/* Time Axis Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const t = Math.round(maxTime * pct);
          const x = timeToX(t);
          return (
            <g key={`grid_t_${t}`}>
              <line
                x1={x}
                y1={10}
                x2={x}
                y2={svgHeight - 15}
                stroke="#1e293b"
                strokeWidth="1"
                strokeDasharray="2 2"
              />
              <text
                x={x}
                y={svgHeight - 3}
                fill="#64748b"
                fontSize="9"
                fontWeight="700"
                textAnchor="middle"
              >
                {t}ms
              </text>
            </g>
          );
        })}

        {/* Signals Waveforms */}
        {signalNames.map((sig, idx) => {
          const rowY = 15 + idx * rowHeight;
          const highY = rowY + 6;
          const lowY = rowY + 22;

          // Build square wave path
          let pathD = '';
          for (let i = 0; i < trace.length; i++) {
            const sample = trace[i];
            const nextSample = trace[i + 1];
            const x = timeToX(sample.t);
            const val = sample.signals[sig] ?? 0;
            const y = val === 1 ? highY : lowY;

            if (i === 0) {
              pathD += `M ${x} ${y}`;
            }

            const nextX = nextSample ? timeToX(nextSample.t) : timeToX(maxTime);
            pathD += ` L ${nextX} ${y}`;

            if (nextSample) {
              const nextVal = nextSample.signals[sig] ?? 0;
              const nextY = nextVal === 1 ? highY : lowY;
              if (y !== nextY) {
                pathD += ` L ${nextX} ${nextY}`;
              }
            }
          }

          const isFailingSignal = failure && failure.signalName === sig;

          return (
            <g key={sig}>
              {/* Signal Tag Label */}
              <text
                x={labelWidth - 8}
                y={lowY - 3}
                fill={isFailingSignal ? '#ef4444' : '#e2e8f0'}
                fontSize="11"
                fontWeight="800"
                textAnchor="end"
              >
                {sig}
              </text>

              {/* Baseline Reference */}
              <line
                x1={labelWidth}
                y1={lowY}
                x2={labelWidth + plotWidth}
                y2={lowY}
                stroke="#1e293b"
                strokeWidth="1"
              />

              {/* Square waveform */}
              <path
                d={pathD}
                fill="none"
                stroke={isFailingSignal ? '#f87171' : 'var(--color-1)'}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          );
        })}

        {/* Failure Marker Cursor */}
        {failure && (
          <g>
            <line
              x1={timeToX(failure.timeMs)}
              y1={5}
              x2={timeToX(failure.timeMs)}
              y2={svgHeight - 15}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="4 2"
            />
            <circle
              cx={timeToX(failure.timeMs)}
              cy={12}
              r="4.5"
              fill="#ef4444"
            />
            <text
              x={timeToX(failure.timeMs)}
              y={22}
              fill="#ef4444"
              fontSize="9"
              fontWeight="900"
              textAnchor="middle"
            >
              FAIL
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};
