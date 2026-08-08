#!/usr/bin/env node
// scroll-world/generate.journey.mjs
// =============================================================================
//  YAMAL by TMG — full-page journey render pipeline, fal.ai backend
//  One continuous forward-moving chain, grounded in the real master-plan PDF:
//  ambient sea loop -> bay/marina -> commercial promenade -> lagoon villas ->
//  single villa -> apartments. Each leg's start frame is the real
//  ffmpeg-extracted last frame of the previous leg (seam law); legs 2-5 also
//  end-anchor to the existing plate stills so the flight stays grounded in
//  real project imagery, not invented geography.
//
//  Model: fal-ai/kling-video/v3/pro/image-to-video, chosen after a Phase 0
//  comparison against Luma Ray-2 and Hailuo-02 Pro for image fidelity/no
//  morphing (the priority over raw motion amplitude). cfg_scale is pushed
//  above the 0.5 default to compensate for that model's subtler default
//  motion and get stronger prompt adherence on the camera moves.
//
//  Usage:
//    node scroll-world/generate.journey.mjs plan   # print cost estimate only
//    node scroll-world/generate.journey.mjs test    # render ambient + leg 1
//    node scroll-world/generate.journey.mjs full    # render everything
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

const MODEL = "fal-ai/kling-video/v3/pro/image-to-video";
const PRICE_PER_SEC = 0.112; // Kling v3 Pro, audio off
const CFG_SCALE = 0.8; // pushed above default 0.5 for stronger motion compliance

const style = fs.readFileSync(path.join(P, "style.txt"), "utf8").trim();
const readPrompt = (name) => `${fs.readFileSync(path.join(P, `${name}.txt`), "utf8").trim()} ${style}`;

// name, duration(s), end still (or null), output filename
const AMBIENT = { name: "ambient", dur: 6, end: null, out: "ambient_sea.mp4" };
const LEGS = [
  { name: "leg_1_bay", dur: 8, end: "02-marina-crescent.jpeg", out: "leg_1_bay.mp4" },
  { name: "leg_2_commercial", dur: 8, end: "08-commercial-centre.jpeg", out: "leg_2_commercial.mp4" },
  { name: "leg_3_villas", dur: 8, end: "03-crystal-lagoons.jpeg", out: "leg_3_villas.mp4" },
  { name: "leg_4_villa", dur: 8, end: "05-villa-facade.jpeg", out: "leg_4_villa.mp4" },
  { name: "leg_5_apartments", dur: 8, end: "04-apartment-park.jpeg", out: "leg_5_apartments.mp4" },
];

function costPlan() {
  const items = [{ name: AMBIENT.name, seconds: AMBIENT.dur }, ...LEGS.map((l) => ({ name: l.name, seconds: l.dur }))];
  const totalSeconds = items.reduce((s, it) => s + it.seconds, 0);
  return { items, totalSeconds, totalCost: totalSeconds * PRICE_PER_SEC };
}

function printCostPlan() {
  const { items, totalSeconds, totalCost } = costPlan();
  console.log(`\n=== Cost plan — ${MODEL} @ $${PRICE_PER_SEC}/s ===`);
  for (const it of items) {
    console.log(`  ${it.name.padEnd(18)} ${String(it.seconds).padStart(2)}s   $${(it.seconds * PRICE_PER_SEC).toFixed(3)}`);
  }
  console.log(`  ${"TOTAL".padEnd(18)} ${String(totalSeconds).padStart(2)}s   $${totalCost.toFixed(2)}\n`);
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download failed ${res.status} ${res.statusText}: ${url}`);
  fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

async function uploadImage(filePath) {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).slice(1).toLowerCase();
  const type = `image/${ext === "jpg" ? "jpeg" : ext}`;
  return fal.storage.upload(new Blob([buf], { type }));
}

async function ffmpeg(args) {
  await execFileAsync(ffmpegPath, args);
}

async function extractLastFrame(videoPath, out) {
  await ffmpeg(["-y", "-sseof", "-0.15", "-i", videoPath, "-frames:v", "1", "-q:v", "2", out]);
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

// startImagePath: local file to use as the start frame. endStillName: plate
// still filename in public/yamal/ to anchor the end frame, or null.
async function renderClip(clipName, prompt, dur, startImagePath, endStillName) {
  const mp4 = path.join(WORK, `${clipName}.mp4`);
  if (fs.existsSync(mp4)) {
    console.log(`  ${clipName} exists, skip`);
    return mp4;
  }
  console.log(`  ${clipName}: uploading start frame...`);
  const startUrl = await uploadImage(startImagePath);
  const input = {
    prompt,
    start_image_url: startUrl,
    duration: String(dur),
    cfg_scale: CFG_SCALE,
    generate_audio: false,
  };
  if (endStillName) {
    input.end_image_url = await uploadImage(path.join(STILLS, endStillName));
  }
  const cost = dur * PRICE_PER_SEC;
  console.log(`  ${clipName}: submitting (${dur}s, ~$${cost.toFixed(2)})...`);
  const result = await fal.subscribe(MODEL, { input, logs: false });
  const videoUrl = result?.data?.video?.url;
  if (!videoUrl) throw new Error(`${clipName}: no video url in result: ${JSON.stringify(result)}`);
  await downloadFile(videoUrl, mp4);
  console.log(`  ${clipName} done -> ${mp4} (charged ~$${cost.toFixed(2)})`);
  return mp4;
}

async function encodeOne(clipName, outName) {
  const src = path.join(WORK, `${clipName}.mp4`);
  const dest = path.join(OUT, outName);
  if (!fs.existsSync(src)) return;
  if (fs.existsSync(dest)) {
    console.log(`  ${outName} exists in vid/, skip`);
    return;
  }
  await encodeClip(src, dest);
  console.log(`  encoded ${outName}`);
}

async function main() {
  const mode = process.argv[2] || "plan"; // plan | test | full
  printCostPlan();

  if (mode === "plan") {
    console.log("Plan only — no rendering. Run with `test` or `full` to render.");
    return;
  }
  if (mode !== "test" && mode !== "full") {
    console.error(`Unknown mode "${mode}" — use plan | test | full`);
    process.exit(1);
  }

  // Ambient: starts from the sea-level still.
  await renderClip(AMBIENT.name, readPrompt("ambient"), AMBIENT.dur, path.join(STILLS, "07-seen-from-the-sea.jpeg"), null);
  const ambientLast = path.join(WORK, "ambient_last.png");
  if (!fs.existsSync(ambientLast)) await extractLastFrame(path.join(WORK, `${AMBIENT.name}.mp4`), ambientLast);

  const legsToRun = mode === "test" ? [LEGS[0]] : LEGS;
  let prevLast = ambientLast;

  for (const leg of legsToRun) {
    const prompt = readPrompt(leg.name);
    await renderClip(leg.name, prompt, leg.dur, prevLast, leg.end);
    const lastFramePath = path.join(WORK, `${leg.name}_last.png`);
    if (!fs.existsSync(lastFramePath)) await extractLastFrame(path.join(WORK, `${leg.name}.mp4`), lastFramePath);
    prevLast = lastFramePath;
  }

  console.log("\n== encode ==");
  await encodeOne(AMBIENT.name, AMBIENT.out);
  for (const leg of legsToRun) await encodeOne(leg.name, leg.out);

  if (mode === "test") {
    console.log(`\nTest clips ready in ${OUT} (ambient_sea.mp4, leg_1_bay.mp4).`);
    console.log("Review them, then run `node scroll-world/generate.journey.mjs full` to render the rest.");
  } else {
    console.log("\nDONE. Clips in", OUT);
  }
}

main().catch((err) => {
  console.error("\nFAILED:", err.message || err);
  process.exit(1);
});
