import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnedPet } from "./helpers";

export const list = query({
  args: { petId: v.id("pets") },
  handler: async (ctx, { petId }) => {
    await requireOwnedPet(ctx, petId);
    return await ctx.db
      .query("careTasks")
      .withIndex("by_pet", (q) => q.eq("petId", petId))
      .collect();
  },
});

export const add = mutation({
  args: {
    petId: v.id("pets"),
    name: v.string(),
    intervalDays: v.number(),
    lastDone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnedPet(ctx, args.petId);
    return await ctx.db.insert("careTasks", args);
  },
});

/** Seed several care tasks at once (called when a pet is created). */
export const seedMany = mutation({
  args: {
    petId: v.id("pets"),
    tasks: v.array(v.object({ name: v.string(), intervalDays: v.number() })),
  },
  handler: async (ctx, { petId, tasks }) => {
    await requireOwnedPet(ctx, petId);
    const existing = await ctx.db
      .query("careTasks")
      .withIndex("by_pet", (q) => q.eq("petId", petId))
      .first();
    if (existing) return; // don't double-seed
    for (const t of tasks) {
      await ctx.db.insert("careTasks", { petId, ...t });
    }
  },
});

export const update = mutation({
  args: {
    id: v.id("careTasks"),
    name: v.optional(v.string()),
    intervalDays: v.optional(v.number()),
    lastDone: v.optional(v.string()),
    notes: v.optional(v.string()),
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

/** Mark a task done on `date` (advances the cycle). */
export const markDone = mutation({
  args: { id: v.id("careTasks"), date: v.string() },
  handler: async (ctx, { id, date }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error("Not found");
    await requireOwnedPet(ctx, row.petId);
    await ctx.db.patch(id, { lastDone: date });
  },
});

export const remove = mutation({
  args: { id: v.id("careTasks") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return;
    await requireOwnedPet(ctx, row.petId);
    await ctx.db.delete(id);
  },
});
