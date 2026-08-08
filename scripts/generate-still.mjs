#!/usr/bin/env node
// scripts/generate-still.mjs
// One-off high-res still generator via fal.ai flux-pro, for scenes the
// scroll-world chain needs that aren't already covered by public/yamal/*.jpeg.
// Usage: node scripts/generate-still.mjs <output-filename> "<prompt>"

import { fal } from "@fal-ai/client";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true });

const [, , outName, prompt] = process.argv;
if (!outName || !prompt) {
  console.error('Usage: node scripts/generate-still.mjs <output-filename.jpeg> "<prompt>"');
  process.exit(1);
}

if (!process.env.FAL_KEY) {
  console.error("FAL_KEY not set — check .env.local");
  process.exit(1);
}
fal.config({ credentials: process.env.FAL_KEY });

const OUT = path.resolve("public/yamal", outName);

async function run() {
  console.log(`Generating ${outName}...`);
  const result = await fal.subscribe("fal-ai/flux-pro/v1.1-ultra", {
    input: { prompt, aspect_ratio: "16:9", output_format: "jpeg" },
    logs: false,
  });
  const url = result?.data?.images?.[0]?.url;
  if (!url) throw new Error(`no image url in result: ${JSON.stringify(result)}`);
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(OUT, buf);
  console.log(`Saved -> ${OUT}`);
}

run().catch((err) => {
  console.error("FAILED:", err.message || err);
  process.exit(1);
});
