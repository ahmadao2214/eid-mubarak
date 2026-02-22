#!/usr/bin/env bun
/**
 * Seed script — inserts asset and sound records into Convex.
 *
 * Usage:
 *   CONVEX_URL=<your-deployment-url> bun run scripts/seed-assets.ts
 *
 * The S3 URLs below are placeholders. Replace them with real S3 URLs after
 * running upload-assets-to-s3.sh.
 *
 * All seed mutations are idempotent (safe to re-run).
 */

import { ConvexHttpClient } from "convex/browser";
import { api } from "../apps/mobile/convex/_generated/api";

const CONVEX_URL = process.env.CONVEX_URL ?? process.env.EXPO_PUBLIC_CONVEX_URL ?? "";

if (!CONVEX_URL) {
  console.error("Error: CONVEX_URL or EXPO_PUBLIC_CONVEX_URL env var required");
  process.exit(1);
}

const client = new ConvexHttpClient(CONVEX_URL);

const S3_BASE = "https://eid-meme-maker-assets.s3.amazonaws.com";

// ── Celebrity Heads ─────────────────────────────────────────

const celebrityHeads = [
  { name: "Zohran", s3Key: "heads/zohran.png", tags: ["politician"] },
  { name: "Drake", s3Key: "heads/drake.png", tags: ["rapper"] },
  { name: "Shah Rukh Khan", s3Key: "heads/srk.png", tags: ["bollywood"] },
  { name: "Aunty Stock", s3Key: "heads/aunty-stock.png", tags: ["meme"] },
  { name: "Onija Robinson", s3Key: "heads/onija-robinson.png", tags: ["meme"] },
  { name: "Wow Grape Teacher", s3Key: "heads/wow-grape-teacher.png", tags: ["meme"] },
  { name: "Central Cee", s3Key: "heads/central-cee.png", tags: ["rapper"] },
];

// ── Backgrounds ─────────────────────────────────────────────

const backgrounds = [
  { name: "Mountain Road Psychedelic", s3Key: "backgrounds/mountain-road.mp4", tags: ["psychedelic", "outdoor"] },
  { name: "Desert Highway Golden", s3Key: "backgrounds/desert-highway.mp4", tags: ["golden", "outdoor"] },
  { name: "Trucker Panel Art", s3Key: "backgrounds/trucker-panel.jpg", tags: ["trucker", "art"] },
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
