import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnedPet } from "./helpers";

export const list = query({
  args: { petId: v.id("pets") },
  handler: async (ctx, { petId }) => {
    await requireOwnedPet(ctx, petId);
    return await ctx.db
      .query("vaccines")
      .withIndex("by_pet", (q) => q.eq("petId", petId))
      .collect();
  },
});

export const add = mutation({
  args: {
    petId: v.id("pets"),
    name: v.string(),
    dateGiven: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    clinic: v.optional(v.string()),
    lot: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnedPet(ctx, args.petId);
    return await ctx.db.insert("vaccines", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("vaccines"),
    name: v.optional(v.string()),
    dateGiven: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    clinic: v.optional(v.string()),
    lot: v.optional(v.string()),
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

export const remove = mutation({
  args: { id: v.id("vaccines") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return;
    await requireOwnedPet(ctx, row.petId);
    await ctx.db.delete(id);
  },
});
