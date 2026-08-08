"use client";

import { forwardRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

import { Eyebrow } from "./primitives";
import { FeatureBadges } from "./interactions";

type Leg = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  badges: string[];
};

// Grounded in the master-plan PDF (sea -> south): marina, commercial
// promenade, lagoon-spine villas, a single villa, then the apartment zones.
const LEGS: Leg[] = [
  {
    id: "bay",
    eyebrow: "Plate I — Arrival By Water",
    title: "International Marina & Yacht Club",
    body: "A crescent of deep-water berths opening onto the open Gulf, with a 113-key beachfront hotel anchoring the water's edge.",
    badges: ["Deep-Water Berths", "113-Key Hotel"],
  },
  {
    id: "commercial",
    eyebrow: "Plate II — The Destination Hub",
    title: "The Waterfront Promenade",
    body: "A 70,000 m² dining and retail promenade, palm-lined boardwalks running the length of the marina crescent.",
    badges: ["70,000m² Promenade", "Palm-Lined Boardwalks"],
  },
  {
    id: "villas",
    eyebrow: "Plate III — Coastal Ecology",
    title: "Interconnected Crystal Lagoons",
    body: "Continuous turquoise channels connecting standalone villas and beach cabins directly to quiet swimming coves.",
    badges: ["50% Water & Landscape", "Private Coves"],
  },
  {
    id: "villa",
    eyebrow: "Plate IV — Omani Heritage Architecture",
    title: "Limestone Facades & Private Pools",
    body: "Local Omani stone cladding, climate-responsive mashrabiya shading screens, and floor-to-ceiling thermal glazing.",
    badges: ["Smart City Infrastructure", "Private Lagoon Access"],
  },
  {
    id: "apartments",
    eyebrow: "Plate V — Community Living",
    title: "Jood Club & Park Apartments",
    body: "6,220 residential units configured alongside integrated sports clubs, community mosques, and shaded cycling loops.",
    badges: ["6,220 Residential Units", "Shaded Cycling Loops"],
  },
];

// Crossfade bands — 5 equal legs. The fade window is intentionally narrow
// and butts each band's fade-out directly against the next band's fade-in
// (rather than the wide overlap the video crossfade uses) so two headlines
// are never simultaneously legible — text handoffs read as a clean cut with
// a brief dissolve, not a muddy double-exposure.
const FADE = 0.015;
const N_LEGS = LEGS.length;
const BANDS: { opacity: number[][]; parallax: number[][] }[] = LEGS.map((_, i) => {
  const start = i / N_LEGS;
  const end = (i + 1) / N_LEGS;
  const isFirst = i === 0;
  const isLast = i === N_LEGS - 1;

  let opacityX: number[];
  let opacityY: number[];
  if (isFirst && isLast) {
    opacityX = [start, end];
    opacityY = [1, 1];
  } else if (isFirst) {
    opacityX = [start, end - FADE, end];
    opacityY = [1, 1, 0];
  } else if (isLast) {
    opacityX = [start, start + FADE, end];
    opacityY = [0, 1, 1];
  } else {
    opacityX = [start, start + FADE, end - FADE, end];
    opacityY = [0, 1, 1, 0];
  }

  return {
    opacity: [opacityX, opacityY],
    parallax: [[start, end], [isFirst ? 0 : 24, isLast ? 0 : -24]],
  };
});

function Band({
  index,
  progress,
  children,
}: {
  index: number;
  progress: MotionValue<number>;
  children: React.ReactNode;
}) {
  const band = BANDS[index];
  const opacity = useTransform(progress, band.opacity[0], band.opacity[1]);
  const y = useTransform(progress, band.parallax[0], band.parallax[1]);
  const pointerEvents = useTransform(opacity, (o) => (o > 0.5 ? "auto" : "none"));

  return (
    <motion.div
      className="absolute inset-0 flex items-end justify-center pb-20 will-change-[opacity,transform] md:items-center md:justify-start md:pb-0"
      style={{ opacity, y, pointerEvents }}
    >
      {children}
    </motion.div>
  );
}

// No scroll-triggered reveal here — the Band wrapper already fades/parallaxes
// the whole panel in and out as `progress` crosses into its range, so a
// second whileInView-based reveal on the children would be redundant (and
// whileInView doesn't fire reliably for content pinned inside a sticky
// container that never itself scrolls into view).
//
// A left-anchored reading panel, not a floating card — mirrors how the
// Spine's index sits quietly on the right without covering the shot. Full
// width and bottom-anchored on mobile (no room for a side column there);
// a left column on desktop, leaving the rest of the frame clear.
function JourneyCard({ leg }: { leg: Leg }) {
  return (
    <div className="w-full max-w-md px-6 md:ml-16 md:px-0 lg:ml-24">
      <div className="bg-paper/90 px-8 py-10 text-left backdrop-blur-xl md:px-10 md:py-12">
        <Eyebrow>{leg.eyebrow}</Eyebrow>
        <h2 className="mt-6 font-serif text-3xl font-light leading-[1.05] tracking-tight text-ink md:text-5xl">
          {leg.title}
        </h2>
        <p className="mt-6 font-sans text-sm font-light leading-relaxed text-ink-soft md:text-[15px]">
          {leg.body}
        </p>
        <div className="mt-8 flex flex-wrap justify-start">
          <FeatureBadges items={leg.badges} />
        </div>
      </div>
    </div>
  );
}

/**
 * The whole page's journey: a tall scroll track (5 x 100vh) with one pinned
 * full-viewport stage. Every leg's promotional card lives in that stage and
 * crossfades on scroll, in lockstep with JourneyFlyThrough's video chain
 * (same `progress` value drives both).
 */
const JourneySections = forwardRef<HTMLDivElement, { progress: MotionValue<number> }>(
  function JourneySections({ progress }, ref) {
    return (
      <div ref={ref} className="relative h-[500vh] w-full">
        <div className="sticky top-0 h-screen w-full overflow-hidden">
          {LEGS.map((leg, i) => (
            <Band key={leg.id} index={i} progress={progress}>
              <JourneyCard leg={leg} />
            </Band>
          ))}
        </div>
      </div>
    );
  }
);

export default JourneySections;
