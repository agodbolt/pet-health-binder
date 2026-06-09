// Tiny dependency-free SVG horizontal bar chart for spending by category.
// Forest-green bars, labeled, with the formatted amount at the bar's end.
import { formatMoney } from "@/lib/format";

export function ExpenseBars({
  data,
  currency,
}: {
  data: { label: string; amount: number }[];
  currency: string;
}) {
  const rows = [...data]
    .filter((d) => d.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  if (rows.length === 0) return null;

  const max = Math.max(...rows.map((d) => d.amount)) || 1;
  const labelW = 92; // space for the category label
  const valueW = 96; // space for the amount at the end
  const rowH = 30;
  const gap = 10;
  const barH = 18;
  const width = 460;
  const trackW = width - labelW - valueW;
  const height = rows.length * rowH + (rows.length - 1) * gap;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Spending by category"
      style={{ maxWidth: width, display: "block" }}
    >
      {rows.map((d, i) => {
        const y = i * (rowH + gap);
        const cy = y + rowH / 2;
        const w = Math.max(2, (d.amount / max) * trackW);
        return (
          <g key={d.label}>
            <text
              x={0}
              y={cy}
              dominantBaseline="middle"
              fontSize={12.5}
              fill="var(--ink)"
              style={{ fontWeight: 500 }}
            >
              {d.label}
            </text>
            {/* track */}
            <rect
              x={labelW}
              y={cy - barH / 2}
              width={trackW}
              height={barH}
              rx={6}
              fill="var(--cream)"
            />
            {/* bar */}
            <rect
              x={labelW}
              y={cy - barH / 2}
              width={w}
              height={barH}
              rx={6}
              fill="var(--forest)"
            />
            <text
              x={width}
              y={cy}
              dominantBaseline="middle"
              textAnchor="end"
              fontSize={12.5}
              fill="var(--ink)"
              style={{ fontWeight: 600 }}
            >
              {formatMoney(d.amount, currency)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
