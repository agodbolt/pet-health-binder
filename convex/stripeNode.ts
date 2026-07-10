"use node";

import Stripe from "stripe";
import { createHash } from "node:crypto";
import { action, internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Id } from "./_generated/dataModel";

const PRICE_CENTS = 1900; // $19 core
const PACK_CENTS = 900; // $9 Pet Emergency Kit order bump
const PACK_THRESHOLD = PRICE_CENTS + PACK_CENTS; // total when the bump is included

const META_PIXEL_ID = "1020983093776998";

/**
 * Server-side Meta Conversions API Purchase event. Fired from the Stripe
 * webhook so iOS / ad-blocker users are still counted. event_id = the Stripe
 * session id, which the browser pixel also sends, so Meta de-duplicates.
 * Never throws: a tracking failure must not fail payment fulfillment.
 */
async function sendCapiPurchase(session: Stripe.Checkout.Session) {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) return;
  try {
    const email = session.customer_details?.email?.trim().toLowerCase();
    const body = {
      data: [
        {
          event_name: "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: session.id,
          action_source: "website",
          event_source_url: "https://binder.canpeteat.com/welcome",
          user_data: {
            em: email
              ? [createHash("sha256").update(email).digest("hex")]
              : [],
            // _fbc carries the ad-click id (fbclid): it is what lets Meta
            // attribute this purchase to an ad in Ads Manager. _fbp and the
            // user agent further raise event match quality.
            ...(session.metadata?.fbp ? { fbp: session.metadata.fbp } : {}),
            ...(session.metadata?.fbc ? { fbc: session.metadata.fbc } : {}),
            ...(session.metadata?.ua
              ? { client_user_agent: session.metadata.ua }
              : {}),
          },
          custom_data: {
            value: (session.amount_total ?? PRICE_CENTS) / 100,
            currency: "usd",
            content_name: "Pet Health Binder",
          },
        },
      ],
    };
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${token}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );
    const out = await res.text();
    console.log(`CAPI purchase ${session.id}: ${res.status} ${out.slice(0, 200)}`);
  } catch (err) {
    console.error("CAPI purchase failed:", (err as Error).message);
  }
}

/** Meta browser identifiers captured at checkout time, carried through Stripe
 *  session metadata so the webhook's server-side event can attribute the sale
 *  back to the ad click. Values are size-capped for Stripe's metadata limits. */
const metaIdArgs = {
  fbp: v.optional(v.string()),
  fbc: v.optional(v.string()),
  userAgent: v.optional(v.string()),
};

function metaIdMetadata(args: {
  fbp?: string;
  fbc?: string;
  userAgent?: string;
}): Record<string, string> {
  const out: Record<string, string> = {};
  if (args.fbp) out.fbp = args.fbp.slice(0, 480);
  if (args.fbc) out.fbc = args.fbc.slice(0, 480);
  if (args.userAgent) out.ua = args.userAgent.slice(0, 480);
  return out;
}

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
  args: {
    origin: v.string(),
    withPack: v.optional(v.boolean()),
    ...metaIdArgs,
  },
  handler: async (
    ctx,
    { origin, withPack, ...metaIds }
  ): Promise<{ url: string }> => {
    const userId = (await getAuthUserId(ctx)) as Id<"users"> | null;
    if (!userId) throw new Error("You need to be signed in to purchase.");
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      client_reference_id: userId,
      line_items: lineItems(Boolean(withPack)),
      metadata: metaIdMetadata(metaIds),
      success_url: `${origin}/app?paid=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app?canceled=1`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout URL.");
    return { url: session.url };
  },
});

/** Checkout for a NEW buyer (no account yet). Stripe collects email + payment. */
export const createGuestCheckout = action({
  args: {
    origin: v.string(),
    withPack: v.optional(v.boolean()),
    ...metaIdArgs,
  },
  handler: async (
    _ctx,
    { origin, withPack, ...metaIds }
  ): Promise<{ url: string }> => {
    const stripe = stripeClient();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems(Boolean(withPack)),
      metadata: metaIdMetadata(metaIds),
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
      // Server-side Meta Purchase for every completed checkout (guest or in-app).
      await sendCapiPurchase(session);
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
