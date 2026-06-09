import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/** Returns the signed-in user id or throws. */
export async function requireUser(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("You need to be signed in.");
  return userId;
}

/** Load a pet and assert the signed-in user owns it. */
export async function requireOwnedPet(
  ctx: QueryCtx | MutationCtx,
  petId: Id<"pets">
) {
  const userId = await requireUser(ctx);
  const pet = await ctx.db.get(petId);
  if (!pet || pet.userId !== userId) {
    throw new Error("That pet doesn't belong to you.");
  }
  return pet;
}
