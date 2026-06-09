import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnedPet } from "./helpers";

export const list = query({
  args: { petId: v.id("pets") },
  handler: async (ctx, { petId }) => {
    await requireOwnedPet(ctx, petId);
    return await ctx.db
      .query("medications")
      .withIndex("by_pet", (q) => q.eq("petId", petId))
      .collect();
  },
});

export const add = mutation({
  args: {
    petId: v.id("pets"),
    name: v.string(),
    dose: v.optional(v.string()),
    frequency: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    ongoing: v.boolean(),
    refillBy: v.optional(v.string()),
    vet: v.optional(v.string()),
    notes: v.optional(v.string()),
    instructions: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnedPet(ctx, args.petId);
    return await ctx.db.insert("medications", {
      ...args,
      archived: false,
      doseLog: {},
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("medications"),
    name: v.optional(v.string()),
    dose: v.optional(v.string()),
    frequency: v.optional(v.string()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    ongoing: v.optional(v.boolean()),
    refillBy: v.optional(v.string()),
    vet: v.optional(v.string()),
    notes: v.optional(v.string()),
    instructions: v.optional(v.string()),
    archived: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...rest }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error("Not found");
    await requireOwnedPet(ctx, row.petId);
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(rest)) if (val !== undefined) patch[k] = val;
    await ctx.db.patch(id, patch);
  },
});

/** Persist the full dose log for a medication (today's checkbox state). */
export const setDoseLog = mutation({
  args: { id: v.id("medications"), doseLog: v.any() },
  handler: async (ctx, { id, doseLog }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error("Not found");
    await requireOwnedPet(ctx, row.petId);
    await ctx.db.patch(id, { doseLog });
  },
});

export const remove = mutation({
  args: { id: v.id("medications") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return;
    await requireOwnedPet(ctx, row.petId);
    await ctx.db.delete(id);
  },
});
