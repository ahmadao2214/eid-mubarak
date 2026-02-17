// Mock API implementations for development without backend
// These stubs let Dev A build and test the full UI flow independently
// They'll be replaced with real Convex calls when Dev B's backend is ready

import type {
  UploadUrlResponse,
  RemoveBgResponse,
  Project,
  RenderJob,
  Asset,
  Sound,
  CelebrityHead,
  CompositionProps,
} from "../types";

// ── Mock delay helper ─────────────────────────────────────

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ── Storage ───────────────────────────────────────────────

export async function mockGetUploadUrl(): Promise<UploadUrlResponse> {
  await delay(300);
  return {
    url: "https://mock-s3.example.com/upload?presigned=true",
  };
}

export async function mockUploadToS3(
  _presignedUrl: string,
  _file: Blob | ArrayBuffer
): Promise<string> {
  await delay(500);
  // Return a fake S3 key
  return `user-photos/mock-user/${Date.now()}.png`;
}

// ── Background Removal ────────────────────────────────────

export async function mockRemoveBackground(
  imageUri: string
): Promise<RemoveBgResponse> {
  await delay(1000);
  // In mock mode, just return the original image as-is (passthrough)
  return {
    resultS3Url: imageUri,
  };
}

// ── Projects (MMKV-backed) ───────────────────────────────

import {
  saveProject,
  getProject as storageGetProject,
  updateProject as storageUpdateProject,
} from "./storage";

export async function mockCreateProject(
  name: string,
  composition: CompositionProps
): Promise<string> {
  await delay(200);
  return saveProject(name, composition);
}

export async function mockGetProject(
  projectId: string
): Promise<Project | null> {
  await delay(100);
  const stored = storageGetProject(projectId);
  if (!stored) return null;
  return {
    id: stored.id,
    name: stored.name,
    composition: stored.composition,
    createdAt: stored.createdAt,
    updatedAt: stored.updatedAt,
  };
}

export async function mockUpdateProject(
  projectId: string,
  composition: CompositionProps
): Promise<void> {
  await delay(200);
  storageUpdateProject(projectId, composition);
}

// ── Renders ───────────────────────────────────────────────

export async function mockRequestRender(
  _projectId: string
): Promise<string> {
  await delay(300);
  return `render-${Date.now()}`;
}

export async function mockGetRenderStatus(
  renderId: string
): Promise<RenderJob> {
  await delay(200);
  // Simulate a completed render
  return {
    id: renderId,
    projectId: "mock-project",
    status: "completed",
    progress: 100,
    outputUrl: "https://mock-s3.example.com/rendered/test-video.mp4",
  };
}

// ── Assets ────────────────────────────────────────────────

export async function mockListAssets(
  _type?: string
): Promise<Asset[]> {
  await delay(200);
  return [
    {
      id: "bg-1",
      type: "background-video",
      name: "Mountain Road Psychedelic",
      url: "https://mock-s3.example.com/backgrounds/mountain-road.mp4",
    },
    {
      id: "bg-2",
      type: "background-video",
      name: "Desert Highway Golden",
      url: "https://mock-s3.example.com/backgrounds/desert-highway.mp4",
    },
    {
      id: "lottie-1",
      type: "lottie",
      name: "Rose Heart Pumping",
      url: "https://mock-s3.example.com/lottie/rose-heart.json",
    },
    {
      id: "lottie-2",
      type: "lottie",
      name: "Floating Petals",
      url: "https://mock-s3.example.com/lottie/floating-petals.json",
    },
  ];
}

// ── Sounds ────────────────────────────────────────────────

export async function mockListSounds(
  _category?: string
): Promise<Sound[]> {
  await delay(200);
  return [
    {
      id: "sound-1",
      name: "Default Nasheed",
      category: "nasheed",
      url: "https://mock-s3.example.com/sounds/default-nasheed.mp3",
      durationSeconds: 15,
    },
  ];
}

// ── Celebrity Heads ───────────────────────────────────────

export async function mockListCelebrityHeads(): Promise<CelebrityHead[]> {
  await delay(200);
  return [
    {
      id: "drake",
      name: "Drake",
      imageUrl: "https://mock-s3.example.com/heads/drake.png",
      thumbnail: "https://mock-s3.example.com/heads/drake-thumb.png",
    },
    {
      id: "shah-rukh-khan",
      name: "Shah Rukh Khan",
      imageUrl: "https://mock-s3.example.com/heads/srk.png",
      thumbnail: "https://mock-s3.example.com/heads/srk-thumb.png",
    },
    {
      id: "aunty-stock",
      name: "Aunty Stock",
      imageUrl: "https://mock-s3.example.com/heads/aunty.png",
      thumbnail: "https://mock-s3.example.com/heads/aunty-thumb.png",
    },
    {
      id: "onija-robinson",
      name: "Onija Robinson",
      imageUrl: "https://mock-s3.example.com/heads/onija.png",
      thumbnail: "https://mock-s3.example.com/heads/onija-thumb.png",
    },
    {
      id: "wow-grape-teacher",
      name: "Wow Grape Teacher",
      imageUrl: "https://mock-s3.example.com/heads/wow-grape.png",
      thumbnail: "https://mock-s3.example.com/heads/wow-grape-thumb.png",
    },
    {
      id: "central-cee",
      name: "Central Cee",
      imageUrl: "https://mock-s3.example.com/heads/central-cee.png",
      thumbnail: "https://mock-s3.example.com/heads/central-cee-thumb.png",
    },
  ];
}
