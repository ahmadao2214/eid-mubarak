import { query } from "./_generated/server";

export const listCompleted = query({
  args: {},
  handler: async (ctx) => {
    const renders = await ctx.db.query("renders").collect();
    return renders
      .filter((r) => r.status === "completed" && r.outputS3Url)
      .sort((a, b) => (a.completedAt ?? 0) - (b.completedAt ?? 0))
      .map((r) => ({
        _id: r._id,
        outputS3Url: r.outputS3Url!,
        completedAt: r.completedAt ?? r.createdAt,
      }));
  },
});

/** Debug: list all renders including failed ones. Remove after debugging. */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const renders = await ctx.db.query("renders").collect();
    return renders.map((r) => ({
      _id: r._id,
      status: r.status,
      progress: r.progress,
      error: r.error,
      outputS3Url: r.outputS3Url,
      createdAt: r.createdAt,
    }));
  },
});
