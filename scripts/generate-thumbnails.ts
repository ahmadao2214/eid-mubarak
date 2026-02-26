/**
 * Generate pre-rendered thumbnail PNGs for each preset.
 *
 * Usage:
 *   cd packages/remotion
 *   npx ts-node ../../scripts/generate-thumbnails.ts
 *
 * Or with specific presets:
 *   npx ts-node ../../scripts/generate-thumbnails.ts --preset zohran-classic
 *
 * Workflow:
 *   1. Open Remotion Studio (`bun run studio` in packages/remotion)
 *   2. Scrub through each preset composition to find the best frame
 *   3. Update the THUMBNAIL_FRAMES map below with chosen frame numbers
 *   4. Run this script to render PNGs to out/thumbnails/
 *   5. Upload PNGs to S3 via upload-assets-to-s3.sh
 *   6. Update thumbnailUrl in apps/mobile/src/lib/presets.ts with S3 URLs
 */

import path from "path";
import { bundle } from "@remotion/bundler";
import { renderStill } from "@remotion/renderer";

// Frame numbers to capture for each preset thumbnail.
// Pick these by scrubbing through Remotion Studio.
const THUMBNAIL_FRAMES: Record<string, number> = {
  "zohran-classic": 90,   // ~3s — head + flowers visible, text entering
  "trucker-art": 90,      // ~3s — border + head + text
  "celebrity-greeting": 90, // ~3s — head popped in, greeting text visible
  "six-head-spiral": 90,  // ~3s — spiral in progress
  "custom": 0,            // frame 0 — blank canvas
};

async function main() {
  const args = process.argv.slice(2);
  const presetFlag = args.indexOf("--preset");
  const selectedPreset = presetFlag !== -1 ? args[presetFlag + 1] : undefined;

  const presets = selectedPreset
    ? { [selectedPreset]: THUMBNAIL_FRAMES[selectedPreset] ?? 90 }
    : THUMBNAIL_FRAMES;

  const entryPoint = path.resolve(__dirname, "../packages/remotion/src/index.ts");
  const outDir = path.resolve(__dirname, "../out/thumbnails");

  console.log("Bundling Remotion project...");
  const bundled = await bundle({
    entryPoint,
    onProgress: (progress) => {
      if (progress % 25 === 0) console.log(`  Bundle progress: ${progress}%`);
    },
  });

  for (const [presetId, frame] of Object.entries(presets)) {
    const compositionId = `EidMemeVideo-${presetId}`;
    const outputPath = path.join(outDir, `${presetId}.png`);

    console.log(`Rendering ${compositionId} frame ${frame} -> ${outputPath}`);

    await renderStill({
      serveUrl: bundled,
      composition: {
        id: compositionId,
        durationInFrames: 300,
        fps: 30,
        width: 1080,
        height: 1920,
        defaultProps: {},
        props: {},
        defaultCodec: "h264",
      },
      output: outputPath,
      frame,
      imageFormat: "png",
    });

    console.log(`  Saved: ${outputPath}`);
  }

  console.log("\nDone! Upload thumbnails to S3, then update thumbnailUrl in presets.ts");
}

main().catch((err) => {
  console.error("Thumbnail generation failed:", err);
  process.exit(1);
});
