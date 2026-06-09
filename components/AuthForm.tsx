"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { Paw } from "./PawMotif";

export function AuthForm({ flow }: { flow: "signIn" | "signUp" }) {
  const { signIn } = useAuthActions();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isSignUp = flow === "signUp";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await signIn("password", { email, password, flow });
      router.push("/app");
    } catch (err) {
      const msg = (err as Error)?.message ?? "";
      if (/InvalidAccountId|InvalidSecret|Invalid/.test(msg)) {
        setError(
          isSignUp
            ? "Couldn't create that account — the email may already be in use."
            : "That email and password don't match. Please try again."
        );
      } else {
        setError("Something went wrong. Please try again in a moment.");
      }
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "32px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 410 }}>
        <Link
          href="/"
          className="row gap-1"
          style={{
            justifyContent: "center",
            color: "var(--forest)",
            fontWeight: 600,
            marginBottom: 22,
          }}
        >
          <Paw size={26} color="var(--terracotta)" />
          <span style={{ fontFamily: "var(--font-head)", fontSize: "1.25rem" }}>
            Pet Health Binder
          </span>
        </Link>
        <div className="card card-pad-lg fadeup">
          <h1 style={{ fontSize: "1.7rem", marginBottom: 4 }}>
            {isSignUp ? "Start your binder" : "Welcome back"}
          </h1>
          <p className="muted" style={{ marginBottom: 18 }}>
            {isSignUp
              ? "Create your account — it syncs to every device you use."
              : "Log in to see your pets on this device."}
          </p>
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                autoComplete={isSignUp ? "new-password" : "current-password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isSignUp ? "At least 8 characters" : "Your password"}
              />
            </div>
            {error && (
              <p
                style={{
                  color: "var(--red)",
                  fontSize: "0.88rem",
                  background: "var(--red-soft)",
                  padding: "8px 12px",
                  borderRadius: 10,
                }}
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              className="btn btn-accent btn-block"
              disabled={busy}
              style={{ marginTop: 6 }}
            >
              {busy
                ? "One moment…"
                : isSignUp
                  ? "Create my account"
                  : "Log in"}
            </button>
          </form>
        </div>
        <p className="center muted" style={{ marginTop: 18, fontSize: "0.92rem" }}>
          {isSignUp ? (
            <>
              Already have a binder?{" "}
              <Link href="/login" style={{ fontWeight: 600 }}>
                Log in
              </Link>
            </>
          ) : (
            <>
              New here?{" "}
              <Link href="/signup" style={{ fontWeight: 600 }}>
                Start your binder
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
