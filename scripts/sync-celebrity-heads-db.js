#!/usr/bin/env node
/**
 * Sync Convex celebrity_head assets with the code.
 * Use after S3 changes (e.g. deleting old .jpg, uploading new .png) so the DB
 * points to the correct keys and URLs.
 *
 * - Deletes all existing celebrity_head rows (removes stale/wrong keys).
 * - Inserts the canonical 7 heads from code (s3Key + s3Url from env).
 *
 * Canonical list must match: apps/mobile/src/lib/head-assets.ts and
 * scripts/seed-assets.ts (names + keys).
 *
 * Usage (from repo root):
 *   node scripts/sync-celebrity-heads-db.js
 *
 * Requires in apps/mobile/.env (or process.env):
 *   CONVEX_URL or EXPO_PUBLIC_CONVEX_URL
 *   S3_BUCKET
 *   AWS_REGION (optional, default us-east-1)
 */

const fs = require("fs");
const path = require("path");
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../apps/mobile/convex/_generated/api");

const REPO_ROOT = path.resolve(__dirname, "..");

function loadEnv() {
  const env = { ...process.env };
  // Load .env.local first (higher priority, matches Expo's load order), then .env
  const envFiles = [
    path.join(REPO_ROOT, "apps", "mobile", ".env.local"),
    path.join(REPO_ROOT, "apps", "mobile", ".env"),
  ];
  for (const envPath of envFiles) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.+)\s*$/);
        if (m) {
          const key = m[1];
          const val = m[2].trim().replace(/^['"]|['"]$/g, "");
          if (!env[key]) env[key] = val;
        }
      }
    }
  }
  return env;
}

// Canonical list — must stay in sync with head-assets.ts and seed-assets.ts
const CANONICAL_HEADS = [
  { name: "Zohran", s3Key: "heads/zohran.png", tags: ["celebrity", "politician"] },
  { name: "Central Cee", s3Key: "heads/central-cee.png", tags: ["celebrity"] },
  { name: "Drake Hijab", s3Key: "heads/drak-hijab.png", tags: ["celebrity"] },
  { name: "Mufti", s3Key: "heads/mufti.png", tags: ["celebrity"] },
  { name: "Onijah Robinson", s3Key: "heads/onijah-robinson.png", tags: ["celebrity"] },
  { name: "Sehad Kamran", s3Key: "heads/sehad-kamran.png", tags: ["celebrity"] },
  { name: "SRK", s3Key: "heads/srk.png", tags: ["celebrity", "bollywood"] },
];

async function main() {
  const env = loadEnv();
  const convexUrl = env.CONVEX_URL || env.EXPO_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("Missing CONVEX_URL or EXPO_PUBLIC_CONVEX_URL in apps/mobile/.env");
    process.exit(1);
  }

  const bucket = env.S3_BUCKET;
  const region = env.AWS_REGION || "us-east-1";
  if (!bucket) {
    console.error("Missing S3_BUCKET in apps/mobile/.env");
    process.exit(1);
  }

  const S3_BASE = `https://${bucket}.s3.${region}.amazonaws.com`;
  const client = new ConvexHttpClient(convexUrl);

  console.log("Fetching existing celebrity_head assets...");
  const existing = await client.query(api.assets.listCelebrityHeads, {});
  console.log(`  Found ${existing.length} row(s).`);

  for (const doc of existing) {
    console.log(`  Deleting: ${doc.name} (${doc.s3Key})`);
    await client.mutation(api.assets.deleteById, { id: doc._id });
  }

  console.log("\nSeeding canonical 7 heads (synced with code):");
  for (const head of CANONICAL_HEADS) {
    const s3Url = `${S3_BASE}/${head.s3Key}`;
    const id = await client.mutation(api.assets.seed, {
      name: head.name,
      type: "celebrity_head",
      s3Key: head.s3Key,
      s3Url,
      tags: head.tags,
    });
    console.log(`  ${head.name} → ${head.s3Key} → ${id}`);
  }

  const verify = await client.query(api.assets.listCelebrityHeads, {});
  console.log(`\nDone. DB now has ${verify.length} celebrity_head asset(s).`);
  verify.forEach((doc) => {
    console.log(`  - ${doc.name}: s3Key=${doc.s3Key}, s3Url=${doc.s3Url}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
