"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Kicker } from "../ui";

type UnitType = {
  id: string;
  name: string;
  tagline: string;
  specs: { k: string; v: string }[];
};

const UNIT_TYPES: UnitType[] = [
  {
    id: "villas",
    name: "Standalone Villas",
    tagline:
      "Private plots along the crystal lagoon edge with direct waterfront access, limestone facades, and enclosed pools.",
    specs: [
      { k: "Footprint", v: "320 – 640 m²" },
      { k: "Configuration", v: "4 – 6 Bedrooms" },
      { k: "Frontage", v: "Private Lagoon" },
    ],
  },
  {
    id: "cabins",
    name: "Beach Cabins",
    tagline:
      "Intimate single-level retreats opening onto quiet swimming coves and the 1,760m Gulf shoreline.",
    specs: [
      { k: "Footprint", v: "180 – 260 m²" },
      { k: "Configuration", v: "2 – 3 Bedrooms" },
      { k: "Frontage", v: "Beach & Cove" },
    ],
  },
  {
    id: "apartments",
    name: "Park Apartments",
    tagline:
      "Jood Club residences framed by shaded cycling loops, sports clubs, and Al Naseem Heritage Park.",
    specs: [
      { k: "Footprint", v: "75 – 165 m²" },
      { k: "Configuration", v: "1 – 3 Bedrooms" },
      { k: "Frontage", v: "Park & Courtyard" },
    ],
  },
];

export default function Section06Masterplan({
  onRequestBrochure,
}: {
  onRequestBrochure: (context: string) => void;
}) {
  const [active, setActive] = useState(UNIT_TYPES[0]);

  return (
    <section
      id="masterplan"
      className="relative z-10 min-h-screen w-full overflow-hidden bg-obsidian grain"
    >
      {/* Aqua glow anchor at the base of the destination */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[900px] -translate-x-1/2 opacity-60"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 0%, rgba(31,107,122,0.35) 0%, rgba(31,107,122,0) 70%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-24 md:px-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Kicker>06 / The Full Masterplan</Kicker>
          </div>
          <h2 className="mx-auto mt-6 max-w-3xl font-serif text-4xl font-light leading-[1.02] tracking-tight text-white text-balance md:text-6xl">
            Choose Your Address on the Coast of Oman
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-sans text-sm font-light leading-relaxed text-muted md:text-base">
            Explore the residential collections across YAMAL&apos;s 2.21 million m²
            waterfront masterplan and request your private release details.
          </p>
        </div>

        {/* Unit type switcher */}
        <div className="mt-12 flex flex-wrap justify-center gap-2 rounded-full border border-white/[0.08] bg-surface/60 p-1.5 backdrop-blur-2xl sm:mx-auto sm:w-fit">
          {UNIT_TYPES.map((u) => {
            const isActive = active.id === u.id;
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => setActive(u)}
                aria-pressed={isActive}
                className={`relative rounded-full px-5 py-3 font-sans text-[11px] font-semibold tracking-[0.16em] transition-colors duration-500 md:px-7 ${
                  isActive ? "text-obsidian" : "text-muted hover:text-white"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="unit-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-gold to-travertine"
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  />
                )}
                <span className="relative uppercase">{u.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active unit detail */}
        <div className="mt-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto grid max-w-4xl gap-6 rounded-3xl border border-white/[0.08] bg-surface/50 p-8 shadow-glass backdrop-blur-2xl md:grid-cols-[1.2fr_1fr] md:p-10"
            >
              <div>
                <h3 className="font-serif text-3xl font-light tracking-tight text-white md:text-4xl">
                  {active.name}
                </h3>
                <p className="mt-4 max-w-md font-sans text-sm font-light leading-relaxed text-muted">
                  {active.tagline}
                </p>
              </div>
              <div className="flex flex-col justify-center gap-4 md:border-l md:border-white/10 md:pl-8">
                {active.specs.map((s) => (
                  <div key={s.k} className="flex items-baseline justify-between">
                    <span className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-white/40">
                      {s.k}
                    </span>
                    <span className="font-serif text-lg text-travertine">
                      {s.v}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Floating VIP CTA */}
        <div className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={() => onRequestBrochure(active.name)}
            className="group relative overflow-hidden rounded-full border border-gold/50 bg-gold/10 px-8 py-4 shadow-goldrim transition-transform duration-500 hover:scale-[1.02] md:px-10"
          >
            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-gold/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            <span className="relative font-sans text-[11px] font-semibold tracking-[0.18em] text-white md:text-xs">
              REQUEST OFFICIAL TMG YAMAL VIP BROCHURE &amp; FLOOR PLANS
            </span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06] px-6 py-10 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/40 font-serif text-sm text-white">
              T
            </span>
            <span className="font-serif text-base tracking-[0.16em] text-white">
              YAMAL{" "}
              <span className="font-sans text-[10px] tracking-[0.24em] text-muted">
                BY TMG
              </span>
            </span>
          </div>
          <p className="font-sans text-[10px] tracking-[0.22em] text-white/35">
            AL SEEB · MUSCAT · SULTANATE OF OMAN
          </p>
          <p className="font-sans text-[10px] tracking-[0.14em] text-white/25">
            INSPIRED BY OMAN VISION 2040
          </p>
        </div>
      </footer>
    </section>
  );
}
