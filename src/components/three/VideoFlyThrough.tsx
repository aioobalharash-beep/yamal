"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimationFrame, type MotionValue } from "framer-motion";

/**
 * Scroll-scrubbed video fly-through — the scroll-world output path.
 *
 * Plays the rendered chain (dive_1 → connector_1 → dive_2 → … → dive_5) as one
 * continuous flight, scrubbed by `progress` (0 → 1). Clips are fetched as blobs
 * so they are fully seekable (static hosts often don't serve byte ranges, which
 * otherwise pins seeks to frame 0). Falls back to the poster still per clip
 * until its video is present, so the page is never blank.
 *
 * Enabled via NEXT_PUBLIC_USE_VIDEO_FLYTHROUGH=1 once generate.sh has produced
 * the clips (see scroll-world/GENERATE.md). Until then the WebGL FlyThrough runs.
 */

const POSTERS = [
  "/yamal/01-aerial-masterplan.jpeg",
  "/yamal/02-marina-crescent.jpeg",
  "/yamal/03-crystal-lagoons.jpeg",
  "/yamal/04-apartment-park.jpeg",
  "/yamal/05-villa-facade.jpeg",
];

// The chained flight: dive_i, then connector_i between scenes. 9 clips for N=5.
type Clip = { src: string; poster: string; dur: number };
const CHAIN: Clip[] = [
  { src: "/yamal/vid/dive_1.mp4", poster: POSTERS[0], dur: 8 },
  { src: "/yamal/vid/connector_1.mp4", poster: POSTERS[0], dur: 5 },
  { src: "/yamal/vid/dive_2.mp4", poster: POSTERS[1], dur: 8 },
  { src: "/yamal/vid/connector_2.mp4", poster: POSTERS[1], dur: 5 },
  { src: "/yamal/vid/dive_3.mp4", poster: POSTERS[2], dur: 8 },
  { src: "/yamal/vid/connector_3.mp4", poster: POSTERS[2], dur: 5 },
  { src: "/yamal/vid/dive_4.mp4", poster: POSTERS[3], dur: 8 },
  { src: "/yamal/vid/connector_4.mp4", poster: POSTERS[3], dur: 5 },
  { src: "/yamal/vid/dive_5.mp4", poster: POSTERS[4], dur: 8 },
];

const CROSSFADE = 0.06; // fraction of a clip's band spent dissolving into the next

export default function VideoFlyThrough({
  progress,
  variant = "page",
}: {
  progress: MotionValue<number>;
  /**
   * "page" — fixed full-viewport backdrop for the dark GalleryExperience.
   * "hero" — absolute fill of a sticky container (the Monograph cover),
   * with an ivory scrim tuned for dark-ink text instead of light text.
   */
  variant?: "page" | "hero";
}) {
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [ready, setReady] = useState<boolean[]>(() => CHAIN.map(() => false));

  // Duration-weighted band boundaries so scrub speed stays even across clips.
  const bounds = useMemo(() => {
    const total = CHAIN.reduce((s, c) => s + c.dur, 0);
    const b: number[] = [0];
    let acc = 0;
    CHAIN.forEach((c) => {
      acc += c.dur;
      b.push(acc / total);
    });
    return b; // length CHAIN.length + 1
  }, []);

  // Blob-load each clip for guaranteed seekability; poster stays if it 404s.
  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];
    CHAIN.forEach((clip, i) => {
      fetch(clip.src)
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("missing"))))
        .then((blob) => {
          if (cancelled) return;
          const url = URL.createObjectURL(blob);
          urls.push(url);
          const v = videos.current[i];
          if (v) {
            v.src = url;
            v.load();
            v.addEventListener(
              "loadeddata",
              () =>
                setReady((prev) => {
                  const n = [...prev];
                  n[i] = true;
                  return n;
                }),
              { once: true }
            );
          }
        })
        .catch(() => {
          /* clip not rendered yet — poster remains */
        });
    });
    return () => {
      cancelled = true;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  useAnimationFrame(() => {
    const p = Math.min(0.999, Math.max(0, progress.get()));
    // find active clip band
    let idx = 0;
    for (let i = 0; i < CHAIN.length; i++) {
      if (p >= bounds[i] && p < bounds[i + 1]) {
        idx = i;
        break;
      }
    }
    const span = bounds[idx + 1] - bounds[idx] || 1;
    const localT = (p - bounds[idx]) / span; // 0..1 within this clip

    CHAIN.forEach((clip, i) => {
      const v = videos.current[i];
      if (!v) return;
      let opacity = 0;
      if (i === idx) {
        opacity = 1;
        // scrub — coalesce seeks so a fast flick never piles up
        if (ready[i] && !v.seeking && v.duration) {
          const t = localT * v.duration;
          if (Math.abs(v.currentTime - t) > 1 / 30) v.currentTime = t;
        }
      } else if (i === idx + 1 && localT > 1 - CROSSFADE) {
        // dissolve into the incoming clip across the seam
        opacity = (localT - (1 - CROSSFADE)) / CROSSFADE;
        if (ready[i] && !v.seeking) v.currentTime = 0;
      }
      v.style.opacity = String(opacity);
    });
  });

  const positionClass =
    variant === "hero"
      ? "absolute inset-0 h-full w-full overflow-hidden bg-paper"
      : "fixed inset-0 -z-10 h-screen w-full overflow-hidden bg-obsidian";

  return (
    <div className={positionClass}>
      {CHAIN.map((clip, i) => (
        <video
          key={clip.src}
          ref={(el) => {
            videos.current[i] = el;
          }}
          poster={clip.poster}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-100"
          style={{ opacity: i === 0 ? 1 : 0 }}
          aria-hidden="true"
        />
      ))}

      {variant === "hero" ? (
        <>
          {/* Ivory scrim — keeps the navy-ink hero title legible over bright aerial footage */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(120% 85% at 50% 38%, rgba(243,237,227,0.16) 0%, rgba(243,237,227,0.58) 78%, rgba(243,237,227,0.82) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3"
            style={{
              background:
                "linear-gradient(0deg, rgba(243,237,227,0.96) 0%, rgba(243,237,227,0) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-40"
            style={{
              background:
                "linear-gradient(180deg, rgba(243,237,227,0.5) 0%, rgba(243,237,227,0) 100%)",
            }}
          />
        </>
      ) : (
        <>
          {/* Same cinematic depth overlays as the WebGL path */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(125% 85% at 50% 42%, rgba(0,0,0,0) 42%, rgba(4,12,28,0.62) 100%)",
            }}
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
            style={{
              background:
                "linear-gradient(0deg, rgba(7,22,48,0.85) 0%, rgba(7,22,48,0) 100%)",
            }}
          />
        </>
      )}
    </div>
  );
}
