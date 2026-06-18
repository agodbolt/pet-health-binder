"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePet } from "@/components/app/PetContext";
import { EmptyState } from "@/components/EmptyState";
import { SPECIES_EMOJI } from "@/lib/defaults";
import { ageFromBirthday, today } from "@/lib/dates";

interface MedRow {
  _id: string;
  name: string;
  dose?: string;
  frequency: string;
  instructions?: string;
  archived: boolean;
}
interface Sheet {
  vetName?: string;
  vetPhone?: string;
  emergencyVet?: string;
  ownerName?: string;
  ownerPhone?: string;
}

export default function EmergencyKitPage() {
  const { pet, hasPack } = usePet();
  const petId = pet?._id;
  const meds = (useQuery(
    api.medications.list,
    petId ? { petId } : "skip"
  ) ?? []) as MedRow[];

  if (!pet) return null;

  if (!hasPack) {
    return (
      <div className="stack gap-3 fadeup">
        <h1 style={{ fontSize: "1.9rem" }}>Pet Emergency Kit</h1>
        <EmptyState emoji="🚑" title="This is part of the Pet Emergency Kit">
          The Emergency Kit is the $9 add-on offered at checkout. It prints a
          wallet emergency card, a fridge medication chart, and a lost-pet flyer,
          all filled in from your binder. You don&apos;t have it on this account
          yet.
        </EmptyState>
      </div>
    );
  }

  const sheet = (pet.sitterSheet ?? {}) as Sheet;
  const active = meds.filter((m) => !m.archived);
  const emoji = SPECIES_EMOJI[pet.species];

  return (
    <div className="stack gap-3 fadeup">
      <div className="row" style={{ justifyContent: "space-between" }} data-noprint>
        <div>
          <span className="eyebrow">Print &amp; keep</span>
          <h1 style={{ fontSize: "1.9rem" }}>Pet Emergency Kit</h1>
        </div>
        <button className="btn btn-accent" onClick={() => window.print()}>
          🖨️ Print the kit
        </button>
      </div>
      <p className="muted" data-noprint style={{ marginTop: -8 }}>
        Three things to print: a wallet card for your bag, a chart for the fridge,
        and a lost-pet flyer ready to go. Fill in the contact details on the{" "}
        <strong>Sitter sheet</strong> tab and they&apos;ll appear here too.
      </p>

      {/* 1. Wallet emergency card */}
      <div className="card print-page" style={{ maxWidth: 460 }}>
        <div className="eyebrow" data-noprint style={{ marginBottom: 8 }}>
          Wallet card
        </div>
        <div
          style={{
            border: "2px dashed var(--line)",
            borderRadius: 14,
            padding: 16,
          }}
        >
          <div className="row gap-1" style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 26 }}>{emoji}</span>
            <div>
              <strong style={{ fontSize: "1.05rem" }}>{pet.name}</strong>
              <div className="faint" style={{ fontSize: "0.78rem" }}>
                {[pet.breed, pet.birthday && ageFromBirthday(pet.birthday, today())]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
          </div>
          <KV label="Microchip" value={pet.microchip} />
          <KV
            label="Meds"
            value={
              active.length
                ? active.map((m) => `${m.name}${m.dose ? ` (${m.dose})` : ""}`).join(", ")
                : "None"
            }
          />
          <KV label="Vet" value={[sheet.vetName, sheet.vetPhone].filter(Boolean).join(" · ")} />
          <KV label="Emergency vet" value={sheet.emergencyVet} />
          <KV label="Owner" value={[sheet.ownerName, sheet.ownerPhone].filter(Boolean).join(" · ")} />
        </div>
      </div>

      {/* 2. Fridge medication chart */}
      <div className="card print-page">
        <div className="eyebrow" data-noprint style={{ marginBottom: 8 }}>
          Fridge chart
        </div>
        <h2 style={{ fontSize: "1.3rem", marginBottom: 4 }}>
          {pet.name}&apos;s medications
        </h2>
        {active.length === 0 ? (
          <p className="muted">No current medications.</p>
        ) : (
          <table className="table" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dose</th>
                <th>When / how</th>
              </tr>
            </thead>
            <tbody>
              {active.map((m) => (
                <tr key={m._id}>
                  <td style={{ fontWeight: 600 }}>{m.name}</td>
                  <td>{m.dose || "—"}</td>
                  <td>{m.instructions || m.frequency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {sheet.emergencyVet && (
          <p style={{ marginTop: 12 }}>
            <strong style={{ color: "var(--forest)" }}>Emergency vet:</strong>{" "}
            {sheet.emergencyVet}
          </p>
        )}
      </div>

      {/* 3. Lost-pet flyer */}
      <div className="card print-page center" style={{ padding: 28 }}>
        <div className="eyebrow" data-noprint style={{ marginBottom: 8, textAlign: "left" }}>
          Lost-pet flyer
        </div>
        <div
          style={{
            fontFamily: "var(--font-head)",
            fontSize: "2.4rem",
            color: "var(--terracotta-deep)",
            letterSpacing: "0.04em",
          }}
        >
          HAVE YOU SEEN ME?
        </div>
        {pet.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={pet.photoUrl}
            alt={pet.name}
            style={{ width: 200, height: 200, objectFit: "cover", borderRadius: 16, margin: "16px auto" }}
          />
        ) : (
          <div style={{ fontSize: 90, margin: "12px 0" }}>{emoji}</div>
        )}
        <h2 style={{ fontSize: "2rem" }}>{pet.name}</h2>
        <p className="muted" style={{ margin: "4px 0 16px" }}>
          {[pet.breed, pet.microchip && `Microchip ${pet.microchip}`]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p style={{ fontSize: "1.2rem", fontWeight: 600 }}>
          If found, please call{" "}
          {sheet.ownerPhone || "[add your phone on the Sitter sheet tab]"}
        </p>
        {sheet.ownerName && <p className="muted">Ask for {sheet.ownerName}</p>}
      </div>
    </div>
  );
}

function KV({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "92px 1fr", gap: 8, padding: "3px 0", fontSize: "0.88rem" }}>
      <strong style={{ color: "var(--forest)" }}>{label}</strong>
      <span>{value || "—"}</span>
    </div>
  );
}
