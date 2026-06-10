"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAction } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "@/convex/_generated/api";
import { Paw } from "@/components/PawMotif";

export default function WelcomePage() {
  return (
    <Suspense fallback={null}>
      <Welcome />
    </Suspense>
  );
}

function Welcome() {
  const search = useSearchParams();
  const sessionId = search.get("session_id");
  const router = useRouter();
  const { signIn } = useAuthActions();
  const getInfo = useAction(api.stripeNode.getCheckoutInfo);
  const claim = useAction(api.stripeNode.claimPurchase);

  const [email, setEmail] = useState("");
  const [paid, setPaid] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signUp" | "signIn">("signUp");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Look up the purchase details from Stripe.
  useEffect(() => {
    if (!sessionId) {
      setPaid(false);
      return;
    }
    getInfo({ sessionId })
      .then((info) => {
        setPaid(info.paid);
        if (info.email) setEmail(info.email);
      })
      .catch(() => setPaid(false));
  }, [sessionId, getInfo]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sessionId) return;
    setBusy(true);
    setError(null);
    try {
      await signIn("password", { email, password, flow: mode });
      await claim({ sessionId });
      router.push("/app");
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      if (mode === "signUp" && /exist|account|InvalidAccountId|InvalidSecret/i.test(msg)) {
        // They already have an account with this email — switch to log in.
        setMode("signIn");
        setError("Looks like you already have an account with this email. Enter your password to log in — your purchase will be applied.");
      } else if (mode === "signIn") {
        setError("That password didn't match. Please try again.");
      } else {
        setError("Something went wrong finishing your setup. Please try again.");
      }
      setBusy(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "32px 16px" }}>
      <div style={{ width: "100%", maxWidth: 430 }}>
        <Link
          href="/"
          className="row gap-1"
          style={{ justifyContent: "center", color: "var(--forest)", fontWeight: 600, marginBottom: 22 }}
        >
          <Paw size={26} color="var(--terracotta)" />
          <span style={{ fontFamily: "var(--font-head)", fontSize: "1.25rem" }}>
            Pet Health Binder
          </span>
        </Link>

        <div className="card card-pad-lg fadeup">
          {paid === null ? (
            <p className="muted center">Confirming your payment…</p>
          ) : !paid ? (
            <div className="center">
              <h1 style={{ fontSize: "1.5rem", marginBottom: 8 }}>
                We couldn&apos;t find your payment
              </h1>
              <p className="muted">
                If you just paid, give it a few seconds and refresh. Otherwise you
                can start your binder below.
              </p>
              <BuyAgain />
            </div>
          ) : (
            <>
              <div className="center" style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 34 }}>🎉</div>
                <h1 style={{ fontSize: "1.6rem", margin: "6px 0 4px" }}>
                  Payment received — welcome!
                </h1>
                <p className="muted">
                  {mode === "signUp"
                    ? "Create a password and your binder is ready, on every device."
                    : "Log in to apply your purchase."}
                </p>
              </div>
              <form onSubmit={onSubmit}>
                <div className="field">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={!!email}
                    required
                  />
                </div>
                <div className="field">
                  <label htmlFor="password">
                    {mode === "signUp" ? "Choose a password" : "Your password"}
                  </label>
                  <input
                    id="password"
                    className="input"
                    type="password"
                    minLength={8}
                    autoComplete={mode === "signUp" ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={mode === "signUp" ? "At least 8 characters" : "Your password"}
                    required
                    autoFocus
                  />
                </div>
                {error && (
                  <p style={{ color: "var(--red)", fontSize: "0.88rem", background: "var(--red-soft)", padding: "8px 12px", borderRadius: 10 }}>
                    {error}
                  </p>
                )}
                <button type="submit" className="btn btn-accent btn-block" disabled={busy} style={{ marginTop: 6 }}>
                  {busy ? "Opening your binder…" : mode === "signUp" ? "Open my binder" : "Log in & unlock"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function BuyAgain() {
  const checkout = useAction(api.stripeNode.createGuestCheckout);
  const [busy, setBusy] = useState(false);
  return (
    <button
      className="btn btn-accent"
      style={{ marginTop: 14 }}
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const { url } = await checkout({ origin: window.location.origin });
          window.location.href = url;
        } catch {
          setBusy(false);
        }
      }}
    >
      {busy ? "Opening checkout…" : "Get the binder — $19"}
    </button>
  );
}
