"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { usePet } from "@/components/app/PetContext";
import { today } from "@/lib/dates";
import { formatWeight, formatDate } from "@/lib/format";
import { WeightChart } from "@/components/WeightChart";
import { Modal } from "@/components/Modal";
import { EmptyState } from "@/components/EmptyState";

interface WeightRow {
  _id: Id<"weights">;
  date: string;
  weight: number;
  note?: string;
}

export default function WeightPage() {
  return (
    <Suspense fallback={null}>
      <WeightPageInner />
    </Suspense>
  );
}

function WeightPageInner() {
  const { pet, weightUnit } = usePet();
  const petId = pet?._id;
  const skip = petId ? { petId } : "skip";

  const search = useSearchParams();
  const weights = (useQuery(api.weights.list, skip) ?? []) as WeightRow[];

  const add = useMutation(api.weights.add);
  const update = useMutation(api.weights.update);
  const remove = useMutation(api.weights.remove);

  const [showForm, setShowForm] = useState(search.get("add") === "1");
  const [editing, setEditing] = useState<WeightRow | null>(null);

  // form fields
  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (!pet) return null;

  // chart wants chronological order (as returned). Table wants most-recent first.
  const chartPoints = weights.map((w) => ({ date: w.date, weight: w.weight, note: w.note }));
  const recent = [...weights].reverse();

  function openAdd() {
    setEditing(null);
    setDate(today());
    setWeight("");
    setNote("");
    setShowForm(true);
  }

  function openEdit(row: WeightRow) {
    setEditing(row);
    setDate(row.date);
    setWeight(String(row.weight));
    setNote(row.note ?? "");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
  }

  async function save() {
    const w = parseFloat(weight);
    if (!date || !Number.isFinite(w)) return;
    setSaving(true);
    try {
      if (editing) {
        await update({ id: editing._id, date, weight: w, note: note.trim() || undefined });
      } else {
        await add({ petId: pet!._id, date, weight: w, note: note.trim() || undefined });
      }
      closeForm();
    } finally {
      setSaving(false);
    }
  }

  async function del(row: WeightRow) {
    if (!confirm(`Remove the ${formatWeight(row.weight, weightUnit)} entry from ${formatDate(row.date)}?`)) return;
    await remove({ id: row._id });
  }

  return (
    <div className="stack gap-3 fadeup">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <span className="eyebrow">{pet.name}</span>
          <h1 style={{ fontSize: "1.9rem" }}>Weight</h1>
        </div>
        <button className="btn btn-accent" onClick={openAdd}>
          + Add weight
        </button>
      </div>

      {/* trend chart */}
      <div className="card card-pad-lg">
        <h2 className="section-title" style={{ marginTop: 0 }}>
          Trend
        </h2>
        {weights.length < 2 ? (
          <p className="muted" style={{ margin: "4px 0 0" }}>
            {weights.length === 0
              ? "Add a couple of weigh-ins and a trend line will show up here."
              : "One more weigh-in and you'll see the trend line take shape."}
          </p>
        ) : (
          <WeightChart points={chartPoints} unit={weightUnit} />
        )}
      </div>

      {/* history */}
      <div className="card">
        <h2 className="section-title">History</h2>
        {weights.length === 0 ? (
          <EmptyState
            emoji="⚖️"
            title="No weigh-ins yet"
            action={
              <button className="btn btn-accent" onClick={openAdd} style={{ marginTop: 12 }}>
                + Add weight
              </button>
            }
          >
            Pop your pet on the scale now and then. Tracking weight over time
            makes it easy to spot changes early.
          </EmptyState>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Weight</th>
                <th>Note</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {recent.map((row) => (
                <tr key={row._id}>
                  <td>{formatDate(row.date)}</td>
                  <td style={{ fontWeight: 600 }}>{formatWeight(row.weight, weightUnit)}</td>
                  <td className="muted">{row.note || "—"}</td>
                  <td>
                    <div className="row gap-1" style={{ justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => openEdit(row)}>
                        Edit
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => del(row)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <Modal
          title={editing ? "Edit weigh-in" : "Add weigh-in"}
          onClose={closeForm}
          footer={
            <>
              <button className="btn btn-ghost" onClick={closeForm}>
                Cancel
              </button>
              <button className="btn btn-accent" onClick={save} disabled={saving}>
                {saving ? "Saving…" : editing ? "Save changes" : "Add weight"}
              </button>
            </>
          }
        >
          <div className="field">
            <label htmlFor="w-date">Date</label>
            <input
              id="w-date"
              className="input"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="w-weight">Weight ({weightUnit})</label>
            <input
              id="w-weight"
              className="input"
              type="number"
              step="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder={`e.g. 24.5`}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="w-note">Note (optional)</label>
            <input
              id="w-note"
              className="input"
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="new food, post-surgery"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
