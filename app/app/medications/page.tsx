"use client";

import { useState, Suspense } from "react";
import { useQuery, useMutation } from "convex/react";
import { useSearchParams } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { usePet } from "@/components/app/PetContext";
import { Modal } from "@/components/Modal";
import { EmptyState } from "@/components/EmptyState";
import { StatusChip } from "@/components/StatusChip";
import { MED_FREQUENCIES } from "@/lib/defaults";
import { dueStatus, today } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import {
  slotsPerDay,
  toggleDose,
  isCheckedToday,
  streak,
  type Frequency,
  type DoseLog,
} from "@/lib/meds";

interface MedDoc {
  _id: Id<"medications">;
  name: string;
  dose?: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  ongoing: boolean;
  refillBy?: string;
  vet?: string;
  notes?: string;
  instructions?: string;
  archived: boolean;
  doseLog?: DoseLog;
}

const SLOT_LABELS: Record<number, string[]> = {
  1: ["Today"],
  2: ["Morning", "Evening"],
};

export default function MedicationsPage() {
  return (
    <Suspense fallback={null}>
      <MedicationsInner />
    </Suspense>
  );
}

function MedicationsInner() {
  const { pet } = usePet();
  const petId = pet?._id;
  const skip = petId ? { petId } : "skip";
  const search = useSearchParams();

  const meds = (useQuery(api.medications.list, skip) ?? []) as MedDoc[];
  const addMed = useMutation(api.medications.add);
  const updateMed = useMutation(api.medications.update);
  const setDoseLog = useMutation(api.medications.setDoseLog);
  const removeMed = useMutation(api.medications.remove);

  const [showForm, setShowForm] = useState(search.get("add") === "1");
  const [editing, setEditing] = useState<MedDoc | null>(null);
  const [showArchived, setShowArchived] = useState(false);

  if (!pet) return null;

  const active = meds.filter((m) => !m.archived);
  const archived = meds.filter((m) => m.archived);

  function openAdd() {
    setEditing(null);
    setShowForm(true);
  }
  function openEdit(m: MedDoc) {
    setEditing(m);
    setShowForm(true);
  }

  async function toggle(m: MedDoc, index: number) {
    const freq = m.frequency as Frequency;
    const count = slotsPerDay(freq);
    const next = toggleDose(m.doseLog ?? {}, index, today(), count);
    await setDoseLog({ id: m._id, doseLog: next });
  }

  return (
    <div className="stack gap-3 fadeup">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <span className="eyebrow">Stay on schedule</span>
          <h1 style={{ fontSize: "1.9rem" }}>Medications</h1>
        </div>
        <button className="btn btn-accent" onClick={openAdd} data-noprint>
          + Add medication
        </button>
      </div>

      {active.length === 0 ? (
        <EmptyState
          emoji="💊"
          title="No medications yet"
          action={
            <button className="btn btn-accent" onClick={openAdd}>
              + Add medication
            </button>
          }
        >
          Add anything {pet.name} takes — daily pills, monthly heartworm, a short
          course of antibiotics. You&apos;ll get a simple daily checklist so you
          never have to wonder whether the morning dose happened.
        </EmptyState>
      ) : (
        <div className="stack gap-2">
          {/* TODAY checklist */}
          <div className="card">
            <h2 className="section-title">Today&apos;s doses</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Tap each dose as you give it. The checklist resets every morning.
            </p>
            <div className="stack gap-1" style={{ marginTop: 8 }}>
              {active.map((m) => {
                const freq = m.frequency as Frequency;
                const count = slotsPerDay(freq);
                const labels = SLOT_LABELS[count] ?? ["Today"];
                const s = streak(freq, m.doseLog ?? {}, today());
                const asNeeded = freq === "as-needed";
                const weekly = freq === "weekly" || freq === "monthly";
                return (
                  <div
                    key={m._id}
                    className="row gap-2"
                    style={{
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      borderRadius: 14,
                      background: "var(--cream)",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>
                        {m.name}{" "}
                        <span className="faint" style={{ fontWeight: 400 }}>
                          {m.dose ? `· ${m.dose}` : ""} · {m.frequency}
                        </span>
                      </div>
                      {s > 0 && (
                        <div
                          className="faint"
                          style={{ fontSize: "0.8rem", marginTop: 2 }}
                        >
                          🔥 {s}-day streak
                        </div>
                      )}
                    </div>
                    <div className="row gap-1" data-noprint>
                      {asNeeded || weekly ? (
                        <DoseButton
                          checked={isCheckedToday(m.doseLog ?? {}, 0, today())}
                          label={asNeeded ? "Given" : "Done"}
                          onClick={() => toggle(m, 0)}
                        />
                      ) : (
                        labels.map((label, i) => (
                          <DoseButton
                            key={i}
                            checked={isCheckedToday(m.doseLog ?? {}, i, today())}
                            label={label}
                            onClick={() => toggle(m, i)}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* med details */}
          <div className="card">
            <h2 className="section-title">Active medications</h2>
            <div className="stack" style={{ marginTop: 8 }}>
              {active.map((m) => {
                const refill = dueStatus(m.refillBy, today(), 30);
                return (
                  <div
                    key={m._id}
                    className="row gap-2"
                    style={{
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600 }}>
                        {m.name} {m.dose && <span className="faint">· {m.dose}</span>}
                      </div>
                      <div className="muted" style={{ fontSize: "0.86rem" }}>
                        {m.frequency}
                        {m.instructions ? ` — ${m.instructions}` : ""}
                        {m.vet ? ` · ${m.vet}` : ""}
                      </div>
                      {m.refillBy && (
                        <div style={{ marginTop: 6 }}>
                          <span className="faint" style={{ fontSize: "0.8rem" }}>
                            Refill by {formatDate(m.refillBy)}{" "}
                          </span>
                          {(refill.level === "overdue" ||
                            refill.level === "due-soon") && (
                            <StatusChip level={refill.level} days={refill.days} />
                          )}
                        </div>
                      )}
                    </div>
                    <div className="row gap-1" data-noprint>
                      <button className="linklike" onClick={() => openEdit(m)}>
                        Edit
                      </button>
                      <button
                        className="linklike"
                        onClick={() => updateMed({ id: m._id, archived: true })}
                      >
                        Archive
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* archived */}
      {archived.length > 0 && (
        <div className="card" data-noprint>
          <button
            className="row gap-1"
            onClick={() => setShowArchived((v) => !v)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              font: "inherit",
              fontWeight: 600,
            }}
          >
            {showArchived ? "▾" : "▸"} Archived medications ({archived.length})
          </button>
          {showArchived && (
            <div className="stack" style={{ marginTop: 10 }}>
              {archived.map((m) => (
                <div
                  key={m._id}
                  className="row gap-2"
                  style={{ justifyContent: "space-between", padding: "8px 0" }}
                >
                  <span className="muted">
                    {m.name} {m.dose && `· ${m.dose}`}{" "}
                    {m.endDate && (
                      <span className="faint">· ended {formatDate(m.endDate)}</span>
                    )}
                  </span>
                  <div className="row gap-1">
                    <button
                      className="linklike"
                      onClick={() => updateMed({ id: m._id, archived: false })}
                    >
                      Restore
                    </button>
                    <button
                      className="linklike"
                      style={{ color: "var(--red)" }}
                      onClick={() => {
                        if (confirm(`Delete ${m.name}? This can't be undone.`))
                          removeMed({ id: m._id });
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <MedForm
          petId={pet._id}
          editing={editing}
          onClose={() => setShowForm(false)}
          onSave={async (data) => {
            if (editing) await updateMed({ id: editing._id, ...data });
            else await addMed({ petId: pet._id, ...data });
            setShowForm(false);
          }}
          onDelete={
            editing
              ? async () => {
                  if (confirm(`Delete ${editing.name}? This can't be undone.`)) {
                    await removeMed({ id: editing._id });
                    setShowForm(false);
                  }
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function DoseButton({
  checked,
  label,
  onClick,
}: {
  checked: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="chip"
      style={{
        cursor: "pointer",
        border: "1.5px solid",
        borderColor: checked ? "var(--green-ok)" : "var(--line)",
        background: checked ? "var(--forest-soft)" : "var(--paper)",
        color: checked ? "var(--green-ok)" : "var(--ink-soft)",
        padding: "8px 14px",
        transition: "transform 0.12s ease",
        transform: checked ? "scale(1.02)" : "scale(1)",
      }}
    >
      {checked ? "✓" : "○"} {label}
    </button>
  );
}

interface MedFormData {
  name: string;
  dose?: string;
  frequency: string;
  startDate?: string;
  endDate?: string;
  ongoing: boolean;
  refillBy?: string;
  vet?: string;
  instructions?: string;
  notes?: string;
}

function MedForm({
  petId,
  editing,
  onClose,
  onSave,
  onDelete,
}: {
  petId: Id<"pets">;
  editing: MedDoc | null;
  onClose: () => void;
  onSave: (data: MedFormData) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [dose, setDose] = useState(editing?.dose ?? "");
  const [frequency, setFrequency] = useState(editing?.frequency ?? "daily");
  const [startDate, setStartDate] = useState(editing?.startDate ?? today());
  const [ongoing, setOngoing] = useState(editing?.ongoing ?? true);
  const [endDate, setEndDate] = useState(editing?.endDate ?? "");
  const [refillBy, setRefillBy] = useState(editing?.refillBy ?? "");
  const [vet, setVet] = useState(editing?.vet ?? "");
  const [instructions, setInstructions] = useState(editing?.instructions ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    await onSave({
      name: name.trim(),
      dose: dose.trim() || undefined,
      frequency,
      startDate: startDate || undefined,
      ongoing,
      endDate: ongoing ? undefined : endDate || undefined,
      refillBy: refillBy || undefined,
      vet: vet.trim() || undefined,
      instructions: instructions.trim() || undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Modal
      title={editing ? "Edit medication" : "Add medication"}
      onClose={onClose}
      wide
    >
      <form onSubmit={submit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="mname">Name</label>
            <input
              id="mname"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Apoquel"
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="mdose">Dose</label>
            <input
              id="mdose"
              className="input"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              placeholder="e.g. 16 mg"
            />
          </div>
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="mfreq">How often</label>
            <select
              id="mfreq"
              className="select"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
            >
              {MED_FREQUENCIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="mstart">Start date</label>
            <input
              id="mstart"
              type="date"
              className="input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label className="row gap-1" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={ongoing}
              onChange={(e) => setOngoing(e.target.checked)}
            />
            Ongoing (no end date)
          </label>
        </div>
        <div className="field-row">
          {!ongoing && (
            <div className="field">
              <label htmlFor="mend">End date</label>
              <input
                id="mend"
                type="date"
                className="input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="mrefill">Refill by (optional)</label>
            <input
              id="mrefill"
              type="date"
              className="input"
              value={refillBy}
              onChange={(e) => setRefillBy(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="minstr">
            Plain-language instructions (shows on the sitter sheet)
          </label>
          <input
            id="minstr"
            className="input"
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder="e.g. One tablet with breakfast and one with dinner"
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label htmlFor="mvet">Prescribing vet</label>
            <input
              id="mvet"
              className="input"
              value={vet}
              onChange={(e) => setVet(e.target.value)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="mnotes">Notes</label>
          <textarea
            id="mnotes"
            className="textarea"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="row gap-2" style={{ justifyContent: "space-between" }}>
          {onDelete ? (
            <button
              type="button"
              className="linklike"
              style={{ color: "var(--red)" }}
              onClick={onDelete}
            >
              Delete
            </button>
          ) : (
            <span />
          )}
          <button type="submit" className="btn btn-accent" disabled={busy}>
            {busy ? "Saving…" : editing ? "Save changes" : "Add medication"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
