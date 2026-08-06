#!/bin/bash
# =============================================================================
#  YAMAL by TMG — scroll-world render pipeline
#  Architecture B (dive-in + aerial connector): a "fly through the world"
#  camera that dives into each scene, pulls up, and hops to the next — the
#  look you selected. Renders 5 scene stills -> 5 dive clips -> 4 connector
#  clips, then encodes everything for scroll-scrubbing into public/yamal/vid/.
#
#  PREREQUISITES (none of these run in the Claude web sandbox — run locally):
#    * higgsfield CLI on PATH, authenticated:  higgsfield auth login
#    * ffmpeg + ffprobe on PATH
#    * enough Higgsfield credits (see scroll-world/GENERATE.md for the estimate)
#  Cheaper alternative: render the video chain on Monid (pay-per-clip USD).
#  See GENERATE.md "Monid backend" — same Seedance model, different biller.
#
#  Run from the repo root:   bash scroll-world/generate.sh
#  Higgsfield gens take 3-8 min each; the script waits. Re-run is safe — it
#  skips any artifact that already exists (delete a file to re-roll it).
# =============================================================================
set -uo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
P="$HERE/prompts"
WORK="$HERE/work"           # raw renders + extracted frames
OUT="$HERE/../public/yamal/vid"   # final scrubbing-ready clips
STILLS="$HERE/../public/yamal"    # scene stills double as posters (01..05.jpg)
mkdir -p "$WORK" "$OUT"

VMODEL="seedance_2_0"       # roster default; frame-locks seams
STYLE="$(cat "$P/style.txt")"
N=5

need() { command -v "$1" >/dev/null 2>&1 || { echo "MISSING: $1 — see GENERATE.md"; exit 1; }; }
need higgsfield; need ffmpeg; need ffprobe; need curl

result_url() { python3 -c "import json,sys;d=json.load(open(sys.argv[1]));print(d[0]['result_url'])" "$1"; }

# --- 1. Scene stills (gpt_image_2, 3:2) --------------------------------------
echo "== [1/5] scene stills =="
for i in $(seq 1 $N); do
  png="$WORK/still_$i.png"
  [ -s "$png" ] && { echo "  still_$i exists, skip"; continue; }
  prompt="$STYLE $(cat "$P/still_$i.txt")"
  ( higgsfield generate create gpt_image_2 --prompt "$prompt" \
      --aspect_ratio 3:2 --resolution 2k --quality high \
      --wait --wait-timeout 15m --json > "$WORK/still_$i.json" 2>"$WORK/still_$i.err" \
    && curl -s "$(result_url "$WORK/still_$i.json")" -o "$png" \
    && echo "  still_$i done" || echo "  still_$i FAILED (see still_$i.err)" ) &
done
wait

# Copy stills to public/yamal as the section posters (01..05-*.jpg names the app uses)
names=(01-aerial-masterplan 02-marina-crescent 03-crystal-lagoons 04-apartment-park 05-villa-facade)
for i in $(seq 1 $N); do
  [ -s "$WORK/still_$i.png" ] && cp "$WORK/still_$i.png" "$STILLS/${names[$((i-1))]}.jpg"
done

# --- 2. Dive clips (one per scene, from its still) ---------------------------
echo "== [2/5] dive clips =="
for i in $(seq 1 $N); do
  mp4="$WORK/dive_$i.mp4"
  [ -s "$mp4" ] && { echo "  dive_$i exists, skip"; continue; }
  prompt="$(cat "$P/dive_$i.txt") $STYLE"
  ( higgsfield generate create "$VMODEL" --prompt "$prompt" \
      --start-image "$WORK/still_$i.png" \
      --mode std --resolution 1080p --aspect_ratio 16:9 --duration 8 \
      --wait --wait-timeout 15m --json > "$WORK/dive_$i.json" 2>"$WORK/dive_$i.err" \
    && curl -s "$(result_url "$WORK/dive_$i.json")" -o "$mp4" \
    && echo "  dive_$i done" || echo "  dive_$i FAILED (NSFW? re-roll — see GENERATE.md)" ) &
done
wait

# --- 3. Extract seam frames (actual rendered pixels, not the stills) ---------
echo "== [3/5] seam frames =="
for i in $(seq 1 $N); do
  ffmpeg -y -sseof -0.15 -i "$WORK/dive_$i.mp4" -frames:v 1 -q:v 2 "$WORK/dive_${i}_last.png"  2>/dev/null
  ffmpeg -y -ss 0        -i "$WORK/dive_$i.mp4" -frames:v 1 -q:v 2 "$WORK/dive_${i}_first.png" 2>/dev/null
done

# --- 4. Connector clips (dive_i.last -> dive_{i+1}.first) --------------------
echo "== [4/5] connector clips =="
for i in $(seq 1 $((N-1))); do
  mp4="$WORK/connector_$i.mp4"
  [ -s "$mp4" ] && { echo "  connector_$i exists, skip"; continue; }
  j=$((i+1))
  prompt="$(cat "$P/connector_$i.txt") $STYLE"
  ( higgsfield generate create "$VMODEL" --prompt "$prompt" \
      --start-image "$WORK/dive_${i}_last.png" --end-image "$WORK/dive_${j}_first.png" \
      --mode std --resolution 1080p --aspect_ratio 16:9 --duration 5 \
      --wait --wait-timeout 15m --json > "$WORK/connector_$i.json" 2>"$WORK/connector_$i.err" \
    && curl -s "$(result_url "$WORK/connector_$i.json")" -o "$mp4" \
    && echo "  connector_$i done" || echo "  connector_$i FAILED (re-roll or set null)" ) &
done
wait

# --- 5. Encode for smooth scroll-scrubbing (native 1080p, GOP 8, blob-seek) --
echo "== [5/5] encode =="
enc() { ffmpeg -y -i "$1" -an -vf "unsharp=5:5:0.8:5:5:0.0" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
  -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$2" 2>/dev/null; }

for i in $(seq 1 $N);       do enc "$WORK/dive_$i.mp4"      "$OUT/dive_$i.mp4"; done
for i in $(seq 1 $((N-1))); do enc "$WORK/connector_$i.mp4" "$OUT/connector_$i.mp4"; done

echo
echo "DONE. Clips in $OUT and posters in $STILLS."
echo "Now enable the video fly-through: set NEXT_PUBLIC_USE_VIDEO_FLYTHROUGH=1"
echo "(see scroll-world/GENERATE.md, 'Wire it in')."
