import { convexClient, api } from "@/lib/convex";
import { mapAsset, mapCelebrityHead, mapSound } from "@/lib/convex-mappers";
import type { CelebrityHead, Asset, Sound } from "@/types";

type AssetType = "background" | "lottie" | "celebrity_head" | "font";
type SoundCategory = "nasheed" | "bollywood" | "voiceover" | "sfx";

export async function listCelebrityHeads(): Promise<CelebrityHead[]> {
  const docs = await convexClient.query(api.assets.listCelebrityHeads, {});
  return docs.map(mapCelebrityHead);
}

export async function listAssets(type?: string): Promise<Asset[]> {
  if (type) {
    const docs = await convexClient.query(api.assets.listByType, {
      type: type as AssetType,
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
      category: category as SoundCategory,
    });
    return docs.map(mapSound);
  }
  const docs = await convexClient.query(api.sounds.listAll, {});
  return docs.map(mapSound);
}
