"use client";

import { metaBrowserIds } from "@/components/MetaPixel";

import { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CheckoutModal } from "@/components/CheckoutModal";

/** Landing-page CTA: opens the order summary (with the Emergency Kit bump),
 *  then sends to Stripe Checkout (pay first, account after). */
export function BuyButton({
  children,
  className = "btn btn-accent",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const checkout = useAction(api.stripeNode.createGuestCheckout);
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={className} onClick={() => setOpen(true)}>
        {children}
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
