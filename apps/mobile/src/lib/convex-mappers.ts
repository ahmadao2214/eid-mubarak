// Type mapping between Convex schema types and frontend types
import type { Doc } from "../../../convex/_generated/dataModel";
import type {
  Project,
  Asset,
  AssetType,
  CelebrityHead,
  Sound,
  RenderJob,
  RenderStatus,
} from "@/types/api";

// ── Asset type mapping ──────────────────────────────────────

export function mapAssetType(
  schemaType: Doc<"assets">["type"],
  s3Url: string,
): AssetType {
  switch (schemaType) {
    case "background": {
      const ext = s3Url.split(".").pop()?.toLowerCase() ?? "";
      return ["mp4", "mov", "webm"].includes(ext)
        ? "background-video"
        : "background-image";
    }
    case "lottie":
      return "lottie";
    case "celebrity_head":
      return "celebrity-head";
    case "font":
      return "font";
  }
}

// ── Render status mapping ───────────────────────────────────

export function mapRenderStatus(
  schemaStatus: Doc<"renders">["status"],
): RenderStatus {
  if (schemaStatus === "pending") return "queued";
  return schemaStatus;
}

// ── Document mappers ────────────────────────────────────────

export function mapProject(doc: Doc<"projects">): Project {
  return {
    id: doc._id,
    name: doc.name,
    composition: doc.composition,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function mapAsset(doc: Doc<"assets">): Asset {
  return {
    id: doc._id,
    type: mapAssetType(doc.type, doc.s3Url),
    name: doc.name,
    url: doc.s3Url,
  };
}

export function mapCelebrityHead(doc: Doc<"assets">): CelebrityHead {
  return {
    id: doc._id,
    name: doc.name,
    imageUrl: doc.s3Url,
    thumbnail: doc.s3Url, // Same URL for now; can add thumbs later
  };
}

export function mapSound(doc: Doc<"sounds">): Sound {
  return {
    id: doc._id,
    name: doc.name,
    category: doc.category,
    url: doc.s3Url,
    durationSeconds: doc.duration,
  };
}

export function mapRender(doc: Doc<"renders">): RenderJob {
  return {
    id: doc._id,
    projectId: doc.projectId,
    status: mapRenderStatus(doc.status),
    progress: doc.progress,
    outputUrl: doc.outputS3Url,
    error: doc.error,
  };
}
