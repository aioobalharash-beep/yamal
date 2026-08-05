"use client";

import { forwardRef } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";

import Section01Macro from "./sections/Section01Macro";
import Section02Marina from "./sections/Section02Marina";
import Section03Lagoons from "./sections/Section03Lagoons";
import Section04Enclaves from "./sections/Section04Enclaves";
import Section05Materiality from "./sections/Section05Materiality";

/** Crossfade bands — identical to KeyframeCanvas so text and imagery move as one. */
const BANDS: { opacity: number[][]; parallax: number[][] }[] = [
  { opacity: [[0, 0.18, 0.22], [1, 1, 0]], parallax: [[0, 0.22], [0, -40]] },
  {
    opacity: [[0.18, 0.22, 0.38, 0.42], [0, 1, 1, 0]],
    parallax: [[0.18, 0.42], [40, -40]],
  },
  {
    opacity: [[0.38, 0.42, 0.58, 0.62], [0, 1, 1, 0]],
    parallax: [[0.38, 0.62], [40, -40]],
  },
  {
    opacity: [[0.58, 0.62, 0.78, 0.82], [0, 1, 1, 0]],
    parallax: [[0.58, 0.82], [40, -40]],
  },
  { opacity: [[0.78, 0.82, 1], [0, 1, 1]], parallax: [[0.78, 1], [40, 0]] },
];

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
  // Only the visible band should capture clicks (interactive badges/CTAs).
  const pointerEvents = useTransform(opacity, (o) =>
    o > 0.5 ? "auto" : "none"
  );

  return (
    <motion.div
      className="absolute inset-0 will-change-[opacity,transform]"
      style={{ opacity, y, pointerEvents }}
    >
      {children}
    </motion.div>
  );
}

const SECTIONS = [
  Section01Macro,
  Section02Marina,
  Section03Lagoons,
  Section04Enclaves,
  Section05Materiality,
];

/**
 * A tall scroll track (5 × 100vh) with one pinned full-viewport stage. Every
 * keyframe section lives in that stage and crossfades on scroll — so only one
 * editorial card is ever composited, in perfect lockstep with the background.
 */
const KeyframeSections = forwardRef<
  HTMLDivElement,
  { progress: MotionValue<number> }
>(function KeyframeSections({ progress }, ref) {
  return (
    <div ref={ref} className="relative h-[500vh] w-full">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {SECTIONS.map((Section, i) => (
          <Band key={i} index={i} progress={progress}>
            <Section />
          </Band>
        ))}
      </div>
    </div>
  );
});

export default KeyframeSections;
