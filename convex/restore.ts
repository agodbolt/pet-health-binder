import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./helpers";
import type { Id } from "./_generated/dataModel";

type Species = "dog" | "cat" | "rabbit" | "bird" | "other";
const SPECIES: Species[] = ["dog", "cat", "rabbit", "bird", "other"];

function str(x: unknown): string | undefined {
  return typeof x === "string" && x.length ? x : undefined;
}
function num(x: unknown): number | undefined {
  return typeof x === "number" && Number.isFinite(x) ? x : undefined;
}

/**
 * Restore a backup. Creates fresh pets + child rows for the signed-in user.
 * Defensive: ignores unknown fields, fills required ones with safe defaults.
 */
export const importPets = mutation({
  args: { pets: v.array(v.any()) },
  handler: async (ctx, { pets }) => {
    const userId = await requireUser(ctx);
    let imported = 0;

    for (const raw of pets) {
      const p = (raw ?? {}) as Record<string, any>;
      const species = SPECIES.includes(p.species) ? p.species : "dog";
      const petId: Id<"pets"> = await ctx.db.insert("pets", {
        userId,
        name: str(p.name) ?? "Unnamed",
        species,
        breed: str(p.breed),
        birthday: str(p.birthday),
        microchip: str(p.microchip),
        sitterSheet:
          p.sitterSheet && typeof p.sitterSheet === "object"
            ? p.sitterSheet
            : {},
        createdAt: Date.now(),
      });

      for (const vac of Array.isArray(p.vaccines) ? p.vaccines : []) {
        if (!str(vac?.name)) continue;
        await ctx.db.insert("vaccines", {
          petId,
          name: vac.name,
          dateGiven: str(vac.dateGiven),
          dueDate: str(vac.dueDate),
          clinic: str(vac.clinic),
          lot: str(vac.lot),
          notes: str(vac.notes),
        });
      }
      for (const m of Array.isArray(p.medications) ? p.medications : []) {
        if (!str(m?.name)) continue;
        await ctx.db.insert("medications", {
          petId,
          name: m.name,
          dose: str(m.dose),
          frequency: str(m.frequency) ?? "daily",
          startDate: str(m.startDate),
          endDate: str(m.endDate),
          ongoing: Boolean(m.ongoing),
          refillBy: str(m.refillBy),
          vet: str(m.vet),
          notes: str(m.notes),
          instructions: str(m.instructions),
          archived: Boolean(m.archived),
          doseLog: m.doseLog && typeof m.doseLog === "object" ? m.doseLog : {},
        });
      }
      for (const visit of Array.isArray(p.vetVisits) ? p.vetVisits : []) {
        if (!str(visit?.date)) continue;
        await ctx.db.insert("vetVisits", {
          petId,
          date: visit.date,
          clinic: str(visit.clinic),
          reason: str(visit.reason),
          diagnosis: str(visit.diagnosis),
          treatment: str(visit.treatment),
          cost: num(visit.cost),
          followUpDate: str(visit.followUpDate),
          notes: str(visit.notes),
        });
      }
      for (const w of Array.isArray(p.weights) ? p.weights : []) {
        if (!str(w?.date) || num(w?.weight) === undefined) continue;
        await ctx.db.insert("weights", {
          petId,
          date: w.date,
          weight: w.weight,
          note: str(w.note),
        });
      }
      for (const t of Array.isArray(p.careTasks) ? p.careTasks : []) {
        if (!str(t?.name)) continue;
        await ctx.db.insert("careTasks", {
          petId,
          name: t.name,
          intervalDays: num(t.intervalDays) ?? 30,
          lastDone: str(t.lastDone),
          notes: str(t.notes),
        });
      }
      for (const e of Array.isArray(p.expenses) ? p.expenses : []) {
        if (!str(e?.date) || num(e?.amount) === undefined) continue;
        await ctx.db.insert("expenses", {
          petId,
          date: e.date,
          category: str(e.category) ?? "Other",
          amount: e.amount,
          note: str(e.note),
        });
      }
      imported++;
    }
    return { imported };
  },
});
