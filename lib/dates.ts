// Pure date helpers. All dates are "YYYY-MM-DD" strings parsed as UTC to avoid
// timezone drift (a vaccine due "2026-06-09" should mean the same calendar day
// everywhere, never shift by a day because of the user's local offset).

const MS_PER_DAY = 86_400_000;

/** Parse "YYYY-MM-DD" into a UTC timestamp (ms). Returns NaN if malformed. */
function parseUTC(date: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!m) return NaN;
  return Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function toISO(ms: number): string {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const da = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

/** Today's date as "YYYY-MM-DD" in the user's local calendar. */
export function today(): string {
  const d = new Date();
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

/** Whole days from `now` to `target`. Positive = future, negative = past. */
export function daysUntil(target: string, now: string = today()): number {
  const a = parseUTC(target);
  const b = parseUTC(now);
  if (Number.isNaN(a) || Number.isNaN(b)) return NaN;
  return Math.round((a - b) / MS_PER_DAY);
}

/** Add (or subtract) days to a date string. */
export function addDays(date: string, days: number): string {
  const ms = parseUTC(date);
  if (Number.isNaN(ms)) return date;
  return toISO(ms + days * MS_PER_DAY);
}

export type DueLevel = "overdue" | "due-soon" | "current" | "none";

export interface DueInfo {
  level: DueLevel;
  days: number; // days until due (negative if overdue); NaN when no date
}

/**
 * Classify a due date relative to `now`.
 * - overdue: due date is in the past
 * - due-soon: due today or within `soonDays`
 * - current: further out than `soonDays`
 * - none: no/blank due date
 */
export function dueStatus(
  due: string | undefined | null,
  now: string = today(),
  soonDays = 30
): DueInfo {
  if (!due) return { level: "none", days: NaN };
  const days = daysUntil(due, now);
  if (Number.isNaN(days)) return { level: "none", days: NaN };
  if (days < 0) return { level: "overdue", days };
  if (days <= soonDays) return { level: "due-soon", days };
  return { level: "current", days };
}

/** Human-friendly age from a birthday, e.g. "5 years, 5 months". */
export function ageFromBirthday(birthday: string, now: string = today()): string {
  const b = parseUTC(birthday);
  const n = parseUTC(now);
  if (Number.isNaN(b) || Number.isNaN(n) || b > n) return "";

  const bd = new Date(b);
  const nd = new Date(n);
  let years = nd.getUTCFullYear() - bd.getUTCFullYear();
  let months = nd.getUTCMonth() - bd.getUTCMonth();
  const dayDiff = nd.getUTCDate() - bd.getUTCDate();

  if (dayDiff < 0) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years === 0 && months === 0) return "Less than a month";

  const parts: string[] = [];
  if (years > 0) parts.push(`${years} year${years === 1 ? "" : "s"}`);
  if (months > 0) parts.push(`${months} month${months === 1 ? "" : "s"}`);
  return parts.join(", ");
}
