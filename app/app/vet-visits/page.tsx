"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { usePet } from "@/components/app/PetContext";
import { today, daysUntil } from "@/lib/dates";
import { formatDate, formatMoney } from "@/lib/format";
import { Modal } from "@/components/Modal";
import { EmptyState } from "@/components/EmptyState";

type VisitId = Id<"vetVisits">;

interface VisitForm {
  date: string;
  clinic: string;
  reason: string;
  diagnosis: string;
  treatment: string;
  cost: string;
  followUpDate: string;
  notes: string;
}

function emptyForm(): VisitForm {
  return {
    date: today(),
    clinic: "",
    reason: "",
    diagnosis: "",
    treatment: "",
    cost: "",
    followUpDate: "",
    notes: "",
  };
}

export default function VetVisitsPage() {
  const { pet, currency } = usePet();
  const petId = pet?._id;
  const skip = petId ? { petId } : "skip";
  const search = useSearchParams();

  const visits = useQuery(api.vetVisits.list, skip) ?? [];
  type Visit = (typeof visits)[number];
  const add = useMutation(api.vetVisits.add);
  const update = useMutation(api.vetVisits.update);
  const remove = useMutation(api.vetVisits.remove);

  const [showAdd, setShowAdd] = useState(search.get("add") === "1");
  const [editingId, setEditingId] = useState<VisitId | null>(null);
  const [form, setForm] = useState<VisitForm>(emptyForm());

  if (!pet) return null;
  const now = today();

  function openAdd() {
    setForm(emptyForm());
    setEditingId(null);
    setShowAdd(true);
  }

  function openEdit(v: Visit) {
    setForm({
      date: v.date,
      clinic: v.clinic ?? "",
      reason: v.reason ?? "",
      diagnosis: v.diagnosis ?? "",
      treatment: v.treatment ?? "",
      cost: typeof v.cost === "number" ? String(v.cost) : "",
      followUpDate: v.followUpDate ?? "",
      notes: v.notes ?? "",
    });
    setEditingId(v._id);
    setShowAdd(false);
  }

  function closeForm() {
    setShowAdd(false);
    setEditingId(null);
  }

  async function save() {
    if (!petId || !form.date) return;
    const costNum = form.cost.trim() === "" ? undefined : Number(form.cost);
    const payload = {
      clinic: form.clinic.trim() || undefined,
      reason: form.reason.trim() || undefined,
      diagnosis: form.diagnosis.trim() || undefined,
      treatment: form.treatment.trim() || undefined,
      cost: typeof costNum === "number" && Number.isFinite(costNum) ? costNum : undefined,
      followUpDate: form.followUpDate || undefined,
      notes: form.notes.trim() || undefined,
    };
    if (editingId) {
      await update({ id: editingId, date: form.date, ...payload });
    } else {
      await add({ petId, date: form.date, ...payload });
    }
    closeForm();
  }

  async function del(id: VisitId) {
    if (!confirm("Delete this vet visit? If it logged a cost, that expense is removed too.")) return;
    await remove({ id });
    closeForm();
  }

  const formOpen = showAdd || editingId !== null;

  return (
    <div className="stack gap-3 fadeup">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <span className="eyebrow">🩺 Vet visits</span>
          <h1 style={{ fontSize: "1.9rem" }}>Vet visits</h1>
        </div>
        <button className="btn btn-accent" onClick={openAdd}>
          + Add visit
        </button>
      </div>

      {visits.length === 0 ? (
        <div className="card">
          <EmptyState emoji="🩺" title="No vet visits yet">
            Start with your pet&apos;s most recent trip to the vet — the date,
            why you went, and what they said. Everything you keep here will be
            right at hand the next time you&apos;re in the waiting room.
            <div style={{ marginTop: 14 }}>
              <button className="btn btn-accent" onClick={openAdd}>
                + Add visit
              </button>
            </div>
          </EmptyState>
        </div>
      ) : (
        <div className="stack gap-2">
          {visits.map((v: Visit) => {
            const followUpDays = v.followUpDate ? daysUntil(v.followUpDate, now) : NaN;
            const followUpAhead = Number.isFinite(followUpDays) && followUpDays >= 0;
            return (
              <div key={v._id} className="card">
                <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div className="grow" style={{ minWidth: 0 }}>
                    <div className="faint" style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {formatDate(v.date)}
                      {v.clinic ? ` · ${v.clinic}` : ""}
                    </div>
                    <h2 className="section-title" style={{ margin: "4px 0 0" }}>
                      {v.reason || "Vet visit"}
                    </h2>
                  </div>
                  <div className="row gap-1" data-noprint>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(v)}>
                      Edit
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => del(v._id)}>
                      Delete
                    </button>
                  </div>
                </div>

                <div className="stack gap-2" style={{ marginTop: 12 }}>
                  {v.diagnosis && (
                    <Detail label="Diagnosis">{v.diagnosis}</Detail>
                  )}
                  {v.treatment && (
                    <Detail label="Treatment">{v.treatment}</Detail>
                  )}
                  {typeof v.cost === "number" && (
                    <Detail label="Cost">{formatMoney(v.cost, currency)}</Detail>
                  )}
                  {v.followUpDate && (
                    <div className="row gap-2" style={{ alignItems: "center" }}>
                      <Detail label="Follow-up">{formatDate(v.followUpDate)}</Detail>
                      {followUpAhead && (
                        <span className="chip chip-amber">Follow-up: {formatDate(v.followUpDate)}</span>
                      )}
                    </div>
                  )}
                  {v.notes && <Detail label="Notes">{v.notes}</Detail>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {formOpen && (
        <Modal
          wide
          title={editingId ? "Edit vet visit" : "Add a vet visit"}
          onClose={closeForm}
          footer={
            <>
              <button className="btn btn-ghost" onClick={closeForm}>
                Cancel
              </button>
              <button className="btn btn-accent" onClick={save} disabled={!form.date}>
                {editingId ? "Save changes" : "Add visit"}
              </button>
            </>
          }
        >
          <div className="stack gap-2">
            <div className="field-row">
              <label className="field">
                <span>Date</span>
                <input
                  className="input"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </label>
              <label className="field">
                <span>Clinic</span>
                <input
                  className="input"
                  type="text"
                  placeholder="Maple Street Animal Hospital"
                  value={form.clinic}
                  onChange={(e) => setForm({ ...form, clinic: e.target.value })}
                />
              </label>
            </div>

            <label className="field">
              <span>Reason for the visit</span>
              <input
                className="input"
                type="text"
                placeholder="Annual checkup, limping, ear infection…"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Diagnosis</span>
              <input
                className="input"
                type="text"
                placeholder="What the vet found"
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              />
            </label>

            <label className="field">
              <span>Treatment</span>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Medication, procedure, or care plan they gave you"
                value={form.treatment}
                onChange={(e) => setForm({ ...form, treatment: e.target.value })}
              />
            </label>

            <div className="field-row">
              <label className="field">
                <span>Cost</span>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                />
                <span className="faint" style={{ fontSize: "0.78rem" }}>
                  Adding a cost here also logs it under Expenses for you — no need to enter it twice.
                </span>
              </label>
              <label className="field">
                <span>Follow-up date</span>
                <input
                  className="input"
                  type="date"
                  value={form.followUpDate}
                  onChange={(e) => setForm({ ...form, followUpDate: e.target.value })}
                />
              </label>
            </div>

            <label className="field">
              <span>Notes</span>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Anything you want to remember for next time"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ whiteSpace: "pre-wrap" }}>{children}</div>
    </div>
  );
}
