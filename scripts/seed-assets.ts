#!/usr/bin/env bun
/**
 * Seed script — inserts asset and sound records into Convex.
 *
 * Usage:
 *   CONVEX_URL=<your-deployment-url> bun run scripts/seed-assets.ts
 *
 * S3 URLs: if S3_BUCKET (and optionally AWS_REGION) are set in apps/mobile/.env
 * or env, uses https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com so DB matches
 * Convex storage; otherwise falls back to default bucket URL.
 *
 * For celebrity heads only, use scripts/sync-celebrity-heads-db.js to replace
 * all heads with the canonical 7 (fixes stale keys after S3 .jpg → .png changes).
 *
 * All seed mutations are idempotent (safe to re-run).
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../apps/mobile/convex/_generated/api";

const REPO_ROOT = resolve(import.meta.dir, "..");

function loadEnv(): Record<string, string> {
  const env = { ...process.env } as Record<string, string>;
  const envPath = resolve(REPO_ROOT, "apps", "mobile", ".env");
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
      if (m && !env[m[1]]) env[m[1]] = m[2].trim().replace(/^['"]|['"]$/g, "");
    }
  }
  return env;
}

const env = loadEnv();
const CONVEX_URL = env.CONVEX_URL ?? env.EXPO_PUBLIC_CONVEX_URL ?? "";

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL or EXPO_PUBLIC_CONVEX_URL env var required");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const bucket = env.S3_BUCKET;
const region = env.AWS_REGION ?? "us-east-1";
const S3_BASE =
  bucket ? `https://${bucket}.s3.${region}.amazonaws.com` : "https://eid-meme-maker-assets.s3.amazonaws.com";

// ── Celebrity Heads ─────────────────────────────────────────

const celebrityHeads = [
  { name: "Zohran", s3Key: "heads/zohran.png", tags: ["celebrity", "politician"] },
  { name: "Central Cee", s3Key: "heads/central-cee.png", tags: ["celebrity"] },
  { name: "Drake Hijab", s3Key: "heads/drak-hijab.png", tags: ["celebrity"] },
  { name: "Mufti", s3Key: "heads/mufti.png", tags: ["celebrity"] },
  { name: "Onijah Robinson", s3Key: "heads/onijah-robinson.png", tags: ["celebrity"] },
  { name: "Sehad Kamran", s3Key: "heads/sehad-kamran.png", tags: ["celebrity"] },
  { name: "SRK", s3Key: "heads/srk.jpg", tags: ["celebrity", "bollywood"] },
];

// ── Backgrounds ─────────────────────────────────────────────

const backgrounds = [
  { name: "Mountain Road Psychedelic", s3Key: "backgrounds/mountain-road.mp4", tags: ["psychedelic", "outdoor"] },
  { name: "Desert Highway Golden", s3Key: "backgrounds/desert-highway.mp4", tags: ["golden", "outdoor"] },
  { name: "Trucker Panel Art", s3Key: "backgrounds/trucker-panel.jpg", tags: ["trucker", "art"] },
  // Phase 5 backgrounds from assets/backgrounds/
  { name: "Desert Dunes", s3Key: "backgrounds/desert.jpg", tags: ["desert", "outdoor"] },
  { name: "Desert Road", s3Key: "backgrounds/desert-road.jpg", tags: ["desert", "road", "outdoor"] },
  { name: "Caribbean Beach", s3Key: "backgrounds/beach-caribbean.jpg", tags: ["beach", "ocean", "outdoor"] },
  { name: "Flower Landscape", s3Key: "backgrounds/flower-landscape.jpg", tags: ["flowers", "landscape"] },
];

// ── Lottie Animations ───────────────────────────────────────

const lotties = [
  { name: "Rose Bloom", s3Key: "lottie/rose-bloom.json", tags: ["flower", "bloom"] },
  { name: "Sunflower Open", s3Key: "lottie/sunflower-open.json", tags: ["flower", "bloom"] },
  { name: "Lotus Open", s3Key: "lottie/lotus-open.json", tags: ["flower", "bloom"] },
  { name: "Rose Heart", s3Key: "lottie/rose-heart.json", tags: ["flower", "heart"] },
  { name: "Sparkle Overlay", s3Key: "lottie/sparkle-overlay.json", tags: ["sparkle", "overlay"] },
  { name: "Gold Particles", s3Key: "lottie/gold-particles.json", tags: ["gold", "particles"] },
];

// ── Fonts ───────────────────────────────────────────────────

const fonts = [
  { name: "Psychedelic", s3Key: "fonts/psychedelic.ttf", tags: ["display", "psychedelic"] },
  { name: "Bollywood", s3Key: "fonts/bollywood.ttf", tags: ["display", "bollywood"] },
  { name: "Trucker Art", s3Key: "fonts/trucker-art.ttf", tags: ["display", "trucker"] },
];

// ── Sounds ──────────────────────────────────────────────────

const sounds = [
  {
    name: "Default Nasheed",
    category: "nasheed" as const,
    duration: 15,
    s3Key: "sounds/default-nasheed.mp3",
    attribution: "Public domain",
    tags: ["eid", "default"],
  },
];

// ── Seed ────────────────────────────────────────────────────

async function seed() {
  console.log("Seeding assets to Convex...\n");

  // Celebrity heads
  for (const head of celebrityHeads) {
    const id = await client.mutation(api.assets.seed, {
      name: head.name,
      type: "celebrity_head",
      s3Key: head.s3Key,
      s3Url: `${S3_BASE}/${head.s3Key}`,
      tags: head.tags,
    });
    console.log(`  [celebrity_head] ${head.name} → ${id}`);
  }

  // Backgrounds
  for (const bg of backgrounds) {
    const id = await client.mutation(api.assets.seed, {
      name: bg.name,
      type: "background",
      s3Key: bg.s3Key,
      s3Url: `${S3_BASE}/${bg.s3Key}`,
      tags: bg.tags,
    });
    console.log(`  [background] ${bg.name} → ${id}`);
  }

  // Lottie
  for (const lottie of lotties) {
    const id = await client.mutation(api.assets.seed, {
      name: lottie.name,
      type: "lottie",
      s3Key: lottie.s3Key,
      s3Url: `${S3_BASE}/${lottie.s3Key}`,
      tags: lottie.tags,
    });
    console.log(`  [lottie] ${lottie.name} → ${id}`);
  }

  // Fonts
  for (const font of fonts) {
    const id = await client.mutation(api.assets.seed, {
      name: font.name,
      type: "font",
      s3Key: font.s3Key,
      s3Url: `${S3_BASE}/${font.s3Key}`,
      tags: font.tags,
    });
    console.log(`  [font] ${font.name} → ${id}`);
  }

  // Sounds
  for (const sound of sounds) {
    const id = await client.mutation(api.sounds.seed, {
      name: sound.name,
      category: sound.category,
      duration: sound.duration,
      s3Key: sound.s3Key,
      s3Url: `${S3_BASE}/${sound.s3Key}`,
      attribution: sound.attribution,
      tags: sound.tags,
    });
    console.log(`  [sound] ${sound.name} → ${id}`);
  }

  console.log("\nSeed complete!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
