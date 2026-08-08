"use client";

import { useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";

const PLATES = [
  "The Marina",
  "The Promenade",
  "The Lagoons",
  "The Villa",
  "The Apartments",
  "The Masterplan",
];

/** Right-edge gold spine: a slow-tracking marker + the live plate index. */
export default function Spine() {
  const { scrollYProgress } = useScroll();
  const smooth = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    mass: 0.4,
  });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(PLATES.length - 1, Math.floor(v * PLATES.length)));
  });

  return (
    <div className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 md:block">
      <div className="flex flex-col items-end gap-4">
        <span className="font-sans text-[10px] font-semibold tracking-[0.28em] text-ink/45">
          {String(active + 1).padStart(2, "0")}
          <span className="text-ink/25"> / 06</span>
        </span>

        {/* the spine */}
        <div className="relative h-44 w-px bg-ink/15">
          <motion.div
            className="absolute left-0 top-0 w-px origin-top bg-gold-ink"
            style={{ scaleY: smooth, height: "100%" }}
          />
          {PLATES.map((_, i) => (
            <span
              key={i}
              className={`absolute -right-[3px] h-[7px] w-[7px] -translate-y-1/2 rounded-full border transition-colors duration-500 ${
                i <= active
                  ? "border-gold-ink bg-gold-ink"
                  : "border-ink/25 bg-paper"
              }`}
              style={{ top: `${(i / (PLATES.length - 1)) * 100}%` }}
            />
          ))}
        </div>

        <span className="[writing-mode:vertical-rl] font-serif text-sm italic tracking-wide text-ink/60">
          {PLATES[active]}
        </span>
      </div>
    </div>
  );
}
