// Medication dose tracking. The "Today" view shows a checkbox per daily dose
// slot; checks are stored keyed by date so they reset automatically each day.
import { addDays, today } from "@/lib/dates";

export type Frequency =
  | "daily"
  | "twice daily"
  | "weekly"
  | "monthly"
  | "as-needed";

/** dose log: date string -> array of booleans, one per dose slot that day. */
export type DoseLog = Record<string, boolean[]>;

/** How many dose checkboxes to show per day for a given frequency. */
export function slotsPerDay(frequency: Frequency): number {
  return frequency === "twice daily" ? 2 : 1;
}

function slotsForDay(log: DoseLog, date: string, count: number): boolean[] {
  const existing = log[date] ?? [];
  const out: boolean[] = [];
  for (let i = 0; i < count; i++) out.push(existing[i] ?? false);
  return out;
}

/** Is dose slot `index` checked on `date`? */
export function isCheckedToday(
  log: DoseLog,
  index: number,
  date: string = today()
): boolean {
  return Boolean(log[date]?.[index]);
}

/** Return a NEW log with slot `index` toggled for `date`. Pure (no mutation). */
export function toggleDose(
  log: DoseLog,
  index: number,
  date: string = today(),
  count = index + 1
): DoseLog {
  const slots = slotsForDay(log, date, Math.max(count, index + 1));
  slots[index] = !slots[index];
  return { ...log, [date]: slots };
}

/** True only when every dose slot for `date` is checked. */
export function allDosesCheckedOn(
  log: DoseLog,
  count: number,
  date: string
): boolean {
  if (count <= 0) return false;
  const slots = log[date];
  if (!slots) return false;
  for (let i = 0; i < count; i++) {
    if (!slots[i]) return false;
  }
  return true;
}

/**
 * Consecutive-day streak of fully-completed doses ending at/before today.
 * If today isn't complete yet, the streak counts through yesterday so the
 * number doesn't drop to zero just because the day isn't over.
 */
export function streak(
  frequency: Frequency,
  log: DoseLog,
  now: string = today()
): number {
  const count = slotsPerDay(frequency);
  let cursor = now;
  if (!allDosesCheckedOn(log, count, cursor)) {
    cursor = addDays(cursor, -1);
  }
  let total = 0;
  while (allDosesCheckedOn(log, count, cursor)) {
    total++;
    cursor = addDays(cursor, -1);
  }
  return total;
}
