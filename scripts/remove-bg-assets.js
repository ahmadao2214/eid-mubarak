#!/usr/bin/env node
/**
 * Remove background from assets using PhotoRoom API.
 * Replaces originals with transparent PNGs (same base name, .png extension).
 *
 * Prerequisites:
 *   PHOTOROOM_API_KEY or PHOTOROOM_SANDBOX_API_KEY in env (or apps/mobile/.env)
 *
 * Usage:
 *   node scripts/remove-bg-assets.js
 *   # Or with env loaded:
 *   cd apps/mobile && source .env 2>/dev/null; cd ../.. && node scripts/remove-bg-assets.js
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.resolve(__dirname, "..");
const ASSETS = path.join(REPO_ROOT, "assets");

const PHOTOROOM_URL = "https://sdk.photoroom.com/v1/segment";

// Files to process: rose, truck-art chain/peacock, and all heads
const FILES = [
  path.join(ASSETS, "rose.jpg"),
  path.join(ASSETS, "pakistani-truck-art-chain.jpg"),
  path.join(ASSETS, "pakistani-truck-art-peacock.jpg"),
  ...fs.readdirSync(path.join(ASSETS, "heads"))
    .filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f))
    .map((f) => path.join(ASSETS, "heads", f)),
];

function getApiKey() {
  const key =
    process.env.PHOTOROOM_API_KEY ?? process.env.PHOTOROOM_SANDBOX_API_KEY;
  if (key && key !== "your_photoroom_api_key_here") return key;
  // Try loading from apps/mobile/.env
  const envPath = path.join(REPO_ROOT, "apps", "mobile", ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    for (const line of content.split("\n")) {
      const m = line.match(/^\s*PHOTOROOM_(?:SANDBOX_)?API_KEY\s*=\s*(.+)/);
      if (m) {
        const v = m[1].trim().replace(/^["']|["']$/g, "");
        if (v && v !== "your_photoroom_api_key_here") return v;
      }
    }
  }
  return null;
}

async function removeBackground(apiKey, inputPath) {
  const body = new FormData();
  const buffer = fs.readFileSync(inputPath);
  body.append("image_file", new Blob([buffer]), path.basename(inputPath));

  const res = await fetch(PHOTOROOM_URL, {
    method: "POST",
    headers: { "x-api-key": apiKey },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PhotoRoom failed (${res.status}): ${text.slice(0, 300)}`);
  }

  return Buffer.from(await res.arrayBuffer());
}

async function main() {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error(
      "Missing PHOTOROOM_API_KEY. Set it in env or apps/mobile/.env"
    );
    process.exit(1);
  }

  const toProcess = FILES.filter((p) => fs.existsSync(p));
  if (toProcess.length === 0) {
    console.log("No files to process.");
    return;
  }

  console.log(`Processing ${toProcess.length} file(s)...`);
  let done = 0;
  let failed = 0;

  for (const inputPath of toProcess) {
      const rel = path.relative(REPO_ROOT, inputPath);
      const ext = path.extname(inputPath);
      const base = path.basename(inputPath, ext);
      const dir = path.dirname(inputPath);
      const outPath = path.join(dir, `${base}.png`);

      try {
        const png = await removeBackground(apiKey, inputPath);
        fs.writeFileSync(outPath, png);
        await new Promise((r) => setTimeout(r, 500)); // avoid rate limits
        if (ext.toLowerCase() !== ".png") {
          fs.unlinkSync(inputPath);
        }
        console.log(`  ✓ ${rel} → ${path.relative(REPO_ROOT, outPath)}`);
        done++;
      } catch (err) {
        console.error(`  ✗ ${rel}: ${err.message}`);
        failed++;
      }
  }

  console.log(`\nDone. ${done} updated, ${failed} failed.`);
  if (done > 0) {
    console.log(
      "\nNote: Files are now .png. Update references in presets, templates, and seed-assets if they still point to .jpg"
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
