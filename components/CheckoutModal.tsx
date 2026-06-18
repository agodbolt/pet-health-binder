"use client";

import { useState } from "react";
import { Modal } from "./Modal";
import { fbqTrack } from "./MetaPixel";

/**
 * Order summary + the Pet Emergency Kit order bump. Calls `checkout(withPack)`
 * (guest or in-app) and redirects to Stripe.
 */
export function CheckoutModal({
  onClose,
  checkout,
}: {
  onClose: () => void;
  checkout: (withPack: boolean) => Promise<{ url: string }>;
}) {
  const [withPack, setWithPack] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const total = withPack ? 28 : 19;

  async function go() {
    setBusy(true);
    setError(null);
    fbqTrack("InitiateCheckout", { value: total, currency: "USD" });
    try {
      const { url } = await checkout(withPack);
      window.location.href = url;
    } catch {
      setError("Checkout isn't available right now. Please try again shortly.");
      setBusy(false);
    }
  }

  return (
    <Modal title="Your order" onClose={onClose}>
      <div
        className="row"
        style={{ justifyContent: "space-between", marginBottom: 4 }}
      >
        <span style={{ fontWeight: 600 }}>Pet Health Binder — full access</span>
        <span style={{ fontWeight: 600 }}>$19</span>
      </div>
      <p className="muted" style={{ fontSize: "0.85rem", marginTop: 0 }}>
        Unlimited pets, every device, yours for good.
      </p>

      {/* order bump */}
      <label
        style={{
          display: "block",
          border: "1.5px dashed",
          borderColor: withPack ? "var(--forest)" : "var(--line)",
          background: withPack ? "var(--forest-soft)" : "var(--cream)",
          borderRadius: 14,
          padding: "14px 16px",
          cursor: "pointer",
          margin: "14px 0",
          transition: "border-color .15s ease, background .15s ease",
        }}
      >
        <div className="row gap-1" style={{ alignItems: "flex-start" }}>
          <input
            type="checkbox"
            checked={withPack}
            onChange={(e) => setWithPack(e.target.checked)}
            style={{ marginTop: 3, width: 18, height: 18, flexShrink: 0 }}
          />
          <div>
            <div style={{ fontWeight: 700 }}>
              Yes, add the Pet Emergency Kit{" "}
              <span style={{ color: "var(--terracotta-deep)" }}>+$9</span>
            </div>
            <p className="muted" style={{ margin: "4px 0 0", fontSize: "0.88rem" }}>
              A printable wallet emergency card, a fridge medication chart, and a
              lost-pet flyer that fill themselves in from your binder. The stuff
              you&apos;ll wish you had on the worst day.
            </p>
          </div>
        </div>
      </label>

      <div
        className="row"
        style={{
          justifyContent: "space-between",
          borderTop: "1px solid var(--line)",
          paddingTop: 12,
          marginBottom: 14,
          fontWeight: 700,
          fontSize: "1.05rem",
        }}
      >
        <span>Total today</span>
        <span>${total}</span>
      </div>

      {error && (
        <p style={{ color: "var(--red)", fontSize: "0.85rem" }}>{error}</p>
      )}

      <button className="btn btn-accent btn-block" onClick={go} disabled={busy}>
        {busy ? "Opening secure checkout…" : "Continue to secure checkout"}
      </button>
      <p className="faint center" style={{ fontSize: "0.78rem", marginTop: 10 }}>
        Secure payment by Stripe · 14-day refund
      </p>
    </Modal>
  );
}
