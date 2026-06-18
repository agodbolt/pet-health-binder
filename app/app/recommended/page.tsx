"use client";

import { usePet } from "@/components/app/PetContext";
import {
  AMAZON_DISCLOSURE,
  RECOMMENDED,
  type RecommendedProduct,
  type RecommendedSection,
} from "@/lib/recommended";

const SECTION_ORDER: RecommendedSection[] = [
  "Emergency",
  "Medications",
  "Weight",
  "Grooming",
  "Travel & sitter",
];

export default function RecommendedPage() {
  const { pet } = usePet();
  if (!pet) return null;

  const grouped = SECTION_ORDER.map((section) => ({
    section,
    items: RECOMMENDED.filter((p) => p.section === section),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="stack gap-3 fadeup">
      <div>
        <span className="eyebrow">Gear we&apos;d grab</span>
        <h1 style={{ fontSize: "1.9rem" }}>Recommended for {pet.name}</h1>
        <p className="muted" style={{ marginTop: 4 }}>
          A short list of things that make caring for {pet.name} a little easier.
        </p>
      </div>

      {grouped.map((group) => (
        <div key={group.section} className="stack gap-2">
          <h2 className="section-title">{group.section}</h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: 16,
            }}
          >
            {group.items.map((p) => (
              <GearCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      ))}

      <p className="faint" style={{ fontSize: ".78rem" }}>
        {AMAZON_DISCLOSURE}
      </p>
    </div>
  );
}

function GearCard({ product }: { product: RecommendedProduct }) {
  return (
    <div className="card lift">
      <div className="stack gap-2">
        <div style={{ fontWeight: 600 }}>{product.name}</div>
        <p className="muted" style={{ margin: 0 }}>
          {product.blurb}
        </p>
        {product.url !== "" ? (
          <a
            className="btn btn-ghost btn-sm"
            href={product.url}
            target="_blank"
            rel="sponsored nofollow noopener"
          >
            View on Amazon
          </a>
        ) : (
          <span className="chip chip-neutral">Link coming soon</span>
        )}
      </div>
    </div>
  );
}
