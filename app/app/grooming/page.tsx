"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { usePet } from "@/components/app/PetContext";
import { addDays, dueStatus, today, type DueLevel } from "@/lib/dates";
import { formatDate } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";
import { EmptyState } from "@/components/EmptyState";
import { Modal } from "@/components/Modal";

interface CareTask {
  _id: Id<"careTasks">;
  name: string;
  intervalDays: number;
  lastDone?: string;
  notes?: string;
}

interface FormState {
  name: string;
  intervalDays: string;
  notes: string;
}

const EMPTY_FORM: FormState = { name: "", intervalDays: "30", notes: "" };

// Sort key: overdue first, then soonest due, then not-started, then furthest out.
function sortValue(task: CareTask, now: string): number {
  if (!task.lastDone) return 1_000_000; // not started — push below dated tasks
  const next = addDays(task.lastDone, task.intervalDays);
  const s = dueStatus(next, now, 0);
  return s.days; // negative (overdue) sorts first, smaller = sooner
}

export default function GroomingPage() {
  const { pet } = usePet();
  const petId = pet?._id;
  const skip = petId ? { petId } : "skip";

  const tasks = (useQuery(api.careTasks.list, skip) ?? []) as CareTask[];
  const add = useMutation(api.careTasks.add);
  const update = useMutation(api.careTasks.update);
  const markDone = useMutation(api.careTasks.markDone);
  const remove = useMutation(api.careTasks.remove);

  const search = useSearchParams();
  const [showForm, setShowForm] = useState(search.get("add") === "1");
  const [editing, setEditing] = useState<CareTask | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [justDone, setJustDone] = useState<string | null>(null);

  if (!pet) return null;
  const now = today();

  const sorted = [...tasks].sort((a, b) => sortValue(a, now) - sortValue(b, now));

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
  }

  function openEdit(task: CareTask) {
    setEditing(task);
    setForm({
      name: task.name,
      intervalDays: String(task.intervalDays),
      notes: task.notes ?? "",
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  }

  async function saveForm() {
    const name = form.name.trim();
    const intervalDays = Math.max(1, Math.round(Number(form.intervalDays) || 0));
    if (!name || intervalDays < 1) return;
    const notes = form.notes.trim() || undefined;
    if (editing) {
      await update({ id: editing._id, name, intervalDays, notes });
    } else {
      await add({ petId: pet!._id, name, intervalDays, notes });
    }
    closeForm();
  }

  async function handleDone(task: CareTask) {
    setJustDone(task._id);
    await markDone({ id: task._id, date: now });
    // let the little pop play, then clear
    setTimeout(() => setJustDone((c) => (c === task._id ? null : c)), 450);
  }

  async function handleDelete(task: CareTask) {
    if (!confirm(`Remove "${task.name}" from ${pet!.name}'s routine?`)) return;
    if (editing?._id === task._id) closeForm();
    await remove({ id: task._id });
  }

  return (
    <div className="stack gap-3 fadeup">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <span className="eyebrow">Grooming &amp; care</span>
          <h1 style={{ fontSize: "1.9rem" }}>Routine care</h1>
        </div>
        <button className="btn btn-accent" onClick={openAdd}>
          + Add task
        </button>
      </div>

      <p className="muted" style={{ marginTop: 0 }}>
        The little things that keep {pet.name} comfy — nail trims, baths, brushing.
        Tap <strong>Done today</strong> each time and the next due date takes care
        of itself. Every interval is yours to tweak, so set what really fits {pet.name}.
      </p>

      {sorted.length === 0 ? (
        <div className="card">
          <EmptyState
            emoji="🛁"
            title="No care tasks yet"
            action={
              <button className="btn btn-accent" onClick={openAdd}>
                + Add a task
              </button>
            }
          >
            We usually start you off with a few sensible tasks for your kind of pet.
            If there&apos;s nothing here, add your own — a nail trim, a bath, a
            weekly brush — and set how often it should come around.
          </EmptyState>
        </div>
      ) : (
        <div className="stack gap-2">
          {sorted.map((task) => {
            const nextDue = task.lastDone
              ? addDays(task.lastDone, task.intervalDays)
              : null;
            const status = task.lastDone
              ? dueStatus(nextDue, now, 0)
              : null;
            const popping = justDone === task._id;
            return (
              <div
                key={task._id}
                className="card"
                style={{ padding: "16px 18px" }}
              >
                <div
                  className="row gap-2 wrap"
                  style={{ justifyContent: "space-between", alignItems: "flex-start" }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="row gap-2" style={{ alignItems: "center" }}>
                      <span style={{ fontSize: 22 }}>🛁</span>
                      <h2 style={{ fontSize: "1.15rem", margin: 0 }}>{task.name}</h2>
                      {status ? (
                        <StatusChip level={status.level as DueLevel} days={status.days} />
                      ) : (
                        <span className="chip chip-neutral">
                          <span>•</span> Not done yet
                        </span>
                      )}
                    </div>
                    <p className="muted" style={{ margin: "8px 0 0" }}>
                      Every {task.intervalDays} day{task.intervalDays === 1 ? "" : "s"}
                      {" · "}Last done {formatDate(task.lastDone)}
                      {" · "}Next due {nextDue ? formatDate(nextDue) : "Not started"}
                    </p>
                    {task.notes && (
                      <p className="faint" style={{ margin: "6px 0 0" }}>
                        {task.notes}
                      </p>
                    )}
                  </div>

                  <div className="row gap-1" style={{ flexShrink: 0 }}>
                    <button
                      className="btn btn-accent"
                      onClick={() => handleDone(task)}
                      style={{
                        transform: popping ? "scale(1.08)" : "scale(1)",
                        transition: "transform 0.18s ease",
                      }}
                    >
                      ✓ Done today
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => openEdit(task)}
                    >
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <Modal
          title={editing ? "Edit care task" : "Add a care task"}
          onClose={closeForm}
          footer={
            <>
              {editing && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(editing)}
                  style={{ marginRight: "auto", color: "var(--red)" }}
                >
                  Delete
                </button>
              )}
              <button className="btn btn-ghost" onClick={closeForm}>
                Cancel
              </button>
              <button
                className="btn btn-accent"
                onClick={saveForm}
                disabled={!form.name.trim()}
              >
                {editing ? "Save" : "Add task"}
              </button>
            </>
          }
        >
          <div className="field">
            <label htmlFor="care-name">What is it?</label>
            <input
              id="care-name"
              className="input"
              type="text"
              placeholder="Nail trim, bath, brushing…"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
          </div>
          <div className="field">
            <label htmlFor="care-interval">Repeat every … days</label>
            <input
              id="care-interval"
              className="input"
              type="number"
              min={1}
              step={1}
              value={form.intervalDays}
              onChange={(e) => setForm({ ...form, intervalDays: e.target.value })}
            />
            <span className="faint" style={{ fontSize: "0.8rem" }}>
              Change this anytime to fit {pet.name}.
            </span>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="care-notes">Notes (optional)</label>
            <textarea
              id="care-notes"
              className="textarea"
              rows={3}
              placeholder="Which groomer, what shampoo, anything to remember…"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
