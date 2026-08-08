"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAnimationFrame, type MotionValue } from "framer-motion";

/**
 * Full-page scroll-driven fly-through — the whole site's journey, not just a
 * hero. A short ambient loop plays on load (before any scroll); the moment
 * scrolling starts it crossfades into the scroll-scrubbed chain, which is
 * frame-locked to the ambient loop's own last frame so the handoff reads as
 * one continuous shot. Scrolling back to the very top crossfades back to the
 * ambient loop.
 *
 * Chain legs (grounded in the real master-plan PDF, top/sea to south):
 *   bay        — arrival, the crescent marina
 *   commercial — the waterfront promenade (C1)
 *   villas     — marina-adjacent + lagoon-spine villas (V1 -> V2)
 *   villa      — single beach-villa close-up
 *   apartments — Jood Club & Park Apartments (A1 -> A2 -> A3)
 *
 * Enabled via NEXT_PUBLIC_USE_VIDEO_FLYTHROUGH=1 once generate.fal.mjs has
 * produced the clips (see scroll-world/GENERATE.md).
 */

const POSTERS = {
  ambient: "/yamal/07-seen-from-the-sea.jpeg",
  bay: "/yamal/02-marina-crescent.jpeg",
  commercial: "/yamal/02-marina-crescent.jpeg",
  villas: "/yamal/03-crystal-lagoons.jpeg",
  villa: "/yamal/05-villa-facade.jpeg",
  apartments: "/yamal/04-apartment-park.jpeg",
};

type Clip = { src: string; poster: string; dur: number };

const AMBIENT: Clip = {
  src: "/yamal/vid/ambient_sea.mp4",
  poster: POSTERS.ambient,
  dur: 6,
};

const CHAIN: Clip[] = [
  { src: "/yamal/vid/leg_1_bay.mp4", poster: POSTERS.bay, dur: 8 },
  { src: "/yamal/vid/leg_2_commercial.mp4", poster: POSTERS.commercial, dur: 8 },
  { src: "/yamal/vid/leg_3_villas.mp4", poster: POSTERS.villas, dur: 8 },
  { src: "/yamal/vid/leg_4_villa.mp4", poster: POSTERS.villa, dur: 8 },
  { src: "/yamal/vid/leg_5_apartments.mp4", poster: POSTERS.apartments, dur: 8 },
];

const CROSSFADE = 0.06; // fraction of a leg's band spent dissolving into the next
const AMBIENT_FADE_START = 0.01; // scrollYProgress threshold to start leaving the ambient loop
const JOURNEY_FADE_OUT_START = 0.96; // progress point where the whole layer starts fading out
const JOURNEY_FADE_OUT_END = 0.999; // matches the p cap below — reaches fully hidden by here

export default function JourneyFlyThrough({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const ambientRef = useRef<HTMLVideoElement | null>(null);
  const videos = useRef<(HTMLVideoElement | null)[]>([]);
  const [ready, setReady] = useState<boolean[]>(() => CHAIN.map(() => false));
  const [ambientReady, setAmbientReady] = useState(false);

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

  // Blob-load every clip (ambient + chain) for guaranteed seekability.
  useEffect(() => {
    let cancelled = false;
    const urls: string[] = [];

    const load = (clip: Clip, onReady: () => void, el: HTMLVideoElement | null) => {
      fetch(clip.src)
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("missing"))))
        .then((blob) => {
          if (cancelled) return;
          const url = URL.createObjectURL(blob);
          urls.push(url);
          if (el) {
            el.src = url;
            el.load();
            el.addEventListener("loadeddata", onReady, { once: true });
          }
        })
        .catch(() => {
          /* clip not rendered yet — poster remains */
        });
    };

    load(AMBIENT, () => setAmbientReady(true), ambientRef.current);
    CHAIN.forEach((clip, i) => {
      load(
        clip,
        () =>
          setReady((prev) => {
            const n = [...prev];
            n[i] = true;
            return n;
          }),
        videos.current[i]
      );
    });

    return () => {
      cancelled = true;
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, []);

  useAnimationFrame(() => {
    const p = Math.min(0.999, Math.max(0, progress.get()));

    // The whole layer fades out once the journey ends, so nothing bleeds
    // through behind Finale — it used to just sit there forever on the last
    // leg's final frame.
    if (containerRef.current) {
      const journeyOpacity =
        p < JOURNEY_FADE_OUT_START
          ? 1
          : Math.max(0, 1 - (p - JOURNEY_FADE_OUT_START) / (JOURNEY_FADE_OUT_END - JOURNEY_FADE_OUT_START));
      containerRef.current.style.opacity = String(journeyOpacity);
    }

    // Ambient loop: full opacity at the very top, fades out once scrolling starts.
    const ambientOpacity = p < AMBIENT_FADE_START ? 1 : Math.max(0, 1 - (p - AMBIENT_FADE_START) / 0.02);
    const av = ambientRef.current;
    if (av) {
      av.style.opacity = String(ambientOpacity);
      if (ambientReady && av.paused) av.play().catch(() => {});
    }

    let idx = 0;
    for (let i = 0; i < CHAIN.length; i++) {
      if (p >= bounds[i] && p < bounds[i + 1]) {
        idx = i;
        break;
      }
    }
    const span = bounds[idx + 1] - bounds[idx] || 1;
    const localT = (p - bounds[idx]) / span;

    CHAIN.forEach((clip, i) => {
      const v = videos.current[i];
      if (!v) return;
      let opacity = 0;
      if (i === idx) {
        opacity = 1;
        if (ready[i] && !v.seeking && v.duration) {
          const t = localT * v.duration;
          if (Math.abs(v.currentTime - t) > 1 / 30) v.currentTime = t;
        }
      } else if (i === idx + 1 && localT > 1 - CROSSFADE) {
        opacity = (localT - (1 - CROSSFADE)) / CROSSFADE;
        if (ready[i] && !v.seeking) v.currentTime = 0;
      }
      // Leg 1 is scrubbing from p=0 onward (so it's ready the instant the
      // ambient loop finishes fading), but must stay hidden behind the
      // ambient loop until that fade actually completes — otherwise it's
      // opaque:1 from the very first frame and the ambient loop never shows.
      if (i === 0) {
        opacity *= 1 - ambientOpacity;
      }
      v.style.opacity = String(opacity);
    });
  });

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 h-screen w-full overflow-hidden bg-paper">
      <video
        ref={ambientRef}
        poster={AMBIENT.poster}
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-100"
        style={{ opacity: 1 }}
        aria-hidden="true"
      />
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
          style={{ opacity: 0 }}
          aria-hidden="true"
        />
      ))}

      {/*
        Light mood wash only — legibility is handled by the glass card in
        JourneySections now, not by this scrim, so this stays subtle enough
        that the footage itself still reads clearly.
      */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3"
        style={{
          background:
            "linear-gradient(0deg, rgba(243,237,227,0.35) 0%, rgba(243,237,227,0) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background:
            "linear-gradient(180deg, rgba(243,237,227,0.25) 0%, rgba(243,237,227,0) 100%)",
        }}
      />
    </div>
  );
}
