import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireOwnedPet } from "./helpers";

export const list = query({
  args: { petId: v.id("pets") },
  handler: async (ctx, { petId }) => {
    await requireOwnedPet(ctx, petId);
    const rows = await ctx.db
      .query("vetVisits")
      .withIndex("by_pet", (q) => q.eq("petId", petId))
      .collect();
    rows.sort((a, b) => (a.date < b.date ? 1 : -1)); // reverse chronological
    return rows;
  },
});

export const add = mutation({
  args: {
    petId: v.id("pets"),
    date: v.string(),
    clinic: v.optional(v.string()),
    reason: v.optional(v.string()),
    diagnosis: v.optional(v.string()),
    treatment: v.optional(v.string()),
    cost: v.optional(v.number()),
    followUpDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireOwnedPet(ctx, args.petId);
    let expenseId = undefined;
    if (typeof args.cost === "number" && args.cost > 0) {
      expenseId = await ctx.db.insert("expenses", {
        petId: args.petId,
        date: args.date,
        category: "Vet",
        amount: args.cost,
        note: args.reason ?? "Vet visit",
      });
    }
    return await ctx.db.insert("vetVisits", { ...args, expenseId });
  },
});

export const update = mutation({
  args: {
    id: v.id("vetVisits"),
    date: v.optional(v.string()),
    clinic: v.optional(v.string()),
    reason: v.optional(v.string()),
    diagnosis: v.optional(v.string()),
    treatment: v.optional(v.string()),
    cost: v.optional(v.number()),
    followUpDate: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...rest }) => {
    const row = await ctx.db.get(id);
    if (!row) throw new Error("Not found");
    await requireOwnedPet(ctx, row.petId);
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(rest)) if (val !== undefined) patch[k] = val;
    await ctx.db.patch(id, patch);

    // Keep the linked expense in sync with cost.
    if (rest.cost !== undefined) {
      if (row.expenseId) {
        if (rest.cost > 0) {
          await ctx.db.patch(row.expenseId, {
            amount: rest.cost,
            date: rest.date ?? row.date,
          });
        } else {
          await ctx.db.delete(row.expenseId);
          await ctx.db.patch(id, { expenseId: undefined });
        }
      } else if (rest.cost > 0) {
        const expenseId = await ctx.db.insert("expenses", {
          petId: row.petId,
          date: rest.date ?? row.date,
          category: "Vet",
          amount: rest.cost,
          note: rest.reason ?? row.reason ?? "Vet visit",
        });
        await ctx.db.patch(id, { expenseId });
      }
    }
  },
});

export const remove = mutation({
  args: { id: v.id("vetVisits") },
  handler: async (ctx, { id }) => {
    const row = await ctx.db.get(id);
    if (!row) return;
    await requireOwnedPet(ctx, row.petId);
    if (row.expenseId) await ctx.db.delete(row.expenseId);
    await ctx.db.delete(id);
  },
});
