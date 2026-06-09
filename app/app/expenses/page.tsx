"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { usePet } from "@/components/app/PetContext";
import { EXPENSE_CATEGORIES } from "@/lib/defaults";
import { today } from "@/lib/dates";
import { formatMoney, formatDate } from "@/lib/format";
import { Modal } from "@/components/Modal";
import { EmptyState } from "@/components/EmptyState";
import { ExpenseBars } from "@/components/ExpenseBars";

type ExpenseRow = {
  _id: Id<"expenses">;
  date: string;
  category: string;
  amount: number;
  note?: string;
};

interface Draft {
  date: string;
  category: string;
  amount: string;
  note: string;
}

function emptyDraft(): Draft {
  return { date: today(), category: EXPENSE_CATEGORIES[0], amount: "", note: "" };
}

export default function ExpensesPage() {
  const { pet, currency } = usePet();
  const petId = pet?._id;
  const skip = petId ? { petId } : "skip";

  const expenses = (useQuery(api.expenses.list, skip) ?? []) as ExpenseRow[];
  const add = useMutation(api.expenses.add);
  const update = useMutation(api.expenses.update);
  const remove = useMutation(api.expenses.remove);

  const search = useSearchParams();
  const [showAdd, setShowAdd] = useState(search.get("add") === "1");
  const [editing, setEditing] = useState<ExpenseRow | null>(null);

  // ---- year-over-year + this-month/this-year totals (plain JS, string slices) ----
  const now = new Date();
  const year = String(now.getFullYear());
  const lastYear = String(now.getFullYear() - 1);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const ym = `${year}-${month}`;

  const stats = useMemo(() => {
    let thisMonth = 0;
    let thisYear = 0;
    let lastYearTotal = 0;
    const byCategory = new Map<string, number>();
    for (const e of expenses) {
      const y = e.date.slice(0, 4);
      if (y === year) {
        thisYear += e.amount;
        byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + e.amount);
        if (e.date.slice(0, 7) === ym) thisMonth += e.amount;
      } else if (y === lastYear) {
        lastYearTotal += e.amount;
      }
    }
    const cats = Array.from(byCategory, ([label, amount]) => ({ label, amount }));
    return { thisMonth, thisYear, lastYearTotal, cats };
  }, [expenses, year, lastYear, ym]);

  // year-over-year direction + percent
  const yoy = useMemo(() => {
    const { thisYear, lastYearTotal } = stats;
    if (lastYearTotal <= 0) return null;
    const pct = ((thisYear - lastYearTotal) / lastYearTotal) * 100;
    const up = pct >= 0;
    return { arrow: up ? "▲" : "▼", pct: Math.abs(Math.round(pct)), up };
  }, [stats]);

  if (!pet) return null;

  function openEdit(row: ExpenseRow) {
    setEditing(row);
  }

  async function handleDelete(id: Id<"expenses">) {
    if (!confirm("Delete this expense? This can't be undone.")) return;
    await remove({ id });
    setEditing(null);
  }

  return (
    <div className="stack gap-3 fadeup">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <span className="eyebrow">Money</span>
          <h1 style={{ fontSize: "1.9rem" }}>Expenses</h1>
        </div>
        <button className="btn btn-accent" onClick={() => setShowAdd(true)}>
          + Add expense
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="card">
          <EmptyState emoji="🧾" title="No expenses yet">
            Keep a running tally of what {pet.name} costs — vet bills, food,
            grooming, the occasional toy. Add your first one and we&apos;ll start
            totaling it up for you.
            <div style={{ marginTop: 14 }}>
              <button className="btn btn-accent" onClick={() => setShowAdd(true)}>
                + Add expense
              </button>
            </div>
          </EmptyState>
        </div>
      ) : (
        <>
          {/* top cards */}
          <div className="row gap-2 wrap">
            <SummaryCard label="This month" value={formatMoney(stats.thisMonth, currency)} />
            <SummaryCard label="This year" value={formatMoney(stats.thisYear, currency)} />
            <div className="card grow" style={{ minWidth: 240 }}>
              <div
                className="faint"
                style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}
              >
                Year over year
              </div>
              <div style={{ marginTop: 6, fontWeight: 600 }}>
                This year: {formatMoney(stats.thisYear, currency)}
              </div>
              <div className="muted" style={{ fontSize: "0.9rem", marginTop: 2 }}>
                Last year: {formatMoney(stats.lastYearTotal, currency)}
                {yoy && (
                  <>
                    {" · "}
                    <span style={{ color: yoy.up ? "var(--terracotta)" : "var(--green-ok)", fontWeight: 600 }}>
                      {yoy.arrow} {yoy.pct}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* by category chart */}
          <div className="card">
            <h2 className="section-title">By category (this year)</h2>
            {stats.cats.length === 0 ? (
              <p className="muted" style={{ marginTop: 0 }}>
                Nothing logged for {year} yet.
              </p>
            ) : (
              <div style={{ marginTop: 8 }}>
                <ExpenseBars data={stats.cats} currency={currency} />
              </div>
            )}
          </div>

          {/* list */}
          <div className="card">
            <h2 className="section-title">Every expense</h2>
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Note</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((e) => (
                  <tr
                    key={e._id}
                    onClick={() => openEdit(e)}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{formatDate(e.date)}</td>
                    <td>
                      <span className="chip chip-neutral">{e.category}</span>
                    </td>
                    <td className="muted">{e.note || "—"}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      {formatMoney(e.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showAdd && (
        <ExpenseForm
          title="Add expense"
          initial={emptyDraft()}
          onClose={() => setShowAdd(false)}
          onSave={async (d) => {
            await add({
              petId: pet._id,
              date: d.date,
              category: d.category,
              amount: Number(d.amount),
              note: d.note || undefined,
            });
            setShowAdd(false);
          }}
        />
      )}

      {editing && (
        <ExpenseForm
          title="Edit expense"
          initial={{
            date: editing.date,
            category: editing.category,
            amount: String(editing.amount),
            note: editing.note ?? "",
          }}
          onClose={() => setEditing(null)}
          onDelete={() => handleDelete(editing._id)}
          onSave={async (d) => {
            await update({
              id: editing._id,
              date: d.date,
              category: d.category,
              amount: Number(d.amount),
              note: d.note || undefined,
            });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card grow" style={{ minWidth: 160 }}>
      <div
        className="faint"
        style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}
      >
        {label}
      </div>
      <div style={{ marginTop: 6, fontSize: "1.5rem", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function ExpenseForm({
  title,
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  title: string;
  initial: Draft;
  onClose: () => void;
  onSave: (draft: Draft) => Promise<void> | void;
  onDelete?: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(initial);
  const [saving, setSaving] = useState(false);

  const valid = draft.date && draft.category && draft.amount !== "" && Number(draft.amount) > 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    try {
      await onSave(draft);
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
          {onDelete && (
            <button type="button" className="btn btn-ghost" onClick={onDelete}>
              Delete
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="expense-form" className="btn btn-accent" disabled={!valid || saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </>
      }
    >
      <form id="expense-form" className="stack gap-2" onSubmit={submit}>
        <div className="field-row">
          <label className="field">
            <span>Date</span>
            <input
              type="date"
              className="input"
              value={draft.date}
              onChange={(e) => setDraft({ ...draft, date: e.target.value })}
            />
          </label>
          <label className="field">
            <span>Category</span>
            <select
              className="select"
              value={draft.category}
              onChange={(e) => setDraft({ ...draft, category: e.target.value })}
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span>Amount</span>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            className="input"
            placeholder="0.00"
            value={draft.amount}
            onChange={(e) => setDraft({ ...draft, amount: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Note</span>
          <input
            type="text"
            className="input"
            placeholder="What was it for?"
            value={draft.note}
            onChange={(e) => setDraft({ ...draft, note: e.target.value })}
          />
        </label>
      </form>
    </Modal>
  );
}
