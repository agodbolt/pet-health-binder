import { ReactNode } from "react";
import { PawField } from "./PawMotif";

export function EmptyState({
  emoji,
  title,
  children,
  action,
}: {
  emoji?: string;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <PawField />
      <div style={{ position: "relative" }}>
        {emoji && (
          <div style={{ fontSize: "2.4rem", marginBottom: 8 }}>{emoji}</div>
        )}
        <h3>{title}</h3>
        <p>{children}</p>
        {action}
      </div>
    </div>
  );
}
