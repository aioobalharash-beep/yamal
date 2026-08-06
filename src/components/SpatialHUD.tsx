"use client";

import { useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "framer-motion";

const STATION_LABELS = [
  "Aerial Masterplan",
  "Marina Crescent",
  "Crystal Lagoons",
  "Apartment Park",
  "Villa Facade",
];

const R = 22;
const CIRC = 2 * Math.PI * R;

/**
 * Bottom-right spatial HUD: glass step counter + live progress arc.
 * The arc reads total gallery progress; the counter reads the active keyframe.
 */
export default function SpatialHUD({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const [active, setActive] = useState(0);
  const total = STATION_LABELS.length;

  useMotionValueEvent(progress, "change", (v) => {
    const idx = Math.min(total - 1, Math.max(0, Math.floor(v * total)));
    setActive(idx);
  });

  const dashoffset = useTransform(progress, [0, 1], [CIRC, 0]);
  const activeLabel = STATION_LABELS[active] ?? "";

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
        className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-obsidian/60 px-4 py-3 shadow-glass backdrop-blur-2xl"
      >
        {/* Progress arc */}
        <div className="relative h-[52px] w-[52px]">
          <svg viewBox="0 0 52 52" className="h-full w-full -rotate-90">
            <circle
              cx="26"
              cy="26"
              r={R}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
            />
            <motion.circle
              cx="26"
              cy="26"
              r={R}
              fill="none"
              stroke="#C6A45C"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={CIRC}
              style={{ strokeDashoffset: dashoffset }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-sans text-[11px] font-semibold tabular-nums tracking-wide text-white">
              {String(active + 1).padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* Counter meta */}
        <div className="flex flex-col leading-none">
          <span className="font-sans text-[10px] font-semibold tracking-[0.24em] text-white/90">
            {String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}{" "}
            <span className="text-white/40">KEYFRAMES</span>
          </span>
          <span className="mt-1.5 font-serif text-sm italic tracking-wide text-travertine">
            {activeLabel}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
