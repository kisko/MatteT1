import React, { useMemo } from 'react';
import {
  evaluateCurve,
  evaluateCurveSlope,
  GraphCurve,
  StepVisual,
  VisualTone,
} from '../../../domain/model/guided/value-objects/StepVisual.js';
import { MathView } from '../../MathView.js';

/**
 * Domenet beskriver *betydningen* av en markering. Her, og bare her, blir
 * betydningen en farge.
 */
const toneColor: Record<VisualTone, string> = {
  primary: '#22d3ee',
  accent: '#a78bfa',
  correct: '#34d399',
  error: '#fb7185',
  muted: '#64748b',
};

const WIDTH = 520;
const HEIGHT = 260;
const PADDING = 38;

const formatTick = (value: number): string => {
  if (Math.abs(value) >= 1000) return `${Math.round(value / 1000)}k`;
  return Number(value.toFixed(Math.abs(value) < 10 ? 1 : 0)).toString();
};

interface CanvasFrameProps {
  label: string;
  caption: string;
  children: React.ReactNode;
}

const CanvasFrame: React.FC<CanvasFrameProps> = ({ label, caption, children }) => (
  <figure className="m-0">
    <div className="overflow-hidden rounded-xl border border-slate-700/80 bg-slate-950/70 p-2 sm:p-3">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-auto w-full" role="img" aria-label={label}>
        {children}
      </svg>
    </div>
    <figcaption className="mt-2 text-xs leading-relaxed text-slate-400">
      <MathView latex={caption} />
    </figcaption>
  </figure>
);

const GraphVisual: React.FC<{ visual: Extract<StepVisual, { kind: 'graph' }> }> = ({ visual }) => {
  const geometry = useMemo(() => {
    const [xMin, xMax] = visual.xRange;
    const sampleCount = 121;
    const samples = visual.curves.map((curve) =>
      Array.from({ length: sampleCount }, (_, index) => {
        const x = xMin + ((xMax - xMin) * index) / (sampleCount - 1);
        return { x, y: evaluateCurve(curve, x) };
      })
    );

    const values = [
      ...samples.flat().map((point) => point.y),
      ...(visual.markers ?? []).map((marker) => marker.y),
      0,
    ].filter((value) => Number.isFinite(value));

    const rawMin = Math.min(...values);
    const rawMax = Math.max(...values);
    const span = Math.max(rawMax - rawMin, 1);
    const yMin = rawMin - span * 0.12;
    const yMax = rawMax + span * 0.12;

    const toX = (x: number) => PADDING + ((x - xMin) / (xMax - xMin)) * (WIDTH - PADDING * 2);
    const toY = (y: number) => HEIGHT - PADDING - ((y - yMin) / (yMax - yMin)) * (HEIGHT - PADDING * 2);

    return { xMin, xMax, yMin, yMax, samples, toX, toY };
  }, [visual]);

  const { xMin, xMax, yMin, yMax, samples, toX, toY } = geometry;
  const xTicks = Array.from({ length: 5 }, (_, index) => xMin + ((xMax - xMin) * index) / 4);
  const yTicks = Array.from({ length: 5 }, (_, index) => yMin + ((yMax - yMin) * index) / 4);
  const clampY = (value: number) => Math.min(Math.max(value, yMin), yMax);

  const tangentFor = (curve: GraphCurve) => {
    if (curve.tangentAtX === undefined) return null;
    const x0 = curve.tangentAtX;
    const y0 = evaluateCurve(curve, x0);
    const slope = evaluateCurveSlope(curve, x0);
    const reach = (xMax - xMin) * 0.3;
    return {
      x1: x0 - reach,
      y1: y0 - slope * reach,
      x2: x0 + reach,
      y2: y0 + slope * reach,
    };
  };

  return (
    <>
      {xTicks.map((tick) => (
        <line
          key={`gx-${tick}`}
          x1={toX(tick)}
          x2={toX(tick)}
          y1={PADDING}
          y2={HEIGHT - PADDING}
          stroke="#1e293b"
          strokeWidth="1"
        />
      ))}
      {yTicks.map((tick) => (
        <line
          key={`gy-${tick}`}
          x1={PADDING}
          x2={WIDTH - PADDING}
          y1={toY(tick)}
          y2={toY(tick)}
          stroke="#1e293b"
          strokeWidth="1"
        />
      ))}

      {xMin <= 0 && xMax >= 0 && (
        <line x1={toX(0)} x2={toX(0)} y1={PADDING} y2={HEIGHT - PADDING} stroke="#475569" strokeWidth="1.5" />
      )}
      {yMin <= 0 && yMax >= 0 && (
        <line x1={PADDING} x2={WIDTH - PADDING} y1={toY(0)} y2={toY(0)} stroke="#475569" strokeWidth="1.5" />
      )}

      {xTicks.map((tick) => (
        <text
          key={`xt-${tick}`}
          x={toX(tick)}
          y={HEIGHT - PADDING + 16}
          textAnchor="middle"
          fill="#94a3b8"
          fontSize="10"
        >
          {formatTick(tick)}
        </text>
      ))}
      {yTicks.map((tick) => (
        <text key={`yt-${tick}`} x={PADDING - 6} y={toY(tick) + 3} textAnchor="end" fill="#94a3b8" fontSize="10">
          {formatTick(tick)}
        </text>
      ))}

      {visual.curves.map((curve, curveIndex) => {
        const tangent = tangentFor(curve);
        return (
          <g key={`curve-${curveIndex}`}>
            {tangent && (
              <line
                x1={toX(tangent.x1)}
                y1={toY(clampY(tangent.y1))}
                x2={toX(tangent.x2)}
                y2={toY(clampY(tangent.y2))}
                stroke="#fbbf24"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
            )}
            <polyline
              points={samples[curveIndex]
                .filter((point) => Number.isFinite(point.y))
                .map((point) => `${toX(point.x).toFixed(1)},${toY(clampY(point.y)).toFixed(1)}`)
                .join(' ')}
              fill="none"
              stroke={toneColor[curve.tone]}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="guided-draw-in"
            />
          </g>
        );
      })}

      {(visual.markers ?? []).map((marker) => (
        <g key={`m-${marker.label}-${marker.x}`} className="guided-pop-in">
          <circle
            cx={toX(marker.x)}
            cy={toY(clampY(marker.y))}
            r="5.5"
            fill={toneColor[marker.tone]}
            stroke="#020617"
            strokeWidth="2"
          />
          <text
            x={toX(marker.x)}
            y={toY(clampY(marker.y)) - 12}
            textAnchor="middle"
            fill={toneColor[marker.tone]}
            fontSize="11"
            fontWeight="600"
          >
            {marker.label}
          </text>
        </g>
      ))}

      {visual.curves.some((curve) => curve.label) && (
        <g>
          {visual.curves
            .filter((curve) => curve.label)
            .map((curve, index) => (
              <g key={`legend-${curve.label}`}>
                <line
                  x1={WIDTH - PADDING - 90}
                  x2={WIDTH - PADDING - 70}
                  y1={PADDING + 4 + index * 16}
                  y2={PADDING + 4 + index * 16}
                  stroke={toneColor[curve.tone]}
                  strokeWidth="3"
                />
                <text
                  x={WIDTH - PADDING - 64}
                  y={PADDING + 8 + index * 16}
                  fill="#cbd5e1"
                  fontSize="11"
                >
                  {curve.label}
                </text>
              </g>
            ))}
        </g>
      )}
    </>
  );
};

const NumberLineVisual: React.FC<{ visual: Extract<StepVisual, { kind: 'numberline' }> }> = ({ visual }) => {
  const axisY = HEIGHT / 2;
  const toX = (value: number) =>
    PADDING + ((value - visual.min) / (visual.max - visual.min)) * (WIDTH - PADDING * 2);
  const tickCount = 7;
  const ticks = Array.from(
    { length: tickCount },
    (_, index) => visual.min + ((visual.max - visual.min) * index) / (tickCount - 1)
  );

  return (
    <>
      {(visual.intervals ?? []).map((interval, index) => (
        <g key={`iv-${interval.label}`} className="guided-draw-in">
          <rect
            x={Math.min(toX(interval.from), toX(interval.to))}
            y={axisY - 14 - index * 26}
            width={Math.abs(toX(interval.to) - toX(interval.from))}
            height="10"
            rx="5"
            fill={toneColor[interval.tone]}
            fillOpacity="0.55"
          />
          <text
            x={(toX(interval.from) + toX(interval.to)) / 2}
            y={axisY - 20 - index * 26}
            textAnchor="middle"
            fill={toneColor[interval.tone]}
            fontSize="11"
            fontWeight="600"
          >
            {interval.label}
          </text>
        </g>
      ))}

      <line x1={PADDING} x2={WIDTH - PADDING} y1={axisY} y2={axisY} stroke="#94a3b8" strokeWidth="2" />
      <polygon
        points={`${WIDTH - PADDING},${axisY} ${WIDTH - PADDING - 9},${axisY - 5} ${WIDTH - PADDING - 9},${axisY + 5}`}
        fill="#94a3b8"
      />

      {ticks.map((tick) => (
        <g key={`t-${tick}`}>
          <line x1={toX(tick)} x2={toX(tick)} y1={axisY - 6} y2={axisY + 6} stroke="#64748b" />
          <text x={toX(tick)} y={axisY + 22} textAnchor="middle" fill="#94a3b8" fontSize="10">
            {formatTick(tick)}
          </text>
        </g>
      ))}

      {(visual.points ?? []).map((point) => (
        <g key={`p-${point.label}-${point.value}`} className="guided-pop-in">
          <circle
            cx={toX(point.value)}
            cy={axisY}
            r="7"
            fill={point.open ? '#020617' : toneColor[point.tone]}
            stroke={toneColor[point.tone]}
            strokeWidth="2.5"
          />
          <text
            x={toX(point.value)}
            y={axisY + 42}
            textAnchor="middle"
            fill={toneColor[point.tone]}
            fontSize="12"
            fontWeight="600"
          >
            {point.label}
          </text>
        </g>
      ))}
    </>
  );
};

const BalanceVisual: React.FC<{ visual: Extract<StepVisual, { kind: 'balance' }> }> = ({ visual }) => {
  const pivotX = WIDTH / 2;
  const beamY = 92;
  const panWidth = 150;

  const renderPan = (terms: readonly string[], centerX: number, tone: VisualTone) => (
    <g>
      <line x1={centerX} y1={beamY} x2={centerX} y2={beamY + 34} stroke="#64748b" strokeWidth="2" />
      <rect
        x={centerX - panWidth / 2}
        y={beamY + 34}
        width={panWidth}
        height="62"
        rx="10"
        fill={toneColor[tone]}
        fillOpacity="0.12"
        stroke={toneColor[tone]}
        strokeWidth="2"
      />
      {terms.map((term, index) => (
        <text
          key={`${centerX}-${term}`}
          x={centerX}
          y={beamY + 60 + index * 22}
          textAnchor="middle"
          fill="#e2e8f0"
          fontSize="17"
          fontWeight="700"
        >
          {term}
        </text>
      ))}
    </g>
  );

  return (
    <>
      <line x1={pivotX - 160} y1={beamY} x2={pivotX + 160} y2={beamY} stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
      <polygon points={`${pivotX},${beamY} ${pivotX - 22},${beamY + 54} ${pivotX + 22},${beamY + 54}`} fill="#475569" />
      <rect x={pivotX - 40} y={beamY + 54} width="80" height="8" rx="4" fill="#334155" />
      <text x={pivotX} y={beamY - 14} textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="700">
        =
      </text>
      {renderPan(visual.left.terms, pivotX - 128, 'primary')}
      {renderPan(visual.right.terms, pivotX + 128, 'accent')}
    </>
  );
};

const AreaModelVisual: React.FC<{ visual: Extract<StepVisual, { kind: 'areaModel' }> }> = ({ visual }) => {
  const gridLeft = 74;
  const gridTop = 52;
  const gridWidth = WIDTH - gridLeft - 46;
  const gridHeight = HEIGHT - gridTop - 34;
  const cellWidth = gridWidth / visual.columnLabels.length;
  const cellHeight = gridHeight / visual.rowLabels.length;

  const partFor = (rowLabel: string, columnLabel: string) =>
    visual.parts.find((part) => part.rowLabel === rowLabel && part.columnLabel === columnLabel);

  return (
    <>
      {visual.columnLabels.map((columnLabel, columnIndex) => (
        <text
          key={`col-${columnLabel}-${columnIndex}`}
          x={gridLeft + cellWidth * (columnIndex + 0.5)}
          y={gridTop - 16}
          textAnchor="middle"
          fill="#cbd5e1"
          fontSize="15"
          fontWeight="700"
        >
          {columnLabel}
        </text>
      ))}
      {visual.rowLabels.map((rowLabel, rowIndex) => (
        <text
          key={`row-${rowLabel}-${rowIndex}`}
          x={gridLeft - 16}
          y={gridTop + cellHeight * (rowIndex + 0.5) + 5}
          textAnchor="end"
          fill="#cbd5e1"
          fontSize="15"
          fontWeight="700"
        >
          {rowLabel}
        </text>
      ))}

      {visual.rowLabels.map((rowLabel, rowIndex) =>
        visual.columnLabels.map((columnLabel, columnIndex) => {
          const part = partFor(rowLabel, columnLabel);
          const tone = part?.tone ?? 'muted';
          return (
            <g key={`cell-${rowIndex}-${columnIndex}`} className="guided-pop-in">
              <rect
                x={gridLeft + cellWidth * columnIndex}
                y={gridTop + cellHeight * rowIndex}
                width={cellWidth - 4}
                height={cellHeight - 4}
                rx="8"
                fill={toneColor[tone]}
                fillOpacity={tone === 'muted' ? 0.1 : 0.22}
                stroke={toneColor[tone]}
                strokeWidth="2"
              />
              <text
                x={gridLeft + cellWidth * (columnIndex + 0.5) - 2}
                y={gridTop + cellHeight * (rowIndex + 0.5) + 4}
                textAnchor="middle"
                fill="#f1f5f9"
                fontSize="16"
                fontWeight="700"
              >
                {part?.productLatex.replace(/\^2/g, '²').replace(/\^3/g, '³') ?? ''}
              </text>
            </g>
          );
        })
      )}
    </>
  );
};

const TriangleVisual: React.FC<{ visual: Extract<StepVisual, { kind: 'triangle' }> }> = ({ visual }) => {
  const radians = (visual.angleDegrees * Math.PI) / 180;
  const originX = 96;
  const originY = HEIGHT - 52;
  const maximumHeight = originY - 30;
  const maximumBase = WIDTH - originX - 62;
  const hypotenuseLength = Math.min(
    300,
    maximumHeight / Math.sin(radians),
    maximumBase / Math.cos(radians)
  );
  const base = hypotenuseLength * Math.cos(radians);
  const height = hypotenuseLength * Math.sin(radians);
  const cornerX = originX + base;
  const topY = originY - height;

  const highlightTone = (side: 'adjacent' | 'opposite' | 'hypotenuse'): string => {
    const active =
      (visual.highlight === 'sin' && (side === 'opposite' || side === 'hypotenuse')) ||
      (visual.highlight === 'cos' && (side === 'adjacent' || side === 'hypotenuse')) ||
      (visual.highlight === 'tan' && (side === 'adjacent' || side === 'opposite')) ||
      visual.highlight === 'pythagoras';
    return active ? toneColor.correct : toneColor.muted;
  };

  return (
    <>
      <polygon
        points={`${originX},${originY} ${cornerX},${originY} ${cornerX},${topY}`}
        fill={toneColor.primary}
        fillOpacity="0.1"
        stroke={toneColor.primary}
        strokeWidth="2.5"
      />
      <line x1={originX} y1={originY} x2={cornerX} y2={originY} stroke={highlightTone('adjacent')} strokeWidth="4" />
      <line x1={cornerX} y1={originY} x2={cornerX} y2={topY} stroke={highlightTone('opposite')} strokeWidth="4" />
      <line x1={originX} y1={originY} x2={cornerX} y2={topY} stroke={highlightTone('hypotenuse')} strokeWidth="4" />

      <path
        d={`M ${cornerX - 18} ${originY} L ${cornerX - 18} ${originY - 18} L ${cornerX} ${originY - 18}`}
        fill="none"
        stroke="#94a3b8"
        strokeWidth="2"
      />
      <path
        d={`M ${originX + 40} ${originY} A 40 40 0 0 0 ${originX + 40 * Math.cos(radians)} ${originY - 40 * Math.sin(radians)}`}
        fill="none"
        stroke={toneColor.accent}
        strokeWidth="3"
      />
      <text x={originX + 48} y={originY - 12} fill="#ddd6fe" fontSize="13" fontWeight="700">
        {visual.angleDegrees}°
      </text>

      <text x={(originX + cornerX) / 2} y={originY + 22} textAnchor="middle" fill={highlightTone('adjacent')} fontSize="12" fontWeight="600">
        {visual.adjacentLabel}
      </text>
      <text x={cornerX + 8} y={(originY + topY) / 2} textAnchor="start" fill={highlightTone('opposite')} fontSize="12" fontWeight="600">
        {visual.oppositeLabel}
      </text>
      <text
        x={(originX + cornerX) / 2 - 18}
        y={(originY + topY) / 2 - 10}
        textAnchor="middle"
        fill={highlightTone('hypotenuse')}
        fontSize="12"
        fontWeight="600"
      >
        {visual.hypotenuseLabel}
      </text>
    </>
  );
};

const GeneralTriangleVisual: React.FC<{ visual: Extract<StepVisual, { kind: 'generalTriangle' }> }> = ({
  visual,
}) => {
  // Faste hjørner: en tydelig ikke-rettvinklet trekant, så figuren aldri
  // antyder at setningene krever en rett vinkel.
  const vertexA = { x: 86, y: HEIGHT - 54 };
  const vertexB = { x: WIDTH - 86, y: HEIGHT - 54 };
  const vertexC = { x: 196, y: 44 };
  const [angleA, angleB, angleC] = visual.angleLabels;
  const [sideA, sideB, sideC] = visual.sideLabels;

  const sideTone = (side: 'a' | 'b' | 'c'): VisualTone => {
    if (visual.highlight === 'sinePair') return side === 'a' ? 'correct' : side === 'b' ? 'accent' : 'muted';
    if (visual.highlight === 'includedAngle') return side === 'c' ? 'error' : 'correct';
    return side === 'c' ? 'muted' : 'correct';
  };

  const midpoint = (from: { x: number; y: number }, to: { x: number; y: number }) => ({
    x: (from.x + to.x) / 2,
    y: (from.y + to.y) / 2,
  });

  const sideAMid = midpoint(vertexB, vertexC);
  const sideBMid = midpoint(vertexA, vertexC);
  const sideCMid = midpoint(vertexA, vertexB);

  return (
    <>
      <polygon
        points={`${vertexA.x},${vertexA.y} ${vertexB.x},${vertexB.y} ${vertexC.x},${vertexC.y}`}
        fill={toneColor.primary}
        fillOpacity="0.08"
        stroke={toneColor.primary}
        strokeWidth="2"
      />

      <line x1={vertexB.x} y1={vertexB.y} x2={vertexC.x} y2={vertexC.y} stroke={toneColor[sideTone('a')]} strokeWidth="4" />
      <line x1={vertexA.x} y1={vertexA.y} x2={vertexC.x} y2={vertexC.y} stroke={toneColor[sideTone('b')]} strokeWidth="4" />
      <line x1={vertexA.x} y1={vertexA.y} x2={vertexB.x} y2={vertexB.y} stroke={toneColor[sideTone('c')]} strokeWidth="4" />

      {visual.highlight === 'area' && (
        <line
          x1={vertexC.x}
          y1={vertexC.y}
          x2={vertexC.x}
          y2={vertexA.y}
          stroke={toneColor.accent}
          strokeWidth="2"
          strokeDasharray="5 4"
        />
      )}

      {[
        { vertex: vertexA, label: angleA, offsetX: -4, offsetY: -14 },
        { vertex: vertexB, label: angleB, offsetX: 4, offsetY: -14 },
        { vertex: vertexC, label: angleC, offsetX: 0, offsetY: 20 },
      ].map(({ vertex, label, offsetX, offsetY }) => (
        <text
          key={`angle-${label}`}
          x={vertex.x + offsetX}
          y={vertex.y + offsetY}
          textAnchor="middle"
          fill={visual.highlight === 'includedAngle' && label === angleC ? toneColor.error : '#ddd6fe'}
          fontSize="14"
          fontWeight="700"
        >
          {label}
        </text>
      ))}

      {[
        { point: sideAMid, label: sideA, tone: sideTone('a'), dx: 16, dy: 0 },
        { point: sideBMid, label: sideB, tone: sideTone('b'), dx: -18, dy: 0 },
        { point: sideCMid, label: sideC, tone: sideTone('c'), dx: 0, dy: 20 },
      ].map(({ point, label, tone, dx, dy }) => (
        <text
          key={`side-${label}`}
          x={point.x + dx}
          y={point.y + dy}
          textAnchor="middle"
          fill={toneColor[tone]}
          fontSize="13"
          fontWeight="600"
        >
          {label}
        </text>
      ))}
    </>
  );
};

const GrowthVisual: React.FC<{ visual: Extract<StepVisual, { kind: 'growth' }> }> = ({ visual }) => {
  const values = Array.from(
    { length: visual.periods + 1 },
    (_, period) => visual.startValue * visual.growthFactor ** period
  );
  const maximum = Math.max(...values, 1);
  const toX = (period: number) => PADDING + (period / visual.periods) * (WIDTH - PADDING * 2);
  const toY = (value: number) => HEIGHT - PADDING - (value / maximum) * (HEIGHT - PADDING * 2);

  return (
    <>
      <line x1={PADDING} y1={PADDING} x2={PADDING} y2={HEIGHT - PADDING} stroke="#475569" />
      <line x1={PADDING} y1={HEIGHT - PADDING} x2={WIDTH - PADDING} y2={HEIGHT - PADDING} stroke="#475569" />
      <polyline
        points={values.map((value, period) => `${toX(period)},${toY(value)}`).join(' ')}
        fill="none"
        stroke={toneColor.correct}
        strokeWidth="3"
        strokeLinecap="round"
        className="guided-draw-in"
      />
      {values.map((value, period) => (
        <circle
          key={`gp-${period}`}
          cx={toX(period)}
          cy={toY(value)}
          r={visual.highlightPeriod === period ? 6 : 3.5}
          fill={visual.highlightPeriod === period ? toneColor.accent : toneColor.correct}
        />
      ))}
      <text x={PADDING - 6} y={toY(maximum) + 4} textAnchor="end" fill="#94a3b8" fontSize="10">
        {formatTick(maximum)}
      </text>
      <text x={WIDTH - PADDING} y={HEIGHT - PADDING + 18} textAnchor="end" fill="#94a3b8" fontSize="10">
        {visual.periods} perioder
      </text>
    </>
  );
};

const BarsVisual: React.FC<{ visual: Extract<StepVisual, { kind: 'bars' }> }> = ({ visual }) => {
  const maximum = Math.max(...visual.bars.map((bar) => bar.value), 1);
  const slotWidth = (WIDTH - PADDING * 2) / visual.bars.length;
  const barWidth = Math.min(slotWidth * 0.55, 76);
  const baseline = HEIGHT - PADDING - 12;

  return (
    <>
      <line x1={PADDING} y1={baseline} x2={WIDTH - PADDING} y2={baseline} stroke="#475569" />
      {visual.bars.map((bar, index) => {
        const height = (bar.value / maximum) * (HEIGHT - PADDING * 2 - 22);
        const centerX = PADDING + slotWidth * (index + 0.5);
        return (
          <g key={`bar-${bar.label}-${index}`}>
            <rect
              x={centerX - barWidth / 2}
              y={baseline - height}
              width={barWidth}
              height={height}
              rx="8"
              fill={toneColor[bar.tone]}
              fillOpacity="0.85"
              className="guided-grow-up"
            />
            <text
              x={centerX}
              y={baseline - height - 8}
              textAnchor="middle"
              fill={toneColor[bar.tone]}
              fontSize="13"
              fontWeight="700"
            >
              {formatTick(bar.value)}
            </text>
            <text x={centerX} y={baseline + 18} textAnchor="middle" fill="#cbd5e1" fontSize="10">
              {bar.label}
            </text>
          </g>
        );
      })}
    </>
  );
};

export interface StepVisualCanvasProps {
  visual: StepVisual;
}

/**
 * Tegner en visualisering fra domenet. Komponenten inneholder ingen
 * matematikk utover å plassere det domenet allerede har regnet ut.
 */
export const StepVisualCanvas: React.FC<StepVisualCanvasProps> = ({ visual }) => {
  switch (visual.kind) {
    case 'none':
      return null;
    case 'graph':
      return (
        <CanvasFrame label="Graf som viser sammenhengen i steget" caption={visual.caption}>
          <GraphVisual visual={visual} />
        </CanvasFrame>
      );
    case 'numberline':
      return (
        <CanvasFrame label="Tallinje som viser løsningen" caption={visual.caption}>
          <NumberLineVisual visual={visual} />
        </CanvasFrame>
      );
    case 'balance':
      return (
        <CanvasFrame label="Vektskål som viser at ligningen er i balanse" caption={visual.caption}>
          <BalanceVisual visual={visual} />
        </CanvasFrame>
      );
    case 'areaModel':
      return (
        <CanvasFrame label="Arealmodell som viser leddene i produktet" caption={visual.caption}>
          <AreaModelVisual visual={visual} />
        </CanvasFrame>
      );
    case 'triangle':
      return (
        <CanvasFrame label="Rettvinklet trekant med sidene markert" caption={visual.caption}>
          <TriangleVisual visual={visual} />
        </CanvasFrame>
      );
    case 'generalTriangle':
      return (
        <CanvasFrame label="Vilkårlig trekant med sider og vinkler markert" caption={visual.caption}>
          <GeneralTriangleVisual visual={visual} />
        </CanvasFrame>
      );
    case 'growth':
      return (
        <CanvasFrame label="Vekstkurve over flere perioder" caption={visual.caption}>
          <GrowthVisual visual={visual} />
        </CanvasFrame>
      );
    case 'bars':
      return (
        <CanvasFrame label="Stolpediagram som sammenligner verdiene" caption={visual.caption}>
          <BarsVisual visual={visual} />
        </CanvasFrame>
      );
  }
};

export default StepVisualCanvas;
