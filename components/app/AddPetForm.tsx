"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { SPECIES_EMOJI, SPECIES_LABEL } from "@/lib/defaults";
import type { Species } from "@/lib/backup";

const SPECIES_LIST: Species[] = ["dog", "cat", "rabbit", "bird", "other"];

export function AddPetForm({
  onDone,
  submitLabel = "Add pet",
}: {
  onDone: (petId: Id<"pets">) => void;
  submitLabel?: string;
}) {
  const createPet = useMutation(api.pets.create);
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);

  const [name, setName] = useState("");
  const [species, setSpecies] = useState<Species>("dog");
  const [breed, setBreed] = useState("");
  const [birthday, setBirthday] = useState("");
  const [microchip, setMicrochip] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pickFile(f: File | null) {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Your pet needs a name.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let photoStorageId: Id<"_storage"> | undefined;
      if (file) {
        const url = await generateUploadUrl();
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const json = await res.json();
        photoStorageId = json.storageId as Id<"_storage">;
      }
      const petId = await createPet({
        name: name.trim(),
        species,
        breed: breed.trim() || undefined,
        birthday: birthday || undefined,
        microchip: microchip.trim() || undefined,
        photoStorageId,
      });
      onDone(petId);
    } catch {
      setError("We couldn't save your pet just now. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="row gap-2" style={{ marginBottom: 14, alignItems: "flex-end" }}>
        <label
          style={{
            width: 76,
            height: 76,
            borderRadius: 18,
            background: "var(--forest-soft)",
            display: "grid",
            placeItems: "center",
            fontSize: 34,
            cursor: "pointer",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            SPECIES_EMOJI[species]
          )}
          <input
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
          />
        </label>
        <div className="grow">
          <div className="field" style={{ marginBottom: 0 }}>
            <label htmlFor="petname">Name</label>
            <input
              id="petname"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cooper"
              autoFocus
            />
          </div>
        </div>
      </div>

      <div className="field">
        <label>Species</label>
        <div className="row gap-1 wrap">
          {SPECIES_LIST.map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => setSpecies(s)}
              className="chip"
              style={{
                cursor: "pointer",
                border: "1.5px solid",
                borderColor: species === s ? "var(--forest)" : "var(--line)",
                background: species === s ? "var(--forest-soft)" : "var(--paper)",
                color: species === s ? "var(--forest)" : "var(--ink-soft)",
                padding: "7px 13px",
              }}
            >
              {SPECIES_EMOJI[s]} {SPECIES_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <label htmlFor="breed">Breed (optional)</label>
          <input
            id="breed"
            className="input"
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            placeholder="e.g. Golden Retriever"
          />
        </div>
        <div className="field">
          <label htmlFor="bday">Birthday (optional)</label>
          <input
            id="bday"
            className="input"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <label htmlFor="chip">Microchip # (optional)</label>
        <input
          id="chip"
          className="input"
          value={microchip}
          onChange={(e) => setMicrochip(e.target.value)}
          placeholder="985…"
        />
      </div>

      {error && (
        <p style={{ color: "var(--red)", fontSize: "0.88rem" }}>{error}</p>
      )}

      <button
        type="submit"
        className="btn btn-accent btn-block"
        disabled={busy}
        style={{ marginTop: 4 }}
      >
        {busy ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
