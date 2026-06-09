"use node";

import Stripe from "stripe";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

const PRICE_CENTS = 1900; // $19 one-time

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

/**
 * Create a one-time $19 Checkout Session for the signed-in user.
 * The user id is taken from the auth context (trustworthy) and stored as
 * client_reference_id so the webhook can fulfill the right account.
 */
export const createCheckoutSession = action({
  args: { origin: v.string() },
  handler: async (ctx, { origin }): Promise<{ url: string }> => {
    const userId = (await getAuthUserId(ctx)) as Id<"users"> | null;
    if (!userId) throw new Error("You need to be signed in to purchase.");
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: userId,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: PRICE_CENTS,
            product_data: {
              name: "Pet Health Binder — full access",
              description:
                "Unlimited pets, multi-device sync, vaccines, meds, sitter sheet & more. One-time purchase.",
            },
          },
        },
      ],
      success_url: `${origin}/app?paid=1`,
      cancel_url: `${origin}/app?canceled=1`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { url: session.url };
  },
});

/** Verify + handle a Stripe webhook payload. Called from the HTTP route. */
export const handleWebhook = internalAction({
  args: { payload: v.string(), signature: v.string() },
  handler: async (ctx, { payload, signature }): Promise<{ ok: boolean }> => {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    const stripe = stripeClient();
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(payload, signature, secret);
    } catch (err) {
      throw new Error(
        `Webhook signature verification failed: ${(err as Error).message}`
      );
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id as Id<"users"> | null;
      if (userId) {
        await ctx.runMutation(internal.payments.fulfillPayment, {
          userId,
          stripeCustomerId:
            typeof session.customer === "string"
              ? session.customer
              : undefined,
        });
      }
    }
    return { ok: true };
  },
});
