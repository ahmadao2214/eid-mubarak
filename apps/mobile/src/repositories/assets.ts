import { convexClient, api } from "@/lib/convex";
import { mapAsset, mapCelebrityHead, mapSound } from "@/lib/convex-mappers";
import type { CelebrityHead, Asset, Sound } from "@/types";

export async function listCelebrityHeads(): Promise<CelebrityHead[]> {
  console.log("[assets repo] listCelebrityHeads called, api ref:", api.assets.listCelebrityHeads);
  const docs = await convexClient.query(api.assets.listCelebrityHeads, {});
  console.log("[assets repo] got docs:", docs?.length ?? "null/undefined");
  return docs.map(mapCelebrityHead);
}

export async function listAssets(type?: string): Promise<Asset[]> {
  if (type) {
    const docs = await convexClient.query(api.assets.listByType, {
      type: type as any,
    });
    return docs.map(mapAsset);
  }
  // No type filter — fetch all asset types
  const [backgrounds, lotties, heads, fonts] = await Promise.all([
    convexClient.query(api.assets.listByType, { type: "background" }),
    convexClient.query(api.assets.listByType, { type: "lottie" }),
    convexClient.query(api.assets.listByType, { type: "celebrity_head" }),
    convexClient.query(api.assets.listByType, { type: "font" }),
  ]);
  return [...backgrounds, ...lotties, ...heads, ...fonts].map(mapAsset);
}

export async function listSounds(category?: string): Promise<Sound[]> {
  if (category) {
    const docs = await convexClient.query(api.sounds.listByCategory, {
      category: category as any,
    });
    return docs.map(mapSound);
  }
  const docs = await convexClient.query(api.sounds.listAll, {});
  return docs.map(mapSound);
}
