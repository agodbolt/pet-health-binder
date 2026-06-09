import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

// Convex Auth HTTP endpoints (token exchange, etc.)
auth.addHttpRoutes(http);

// Stripe webhook. Stripe POSTs the raw body + a signature header here; we hand
// it to a Node action that verifies the signature and fulfills the purchase.
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) {
      return new Response("Missing signature", { status: 400 });
    }
    const payload = await request.text();
    try {
      await ctx.runAction(internal.stripeNode.handleWebhook, {
        payload,
        signature,
      });
    } catch (err) {
      return new Response((err as Error).message, { status: 400 });
    }
    return new Response(null, { status: 200 });
  }),
});

export default http;
