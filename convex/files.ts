import { mutation } from "./_generated/server";
import { requireUser } from "./helpers";

/** Short-lived URL the browser POSTs a photo to. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
