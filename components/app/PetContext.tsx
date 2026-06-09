"use client";

import { createContext, useContext } from "react";
import type { Id } from "@/convex/_generated/dataModel";

export interface PetDoc {
  _id: Id<"pets">;
  name: string;
  species: "dog" | "cat" | "rabbit" | "bird" | "other";
  breed?: string;
  birthday?: string;
  microchip?: string;
  photoUrl?: string | null;
  photoStorageId?: Id<"_storage">;
  sitterSheet?: Record<string, unknown>;
  isDemo?: boolean;
  createdAt: number;
}

export interface PetContextValue {
  pet: PetDoc | null;
  pets: PetDoc[];
  weightUnit: "lb" | "kg";
  currency: string;
  hasPaid: boolean;
}

const PetContext = createContext<PetContextValue | null>(null);

export const PetProvider = PetContext.Provider;

export function usePet(): PetContextValue {
  const ctx = useContext(PetContext);
  if (!ctx) throw new Error("usePet must be used inside the app shell");
  return ctx;
}
