# YAMAL — scroll-world video fly-through: generation guide

This kit renders a LIKOVA-style **continuous camera fly-through** for YAMAL: the
camera dives into each scene, pulls up, and flies to the next, with no visible
cuts. The page then scroll-scrubs the pre-rendered video (the same technique as
Apple's scroll-through product pages — the camera genuinely moves, scroll only
drives time).

The clips are **AI-generated** (Higgsfield / Seedance 2.0). Generation needs
paid credits, an interactive login, and `ffmpeg` — **none of which exist in the
Claude web sandbox**, so this step is run on your own machine (or a Claude Code
session on your machine). Everything else — prompts, script, page wiring — is
already in the repo.

## What's here

```
scroll-world/
  prompts/          5 scene stills · 5 dive clips · 4 connectors (+ shared style.txt)
  generate.sh       one-command pipeline: stills → dives → connectors → encode
  GENERATE.md       this file
src/components/three/VideoFlyThrough.tsx   the scroll-scrub player (flag-gated)
```

## Prerequisites (on your machine)

1. **Higgsfield CLI** — install per the `higgsfield-generate` skill, then:
   ```bash
   higgsfield auth login        # interactive OAuth (must be done by a human)
   higgsfield workspace list    # confirm it's authenticated
   ```
2. **ffmpeg + ffprobe** on `PATH` (`brew install ffmpeg` / `apt install ffmpeg`).
3. **Credits.** The chain for N=5 is **5 stills + 9 videos** (5 dives + 4
   connectors), plus ~15% re-roll headroom for the NSFW filter on interiors.
   - Higgsfield (observed Plus plan): still ≈ 15 credits, Standard video ≈ 40–55.
     Rough total ≈ **~500–650 credits**. Calibrate by running one still + one
     video and diffing `higgsfield workspace list` before/after.
   - **Monid backend (cheaper, pay-per-USD):** same Seedance 2.0 billed per clip.
     ~**$21 at 1080p** / ~**$9 at 720p** for this chain. Requires the `monid` CLI
     (`monid keys list`, `monid balance`) and passing frames by `sfs` URL — see
     the scroll-world SKILL.md "Monid backend" section. To use it, swap the
     `higgsfield generate create "$VMODEL" …` calls in `generate.sh` for the Monid
     equivalents. Draft/previz is the same endpoint at 480p (~$4 total).

## Render

```bash
bash scroll-world/generate.sh
```

- Runs stills concurrently, then dives, extracts the real seam frames, renders
  connectors frame-locked to those frames, and encodes everything for smooth
  scrubbing into `public/yamal/vid/`.
- Re-running skips finished artifacts — delete a file in `scroll-world/work/` to
  re-roll just that one.
- **NSFW false-positives** (Seedance flags innocuous pool/interior clips): re-run
  the failed clip; if it sticks, add "empty, unoccupied, architectural, tasteful"
  to that prompt or re-roll it on `kling3_0`. See SKILL.md Gotchas.

The script also copies the 5 stills to `public/yamal/01-…05-….jpg`, so they
become the posters for both the video path **and** the current WebGL fly-through.

## Wire it in

Once `public/yamal/vid/` holds `dive_1…5.mp4` and `connector_1…4.mp4`:

```bash
# .env.local
NEXT_PUBLIC_USE_VIDEO_FLYTHROUGH=1
```

Rebuild. `GalleryExperience` now mounts `VideoFlyThrough` (scroll-scrubbed video)
instead of the WebGL `FlyThrough`. All overlays — header, HUD, the five text
stations, concierge — sit on top unchanged. Unset the flag to return to WebGL.

## Verify the seams (don't skip)

Scroll slowly through each dive→connector→dive boundary. The frame just before
and just after a seam must look near-identical. If one pops, its connector used
the wrong frames — delete that connector and re-run (the script re-extracts the
real rendered frames). The player also applies a short crossfade at each seam as
insurance.

## Notes on the camera choice

This kit is **Architecture B** (dive-in + aerial connector) — the "fly through
the world" look you asked for, well suited to an aerial masterplan flyover with
distinct districts (marina → lagoons → park → villa). B reverses camera
direction at each seam (dive in, pull out); over a miniature/aerial world that
reads as an intentional "rise to the map and fly to the next district." If you'd
prefer a single never-reversing forward glide, switch the prompts to Architecture
A (forward-only legs, no connectors) per SKILL.md §4.
