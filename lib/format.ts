// Small display formatters shared across the UI.

export function formatMoney(amount: number, currency = "$"): string {
  const n = Number.isFinite(amount) ? amount : 0;
  return `${currency}${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatWeight(weight: number, unit: "lb" | "kg" = "lb"): string {
  if (!Number.isFinite(weight)) return "—";
  return `${weight.toLocaleString(undefined, { maximumFractionDigits: 1 })} ${unit}`;
}

/** "2026-06-09" -> "Jun 9, 2026" (parsed as a plain calendar date, no TZ shift). */
export function formatDate(date?: string | null): string {
  if (!date) return "—";
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return date;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Relative phrasing for due dates, e.g. "3 days overdue", "due in 12 days". */
export function duePhrase(days: number): string {
  if (!Number.isFinite(days)) return "";
  if (days < 0) {
    const n = Math.abs(days);
    return `${n} day${n === 1 ? "" : "s"} overdue`;
  }
  if (days === 0) return "due today";
  return `due in ${days} day${days === 1 ? "" : "s"}`;
}
