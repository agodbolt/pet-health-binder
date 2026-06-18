"use node";

import Stripe from "stripe";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

const PRICE_CENTS = 1900; // $19 core
const PACK_CENTS = 900; // $9 Pet Emergency Kit order bump
const PACK_THRESHOLD = PRICE_CENTS + PACK_CENTS; // total when the bump is included

function stripeClient() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(key);
}

// Builds the line items, optionally including the Pet Emergency Kit bump.
function lineItems(withPack: boolean) {
  const items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
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
  ];
  if (withPack) {
    items.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: PACK_CENTS,
        product_data: {
          name: "Pet Emergency Kit (printables)",
          description:
            "A printable wallet emergency card, fridge medication chart, and lost-pet flyer that fill in from your binder.",
        },
      },
    });
  }
  return items;
}

/** Checkout for the signed-in user (in-app upgrade). */
export const createCheckoutSession = action({
  args: { origin: v.string(), withPack: v.optional(v.boolean()) },
  handler: async (ctx, { origin, withPack }): Promise<{ url: string }> => {
    const userId = (await getAuthUserId(ctx)) as Id<"users"> | null;
    if (!userId) throw new Error("You need to be signed in to purchase.");
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: userId,
      line_items: lineItems(Boolean(withPack)),
      success_url: `${origin}/app?paid=1`,
      cancel_url: `${origin}/app?canceled=1`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { url: session.url };
  },
});

/** Checkout for a NEW buyer (no account yet). Stripe collects email + payment. */
export const createGuestCheckout = action({
  args: { origin: v.string(), withPack: v.optional(v.boolean()) },
  handler: async (_ctx, { origin, withPack }): Promise<{ url: string }> => {
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems(Boolean(withPack)),
      success_url: `${origin}/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { url: session.url };
  },
});

/** Read buyer email + paid status + whether the bump was bought (for /welcome). */
export const getCheckoutInfo = action({
  args: { sessionId: v.string() },
  handler: async (
    _ctx,
    { sessionId }
  ): Promise<{ paid: boolean; email: string | null; hasPack: boolean }> => {
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      paid: session.payment_status === "paid",
      email: session.customer_details?.email ?? null,
      hasPack: (session.amount_total ?? 0) >= PACK_THRESHOLD,
    };
  },
});

/**
 * After the buyer sets a password (and is now signed in), verify their paid
 * Stripe session and grant access. Tied to the session id (single use).
 */
export const claimPurchase = action({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }): Promise<{ ok: boolean }> => {
    const userId = (await getAuthUserId(ctx)) as Id<"users"> | null;
    if (!userId) throw new Error("You need to be signed in to claim a purchase.");
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      throw new Error("This purchase hasn't completed yet.");
    }
    await ctx.runMutation(internal.payments.grantPurchase, {
      userId,
      sessionId,
      hasPack: (session.amount_total ?? 0) >= PACK_THRESHOLD,
      stripeCustomerId:
        typeof session.customer === "string" ? session.customer : undefined,
    });
    return { ok: true };
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
          hasPack: (session.amount_total ?? 0) >= PACK_THRESHOLD,
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
