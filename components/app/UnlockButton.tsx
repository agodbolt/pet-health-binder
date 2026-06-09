"use client";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UnlockButton({
  label = "Unlock everything — $19",
  block,
}: {
  label?: string;
  block?: boolean;
}) {
  const checkout = useAction(api.stripeNode.createCheckoutSession);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await checkout({ origin: window.location.origin });
      window.location.href = url;
    } catch {
      setError("Checkout isn't available yet — please try again shortly.");
      setBusy(false);
    }
  }

  return (
    <>
      <button
        className={`btn btn-accent ${block ? "btn-block" : "btn-sm"}`}
        onClick={go}
        disabled={busy}
      >
        {busy ? "Opening checkout…" : label}
      </button>
      {error && (
        <p style={{ color: "var(--red)", fontSize: "0.82rem", marginTop: 6 }}>
          {error}
        </p>
      )}
    </>
  );
}
