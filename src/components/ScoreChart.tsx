import { useState } from 'react';
import { seriesColor } from '../game/colors';
import { cumulativeScoresByRound } from '../game/logic';
import type { GameState } from '../game/types';

const VB_W = 300;
const VB_H = 170;
const PAD_LEFT = 22;
const PAD_RIGHT = 10;
const PAD_TOP = 12;
const PAD_BOTTOM = 22;

interface ScoreChartProps {
  state: GameState;
}

export function ScoreChart({ state }: ScoreChartProps) {
  const { roundLabels, seriesByPlayer } = cumulativeScoresByRound(state);
  const n = roundLabels.length;
  const [selected, setSelected] = useState<number | null>(n > 0 ? n - 1 : null);
  const activeIndex = selected !== null && selected < n ? selected : n > 0 ? n - 1 : null;

  if (n === 0) {
    return (
      <div className="chart-wrap">
        <p className="chart-empty">Nog geen voltooide rondes — de grafiek verschijnt na ronde 1.</p>
      </div>
    );
  }

  const allValues = Object.values(seriesByPlayer).flat();
  const rawMin = Math.min(0, ...allValues);
  const rawMax = Math.max(0, ...allValues);
  const [min, max] = niceRange(rawMin, rawMax);

  const xScale = (i: number) => {
    if (n === 1) return PAD_LEFT + (VB_W - PAD_LEFT - PAD_RIGHT) / 2;
    return PAD_LEFT + (i / (n - 1)) * (VB_W - PAD_LEFT - PAD_RIGHT);
  };
  const yScale = (v: number) => {
    const t = (v - min) / (max - min || 1);
    return PAD_TOP + (1 - t) * (VB_H - PAD_TOP - PAD_BOTTOM);
  };

  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) => min + ((max - min) * i) / gridSteps);

  const xTicks = buildXTicks(n);

  const tooltipLeftPct = activeIndex !== null
    ? clamp((xScale(activeIndex) / VB_W) * 100, 18, 82)
    : 50;

  return (
    <div className="chart-wrap">
      <div style={{ position: 'relative' }}>
        <svg
          viewBox={`0 0 ${VB_W} ${VB_H}`}
          width="100%"
          style={{ display: 'block' }}
          role="img"
          aria-label="Cumulatieve score per speler door de rondes heen"
        >
          {gridValues.map((v, i) => (
            <line
              key={i}
              x1={PAD_LEFT}
              x2={VB_W - PAD_RIGHT}
              y1={yScale(v)}
              y2={yScale(v)}
              stroke={v === 0 ? 'var(--border-strong)' : 'var(--border)'}
              strokeWidth={v === 0 ? 1 : 0.6}
            />
          ))}

          {xTicks.map((i) => (
            <text
              key={i}
              x={xScale(i)}
              y={VB_H - 6}
              fontSize={7}
              fill="var(--text-muted)"
              textAnchor="middle"
            >
              {roundLabels[i]}
            </text>
          ))}

          {activeIndex !== null && (
            <line
              x1={xScale(activeIndex)}
              x2={xScale(activeIndex)}
              y1={PAD_TOP}
              y2={VB_H - PAD_BOTTOM}
              stroke="var(--text-muted)"
              strokeWidth={0.6}
              strokeDasharray="2,2"
            />
          )}

          {state.players.map((player, idx) => {
            const values = seriesByPlayer[player.id] ?? [];
            const color = seriesColor(idx);
            const d = values
              .map((v, i) => `${i === 0 ? 'M' : 'L'}${xScale(i)},${yScale(v)}`)
              .join(' ');
            return (
              <g key={player.id}>
                <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                {values.map((v, i) => (
                  <circle key={i} cx={xScale(i)} cy={yScale(v)} r={i === activeIndex ? 3.4 : 2.4} fill={color} />
                ))}
              </g>
            );
          })}

          {/* Onzichtbare tik-doelen per ronde, voor de tooltip */}
          {Array.from({ length: n }, (_, i) => i).map((i) => {
            const halfStep = n > 1 ? (VB_W - PAD_LEFT - PAD_RIGHT) / (n - 1) / 2 : (VB_W - PAD_LEFT - PAD_RIGHT) / 2;
            return (
              <rect
                key={i}
                x={xScale(i) - halfStep}
                y={0}
                width={halfStep * 2}
                height={VB_H}
                fill="transparent"
                onPointerDown={() => setSelected(i)}
              />
            );
          })}
        </svg>

        {activeIndex !== null && (
          <div
            className="chart-tooltip-box"
            style={{ left: `${tooltipLeftPct}%` }}
          >
            <div className="chart-tooltip">
              <div className="chart-tooltip-title">Na ronde {roundLabels[activeIndex]}</div>
              {[...state.players]
                .map((player, idx) => ({
                  player,
                  idx,
                  value: seriesByPlayer[player.id]?.[activeIndex] ?? 0,
                }))
                .sort((a, b) => b.value - a.value)
                .map(({ player, idx, value }) => (
                  <div key={player.id} className="chart-tooltip-row">
                    <span className="series-dot" style={{ background: seriesColor(idx) }} />
                    <span>{player.name}</span>
                    <span style={{ marginLeft: 'auto', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="chart-legend">
        {state.players.map((player, idx) => (
          <span key={player.id} className="chart-legend-item">
            <span className="series-dot" style={{ background: seriesColor(idx) }} />
            {player.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function niceRange(min: number, max: number): [number, number] {
  if (min === max) {
    return [min - 5, max + 5];
  }
  const pad = Math.max(1, (max - min) * 0.12);
  return [Math.floor(min - pad), Math.ceil(max + pad)];
}

function buildXTicks(n: number): number[] {
  if (n <= 6) return Array.from({ length: n }, (_, i) => i);
  const step = Math.ceil(n / 6);
  const ticks: number[] = [];
  for (let i = 0; i < n; i += step) ticks.push(i);
  if (ticks[ticks.length - 1] !== n - 1) ticks.push(n - 1);
  return ticks;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}
