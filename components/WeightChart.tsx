// Dependency-free responsive SVG line chart for weight history.
// Matches the hand-drawn Sparkline aesthetic: forest-green line, terracotta
// dots, light gridlines. Pure component — no hooks, everything computed inline.
import { formatDate } from "@/lib/format";

export function WeightChart({
  points,
  unit,
  height = 240,
}: {
  points: { date: string; weight: number; note?: string }[];
  unit: "lb" | "kg";
  height?: number;
}) {
  if (points.length < 2) return null;

  // viewBox space — the SVG scales responsively to its container width.
  const VB_W = 720;
  const VB_H = height;
  const padL = 46; // room for y labels
  const padR = 16;
  const padT = 16;
  const padB = 30; // room for x labels
  const plotW = VB_W - padL - padR;
  const plotH = VB_H - padT - padB;

  const weights = points.map((p) => p.weight);
  const rawMin = Math.min(...weights);
  const rawMax = Math.max(...weights);
  // Pad the range a touch so the line never hugs the very top/bottom edge.
  const span = rawMax - rawMin || 1;
  const min = rawMin - span * 0.12;
  const max = rawMax + span * 0.12;
  const range = max - min || 1;

  const xAt = (i: number) =>
    padL + (points.length === 1 ? plotW / 2 : (i / (points.length - 1)) * plotW);
  const yAt = (w: number) => padT + (1 - (w - min) / range) * plotH;

  const pts = points.map((p, i) => ({ ...p, x: xAt(i), y: yAt(p.weight) }));
  const linePath = pts
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  // Soft fill under the line, anchored to the baseline.
  const baseY = padT + plotH;
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${baseY.toFixed(
    1
  )} L${pts[0].x.toFixed(1)},${baseY.toFixed(1)} Z`;

  // Three gridlines: top (max), middle, bottom (min) of the real data range.
  const gridVals = [rawMax, (rawMax + rawMin) / 2, rawMin];

  return (
    <svg
      viewBox={`0 0 ${VB_W} ${VB_H}`}
      width="100%"
      height={height}
      role="img"
      aria-label="Weight over time"
      style={{ display: "block", overflow: "visible" }}
      preserveAspectRatio="none"
    >
      {/* y gridlines + labels */}
      {gridVals.map((val, i) => {
        const y = yAt(val);
        return (
          <g key={i}>
            <line
              x1={padL}
              y1={y}
              x2={VB_W - padR}
              y2={y}
              stroke="var(--line)"
              strokeWidth={1}
              strokeDasharray={i === 2 ? undefined : "3 4"}
              opacity={i === 2 ? 1 : 0.7}
            />
            <text
              x={padL - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={12}
              fill="var(--ink-faint)"
            >
              {Number(val.toFixed(1))}
            </text>
          </g>
        );
      })}

      {/* area fill */}
      <path d={areaPath} fill="var(--forest-soft)" opacity={0.5} stroke="none" />

      {/* the line */}
      <path
        d={linePath}
        fill="none"
        stroke="var(--forest)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* point dots (+ note markers) */}
      {pts.map((p, i) => (
        <g key={i}>
          {p.note ? (
            // a slightly larger ringed marker for points carrying a note
            <>
              <circle
                cx={p.x}
                cy={p.y}
                r={6}
                fill="var(--terracotta)"
                stroke="var(--paper)"
                strokeWidth={2}
              />
              <circle cx={p.x} cy={p.y} r={10} fill="var(--terracotta)" opacity={0.18} />
            </>
          ) : (
            <circle
              cx={p.x}
              cy={p.y}
              r={4}
              fill="var(--terracotta)"
              stroke="var(--paper)"
              strokeWidth={1.5}
            />
          )}
          <title>
            {`${formatDate(p.date)} · ${Number(p.weight.toFixed(1))} ${unit}${
              p.note ? ` — ${p.note}` : ""
            }`}
          </title>
        </g>
      ))}

      {/* x labels: first + last date */}
      <text x={pts[0].x} y={VB_H - 8} textAnchor="start" fontSize={12} fill="var(--ink-faint)">
        {formatDate(points[0].date)}
      </text>
      <text
        x={pts[pts.length - 1].x}
        y={VB_H - 8}
        textAnchor="end"
        fontSize={12}
        fill="var(--ink-faint)"
      >
        {formatDate(points[points.length - 1].date)}
      </text>
    </svg>
  );
}
