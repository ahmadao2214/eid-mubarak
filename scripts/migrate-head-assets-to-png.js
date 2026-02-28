#!/usr/bin/env node
/**
 * Migrate Convex celebrity_head assets to use PNG S3 keys/URLs.
 *
 * - Reads Convex URL and S3 bucket/region from apps/mobile/.env (or process.env)
 * - For each celebrity_head asset whose key ends with .jpg and has a matching
 *   local PNG file in assets/heads, deletes the old doc and seeds a new one
 *   with s3Key "heads/<name>.png" and s3Url "https://<bucket>.s3.<region>.amazonaws.com/heads/<name>.png".
 * - SRK remains JPG (no PNG generated).
 *
 * Usage:
 *   node scripts/migrate-head-assets-to-png.js
 */

const fs = require("fs");
const path = require("path");
const { ConvexHttpClient } = require("convex/browser");
const { api } = require("../apps/mobile/convex/_generated/api");

const REPO_ROOT = path.resolve(__dirname, "..");

function loadEnv() {
  const env = { ...process.env };
  const envPath = path.join(REPO_ROOT, "apps", "mobile", ".env");
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
  return env;
}

async function main() {
  const env = loadEnv();
  const convexUrl = env.CONVEX_URL || env.EXPO_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    console.error("Missing CONVEX_URL or EXPO_PUBLIC_CONVEX_URL in env/.env");
    process.exit(1);
  }

  const bucket = env.S3_BUCKET;
  const region = env.AWS_REGION || "us-east-1";
  if (!bucket) {
    console.error("Missing S3_BUCKET in env/.env");
    process.exit(1);
  }

  const client = new ConvexHttpClient(convexUrl);

  console.log("Fetching celebrity_head assets from Convex...");
  const docs = await client.query(api.assets.listCelebrityHeads, {});

  const assetsDir = path.join(REPO_ROOT, "assets", "heads");
  const pngFiles = new Set(
    fs.existsSync(assetsDir)
      ? fs
          .readdirSync(assetsDir)
          .filter((f) => f.toLowerCase().endsWith(".png"))
      : []
  );

  let migrated = 0;
  let skipped = 0;

  for (const doc of docs) {
    const key = doc.s3Key;
    if (!key.endsWith(".jpg")) {
      skipped++;
      continue;
    }
    const base = path.basename(key, ".jpg");
    // Keep SRK as JPG for now (no PNG / failed conversion)
    if (base === "srk") {
      skipped++;
      continue;
    }
    const pngName = `${base}.png`;
    if (!pngFiles.has(pngName)) {
      console.warn(`Skip ${doc.name} (${key}) — no local PNG at ${pngName}`);
      skipped++;
      continue;
    }

    const newKey = `heads/${pngName}`;
    const newUrl = `https://${bucket}.s3.${region}.amazonaws.com/${newKey}`;

    console.log(`Migrating ${doc.name}: ${key} -> ${newKey}`);

    // Delete old doc and seed new one with PNG key/url
    await client.mutation(api.assets.deleteById, { id: doc._id });
    await client.mutation(api.assets.seed, {
      name: doc.name,
      type: "celebrity_head",
      s3Key: newKey,
      s3Url: newUrl,
      tags: doc.tags || [],
    });
    migrated++;
  }

  console.log(`Done. Migrated ${migrated}, skipped ${skipped}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

