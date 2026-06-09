"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { usePet } from "@/components/app/PetContext";
import { SPECIES_EMOJI } from "@/lib/defaults";
import { ageFromBirthday, today } from "@/lib/dates";

interface Sheet {
  foodBrand?: string;
  foodAmount?: string;
  feedingTimes?: string;
  walkRoutine?: string;
  litterRoutine?: string;
  quirks?: string;
  vetName?: string;
  vetPhone?: string;
  emergencyVet?: string;
  ownerName?: string;
  ownerPhone?: string;
}

interface MedDoc {
  _id: Id<"medications">;
  name: string;
  dose?: string;
  instructions?: string;
  frequency: string;
  archived: boolean;
}

const FIELDS: { key: keyof Sheet; label: string; placeholder: string; area?: boolean }[] = [
  { key: "foodBrand", label: "Food brand", placeholder: "e.g. Purina Pro Plan Salmon" },
  { key: "foodAmount", label: "How much", placeholder: "e.g. 1.5 cups" },
  { key: "feedingTimes", label: "Feeding times", placeholder: "e.g. 7:30am and 6:00pm" },
  { key: "walkRoutine", label: "Walks / exercise", placeholder: "When and how long; anything to know", area: true },
  { key: "litterRoutine", label: "Litter / bathroom", placeholder: "Scooping, where it is, habits", area: true },
  { key: "quirks", label: "Good to know / quirks", placeholder: "e.g. Hides under the bed during storms", area: true },
  { key: "vetName", label: "Regular vet", placeholder: "Clinic name" },
  { key: "vetPhone", label: "Vet phone", placeholder: "(555) …" },
  { key: "emergencyVet", label: "Emergency vet", placeholder: "Name + 24hr phone number" },
  { key: "ownerName", label: "Your name", placeholder: "So the sitter knows who to reach" },
  { key: "ownerPhone", label: "Your phone", placeholder: "(555) …" },
];

export default function SitterSheetPage() {
  const { pet } = usePet();
  const petId = pet?._id;
  const skip = petId ? { petId } : "skip";

  const updatePet = useMutation(api.pets.update);
  const meds = (useQuery(api.medications.list, skip) ?? []) as MedDoc[];
  const visits = (useQuery(api.vetVisits.list, skip) ?? []) as {
    clinic?: string;
  }[];

  const [sheet, setSheet] = useState<Sheet>({});
  const [savedMsg, setSavedMsg] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load the saved sheet once the pet is available; auto-suggest the vet name
  // from the most recent vet visit if it's still blank.
  useEffect(() => {
    if (pet && !loaded) {
      const existing = (pet.sitterSheet ?? {}) as Sheet;
      const suggestedVet =
        existing.vetName || visits.find((v) => v.clinic)?.clinic || "";
      setSheet({ ...existing, vetName: suggestedVet });
      setLoaded(true);
    }
  }, [pet, loaded, visits]);

  if (!pet) return null;
  const activeMeds = meds.filter((m) => !m.archived);

  function set(key: keyof Sheet, value: string) {
    setSheet((s) => ({ ...s, [key]: value }));
  }

  async function save() {
    await updatePet({ petId: pet!._id, sitterSheet: sheet });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  }

  return (
    <div className="stack gap-3 fadeup">
      <div className="row" style={{ justifyContent: "space-between" }} data-noprint>
        <div>
          <span className="eyebrow">The one to hand your sitter</span>
          <h1 style={{ fontSize: "1.9rem" }}>Sitter sheet</h1>
        </div>
        <div className="row gap-1">
          <button className="btn btn-ghost" onClick={save}>
            {savedMsg ? "Saved ✓" : "Save"}
          </button>
          <button className="btn btn-accent" onClick={() => window.print()}>
            🖨️ Print sitter sheet
          </button>
        </div>
      </div>

      <p className="muted" data-noprint style={{ marginTop: -8 }}>
        Fill in whatever a sitter would need. Medications and your vet are pulled
        in from the rest of the binder, so this half-fills itself. Then print a
        calm one-page sheet to leave on the counter.
      </p>

      {/* editor */}
      <div className="card" data-noprint>
        <div className="field-row">
          {FIELDS.map((f) =>
            f.area ? (
              <div className="field" key={f.key} style={{ gridColumn: "1 / -1" }}>
                <label>{f.label}</label>
                <textarea
                  className="textarea"
                  value={sheet[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              </div>
            ) : (
              <div className="field" key={f.key}>
                <label>{f.label}</label>
                <input
                  className="input"
                  value={sheet[f.key] ?? ""}
                  onChange={(e) => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                />
              </div>
            )
          )}
        </div>
      </div>

      {/* printable preview */}
      <div className="card print-page" style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            background: "var(--forest)",
            color: "#fff",
            padding: "22px 26px",
            display: "flex",
            gap: 18,
            alignItems: "center",
          }}
        >
          {pet.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pet.photoUrl}
              alt={pet.name}
              style={{ width: 74, height: 74, borderRadius: 16, objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 74,
                height: 74,
                borderRadius: 16,
                background: "rgba(255,255,255,0.15)",
                display: "grid",
                placeItems: "center",
                fontSize: 38,
              }}
            >
              {SPECIES_EMOJI[pet.species]}
            </div>
          )}
          <div>
            <div
              style={{
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                fontSize: "0.72rem",
                opacity: 0.85,
              }}
            >
              While you&apos;re away
            </div>
            <h2 style={{ color: "#fff", fontSize: "1.9rem" }}>
              Caring for {pet.name}
            </h2>
            <div style={{ opacity: 0.9, fontSize: "0.9rem" }}>
              {[
                pet.breed,
                pet.birthday && ageFromBirthday(pet.birthday, today()),
                pet.microchip && `Microchip ${pet.microchip}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </div>
          </div>
        </div>

        <div style={{ padding: "8px 26px 26px" }}>
          <SheetSection title="🍽️ Feeding">
            {sheet.foodBrand || sheet.foodAmount || sheet.feedingTimes ? (
              <p style={{ margin: "4px 0" }}>
                {[
                  sheet.foodAmount,
                  sheet.foodBrand && `of ${sheet.foodBrand}`,
                  sheet.feedingTimes && `— ${sheet.feedingTimes}`,
                ]
                  .filter(Boolean)
                  .join(" ")}
              </p>
            ) : (
              <Blank />
            )}
          </SheetSection>

          <SheetSection title="💊 Medications">
            {activeMeds.length > 0 ? (
              <ul style={{ margin: "4px 0", paddingLeft: 18 }}>
                {activeMeds.map((m) => (
                  <li key={m._id} style={{ marginBottom: 4 }}>
                    <strong>{m.name}</strong>
                    {m.dose ? ` (${m.dose})` : ""} —{" "}
                    {m.instructions || m.frequency}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted" style={{ margin: "4px 0" }}>
                No current medications.
              </p>
            )}
          </SheetSection>

          {pet.species === "cat" ? (
            <SheetSection title="🪴 Litter">
              {sheet.litterRoutine ? <p style={{ margin: "4px 0" }}>{sheet.litterRoutine}</p> : <Blank />}
            </SheetSection>
          ) : (
            <SheetSection title="🚶 Walks & exercise">
              {sheet.walkRoutine ? <p style={{ margin: "4px 0" }}>{sheet.walkRoutine}</p> : <Blank />}
            </SheetSection>
          )}

          <SheetSection title="💡 Good to know">
            {sheet.quirks ? <p style={{ margin: "4px 0" }}>{sheet.quirks}</p> : <Blank />}
          </SheetSection>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginTop: 14,
              borderTop: "1px solid var(--line)",
              paddingTop: 14,
            }}
          >
            <Contact title="Regular vet" name={sheet.vetName} phone={sheet.vetPhone} />
            <Contact title="Emergency vet" name={sheet.emergencyVet} />
            <Contact title="Owner" name={sheet.ownerName} phone={sheet.ownerPhone} />
            <Contact title="Microchip #" name={pet.microchip} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SheetSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
      <div style={{ fontWeight: 700, color: "var(--forest)", marginBottom: 2 }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function Contact({ title, name, phone }: { title: string; name?: string; phone?: string }) {
  return (
    <div>
      <div
        className="faint"
        style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}
      >
        {title}
      </div>
      <div style={{ fontWeight: 600 }}>{name || "—"}</div>
      {phone && <div className="muted">{phone}</div>}
    </div>
  );
}

function Blank() {
  return (
    <p className="faint" style={{ margin: "4px 0", fontStyle: "italic" }}>
      (add this above so your sitter has it)
    </p>
  );
}
