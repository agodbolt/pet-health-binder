"use client";

import { ReactNode } from "react";
import { usePet } from "./PetContext";
import { UnlockButton } from "./UnlockButton";
import { PawField } from "../PawMotif";

/**
 * Wraps a gated tab. If the user hasn't purchased, the tab content is shown
 * blurred behind a friendly unlock card so they can see what they're getting.
 */
export function LockGate({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const { hasPaid } = usePet();
  if (hasPaid) return <>{children}</>;
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          filter: "blur(4px)",
          pointerEvents: "none",
          userSelect: "none",
          opacity: 0.5,
        }}
        aria-hidden="true"
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          padding: 20,
        }}
      >
        <div
          className="card card-pad-lg center fadeup"
          style={{ maxWidth: 420, boxShadow: "var(--shadow-lg)", position: "relative", overflow: "hidden" }}
        >
          <PawField />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>🔒</div>
            <h3 style={{ fontSize: "1.3rem", marginBottom: 6 }}>
              {title} is part of the full binder
            </h3>
            <p className="muted" style={{ marginBottom: 18 }}>
              Unlock every tab — vaccines, meds, vet visits, weight, grooming,
              expenses and the sitter sheet — with a single $19 payment. No
              subscription, syncs to all your devices.
            </p>
            <UnlockButton block />
          </div>
        </div>
      </div>
    </div>
  );
}
