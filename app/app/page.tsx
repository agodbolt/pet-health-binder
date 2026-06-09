"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { usePet } from "@/components/app/PetContext";
import { SPECIES_EMOJI } from "@/lib/defaults";
import { ageFromBirthday, dueStatus, addDays, today, type DueLevel } from "@/lib/dates";
import { formatWeight, formatDate, duePhrase } from "@/lib/format";
import { StatusChip } from "@/components/StatusChip";
import { Sparkline } from "@/components/Sparkline";
import { EmptyState } from "@/components/EmptyState";

interface AttnItem {
  key: string;
  icon: string;
  label: string;
  sub: string;
  date: string;
  level: DueLevel;
  days: number;
}

export default function DashboardPage() {
  const { pet, weightUnit } = usePet();
  const petId = pet?._id;
  const skip = petId ? { petId } : "skip";

  const vaccines = useQuery(api.vaccines.list, skip) ?? [];
  const meds = useQuery(api.medications.list, skip) ?? [];
  const careTasks = useQuery(api.careTasks.list, skip) ?? [];
  const visits = useQuery(api.vetVisits.list, skip) ?? [];
  const weights = useQuery(api.weights.list, skip) ?? [];

  if (!pet) return null;
  const now = today();

  // ---- build "needs attention" ----
  const items: AttnItem[] = [];
  for (const v of vaccines) {
    if (!v.dueDate) continue;
    const s = dueStatus(v.dueDate, now, 30);
    if (s.level === "overdue" || s.level === "due-soon")
      items.push({ key: `vac-${v._id}`, icon: "💉", label: `${v.name} vaccine`, sub: v.clinic ?? "Vaccine due", date: v.dueDate, ...s });
  }
  for (const m of meds) {
    if (m.archived || !m.refillBy) continue;
    const s = dueStatus(m.refillBy, now, 30);
    if (s.level === "overdue" || s.level === "due-soon")
      items.push({ key: `med-${m._id}`, icon: "💊", label: `${m.name} refill`, sub: m.dose ?? "Refill due", date: m.refillBy, ...s });
  }
  for (const t of careTasks) {
    if (!t.lastDone) continue;
    const next = addDays(t.lastDone, t.intervalDays);
    const s = dueStatus(next, now, 30);
    if (s.level === "overdue" || s.level === "due-soon")
      items.push({ key: `care-${t._id}`, icon: "🛁", label: t.name, sub: "Recurring care", date: next, ...s });
  }
  for (const vis of visits) {
    if (!vis.followUpDate) continue;
    const s = dueStatus(vis.followUpDate, now, 30);
    if (s.level === "overdue" || s.level === "due-soon")
      items.push({ key: `visit-${vis._id}`, icon: "🩺", label: "Vet follow-up", sub: vis.reason ?? vis.clinic ?? "Follow-up visit", date: vis.followUpDate, ...s });
  }
  items.sort((a, b) => a.days - b.days);

  const latestWeight = weights[weights.length - 1];

  const QUICK = [
    ["/app/vet-visits?add=1", "🩺", "Vet visit"],
    ["/app/vaccines?add=1", "💉", "Vaccine"],
    ["/app/medications?add=1", "💊", "Medication"],
    ["/app/weight?add=1", "⚖️", "Weight"],
    ["/app/expenses?add=1", "🧾", "Expense"],
  ];

  return (
    <div className="stack gap-3 fadeup">
      {/* header card */}
      <div className="card card-pad-lg">
        <div className="row gap-2 wrap" style={{ alignItems: "flex-start" }}>
          {pet.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={pet.photoUrl}
              alt={pet.name}
              style={{ width: 92, height: 92, borderRadius: 22, objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                width: 92,
                height: 92,
                borderRadius: 22,
                background: "var(--forest-soft)",
                display: "grid",
                placeItems: "center",
                fontSize: 46,
              }}
            >
              {SPECIES_EMOJI[pet.species]}
            </div>
          )}
          <div className="grow">
            <h1 style={{ fontSize: "2rem" }}>{pet.name}</h1>
            <p className="muted" style={{ margin: "2px 0 0" }}>
              {[pet.breed, pet.birthday && ageFromBirthday(pet.birthday, now)]
                .filter(Boolean)
                .join(" · ") || "Add a breed and birthday to see age"}
            </p>
            <div className="row gap-2 wrap" style={{ marginTop: 10 }}>
              <Stat label="Latest weight" value={latestWeight ? formatWeight(latestWeight.weight, weightUnit) : "—"} />
              <Stat label="Microchip" value={pet.microchip || "—"} />
              <Stat label="On file" value={`${vaccines.length} vaccines · ${meds.filter((m: { archived?: boolean }) => !m.archived).length} meds`} />
            </div>
          </div>
          {weights.length >= 2 && (
            <div className="center" style={{ paddingTop: 6 }}>
              <Sparkline values={weights.map((w: { weight: number }) => w.weight)} />
              <div className="faint" style={{ fontSize: "0.72rem" }}>
                weight trend
              </div>
            </div>
          )}
        </div>
      </div>

      {/* quick add */}
      <div className="row gap-1 wrap" data-noprint>
        {QUICK.map(([href, icon, label]) => (
          <Link key={href} href={href} className="btn btn-ghost btn-sm">
            <span>{icon}</span> + {label}
          </Link>
        ))}
      </div>

      {/* needs attention */}
      <div className="card">
        <h2 className="section-title">Needs attention</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          Anything overdue or coming up in the next 30 days.
        </p>
        {items.length === 0 ? (
          <EmptyState emoji="🌿" title="All caught up">
            Nothing overdue and nothing due in the next month. When a vaccine,
            refill, or grooming task gets close, it&apos;ll show up here.
          </EmptyState>
        ) : (
          <div className="stack gap-1" style={{ marginTop: 8 }}>
            {items.map((it) => (
              <div
                key={it.key}
                className="row gap-2"
                style={{
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  borderRadius: 14,
                  background:
                    it.level === "overdue" ? "var(--red-soft)" : "var(--amber-soft)",
                }}
              >
                <div className="row gap-2" style={{ minWidth: 0 }}>
                  <span style={{ fontSize: 22 }}>{it.icon}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{it.label}</div>
                    <div className="muted" style={{ fontSize: "0.85rem" }}>
                      {it.sub} · {formatDate(it.date)}
                    </div>
                  </div>
                </div>
                <div className="row gap-2">
                  <span
                    style={{
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      color: it.level === "overdue" ? "var(--red)" : "var(--amber)",
                    }}
                  >
                    {duePhrase(it.days)}
                  </span>
                  <StatusChip level={it.level} days={it.days} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: "var(--cream)",
        borderRadius: 12,
        padding: "8px 14px",
        minWidth: 120,
      }}
    >
      <div className="faint" style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div style={{ fontWeight: 600 }}>{value}</div>
    </div>
  );
}
