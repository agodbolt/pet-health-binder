import { describe, it, expect } from "vitest";
import { mergePetDefaults, parseBackup, buildBackup } from "@/lib/backup";

describe("mergePetDefaults", () => {
  it("fills missing collections with empty arrays", () => {
    const merged = mergePetDefaults({ name: "Rex", species: "dog" });
    expect(merged.name).toBe("Rex");
    expect(merged.species).toBe("dog");
    expect(merged.vaccines).toEqual([]);
    expect(merged.medications).toEqual([]);
    expect(merged.vetVisits).toEqual([]);
    expect(merged.weights).toEqual([]);
    expect(merged.careTasks).toEqual([]);
    expect(merged.expenses).toEqual([]);
    expect(merged.sitterSheet).toEqual({});
  });
  it("defaults species to dog when absent", () => {
    expect(mergePetDefaults({ name: "Mystery" }).species).toBe("dog");
  });
  it("preserves provided collections", () => {
    const merged = mergePetDefaults({
      name: "Rex",
      vaccines: [{ name: "Rabies" }],
    });
    expect(merged.vaccines).toHaveLength(1);
  });
});

describe("parseBackup", () => {
  it("parses a valid backup payload", () => {
    const payload = buildBackup({
      name: "Rex",
      species: "dog",
      vaccines: [],
      medications: [],
      vetVisits: [],
      weights: [],
      careTasks: [],
      expenses: [],
      sitterSheet: {},
    });
    const json = JSON.stringify(payload);
    const parsed = parseBackup(json);
    expect(parsed.pets[0].name).toBe("Rex");
  });
  it("throws a friendly error on malformed JSON", () => {
    expect(() => parseBackup("{not valid")).toThrowError(/couldn't read/i);
  });
  it("throws a friendly error when shape is wrong", () => {
    expect(() => parseBackup(JSON.stringify({ foo: 1 }))).toThrowError(
      /doesn't look like/i
    );
  });
  it("merges defaults into imported pets missing collections", () => {
    const parsed = parseBackup(
      JSON.stringify({ version: 1, pets: [{ name: "Patch" }] })
    );
    expect(parsed.pets[0].vaccines).toEqual([]);
    expect(parsed.pets[0].sitterSheet).toEqual({});
  });
});

describe("buildBackup", () => {
  it("wraps pets with version metadata", () => {
    const payload = buildBackup({ name: "Rex" });
    expect(payload.version).toBe(1);
    expect(Array.isArray(payload.pets)).toBe(true);
    expect(payload.pets[0].name).toBe("Rex");
  });
  it("accepts an array of pets", () => {
    const payload = buildBackup([{ name: "A" }, { name: "B" }]);
    expect(payload.pets).toHaveLength(2);
  });
});
