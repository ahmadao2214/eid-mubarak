import {
  mockListCelebrityHeads,
  mockListAssets,
  mockListSounds,
} from "@/lib/mock-api";
import type { CelebrityHead, Asset, Sound } from "@/types";

export async function listCelebrityHeads(): Promise<CelebrityHead[]> {
  return mockListCelebrityHeads();
}

export async function listAssets(type?: string): Promise<Asset[]> {
  return mockListAssets(type);
}

export async function listSounds(category?: string): Promise<Sound[]> {
  return mockListSounds(category);
}
