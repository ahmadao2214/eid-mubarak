#!/usr/bin/env node
/**
 * Phase 4: Upload assets to S3 and seed Convex assets table.
 *
 * Prerequisites:
 * - AWS env: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET
 * - Convex: run from repo root; Convex project must be linked in apps/mobile (npx convex dev once)
 * - Copy scripts/asset-manifest.example.json to scripts/asset-manifest.json and add your entries
 *
 * Usage: node scripts/upload-and-seed-assets.js [path-to-manifest.json]
 * Default manifest: scripts/asset-manifest.json
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");

function getEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function buildS3Url(bucket, region, key) {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function guessContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".json": "application/json",
    ".ttf": "font/ttf",
    ".otf": "font/otf",
    ".woff": "font/woff",
    ".woff2": "font/woff2",
  };
  return map[ext] || "application/octet-stream";
}

async function main() {
  const manifestPath =
    path.resolve(repoRoot, process.argv[2] || "scripts/asset-manifest.json");
  if (!fs.existsSync(manifestPath)) {
    console.error(
      "Manifest not found:",
      manifestPath,
      "\nCopy scripts/asset-manifest.example.json to scripts/asset-manifest.json and add your assets."
    );
    process.exit(1);
  }

  const bucket = getEnv("S3_BUCKET");
  const region = getEnv("AWS_REGION");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
  const s3 = new S3Client({ region });

  for (const entry of manifest) {
    const absPath = path.resolve(repoRoot, entry.localPath);
    if (!fs.existsSync(absPath)) {
      console.warn("Skip (file not found):", entry.localPath);
      continue;
    }
    const body = fs.readFileSync(absPath);
    const contentType = guessContentType(entry.localPath);
    await s3.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: entry.s3Key,
        Body: body,
        ContentType: contentType,
      })
    );
    console.log("Uploaded:", entry.s3Key);

    const s3Url = buildS3Url(bucket, region, entry.s3Key);
    const seedPayload = JSON.stringify({
      name: entry.name,
      type: entry.type,
      s3Key: entry.s3Key,
      s3Url,
      tags: entry.tags || [],
    });
    const result = spawnSync(
      "npx",
      ["convex", "run", "assets:seed", seedPayload],
      { stdio: "inherit", cwd: path.join(repoRoot, "apps/mobile") }
    );
    if (result.status !== 0) {
      console.error("Convex seed failed for:", entry.name);
      process.exit(1);
    }
    console.log("Seeded:", entry.name);
  }
  console.log("Done. Upload and seed complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
