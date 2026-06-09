"use client";

import { ReactNode, useEffect } from "react";

export function Modal({
  title,
  onClose,
  children,
  footer,
  wide,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      onMouseDown={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(42, 42, 40, 0.42)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "6vh 16px 16px",
        zIndex: 100,
        overflowY: "auto",
      }}
    >
      <div
        className="card fadeup"
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: wide ? 640 : 480,
          padding: 0,
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div
          className="row"
          style={{
            justifyContent: "space-between",
            padding: "18px 22px",
            borderBottom: "1px solid var(--line)",
          }}
        >
          <h3 style={{ fontSize: "1.25rem" }}>{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="linklike"
            style={{
              fontSize: "1.4rem",
              textDecoration: "none",
              color: "var(--ink-faint)",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>
        <div style={{ padding: "22px" }}>{children}</div>
        {footer && (
          <div
            className="row gap-2"
            style={{
              justifyContent: "flex-end",
              padding: "16px 22px",
              borderTop: "1px solid var(--line)",
              background: "var(--cream)",
              borderRadius: "0 0 var(--radius-lg) var(--radius-lg)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
