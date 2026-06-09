// A hand-drawn-feeling paw print, used as a quiet motif in empty states and
// headers. Inline SVG so it inherits color and needs no asset request.
export function Paw({
  size = 28,
  color = "currentColor",
  style,
}: {
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill={color}
      style={style}
      aria-hidden="true"
    >
      <ellipse cx="32" cy="44" rx="15" ry="12" />
      <ellipse cx="13" cy="30" rx="6.5" ry="8.5" />
      <ellipse cx="25" cy="20" rx="6" ry="8" />
      <ellipse cx="39" cy="20" rx="6" ry="8" />
      <ellipse cx="51" cy="30" rx="6.5" ry="8.5" />
    </svg>
  );
}

/** Tiled faint paws for empty-state backgrounds. */
export function PawField() {
  const spots = [
    [10, 20, 18, 12],
    [70, 12, 22, -8],
    [30, 60, 16, 24],
    [85, 65, 20, -14],
    [50, 30, 14, 6],
  ];
  return (
    <div className="paw-bg" aria-hidden="true">
      {spots.map(([x, y, s, r], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            transform: `rotate(${r}deg)`,
            color: "var(--forest)",
          }}
        >
          <Paw size={s} />
        </div>
      ))}
    </div>
  );
}
