"use client";

import { useEffect } from "react";
import { fbqTrack } from "@/components/MetaPixel";

/** Fires Meta ViewContent once when the sales page loads. */
export function TrackViewContent() {
  useEffect(() => {
    fbqTrack("ViewContent", {
      content_name: "Pet Health Binder",
      content_category: "sales-page",
      value: 19,
      currency: "USD",
    });
  }, []);
  return null;
}
