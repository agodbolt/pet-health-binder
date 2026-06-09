import { describe, it, expect } from "vitest";
import { ageFromBirthday, daysUntil, dueStatus, addDays } from "@/lib/dates";

describe("ageFromBirthday", () => {
  it("computes whole years on exact birthday", () => {
    expect(ageFromBirthday("2020-06-09", "2026-06-09")).toBe("6 years");
  });
  it("handles birthday later in the year (years + months)", () => {
    expect(ageFromBirthday("2020-12-31", "2026-06-09")).toBe("5 years, 5 months");
  });
  it("shows months only for under-1-year", () => {
    expect(ageFromBirthday("2026-01-09", "2026-06-09")).toBe("5 months");
  });
  it("shows '1 month' singular", () => {
    expect(ageFromBirthday("2026-05-09", "2026-06-09")).toBe("1 month");
  });
  it("shows less than a month for newborns", () => {
    expect(ageFromBirthday("2026-06-01", "2026-06-09")).toBe("Less than a month");
  });
  it("returns empty string for missing birthday", () => {
    expect(ageFromBirthday("", "2026-06-09")).toBe("");
  });
  it("singular year", () => {
    expect(ageFromBirthday("2025-06-09", "2026-06-09")).toBe("1 year");
  });
});

describe("daysUntil", () => {
  it("counts forward across a year boundary", () => {
    expect(daysUntil("2027-01-08", "2026-12-09")).toBe(30);
  });
  it("returns negative for past dates across a year boundary", () => {
    expect(daysUntil("2026-12-09", "2027-01-08")).toBe(-30);
  });
  it("returns 0 for same day", () => {
    expect(daysUntil("2026-06-09", "2026-06-09")).toBe(0);
  });
});

describe("addDays", () => {
  it("adds days across month boundary", () => {
    expect(addDays("2026-01-25", 10)).toBe("2026-02-04");
  });
  it("adds days across year boundary", () => {
    expect(addDays("2026-12-28", 5)).toBe("2027-01-02");
  });
});

describe("dueStatus", () => {
  it("classifies overdue", () => {
    expect(dueStatus("2026-06-01", "2026-06-09", 60).level).toBe("overdue");
  });
  it("classifies due-soon within threshold", () => {
    expect(dueStatus("2026-07-15", "2026-06-09", 60).level).toBe("due-soon");
  });
  it("classifies current beyond threshold", () => {
    expect(dueStatus("2026-12-09", "2026-06-09", 60).level).toBe("current");
  });
  it("due today is due-soon, not overdue", () => {
    expect(dueStatus("2026-06-09", "2026-06-09", 60).level).toBe("due-soon");
  });
  it("returns days remaining", () => {
    expect(dueStatus("2026-07-09", "2026-06-09", 60).days).toBe(30);
  });
  it("returns 'none' level for missing due date", () => {
    expect(dueStatus(undefined, "2026-06-09", 60).level).toBe("none");
  });
});
