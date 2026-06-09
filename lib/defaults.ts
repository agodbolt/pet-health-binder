import type { Species } from "@/lib/backup";

export const SPECIES_EMOJI: Record<Species, string> = {
  dog: "🐕",
  cat: "🐈",
  rabbit: "🐇",
  bird: "🐦",
  other: "🐾",
};

export const SPECIES_LABEL: Record<Species, string> = {
  dog: "Dog",
  cat: "Cat",
  rabbit: "Rabbit",
  bird: "Bird",
  other: "Other",
};

// Common vaccines for autocomplete. Not medical advice — just a convenience
// list so owners don't have to remember the acronyms.
export const COMMON_VACCINES: Record<Species, string[]> = {
  dog: [
    "Rabies",
    "DHPP (Distemper/Hepatitis/Parvo/Parainfluenza)",
    "Bordetella (Kennel Cough)",
    "Leptospirosis",
    "Lyme Disease",
    "Canine Influenza",
  ],
  cat: [
    "Rabies",
    "FVRCP (Feline Distemper)",
    "FeLV (Feline Leukemia)",
    "FIV",
  ],
  rabbit: ["RHDV2", "Myxomatosis"],
  bird: ["Polyomavirus", "Pacheco's Disease"],
  other: [],
};

export interface CareTaskSeed {
  name: string;
  intervalDays: number;
}

// Sensible recurring-care starting points per species. Fully editable later.
export const CARE_TASK_SEEDS: Record<Species, CareTaskSeed[]> = {
  dog: [
    { name: "Nail trim", intervalDays: 21 },
    { name: "Bath", intervalDays: 30 },
    { name: "Flea & tick treatment", intervalDays: 30 },
    { name: "Heartworm prevention", intervalDays: 30 },
    { name: "Teeth brushing", intervalDays: 2 },
    { name: "Ear cleaning", intervalDays: 14 },
  ],
  cat: [
    { name: "Nail trim", intervalDays: 21 },
    { name: "Litter deep clean", intervalDays: 7 },
    { name: "Flea & tick treatment", intervalDays: 30 },
    { name: "Brushing", intervalDays: 3 },
    { name: "Teeth brushing", intervalDays: 3 },
  ],
  rabbit: [
    { name: "Nail trim", intervalDays: 30 },
    { name: "Hutch deep clean", intervalDays: 7 },
    { name: "Brushing", intervalDays: 3 },
  ],
  bird: [
    { name: "Cage deep clean", intervalDays: 7 },
    { name: "Nail/beak check", intervalDays: 30 },
    { name: "Bath / misting", intervalDays: 3 },
  ],
  other: [
    { name: "Habitat clean", intervalDays: 7 },
    { name: "Health check", intervalDays: 30 },
  ],
};

export const EXPENSE_CATEGORIES = [
  "Vet",
  "Food",
  "Grooming",
  "Insurance",
  "Medication",
  "Toys",
  "Boarding",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const MED_FREQUENCIES = [
  "daily",
  "twice daily",
  "weekly",
  "monthly",
  "as-needed",
] as const;
