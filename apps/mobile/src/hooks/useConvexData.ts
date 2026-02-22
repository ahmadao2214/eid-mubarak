/**
 * Custom React hooks wrapping Convex useQuery / useMutation / useAction
 * with the mapper layer so screens get typed frontend models.
 *
 * These hooks go through the ConvexReactClient (WebSocket) which works
 * reliably in React Native, unlike ConvexHttpClient (HTTP fetch).
 */

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  mapCelebrityHead,
  mapProject,
  mapRender,
  mapAsset,
  mapSound,
} from "@/lib/convex-mappers";
import type { CelebrityHead, Project, RenderJob, Asset, Sound } from "@/types";
import type { Id } from "../../convex/_generated/dataModel";

// ── Query hooks ─────────────────────────────────────────────

export function useCelebrityHeads(): CelebrityHead[] {
  const docs = useQuery(api.assets.listCelebrityHeads);
  if (!docs) return [];
  return docs.map(mapCelebrityHead);
}

export function useAllProjects(): { projects: Project[]; isLoading: boolean } {
  const docs = useQuery(api.projects.list);
  if (docs === undefined) return { projects: [], isLoading: true };
  return { projects: docs.map(mapProject), isLoading: false };
}

export function useProject(
  id: string | undefined,
): { project: Project | null; isLoading: boolean } {
  const doc = useQuery(
    api.projects.get,
    id ? { id: id as Id<"projects"> } : "skip",
  );
  if (doc === undefined) return { project: null, isLoading: !!id };
  if (doc === null) return { project: null, isLoading: false };
  return { project: mapProject(doc), isLoading: false };
}

export function useRenderStatus(
  renderId: string | undefined,
): RenderJob | undefined {
  const doc = useQuery(
    api.renders.getStatus,
    renderId ? { renderId: renderId as Id<"renders"> } : "skip",
  );
  if (!doc) return undefined;
  return mapRender(doc);
}

export function useAssetsByType(type: string): Asset[] {
  const docs = useQuery(api.assets.listByType, {
    type: type as "background" | "lottie" | "celebrity_head" | "font",
  });
  if (!docs) return [];
  return docs.map(mapAsset);
}

export function useAllSounds(): Sound[] {
  const docs = useQuery(api.sounds.listAll);
  if (!docs) return [];
  return docs.map(mapSound);
}

// ── Mutation hooks ──────────────────────────────────────────

export function useCreateProject() {
  return useMutation(api.projects.create);
}

export function useUpdateProject() {
  return useMutation(api.projects.update);
}

export function useRemoveProject() {
  return useMutation(api.projects.remove);
}

export function useRequestRender() {
  return useMutation(api.renders.request);
}

// ── Action hooks ────────────────────────────────────────────
// Note: For uploads, use the useUpload() hook from ./useUpload.ts instead.
// It wraps getUploadUrl + confirmUpload from api.storage with full error handling.

export function useRemoveBackground() {
  return useAction(api.uploads.removeBackground);
}
