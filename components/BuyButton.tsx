"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

/** Landing-page CTA: goes straight to Stripe Checkout (pay first, account after). */
export function BuyButton({
  children,
  className = "btn btn-accent",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const checkout = useAction(api.stripeNode.createGuestCheckout);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await checkout({ origin: window.location.origin });
      window.location.href = url;
    } catch {
      setError("Checkout isn't available right now — please try again shortly.");
      setBusy(false);
    }
  }

  return (
    <>
      <button className={className} onClick={go} disabled={busy}>
        {busy ? "Opening secure checkout…" : children}
      </button>
      {error && (
        <p style={{ color: "var(--red)", fontSize: "0.85rem", marginTop: 8 }}>
          {error}
        </p>
      )}
    </>
  );
}
