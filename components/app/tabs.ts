export interface TabDef {
  href: string;
  label: string;
  icon: string;
  /** Free tabs are usable before purchase; others are gated. */
  free?: boolean;
}

export const TABS: TabDef[] = [
  { href: "/app", label: "Dashboard", icon: "🏠", free: true },
  { href: "/app/vaccines", label: "Vaccines", icon: "💉" },
  { href: "/app/medications", label: "Meds", icon: "💊" },
  { href: "/app/vet-visits", label: "Vet visits", icon: "🩺" },
  { href: "/app/weight", label: "Weight", icon: "⚖️" },
  { href: "/app/grooming", label: "Grooming", icon: "🛁" },
  { href: "/app/expenses", label: "Expenses", icon: "🧾" },
  { href: "/app/sitter-sheet", label: "Sitter sheet", icon: "📋" },
];
