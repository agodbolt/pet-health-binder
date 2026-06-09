"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { usePet } from "@/components/app/PetContext";
import { COMMON_VACCINES, SPECIES_EMOJI, SPECIES_LABEL } from "@/lib/defaults";
import { dueStatus, today } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/Modal";

// Vaccines get a longer "coming up" window than the 30-day dashboard default —
// boosters are usually booked weeks ahead, so we flag them 60 days out.
const SOON_DAYS = 60;

interface VaccineRow {
  _id: Id<"vaccines">;
  name: string;
  dateGiven?: string;
  dueDate?: string;
  clinic?: string;
  lot?: string;
  notes?: string;
}

interface FormState {
  name: string;
  dateGiven: string;
  dueDate: string;
  clinic: string;
  lot: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  dateGiven: "",
  dueDate: "",
  clinic: "",
  lot: "",
  notes: "",
};

export default function VaccinesPage() {
  return (
    <Suspense fallback={null}>
      <VaccinesInner />
    </Suspense>
  );
}

function VaccinesInner() {
  const { pet } = usePet();
  const petId = pet?._id;
  const skip = petId ? { petId } : "skip";

  const search = useSearchParams();
  const vaccines = (useQuery(api.vaccines.list, skip) ?? []) as VaccineRow[];
  const add = useMutation(api.vaccines.add);
  const update = useMutation(api.vaccines.update);
  const remove = useMutation(api.vaccines.remove);

  const [showAdd, setShowAdd] = useState(search.get("add") === "1");
  const [editing, setEditing] = useState<VaccineRow | null>(null);

  if (!pet) return null;
  const now = today();

  const suggestions = COMMON_VACCINES[pet.species] ?? [];

  async function handleDelete(row: VaccineRow) {
    if (!confirm(`Remove the ${row.name} record? This can't be undone.`)) return;
    await remove({ id: row._id });
  }

  // newest-given first, then anything without a date trails behind
  const sorted = [...vaccines].sort((a, b) =>
    (b.dateGiven ?? "").localeCompare(a.dateGiven ?? "")
  );

  return (
    <div className="stack gap-3 fadeup">
      {/* header */}
      <div
        className="row wrap"
        style={{ justifyContent: "space-between", gap: 12 }}
        data-noprint
      >
        <div>
          <span className="eyebrow">{pet.name}</span>
          <h1 style={{ fontSize: "1.9rem" }}>Vaccines</h1>
        </div>
        <div className="row gap-2 wrap">
          {vaccines.length > 0 && (
            <button className="btn btn-ghost" onClick={() => window.print()}>
              🖨️ Print vaccine record
            </button>
          )}
          <button className="btn btn-accent" onClick={() => setShowAdd(true)}>
            + Add vaccine
          </button>
        </div>
      </div>

      {/* list or empty state */}
      <div className="card" data-noprint>
        {sorted.length === 0 ? (
          <EmptyState
            emoji="💉"
            title="No vaccines on file yet"
            action={
              <button className="btn btn-accent" onClick={() => setShowAdd(true)}>
                + Add the first one
              </button>
            }
          >
            Boarding facilities and groomers almost always ask for an up-to-date
            vaccine record before {pet.name} can stay or come in. Add each shot
            here once and you&apos;ll have it ready to print whenever they ask.
          </EmptyState>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Vaccine</th>
                  <th>Given</th>
                  <th>Due</th>
                  <th>Status</th>
                  <th>Clinic</th>
                  <th style={{ width: 1 }}></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => {
                  const s = dueStatus(row.dueDate, now, SOON_DAYS);
                  return (
                    <tr key={row._id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{row.name}</div>
                        {row.lot && (
                          <div className="faint" style={{ fontSize: "0.8rem" }}>
                            Lot {row.lot}
                          </div>
                        )}
                      </td>
                      <td>{formatDate(row.dateGiven)}</td>
                      <td>{formatDate(row.dueDate)}</td>
                      <td>
                        <StatusChip level={s.level} days={s.days} />
                      </td>
                      <td>{row.clinic || <span className="faint">—</span>}</td>
                      <td>
                        <div className="row gap-1" style={{ justifyContent: "flex-end" }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setEditing(row)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleDelete(row)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* add modal */}
      {showAdd && (
        <VaccineModal
          title="Add a vaccine"
          suggestions={suggestions}
          onClose={() => setShowAdd(false)}
          onSave={async (form) => {
            await add({
              petId: pet._id,
              name: form.name.trim(),
              dateGiven: form.dateGiven || undefined,
              dueDate: form.dueDate || undefined,
              clinic: form.clinic.trim() || undefined,
              lot: form.lot.trim() || undefined,
              notes: form.notes.trim() || undefined,
            });
            setShowAdd(false);
          }}
        />
      )}

      {/* edit modal */}
      {editing && (
        <VaccineModal
          title="Edit vaccine"
          suggestions={suggestions}
          initial={{
            name: editing.name,
            dateGiven: editing.dateGiven ?? "",
            dueDate: editing.dueDate ?? "",
            clinic: editing.clinic ?? "",
            lot: editing.lot ?? "",
            notes: editing.notes ?? "",
          }}
          onClose={() => setEditing(null)}
          onSave={async (form) => {
            await update({
              id: editing._id,
              name: form.name.trim(),
              dateGiven: form.dateGiven || undefined,
              dueDate: form.dueDate || undefined,
              clinic: form.clinic.trim() || undefined,
              lot: form.lot.trim() || undefined,
              notes: form.notes.trim() || undefined,
            });
            setEditing(null);
          }}
        />
      )}

      {/* print-only vaccination certificate */}
      <div className="print-only print-page">
        <h1 style={{ fontSize: "1.6rem", marginBottom: 4 }}>Vaccination Record</h1>
        <p style={{ margin: "0 0 4px" }}>
          {SPECIES_EMOJI[pet.species]} <strong>{pet.name}</strong> ·{" "}
          {SPECIES_LABEL[pet.species]}
          {pet.breed ? ` · ${pet.breed}` : ""}
        </p>
        <p style={{ margin: "0 0 16px", fontSize: "0.9rem" }}>
          Microchip: {pet.microchip || "—"} · Printed {formatDate(now)}
        </p>
        <table className="table">
          <thead>
            <tr>
              <th>Vaccine</th>
              <th>Date given</th>
              <th>Due date</th>
              <th>Clinic</th>
              <th>Lot</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5}>No vaccines recorded.</td>
              </tr>
            ) : (
              sorted.map((row) => (
                <tr key={row._id}>
                  <td>{row.name}</td>
                  <td>{formatDate(row.dateGiven)}</td>
                  <td>{formatDate(row.dueDate)}</td>
                  <td>{row.clinic || "—"}</td>
                  <td>{row.lot || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VaccineModal({
  title,
  suggestions,
  initial,
  onClose,
  onSave,
}: {
  title: string;
  suggestions: string[];
  initial?: FormState;
  onClose: () => void;
  onSave: (form: FormState) => Promise<void>;
}) {
  const [form, setForm] = useState<FormState>(initial ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  async function submit() {
    if (!form.name.trim() || saving) return;
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-accent"
            onClick={submit}
            disabled={!form.name.trim() || saving}
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <div className="field">
        <label htmlFor="vac-name">Vaccine</label>
        <input
          id="vac-name"
          className="input"
          list="vac-suggestions"
          placeholder="Start typing, e.g. Rabies"
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
        />
        <datalist id="vac-suggestions">
          {suggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="vac-given">Date given</label>
          <input
            id="vac-given"
            type="date"
            className="input"
            value={form.dateGiven}
            onChange={(e) => set("dateGiven", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="vac-due">Next due</label>
          <input
            id="vac-due"
            type="date"
            className="input"
            value={form.dueDate}
            onChange={(e) => set("dueDate", e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="vac-clinic">Clinic</label>
        <input
          id="vac-clinic"
          className="input"
          placeholder="Where the shot was given"
          value={form.clinic}
          onChange={(e) => set("clinic", e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="vac-lot">Lot number (optional)</label>
        <input
          id="vac-lot"
          className="input"
          placeholder="From the vial label, if you have it"
          value={form.lot}
          onChange={(e) => set("lot", e.target.value)}
        />
      </div>

      <div className="field" style={{ marginBottom: 0 }}>
        <label htmlFor="vac-notes">Notes</label>
        <textarea
          id="vac-notes"
          className="textarea"
          placeholder="Anything you want to remember for next time"
          value={form.notes}
          onChange={(e) => set("notes", e.target.value)}
        />
      </div>
    </Modal>
  );
}
