"use client";

import { useEffect, useRef, useState, ReactNode } from "react";

/**
 * Fades + lifts its children into view on scroll. Starts hidden only after
 * mount, so if JS is off the content still shows.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  style,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    setArmed(true); // only hide once JS has mounted
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const cls =
    `${className} ` + (!armed ? "" : shown ? "reveal reveal--in" : "reveal");

  return (
    <div
      ref={ref}
      className={cls.trim()}
      style={{ transitionDelay: `${delay}ms`, ...style }}
    >
      {children}
    </div>
  );
}
