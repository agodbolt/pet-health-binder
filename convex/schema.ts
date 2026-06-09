import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const speciesValidator = v.union(
  v.literal("dog"),
  v.literal("cat"),
  v.literal("rabbit"),
  v.literal("bird"),
  v.literal("other")
);

export default defineSchema({
  // Convex Auth tables (users, authSessions, authAccounts, etc.)
  ...authTables,

  // Per-user profile/billing/settings, linked to the auth user id.
  profiles: defineTable({
    userId: v.id("users"),
    email: v.optional(v.string()),
    hasPaid: v.boolean(),
    stripeCustomerId: v.optional(v.string()),
    weightUnit: v.union(v.literal("lb"), v.literal("kg")),
    currency: v.string(),
    activePetId: v.optional(v.id("pets")),
  }).index("by_user", ["userId"]),

  pets: defineTable({
    userId: v.id("users"),
    name: v.string(),
    species: speciesValidator,
    breed: v.optional(v.string()),
    birthday: v.optional(v.string()),
    microchip: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    sitterSheet: v.optional(v.any()),
    isDemo: v.optional(v.boolean()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  vaccines: defineTable({
    petId: v.id("pets"),
    name: v.string(),
    dateGiven: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    clinic: v.optional(v.string()),
    lot: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_pet", ["petId"]),

  medications: defineTable({
    petId: v.id("pets"),
    name: v.string(),
    dose: v.optional(v.string()),
    frequency: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    ongoing: v.boolean(),
    refillBy: v.optional(v.string()),
    vet: v.optional(v.string()),
    notes: v.optional(v.string()),
    instructions: v.optional(v.string()),
    archived: v.boolean(),
    doseLog: v.optional(v.any()),
  }).index("by_pet", ["petId"]),

  vetVisits: defineTable({
    petId: v.id("pets"),
    date: v.string(),
    clinic: v.optional(v.string()),
    reason: v.optional(v.string()),
    diagnosis: v.optional(v.string()),
    treatment: v.optional(v.string()),
    cost: v.optional(v.number()),
    followUpDate: v.optional(v.string()),
    notes: v.optional(v.string()),
    expenseId: v.optional(v.id("expenses")),
  }).index("by_pet", ["petId"]),

  weights: defineTable({
    petId: v.id("pets"),
    date: v.string(),
    weight: v.number(),
    note: v.optional(v.string()),
  }).index("by_pet", ["petId"]),

  careTasks: defineTable({
    petId: v.id("pets"),
    name: v.string(),
    intervalDays: v.number(),
    lastDone: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_pet", ["petId"]),

  expenses: defineTable({
    petId: v.id("pets"),
    date: v.string(),
    category: v.string(),
    amount: v.number(),
    note: v.optional(v.string()),
  }).index("by_pet", ["petId"]),
});
