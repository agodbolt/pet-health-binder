"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SPECIES_EMOJI } from "@/lib/defaults";
import type { PetDoc } from "./PetContext";
import type { Id } from "@/convex/_generated/dataModel";

function Avatar({ pet, size = 34 }: { pet: PetDoc; size?: number }) {
  return pet.photoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={pet.photoUrl}
      alt=""
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
      }}
    />
  ) : (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "var(--forest-soft)",
        display: "grid",
        placeItems: "center",
        fontSize: size * 0.5,
      }}
    >
      {SPECIES_EMOJI[pet.species]}
    </span>
  );
}

export function PetSwitcher({
  pets,
  activeId,
  onAdd,
}: {
  pets: PetDoc[];
  activeId: Id<"pets"> | null;
  onAdd: () => void;
}) {
  const updateSettings = useMutation(api.users.updateSettings);

  return (
    <div className="row gap-1 wrap" data-noprint>
      {pets.map((p) => {
        const active = p._id === activeId;
        return (
          <button
            key={p._id}
            onClick={() => updateSettings({ activePetId: p._id })}
            className="row gap-1"
            style={{
              border: "1.5px solid",
              borderColor: active ? "var(--forest)" : "var(--line)",
              background: active ? "var(--forest-soft)" : "var(--paper)",
              borderRadius: 999,
              padding: "4px 12px 4px 4px",
              cursor: "pointer",
              fontWeight: active ? 600 : 500,
              color: active ? "var(--forest)" : "var(--ink-soft)",
            }}
          >
            <Avatar pet={p} />
            {p.name}
          </button>
        );
      })}
      <button
        onClick={onAdd}
        className="row"
        title="Add a pet"
        style={{
          width: 38,
          height: 38,
          borderRadius: "50%",
          border: "1.5px dashed var(--line)",
          background: "var(--paper)",
          cursor: "pointer",
          justifyContent: "center",
          color: "var(--forest)",
          fontSize: 20,
        }}
      >
        +
      </button>
    </div>
  );
}
