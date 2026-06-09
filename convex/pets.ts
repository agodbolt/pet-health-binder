import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireUser, requireOwnedPet } from "./helpers";
import type { Id } from "./_generated/dataModel";

const CHILD_TABLES = [
  "vaccines",
  "medications",
  "vetVisits",
  "weights",
  "careTasks",
  "expenses",
] as const;

const speciesValidator = v.union(
  v.literal("dog"),
  v.literal("cat"),
  v.literal("rabbit"),
  v.literal("bird"),
  v.literal("other")
);

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await requireUser(ctx);
    const pets = await ctx.db
      .query("pets")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    pets.sort((a, b) => a.createdAt - b.createdAt);
    return await Promise.all(
      pets.map(async (p) => ({
        ...p,
        photoUrl: p.photoStorageId
          ? await ctx.storage.getUrl(p.photoStorageId)
          : null,
      }))
    );
  },
});

export const get = query({
  args: { petId: v.id("pets") },
  handler: async (ctx, { petId }) => {
    const pet = await requireOwnedPet(ctx, petId);
    return {
      ...pet,
      photoUrl: pet.photoStorageId
        ? await ctx.storage.getUrl(pet.photoStorageId)
        : null,
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    species: speciesValidator,
    breed: v.optional(v.string()),
    birthday: v.optional(v.string()),
    microchip: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const userId = await requireUser(ctx);
    const petId = await ctx.db.insert("pets", {
      userId,
      name: args.name,
      species: args.species,
      breed: args.breed,
      birthday: args.birthday,
      microchip: args.microchip,
      photoStorageId: args.photoStorageId,
      sitterSheet: {},
      createdAt: Date.now(),
    });
    // Make this the active pet if the user had none.
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();
    if (profile && !profile.activePetId) {
      await ctx.db.patch(profile._id, { activePetId: petId });
    }
    return petId;
  },
});

export const update = mutation({
  args: {
    petId: v.id("pets"),
    name: v.optional(v.string()),
    species: v.optional(speciesValidator),
    breed: v.optional(v.string()),
    birthday: v.optional(v.string()),
    microchip: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    sitterSheet: v.optional(v.any()),
  },
  handler: async (ctx, { petId, ...rest }) => {
    await requireOwnedPet(ctx, petId);
    const patch: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(rest)) {
      if (val !== undefined) patch[k] = val;
    }
    await ctx.db.patch(petId, patch);
  },
});

export const remove = mutation({
  args: { petId: v.id("pets") },
  handler: async (ctx, { petId }) => {
    const pet = await requireOwnedPet(ctx, petId);
    // Cascade: delete all child rows.
    for (const table of CHILD_TABLES) {
      const rows = await ctx.db
        .query(table)
        .withIndex("by_pet", (q) => q.eq("petId", petId))
        .collect();
      for (const row of rows) await ctx.db.delete(row._id);
    }
    if (pet.photoStorageId) await ctx.storage.delete(pet.photoStorageId);
    await ctx.db.delete(petId);
    // Reassign active pet if needed.
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", pet.userId))
      .unique();
    if (profile && profile.activePetId === petId) {
      const remaining = await ctx.db
        .query("pets")
        .withIndex("by_user", (q) => q.eq("userId", pet.userId))
        .first();
      await ctx.db.patch(profile._id, {
        activePetId: remaining?._id as Id<"pets"> | undefined,
      });
    }
  },
});
