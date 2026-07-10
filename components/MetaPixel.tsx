"use client";

import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

export const PIXEL_ID = "1020983093776998";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Safe wrapper — fires a Meta event only if the pixel has loaded.
 *  Pass eventId when the same event is also sent server-side (Conversions
 *  API) so Meta can de-duplicate the pair. */
export function fbqTrack(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
  attempt = 0
) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq !== "function") {
    // fbevents.js may not have run yet (e.g. arriving back from Stripe).
    // Retry briefly instead of silently dropping the event.
    if (attempt < 20) {
      setTimeout(() => fbqTrack(event, params, eventId, attempt + 1), 500);
    }
    return;
  }
  if (eventId) {
    window.fbq("track", event, params, { eventID: eventId });
  } else {
    window.fbq("track", event, params);
  }
}

/** Read Meta's browser identifiers so checkout can carry them to the server.
 *  _fbc exists when the visitor arrived through an ad click (it embeds the
 *  fbclid); _fbp identifies the browser. Both power Ads Manager attribution
 *  for the server-side Purchase event. */
export function metaBrowserIds(): {
  fbp?: string;
  fbc?: string;
  userAgent?: string;
} {
  if (typeof document === "undefined") return {};
  const read = (name: string) =>
    document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${name}=`))
      ?.split("=")
      .slice(1)
      .join("=");
  const out: { fbp?: string; fbc?: string; userAgent?: string } = {};
  const fbp = read("_fbp");
  const fbc = read("_fbc");
  if (fbp) out.fbp = fbp;
  if (fbc) out.fbc = fbc;
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    out.userAgent = navigator.userAgent;
  }
  return out;
}

// Fire PageView on client-side route changes (the inline snippet covers the
// first load; this covers SPA navigations after it).
function PageViewTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    fbqTrack("PageView");
  }, [pathname, search]);
  return null;
}

export function MetaPixel() {
  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${PIXEL_ID}');
fbq('track', 'PageView');`}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
      <Suspense fallback={null}>
        <PageViewTracker />
      </Suspense>
    </>
  );
}
