"use client";

import { AMAZON_DISCLOSURE, RECOMMENDED } from "@/lib/recommended";

export function RecommendedGear({
  limit,
  title,
}: {
  limit?: number;
  title?: string;
}) {
  const linked = RECOMMENDED.filter((p) => p.url !== "");
  const shown = typeof limit === "number" ? linked.slice(0, limit) : linked;

  // Nothing to show until the owner adds at least one affiliate link.
  if (shown.length === 0) return null;

  return (
    <div className="stack gap-2">
      {title && <h2 className="section-title">{title}</h2>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: 16,
        }}
      >
        {shown.map((p) => (
          <div key={p.id} className="card lift">
            <div className="stack gap-2">
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <p className="muted" style={{ margin: 0 }}>
                {p.blurb}
              </p>
              <a
                className="btn btn-ghost btn-sm"
                href={p.url}
                target="_blank"
                rel="sponsored nofollow noopener"
              >
                View on Amazon
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="faint" style={{ fontSize: ".78rem" }}>
        {AMAZON_DISCLOSURE}
      </p>
    </div>
  );
}
