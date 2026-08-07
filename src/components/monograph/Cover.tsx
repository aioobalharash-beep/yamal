"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion, useScroll } from "framer-motion";

import { MaskLine, Fade, Eyebrow, PlateImage } from "./primitives";

// Scroll-scrubbed video fly-through — client-only (no SSR for the <video> chain).
const VideoFlyThrough = dynamic(() => import("../three/VideoFlyThrough"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-paper" />,
});

const USE_VIDEO = process.env.NEXT_PUBLIC_USE_VIDEO_FLYTHROUGH === "1";

const STATS = [
  { v: "1,760m", l: "Direct Gulf Shoreline" },
  { v: "15%", l: "Built-Up Density" },
  { v: "50%", l: "Lagoons & Green Parks" },
];

function TitleBlock() {
  return (
    <>
      <Fade i={0}>
        <Eyebrow>The Coastal Monograph · Vol. 01</Eyebrow>
      </Fade>

      <h1 className="mt-8 font-serif font-light leading-[0.92] tracking-[-0.01em] text-ink">
        <MaskLine className="text-[15vw] md:text-[10.5vw] lg:text-[9rem]">
          Yamal
        </MaskLine>
        <MaskLine
          delay={0.08}
          className="text-[9vw] italic text-ink/80 md:text-[6vw] lg:text-[5rem]"
        >
          Coast of Oman
        </MaskLine>
      </h1>

      <Fade i={2} className="mt-8 max-w-xl">
        <p className="font-sans text-sm font-light leading-relaxed tracking-wide text-ink-soft md:text-[15px]">
          A 2.21 million m² smart coastal destination on the Gulf of Oman,
          in Al Seeb, Muscat — inspired by Oman Vision 2040.
        </p>
      </Fade>

      {/* Stat register */}
      <Fade i={3} className="mt-14 w-full max-w-3xl">
        <div className="grid grid-cols-3 border-y border-ink/15">
          {STATS.map((s, i) => (
            <div
              key={s.l}
              className={`px-3 py-7 md:px-6 ${
                i > 0 ? "border-l border-ink/12" : ""
              }`}
            >
              <div className="font-serif text-3xl font-light text-ink md:text-5xl">
                {s.v}
              </div>
              <div className="mt-2 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-ink/45 md:text-[10px]">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </Fade>
    </>
  );
}

/**
 * Video hero — pins the title over the scroll-scrubbed fly-through for one
 * tall scroll pass, then releases into the ordinary Monograph flow below.
 * Falls back to the plain static hero for prefers-reduced-motion, since
 * scroll-jacked video scrubbing is exactly the kind of motion those users
 * are opting out of.
 */
function VideoHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end end"],
  });

  return (
    <div ref={heroRef} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden">
        <VideoFlyThrough progress={scrollYProgress} variant="hero" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-16 text-center md:px-10">
          <TitleBlock />
        </div>
      </div>
    </div>
  );
}

export default function Cover() {
  const reducedMotion = useReducedMotion();
  const showVideoHero = USE_VIDEO && !reducedMotion;

  return (
    <header id="top" className="relative">
      {showVideoHero ? (
        <VideoHero />
      ) : (
        <div className="px-6 pt-32 md:px-10 md:pt-40">
          <div className="mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center text-center">
            <TitleBlock />
          </div>
        </div>
      )}

      {/* Frontispiece plate — the aerial masterplan */}
      <div className="mx-auto mt-20 max-w-6xl px-6 md:px-10">
        <PlateImage
          src="/yamal/01-aerial-masterplan.jpeg"
          alt="Aerial view of the Yamal masterplan"
          plate="Plate I — Aerial Masterplan"
          caption="The 2.21M m² coast"
          aspect="aspect-[16/9]"
        />
      </div>
    </header>
  );
}
