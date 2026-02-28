#!/usr/bin/env node
/**
 * Delete obsolete JPG celebrity head assets from S3.
 *
 * We now use transparent PNGs for all heads except SRK, so it's safe to delete:
 *   heads/zohran.jpg
 *   heads/central-cee.jpg
 *   heads/drak-hijab.jpg
 *   heads/mufti.jpg
 *   heads/onijah-robinson.jpg
 *   heads/sehad-kamran.jpg
 *
 * Usage (from repo root, with AWS env set – e.g. apps/mobile/.env):
 *   node scripts/delete-old-head-jpgs.js
 */

const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");

const keysToDelete = [
  "heads/zohran.jpg",
  "heads/central-cee.jpg",
  "heads/drak-hijab.jpg",
  "heads/mufti.jpg",
  "heads/onijah-robinson.jpg",
  "heads/sehad-kamran.jpg",
];

async function main() {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.AWS_REGION || "us-east-1";
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    console.error(
      "Missing S3 env: S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY"
    );
    process.exit(1);
  }

  const s3 = new S3Client({
    region,
    credentials: { accessKeyId, secretAccessKey },
  });

  let deleted = 0;
  let failed = 0;

  for (const Key of keysToDelete) {
    try {
      await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key }));
      console.log("Deleted:", Key);
      deleted++;
    } catch (err) {
      console.error("Failed to delete", Key, "-", err instanceof Error ? err.message : err);
      failed++;
    }
  }

  console.log(`Done. Deleted ${deleted}, failed ${failed}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

