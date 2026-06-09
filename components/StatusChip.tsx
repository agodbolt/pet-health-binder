import type { DueLevel } from "@/lib/dates";

const MAP: Record<
  DueLevel,
  { cls: string; icon: string; label: (d: number) => string }
> = {
  overdue: {
    cls: "chip-red",
    icon: "❌",
    label: (d) => `Overdue ${Math.abs(d)}d`,
  },
  "due-soon": {
    cls: "chip-amber",
    icon: "⚠️",
    label: (d) => (d === 0 ? "Due today" : `Due in ${d}d`),
  },
  current: { cls: "chip-ok", icon: "✅", label: () => "Current" },
  none: { cls: "chip-neutral", icon: "•", label: () => "No date" },
};

export function StatusChip({ level, days }: { level: DueLevel; days: number }) {
  const m = MAP[level];
  return (
    <span className={`chip ${m.cls}`}>
      <span>{m.icon}</span>
      {m.label(days)}
    </span>
  );
}
