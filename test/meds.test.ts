import { describe, it, expect } from "vitest";
import {
  slotsPerDay,
  isCheckedToday,
  toggleDose,
  allDosesCheckedOn,
  streak,
  type DoseLog,
} from "@/lib/meds";

describe("slotsPerDay", () => {
  it("daily => 1", () => expect(slotsPerDay("daily")).toBe(1));
  it("twice daily => 2", () => expect(slotsPerDay("twice daily")).toBe(2));
  it("weekly => 1", () => expect(slotsPerDay("weekly")).toBe(1));
  it("as-needed => 1", () => expect(slotsPerDay("as-needed")).toBe(1));
});

describe("isCheckedToday / toggleDose", () => {
  it("yesterday's checks do not count today (daily reset)", () => {
    const log: DoseLog = { "2026-06-08": [true, true] };
    expect(isCheckedToday(log, 0, "2026-06-09")).toBe(false);
  });
  it("toggleDose sets a specific slot for today", () => {
    const log = toggleDose({}, 1, "2026-06-09", 2);
    expect(log["2026-06-09"][1]).toBe(true);
    expect(log["2026-06-09"][0]).toBe(false);
  });
  it("toggleDose flips an already-checked slot off", () => {
    let log = toggleDose({}, 0, "2026-06-09", 1);
    log = toggleDose(log, 0, "2026-06-09", 1);
    expect(log["2026-06-09"][0]).toBe(false);
  });
  it("does not mutate the input log", () => {
    const original: DoseLog = {};
    toggleDose(original, 0, "2026-06-09", 1);
    expect(original["2026-06-09"]).toBeUndefined();
  });
});

describe("allDosesCheckedOn", () => {
  it("true only when every slot is checked", () => {
    expect(allDosesCheckedOn({ "2026-06-09": [true, true] }, 2, "2026-06-09")).toBe(true);
    expect(allDosesCheckedOn({ "2026-06-09": [true, false] }, 2, "2026-06-09")).toBe(false);
    expect(allDosesCheckedOn({}, 2, "2026-06-09")).toBe(false);
  });
});

describe("streak", () => {
  it("counts consecutive fully-checked days ending today", () => {
    const log: DoseLog = {
      "2026-06-07": [true, true],
      "2026-06-08": [true, true],
      "2026-06-09": [true, true],
    };
    expect(streak("twice daily", log, "2026-06-09")).toBe(3);
  });
  it("today not yet checked but prior days were => streak through yesterday", () => {
    const log: DoseLog = {
      "2026-06-07": [true],
      "2026-06-08": [true],
    };
    expect(streak("daily", log, "2026-06-09")).toBe(2);
  });
  it("a missed day breaks the streak", () => {
    const log: DoseLog = {
      "2026-06-06": [true],
      "2026-06-08": [true],
      "2026-06-09": [true],
    };
    expect(streak("daily", log, "2026-06-09")).toBe(2);
  });
  it("no log => 0", () => {
    expect(streak("daily", {}, "2026-06-09")).toBe(0);
  });
});
