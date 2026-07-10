"use client";

import { metaBrowserIds } from "@/components/MetaPixel";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckoutModal } from "@/components/CheckoutModal";

export function UnlockButton({
  label = "Unlock everything for $19",
  block,
}: {
  label?: string;
  block?: boolean;
}) {
  const checkout = useAction(api.stripeNode.createCheckoutSession);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className={`btn btn-accent ${block ? "btn-block" : "btn-sm"}`}
        onClick={() => setOpen(true)}
      >
        {label}
      </button>
      {open && (
        <CheckoutModal
          onClose={() => setOpen(false)}
          checkout={(withPack) =>
            checkout({ origin: window.location.origin, withPack, ...metaBrowserIds() })
          }
        />
      )}
    </>
  );
}
