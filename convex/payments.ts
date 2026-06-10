import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

/** Flip a user to paid. Called by the Stripe webhook (internal only). */
export const fulfillPayment = internalMutation({
  args: { userId: v.id("users"), stripeCustomerId: v.optional(v.string()) },
  handler: async (ctx, { userId, stripeCustomerId }) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (profile) {
      await ctx.db.patch(profile._id, { hasPaid: true, stripeCustomerId });
    } else {
      await ctx.db.insert("profiles", {
        userId,
        hasPaid: true,
        stripeCustomerId,
        weightUnit: "lb",
        currency: "$",
      });
    }
  },
});

/**
 * Grant access to the signed-in user after a verified guest purchase.
 * Tied to the Stripe session id so the same payment can't unlock two accounts.
 */
export const grantPurchase = internalMutation({
  args: { userId: v.id("users"), sessionId: v.string(), stripeCustomerId: v.optional(v.string()) },
  handler: async (ctx, { userId, sessionId, stripeCustomerId }) => {
    // Reject if this purchase was already claimed by a different account.
    const claimed = await ctx.db
      .query("profiles")
      .withIndex("by_purchase", (q) => q.eq("purchaseSessionId", sessionId))
      .first();
    if (claimed && claimed.userId !== userId) {
      throw new Error("This purchase has already been used on another account.");
    }
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (profile) {
      await ctx.db.patch(profile._id, {
        hasPaid: true,
        purchaseSessionId: sessionId,
        stripeCustomerId: stripeCustomerId ?? profile.stripeCustomerId,
      });
    } else {
      await ctx.db.insert("profiles", {
        userId,
        hasPaid: true,
        purchaseSessionId: sessionId,
        stripeCustomerId,
        weightUnit: "lb",
        currency: "$",
      });
    }
  },
});

/** Lightweight paid-status check (used internally and by clients). */
export const hasPaid = query({
  args: {},
  handler: async (ctx) => {
    const userId = (await getAuthUserId(ctx)) as Id<"users"> | null;
    if (!userId) return false;
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    return profile?.hasPaid ?? false;
  },
});
