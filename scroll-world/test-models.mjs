#!/usr/bin/env node
// scroll-world/test-models.mjs
// Phase 0 quality comparison: same still + same prompt across 2-3 candidate
// fal.ai video models, to pick the one that heads into full production.
// Usage: node scroll-world/test-models.mjs

import { fal } from "@fal-ai/client";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true });

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const STILL = path.join(ROOT, "public/yamal/01-aerial-masterplan.jpeg");
const OUT = path.join(HERE, "work");
fs.mkdirSync(OUT, { recursive: true });

if (!process.env.FAL_KEY) {
  console.error("FAL_KEY not set — check .env.local");
  process.exit(1);
}
fal.config({ credentials: process.env.FAL_KEY });

const PROMPT =
  "Single continuous cinematic camera move, no cuts. Begin high above the open Gulf looking down at the YAMAL coastal masterplan, then descend smoothly and glide forward toward the crescent international marina, boats and shoreline coming into sharp focus, golden-hour light, calm turquoise water. Photorealistic architectural visualization, ultra-detailed, no text, no watermark.";

async function uploadStill() {
  const buf = fs.readFileSync(STILL);
  const blob = new Blob([buf], { type: "image/jpeg" });
  return fal.storage.upload(blob);
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed ${res.status}: ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

const CANDIDATES = [
  {
    name: "kling_v3_pro",
    model: "fal-ai/kling-video/v3/pro/image-to-video",
    input: (imageUrl) => ({
      prompt: PROMPT,
      start_image_url: imageUrl,
      duration: "8",
      generate_audio: false,
    }),
    estCost: 8 * 0.112,
  },
  {
    name: "luma_ray2",
    model: "fal-ai/luma-dream-machine/ray-2/image-to-video",
    input: (imageUrl) => ({
      prompt: PROMPT,
      image_url: imageUrl,
      aspect_ratio: "16:9",
      resolution: "1080p",
      duration: "5s",
    }),
    estCost: 0.5 * 4,
  },
  {
    name: "hailuo02_pro",
    model: "fal-ai/minimax/hailuo-02/pro/image-to-video",
    input: (imageUrl) => ({
      prompt: PROMPT,
      image_url: imageUrl,
    }),
    estCost: 6 * 0.08,
  },
];

async function run() {
  const total = CANDIDATES.reduce((s, c) => s + c.estCost, 0);
  console.log("\n=== Phase 0 model comparison ===");
  CANDIDATES.forEach((c) => console.log(`  ${c.name.padEnd(14)} ~$${c.estCost.toFixed(2)}`));
  console.log(`  ${"TOTAL".padEnd(14)} ~$${total.toFixed(2)}\n`);

  console.log("Uploading test still...");
  const imageUrl = await uploadStill();

  for (const c of CANDIDATES) {
    const mp4 = path.join(OUT, `test_${c.name}.mp4`);
    if (fs.existsSync(mp4)) {
      console.log(`  ${c.name} exists, skip`);
      continue;
    }
    console.log(`  ${c.name}: submitting (~$${c.estCost.toFixed(2)})...`);
    try {
      const result = await fal.subscribe(c.model, {
        input: c.input(imageUrl),
        logs: false,
      });
      const videoUrl = result?.data?.video?.url;
      if (!videoUrl) throw new Error(`no video url: ${JSON.stringify(result)}`);
      await downloadFile(videoUrl, mp4);
      console.log(`  ${c.name} done -> ${mp4}`);
    } catch (err) {
      console.error(`  ${c.name} FAILED: ${err.message || err}`);
    }
  }
  console.log("\nDONE.");
}

run().catch((err) => {
  console.error("FAILED:", err.message || err);
  process.exit(1);
});
