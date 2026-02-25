#!/usr/bin/env node
/**
 * Sync AWS/S3 env vars from apps/mobile/.env to Convex so the backend can call S3.
 * Run from repo root: bun scripts/sync-aws-env-to-convex.js
 * Requires: S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY in .env
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const repoRoot = path.resolve(__dirname, "..");
const envPath = path.join(repoRoot, "apps", "mobile", ".env");
const keys = ["S3_BUCKET", "AWS_REGION", "AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"];

function parseEnv(pathToEnv) {
  if (!fs.existsSync(pathToEnv)) {
    console.error("Missing:", pathToEnv);
    process.exit(1);
  }
  const content = fs.readFileSync(pathToEnv, "utf8");
  const out = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (keys.includes(key)) out[key] = value;
  }
  return out;
}

function setConvexEnv(key, value) {
  const result = spawnSync(
    "bun",
    ["x", "convex", "env", "set", key, value],
    { cwd: path.join(repoRoot, "apps", "mobile"), stdio: "inherit" }
  );
  return result.status === 0;
}

const env = parseEnv(envPath);
const missing = keys.filter((k) => !env[k]);
if (missing.length) {
  console.error("Missing in .env:", missing.join(", "));
  process.exit(1);
}

console.log("Syncing AWS env to Convex from apps/mobile/.env ...");
for (const key of keys) {
  if (!setConvexEnv(key, env[key])) {
    console.error("Failed to set", key);
    process.exit(1);
  }
}
console.log("Done. Convex has S3_BUCKET, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY.");
