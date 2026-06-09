import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnedPet } from "./helpers";

export const list = query({
  args: { petId: v.id("pets") },
  handler: async (ctx, { petId }) => {
    await requireOwnedPet(ctx, petId);
    const rows = await ctx.db
      .query("expenses")
      .withIndex("by_pet", (q) => q.eq("petId", petId))
      .collect();
    rows.sort((a, b) => (a.date < b.date ? 1 : -1));
    return rows;
  },
});

export const add = mutation({
  args: {
    petId: v.id("pets"),
    date: v.string(),
    category: v.string(),
    amount: v.number(),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnedPet(ctx, args.petId);
    return await ctx.db.insert("expenses", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("expenses"),
    date: v.optional(v.string()),
    category: v.optional(v.string()),
    amount: v.optional(v.number()),
    note: v.optional(v.string()),
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
  args: { id: v.id("expenses") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return;
    await requireOwnedPet(ctx, row.petId);
    await ctx.db.delete(id);
  },
});
