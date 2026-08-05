"use client";

import { useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

export type KeyframeDef = {
  id: string;
  src: string;
  label: string;
  /** CSS background used as an editorial fallback until the JPG is dropped in. */
  gradient: string;
  opacityStops: number[];
  opacityValues: number[];
  scaleStops: number[];
  scaleValues: number[];
};

/**
 * The 5 asset keyframes, timed to global gallery progress (0 → 1).
 * Ranges and scale directions follow the art-direction brief exactly.
 */
export const KEYFRAMES: KeyframeDef[] = [
  {
    id: "01",
    src: "/yamal/01-aerial-masterplan.jpg",
    label: "Aerial Masterplan",
    gradient:
      "radial-gradient(120% 90% at 50% -10%, rgba(31,107,122,0.45) 0%, rgba(31,107,122,0) 55%), radial-gradient(80% 60% at 80% 110%, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0) 60%), linear-gradient(180deg, #0a1218 0%, #080a0e 60%, #060709 100%)",
    opacityStops: [0, 0.18, 0.22],
    opacityValues: [1, 1, 0],
    scaleStops: [0, 0.2],
    scaleValues: [1.05, 1.0],
  },
  {
    id: "02",
    src: "/yamal/02-marina-crescent.jpg",
    label: "Marina Crescent",
    gradient:
      "radial-gradient(100% 80% at 20% 20%, rgba(31,107,122,0.5) 0%, rgba(31,107,122,0) 55%), radial-gradient(90% 70% at 90% 90%, rgba(15,60,72,0.65) 0%, rgba(15,60,72,0) 60%), linear-gradient(160deg, #071318 0%, #081016 55%, #060809 100%)",
    opacityStops: [0.18, 0.22, 0.38, 0.42],
    opacityValues: [0, 1, 1, 0],
    scaleStops: [0.2, 0.4],
    scaleValues: [1.0, 1.03],
  },
  {
    id: "03",
    src: "/yamal/03-crystal-lagoons.jpg",
    label: "Crystal Lagoons",
    gradient:
      "radial-gradient(120% 90% at 70% 20%, rgba(45,140,158,0.5) 0%, rgba(45,140,158,0) 55%), radial-gradient(90% 70% at 10% 100%, rgba(31,107,122,0.5) 0%, rgba(31,107,122,0) 60%), linear-gradient(200deg, #06171c 0%, #071418 55%, #060809 100%)",
    opacityStops: [0.38, 0.42, 0.58, 0.62],
    opacityValues: [0, 1, 1, 0],
    scaleStops: [0.4, 0.6],
    scaleValues: [1.03, 1.0],
  },
  {
    id: "04",
    src: "/yamal/04-apartment-park.jpg",
    label: "Apartment Park",
    gradient:
      "radial-gradient(110% 80% at 30% 90%, rgba(200,178,155,0.28) 0%, rgba(200,178,155,0) 55%), radial-gradient(90% 70% at 85% 10%, rgba(31,107,122,0.32) 0%, rgba(31,107,122,0) 60%), linear-gradient(180deg, #0d1116 0%, #0a0e13 55%, #070809 100%)",
    opacityStops: [0.58, 0.62, 0.78, 0.82],
    opacityValues: [0, 1, 1, 0],
    scaleStops: [0.6, 0.8],
    scaleValues: [1.0, 1.04],
  },
  {
    id: "05",
    src: "/yamal/05-villa-facade.jpg",
    label: "Villa Facade",
    gradient:
      "radial-gradient(120% 90% at 65% 15%, rgba(212,175,55,0.24) 0%, rgba(212,175,55,0) 55%), radial-gradient(90% 80% at 15% 95%, rgba(200,178,155,0.3) 0%, rgba(200,178,155,0) 60%), linear-gradient(200deg, #12100c 0%, #0c0d0f 55%, #070809 100%)",
    opacityStops: [0.78, 0.82, 1],
    opacityValues: [0, 1, 1],
    scaleStops: [0.8, 1],
    scaleValues: [1.04, 1.0],
  },
];

function Keyframe({
  def,
  progress,
}: {
  def: KeyframeDef;
  progress: MotionValue<number>;
}) {
  const [imgOk, setImgOk] = useState(true);
  const opacity = useTransform(progress, def.opacityStops, def.opacityValues);
  const scale = useTransform(progress, def.scaleStops, def.scaleValues);

  return (
    <motion.div
      className="absolute inset-0 will-change-[opacity,transform]"
      style={{ opacity }}
      aria-hidden="true"
    >
      <motion.div
        className="absolute inset-0 bg-cover bg-center"
        style={{ scale, backgroundImage: def.gradient }}
      >
        {imgOk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={def.src}
            alt=""
            className="h-full w-full object-cover"
            onError={() => setImgOk(false)}
            draggable={false}
          />
        )}
      </motion.div>
    </motion.div>
  );
}

/**
 * Fixed, full-viewport harness. All five keyframes stack here and crossfade
 * continuously as gallery progress advances. A vignette + aqua rim + grain
 * hold the depth so flat gradients never read as empty screens.
 */
export default function KeyframeCanvas({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-full overflow-hidden bg-obsidian grain">
      {KEYFRAMES.map((def) => (
        <Keyframe key={def.id} def={def} progress={progress} />
      ))}

      {/* Cinematic vignette for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 50% 40%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.55) 100%)",
        }}
      />
      {/* Aqua horizon glow rim */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        style={{
          background:
            "linear-gradient(180deg, rgba(31,107,122,0.22) 0%, rgba(31,107,122,0) 100%)",
        }}
      />
      {/* Grounding floor gradient so text sits on readable density */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
        style={{
          background:
            "linear-gradient(0deg, rgba(6,7,9,0.85) 0%, rgba(6,7,9,0) 100%)",
        }}
      />
    </div>
  );
}
