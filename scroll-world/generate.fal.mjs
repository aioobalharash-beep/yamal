#!/usr/bin/env node
// scroll-world/generate.fal.mjs
// =============================================================================
//  YAMAL by TMG — scroll-world render pipeline, fal.ai backend
//  Architecture B (dive-in + aerial connector), mirrors generate.sh but renders
//  video with fal.ai instead of Higgsfield. Scene stills already exist in
//  public/yamal/ (this script only renders the 9 video clips).
//
//  Model: fal-ai/kling-video/v1.6/pro/image-to-video — the whole chain uses
//  this one model since it accepts an optional tail_image_url (last-frame
//  control), which the frame-locked connectors require. Dives omit it.
//
//  Usage:
//    node scroll-world/generate.fal.mjs plan          # print cost estimate only
//    node scroll-world/generate.fal.mjs test           # render dive_1 only
//    node scroll-world/generate.fal.mjs full           # render everything
//
//  Idempotent — skips any raw clip already in scroll-world/work/ and any
//  encoded clip already in public/yamal/vid/. Delete a file to re-roll it.
// =============================================================================

import { fal } from "@fal-ai/client";
import dotenv from "dotenv";
import ffmpegPath from "ffmpeg-static";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local"), quiet: true });

const execFileAsync = promisify(execFile);

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..");
const P = path.join(HERE, "prompts");
const WORK = path.join(HERE, "work");
const OUT = path.join(ROOT, "public/yamal/vid");
const STILLS = path.join(ROOT, "public/yamal");

fs.mkdirSync(WORK, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

if (!process.env.FAL_KEY) {
  console.error("FAL_KEY not set — check .env.local");
  process.exit(1);
}
fal.config({ credentials: process.env.FAL_KEY });

const MODEL = "fal-ai/kling-video/v1.6/pro/image-to-video";
const PRICE_PER_SEC = 0.095; // Kling 1.6 Pro, USD per video-second, 1080p

const N = 5;
const STILL_NAMES = [
  "01-aerial-masterplan.jpeg",
  "02-marina-crescent.jpeg",
  "03-crystal-lagoons.jpeg",
  "04-apartment-park.jpeg",
  "05-villa-facade.jpeg",
];

const DIVE_DURATION = "10"; // Kling only offers 5|10s; 10 sits closest to the ~6-8s brief
const CONNECTOR_DURATION = "5"; // matches the ~5s brief exactly

const style = fs.readFileSync(path.join(P, "style.txt"), "utf8").trim();
const readPrompt = (name) =>
  `${fs.readFileSync(path.join(P, `${name}.txt`), "utf8").trim()} ${style}`;

function costPlan() {
  const items = [];
  for (let i = 1; i <= N; i++) items.push({ name: `dive_${i}`, seconds: Number(DIVE_DURATION) });
  for (let i = 1; i < N; i++) items.push({ name: `connector_${i}`, seconds: Number(CONNECTOR_DURATION) });
  const totalSeconds = items.reduce((s, it) => s + it.seconds, 0);
  return { items, totalSeconds, totalCost: totalSeconds * PRICE_PER_SEC };
}

function printCostPlan() {
  const { items, totalSeconds, totalCost } = costPlan();
  console.log(`\n=== Cost plan — ${MODEL} @ $${PRICE_PER_SEC}/s ===`);
  for (const it of items) {
    console.log(`  ${it.name.padEnd(12)} ${String(it.seconds).padStart(2)}s   $${(it.seconds * PRICE_PER_SEC).toFixed(3)}`);
  }
  console.log(`  ${"TOTAL".padEnd(12)} ${String(totalSeconds).padStart(2)}s   $${totalCost.toFixed(2)}\n`);
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed ${res.status} ${res.statusText}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
}

async function uploadImage(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const type = `image/${ext === "jpg" ? "jpeg" : ext}`;
  const blob = new Blob([buf], { type });
  return fal.storage.upload(blob);
}

async function ffmpeg(args) {
  await execFileAsync(ffmpegPath, args);
}

async function extractFrame(videoPath, out, atEnd) {
  const args = atEnd
    ? ["-y", "-sseof", "-0.15", "-i", videoPath, "-frames:v", "1", "-q:v", "2", out]
    : ["-y", "-ss", "0", "-i", videoPath, "-frames:v", "1", "-q:v", "2", out];
  await ffmpeg(args);
}

async function encodeClip(src, dest) {
  await ffmpeg([
    "-y", "-i", src,
    "-an",
    "-vf", "unsharp=5:5:0.8:5:5:0.0",
    "-c:v", "libx264",
    "-preset", "slow",
    "-crf", "20",
    "-pix_fmt", "yuv420p",
    "-g", "8",
    "-keyint_min", "8",
    "-sc_threshold", "0",
    "-movflags", "+faststart",
    dest,
  ]);
}

async function renderDive(i) {
  const mp4 = path.join(WORK, `dive_${i}.mp4`);
  if (fs.existsSync(mp4)) {
    console.log(`  dive_${i} exists, skip`);
    return;
  }
  const stillPath = path.join(STILLS, STILL_NAMES[i - 1]);
  console.log(`  dive_${i}: uploading still...`);
  const imageUrl = await uploadImage(stillPath);
  const prompt = readPrompt(`dive_${i}`);
  const cost = Number(DIVE_DURATION) * PRICE_PER_SEC;
  console.log(`  dive_${i}: submitting (${DIVE_DURATION}s, ~$${cost.toFixed(2)})...`);
  const result = await fal.subscribe(MODEL, {
    input: { prompt, image_url: imageUrl, duration: DIVE_DURATION, aspect_ratio: "16:9" },
    logs: false,
  });
  const videoUrl = result?.data?.video?.url;
  if (!videoUrl) throw new Error(`dive_${i}: no video url in result: ${JSON.stringify(result)}`);
  await downloadFile(videoUrl, mp4);
  console.log(`  dive_${i} done -> ${mp4} (charged ~$${cost.toFixed(2)})`);
}

async function extractSeams(i) {
  const mp4 = path.join(WORK, `dive_${i}.mp4`);
  const last = path.join(WORK, `dive_${i}_last.png`);
  const first = path.join(WORK, `dive_${i}_first.png`);
  if (!fs.existsSync(mp4)) return;
  if (!fs.existsSync(last)) await extractFrame(mp4, last, true);
  if (!fs.existsSync(first)) await extractFrame(mp4, first, false);
}

async function renderConnector(i) {
  const mp4 = path.join(WORK, `connector_${i}.mp4`);
  if (fs.existsSync(mp4)) {
    console.log(`  connector_${i} exists, skip`);
    return;
  }
  const j = i + 1;
  const startFrame = path.join(WORK, `dive_${i}_last.png`);
  const endFrame = path.join(WORK, `dive_${j}_first.png`);
  if (!fs.existsSync(startFrame) || !fs.existsSync(endFrame)) {
    throw new Error(`connector_${i}: seam frames missing — render dive_${i} and dive_${j} first`);
  }
  console.log(`  connector_${i}: uploading seam frames (real rendered pixels, not stills)...`);
  const [startUrl, endUrl] = await Promise.all([uploadImage(startFrame), uploadImage(endFrame)]);
  const prompt = readPrompt(`connector_${i}`);
  const cost = Number(CONNECTOR_DURATION) * PRICE_PER_SEC;
  console.log(`  connector_${i}: submitting (${CONNECTOR_DURATION}s, ~$${cost.toFixed(2)})...`);
  const result = await fal.subscribe(MODEL, {
    input: {
      prompt,
      image_url: startUrl,
      tail_image_url: endUrl,
      duration: CONNECTOR_DURATION,
      aspect_ratio: "16:9",
    },
    logs: false,
  });
  const videoUrl = result?.data?.video?.url;
  if (!videoUrl) throw new Error(`connector_${i}: no video url in result: ${JSON.stringify(result)}`);
  await downloadFile(videoUrl, mp4);
  console.log(`  connector_${i} done -> ${mp4} (charged ~$${cost.toFixed(2)})`);
}

async function encodeOne(name) {
  const src = path.join(WORK, `${name}.mp4`);
  const dest = path.join(OUT, `${name}.mp4`);
  if (!fs.existsSync(src)) return;
  if (fs.existsSync(dest)) {
    console.log(`  ${name}.mp4 exists in vid/, skip`);
    return;
  }
  await encodeClip(src, dest);
  console.log(`  encoded ${name}.mp4`);
}

async function encodeAll() {
  console.log("\n== encode ==");
  for (let i = 1; i <= N; i++) await encodeOne(`dive_${i}`);
  for (let i = 1; i < N; i++) await encodeOne(`connector_${i}`);
}

async function main() {
  const mode = process.argv[2] || "plan"; // plan | test | full
  printCostPlan();

  if (mode === "plan") {
    console.log("Plan only — no rendering. Run with `test` or `full` to render.");
    return;
  }

  if (mode === "test") {
    console.log("TEST MODE — rendering dive_1 only.\n");
    await renderDive(1);
    await extractSeams(1);
    await encodeOne("dive_1");
    console.log(`\nTest clip ready: ${path.join(OUT, "dive_1.mp4")}`);
    console.log("Review it, then run `node scroll-world/generate.fal.mjs full` to render the rest.");
    return;
  }

  if (mode !== "full") {
    console.error(`Unknown mode "${mode}" — use plan | test | full`);
    process.exit(1);
  }

  console.log("== dives ==");
  for (let i = 1; i <= N; i++) await renderDive(i);

  console.log("== seam frames (real rendered pixels, not stills) ==");
  for (let i = 1; i <= N; i++) await extractSeams(i);

  console.log("== connectors (frame-locked to real dive seams) ==");
  for (let i = 1; i < N; i++) await renderConnector(i);

  await encodeAll();

  console.log("\nDONE. Clips in", OUT);
}

main().catch((err) => {
  console.error("\nFAILED:", err.message || err);
  process.exit(1);
});
