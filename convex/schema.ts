import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Projects (user's video cards — no auth for MVP, anonymous)
  projects: defineTable({
    name: v.string(),
    templateId: v.string(),
    composition: v.any(), // Full CompositionProps from apps/mobile/src/types/composition.ts
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  // Render jobs
  renders: defineTable({
    projectId: v.id("projects"),
    status: v.union(
      v.literal("pending"),
      v.literal("rendering"),
      v.literal("completed"),
      v.literal("failed")
    ),
    outputS3Url: v.optional(v.string()),
    error: v.optional(v.string()),
    progress: v.number(),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  }).index("by_project", ["projectId"]),

  // Sound library
  sounds: defineTable({
    name: v.string(),
    category: v.union(
      v.literal("nasheed"),
      v.literal("bollywood"),
      v.literal("voiceover"),
      v.literal("sfx")
    ),
    duration: v.number(),
    s3Key: v.string(),
    s3Url: v.string(),
    attribution: v.optional(v.string()),
    tags: v.array(v.string()),
  }).index("by_category", ["category"]),

  // Asset library (backgrounds, lottie files, celebrity heads, fonts)
  assets: defineTable({
    name: v.string(),
    type: v.union(
      v.literal("background"),
      v.literal("lottie"),
      v.literal("celebrity_head"),
      v.literal("font")
    ),
    s3Key: v.string(),
    s3Url: v.string(),
    tags: v.array(v.string()),
  }).index("by_type", ["type"]),

  // Uploads (metadata for presigned uploads: user-photo, rendered-video)
  uploads: defineTable({
    s3Key: v.string(),
    type: v.union(v.literal("user-photo"), v.literal("rendered-video")),
    createdAt: v.number(),
  }).index("by_s3Key", ["s3Key"]),
});
