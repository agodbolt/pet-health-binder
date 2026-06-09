"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TABS } from "./tabs";
import { Paw } from "../PawMotif";

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <aside
      className="app-nav sidebar-nav"
      data-noprint
      style={{
        width: 232,
        flexShrink: 0,
        borderRight: "1px solid var(--line)",
        background: "var(--paper)",
        padding: "22px 16px",
        position: "sticky",
        top: 0,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Link
        href="/app"
        className="row gap-1"
        style={{ color: "var(--forest)", fontWeight: 600, marginBottom: 18, padding: "0 8px" }}
      >
        <Paw size={24} color="var(--terracotta)" />
        <span style={{ fontFamily: "var(--font-head)", fontSize: "1.1rem" }}>
          Health Binder
        </span>
      </Link>
      {TABS.map((t) => {
        const active =
          t.href === "/app" ? pathname === "/app" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className="row gap-1"
            style={{
              padding: "10px 12px",
              borderRadius: 12,
              fontWeight: active ? 600 : 500,
              color: active ? "var(--forest)" : "var(--ink-soft)",
              background: active ? "var(--forest-soft)" : "transparent",
              textDecoration: "none",
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      className="app-nav bottom-nav"
      data-noprint
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--paper)",
        borderTop: "1px solid var(--line)",
        display: "flex",
        justifyContent: "space-around",
        padding: "6px 2px env(safe-area-inset-bottom)",
        zIndex: 40,
      }}
    >
      {TABS.map((t) => {
        const active =
          t.href === "/app" ? pathname === "/app" : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              fontSize: "0.62rem",
              padding: "4px 2px",
              color: active ? "var(--forest)" : "var(--ink-faint)",
              fontWeight: active ? 600 : 500,
              textDecoration: "none",
              flex: 1,
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
