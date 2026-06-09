// Export / import of a binder backup. The cloud (Convex) is the source of
// truth, but a downloadable JSON backup is kept as a "your data is yours"
// trust signal. Import is defensive: older or partial backups are merged with
// defaults rather than crashing.

export type Species = "dog" | "cat" | "rabbit" | "bird" | "other";

export interface PetData {
  name: string;
  species: Species;
  breed?: string;
  birthday?: string;
  microchip?: string;
  photoUrl?: string | null;
  vaccines: Record<string, unknown>[];
  medications: Record<string, unknown>[];
  vetVisits: Record<string, unknown>[];
  weights: Record<string, unknown>[];
  careTasks: Record<string, unknown>[];
  expenses: Record<string, unknown>[];
  sitterSheet: Record<string, unknown>;
}

export interface BackupFile {
  version: 1;
  exportedAt?: string;
  pets: PetData[];
}

const COLLECTIONS = [
  "vaccines",
  "medications",
  "vetVisits",
  "weights",
  "careTasks",
  "expenses",
] as const;

/** Fill any missing fields/collections on a partial pet object. */
export function mergePetDefaults(partial: Record<string, unknown>): PetData {
  const out: Record<string, unknown> = {
    name: typeof partial.name === "string" ? partial.name : "",
    species: typeof partial.species === "string" ? partial.species : "dog",
    breed: partial.breed,
    birthday: partial.birthday,
    microchip: partial.microchip,
    photoUrl: partial.photoUrl ?? null,
    sitterSheet:
      partial.sitterSheet && typeof partial.sitterSheet === "object"
        ? partial.sitterSheet
        : {},
  };
  for (const key of COLLECTIONS) {
    out[key] = Array.isArray(partial[key]) ? partial[key] : [];
  }
  return out as unknown as PetData;
}

/** Build a backup payload from one pet or many. */
export function buildBackup(
  pets: Record<string, unknown> | Record<string, unknown>[]
): BackupFile {
  const list = Array.isArray(pets) ? pets : [pets];
  return {
    version: 1,
    pets: list.map(mergePetDefaults),
  };
}

/** Parse + validate a backup string. Throws friendly Errors on failure. */
export function parseBackup(text: string): BackupFile {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    throw new Error(
      "We couldn't read that file — it doesn't appear to be a valid backup."
    );
  }
  if (
    !raw ||
    typeof raw !== "object" ||
    !Array.isArray((raw as { pets?: unknown }).pets)
  ) {
    throw new Error(
      "That file doesn't look like a Pet Health Binder backup. Please choose the JSON file you downloaded from the app."
    );
  }
  const pets = (raw as { pets: unknown[] }).pets.map((p) =>
    mergePetDefaults((p ?? {}) as Record<string, unknown>)
  );
  return { version: 1, pets };
}
