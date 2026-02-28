#!/usr/bin/env node
/**
 * Reseed celebrity_head assets in Convex using PNG S3 keys.
 *
 * Usage (from repo root):
 *   node scripts/reseed-celebrity-heads.js
 *
 * Reads Convex URL and S3 bucket/region from apps/mobile/.env or process.env.
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

  const S3_BASE = `https://${bucket}.s3.${region}.amazonaws.com`;
  const client = new ConvexHttpClient(convexUrl);

  const celebrityHeads = [
    { name: "Zohran", s3Key: "heads/zohran.png", tags: ["celebrity", "politician"] },
    { name: "Central Cee", s3Key: "heads/central-cee.png", tags: ["celebrity"] },
    { name: "Drake Hijab", s3Key: "heads/drak-hijab.png", tags: ["celebrity"] },
    { name: "Mufti", s3Key: "heads/mufti.png", tags: ["celebrity"] },
    { name: "Onijah Robinson", s3Key: "heads/onijah-robinson.png", tags: ["celebrity"] },
    { name: "Sehad Kamran", s3Key: "heads/sehad-kamran.png", tags: ["celebrity"] },
    // SRK still JPG on purpose; leave as-is
  ];

  let seeded = 0;
  for (const head of celebrityHeads) {
    const s3Url = `${S3_BASE}/${head.s3Key}`;
    console.log(`Seeding ${head.name} -> ${head.s3Key}`);
    await client.mutation(api.assets.seed, {
      name: head.name,
      type: "celebrity_head",
      s3Key: head.s3Key,
      s3Url,
      tags: head.tags,
    });
    seeded++;
  }

  console.log(`Done. Seeded ${seeded} celebrity heads (idempotent).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

