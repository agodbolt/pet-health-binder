"use client";

import { useRef, useState } from "react";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { buildBackup, parseBackup } from "@/lib/backup";
import type { PetDoc } from "./PetContext";

// Pull a pet's full record (all child tables) into one plain object for export.
async function collectPet(convex: ReturnType<typeof useConvex>, pet: PetDoc) {
  const [vaccines, medications, vetVisits, weights, careTasks, expenses] =
    await Promise.all([
      convex.query(api.vaccines.list, { petId: pet._id }),
      convex.query(api.medications.list, { petId: pet._id }),
      convex.query(api.vetVisits.list, { petId: pet._id }),
      convex.query(api.weights.list, { petId: pet._id }),
      convex.query(api.careTasks.list, { petId: pet._id }),
      convex.query(api.expenses.list, { petId: pet._id }),
    ]);
  const strip = (rows: Record<string, unknown>[]) =>
    rows.map(({ _id, _creationTime, petId, ...rest }) => rest);
  return {
    name: pet.name,
    species: pet.species,
    breed: pet.breed,
    birthday: pet.birthday,
    microchip: pet.microchip,
    sitterSheet: pet.sitterSheet ?? {},
    vaccines: strip(vaccines),
    medications: strip(medications),
    vetVisits: strip(vetVisits),
    weights: strip(weights),
    careTasks: strip(careTasks),
    expenses: strip(expenses),
  };
}

export function BackupButtons({ pets }: { pets: PetDoc[] }) {
  const convex = useConvex();
  const importPets = useMutation(api.restore.importPets);
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onExport() {
    setBusy(true);
    try {
      const data = await Promise.all(pets.map((p) => collectPet(convex, p)));
      const payload = buildBackup(data);
      payload.exportedAt = new Date().toISOString();
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pet-health-binder-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      flash("Backup downloaded.");
    } finally {
      setBusy(false);
    }
  }

  async function onImport(file: File) {
    setBusy(true);
    try {
      const text = await file.text();
      const parsed = parseBackup(text);
      const { imported } = await importPets({ pets: parsed.pets });
      flash(`Restored ${imported} pet${imported === 1 ? "" : "s"}.`);
    } catch (err) {
      flash((err as Error).message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function flash(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(null), 4000);
  }

  return (
    <div className="row gap-1" data-noprint>
      <button
        className="btn btn-ghost btn-sm"
        onClick={onExport}
        disabled={busy || pets.length === 0}
        title="Download a JSON copy of all your data"
      >
        💾 Back up my data
      </button>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => fileRef.current?.click()}
        disabled={busy}
        title="Restore from a backup file"
      >
        ↩︎ Restore backup
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onImport(f);
        }}
      />
      {msg && (
        <span
          className="chip chip-ok"
          style={{ animation: "fadeup .2s ease" }}
        >
          {msg}
        </span>
      )}
    </div>
  );
}
