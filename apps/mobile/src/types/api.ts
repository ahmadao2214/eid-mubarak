// API contract types — the boundary between Dev A (frontend) and Dev B (backend)
// Dev A calls these. Dev B implements them as Convex functions.

import type { CompositionProps } from "./composition";

// ── Storage / Upload ──────────────────────────────────────

export interface UploadUrlResponse {
  url: string; // Presigned S3 upload URL
}

export interface ConfirmUploadParams {
  s3Key: string;
  type: "user-photo" | "rendered-video";
}

export interface UploadResult {
  s3Key: string | null;
  success: boolean;
  error?: string;
}

// ── Background Removal ────────────────────────────────────

export interface RemoveBgParams {
  s3Key: string;
}

export interface RemoveBgResponse {
  resultS3Url: string; // URL to the transparent PNG
}

// ── Projects ──────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  composition: CompositionProps;
  createdAt: number;
  updatedAt: number;
}

export interface CreateProjectParams {
  name: string;
  composition: CompositionProps;
}

export interface UpdateProjectParams {
  projectId: string;
  composition: CompositionProps;
}

// ── Renders ───────────────────────────────────────────────

export type RenderStatus = "queued" | "rendering" | "completed" | "failed";

export interface RenderJob {
  id: string;
  projectId: string;
  status: RenderStatus;
  progress: number; // 0-100
  outputUrl?: string; // S3 URL when completed
  error?: string;
}

export interface RequestRenderParams {
  projectId: string;
}

// ── Assets ────────────────────────────────────────────────

export type AssetType =
  | "background-video"
  | "background-image"
  | "lottie"
  | "celebrity-head"
  | "font"
  | "sound";

export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  url: string; // S3 URL
  thumbnail?: string;
  metadata?: Record<string, unknown>;
}

export type SoundCategory = "nasheed" | "bollywood" | "sfx" | "voiceover";

export interface Sound {
  id: string;
  name: string;
  category: SoundCategory;
  url: string;
  durationSeconds: number;
}

// ── Celebrity/Meme Heads ──────────────────────────────────

export interface CelebrityHead {
  id: string;
  name: string;
  imageUrl: string; // Pre-cropped transparent PNG
  thumbnail: string;
}

export const CELEBRITY_HEADS: readonly string[] = [
  "drake",
  "shah-rukh-khan",
  "aunty-stock",
  "onija-robinson",
  "wow-grape-teacher",
  "central-cee",
] as const;
