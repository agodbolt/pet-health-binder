import { query, mutation, type QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

async function loadProfile(ctx: QueryCtx, userId: Id<"users">) {
  return await ctx.db
    .query("profiles")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .unique();
}

/** The signed-in user with profile/settings, or null when logged out. */
export const current = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    const profile = await loadProfile(ctx, userId);
    return {
      userId,
      email: user?.email ?? profile?.email ?? null,
      hasPaid: profile?.hasPaid ?? false,
      weightUnit: profile?.weightUnit ?? ("lb" as const),
      currency: profile?.currency ?? "$",
      activePetId: profile?.activePetId ?? null,
    };
  },
});

/** Create the profile row on first sign-in if it doesn't exist yet. */
export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    const existing = await loadProfile(ctx, userId);
    if (existing) return existing._id;
    const user = await ctx.db.get(userId);
    return await ctx.db.insert("profiles", {
      userId,
      email: user?.email ?? undefined,
      hasPaid: false,
      weightUnit: "lb",
      currency: "$",
    });
  },
});

export const updateSettings = mutation({
  args: {
    weightUnit: v.optional(v.union(v.literal("lb"), v.literal("kg"))),
    currency: v.optional(v.string()),
    activePetId: v.optional(v.id("pets")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not signed in");
    let profile = await loadProfile(ctx, userId);
    if (!profile) {
      const id = await ctx.db.insert("profiles", {
        userId,
        hasPaid: false,
        weightUnit: "lb",
        currency: "$",
      });
      profile = await ctx.db.get(id);
    }
    if (!profile) throw new Error("Profile missing");
    const patch: Record<string, unknown> = {};
    if (args.weightUnit !== undefined) patch.weightUnit = args.weightUnit;
    if (args.currency !== undefined) patch.currency = args.currency;
    if (args.activePetId !== undefined) patch.activePetId = args.activePetId;
    await ctx.db.patch(profile._id, patch);
  },
});
