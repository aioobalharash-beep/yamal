"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MaskLine, Fade, Eyebrow, PlateImage } from "./primitives";

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
      "Private plots along the crystal-lagoon edge with direct waterfront access, limestone facades, and enclosed pools.",
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

export default function Finale({
  onRequestBrochure,
}: {
  onRequestBrochure: (context: string) => void;
}) {
  const [active, setActive] = useState(UNIT_TYPES[0]);

  return (
    <section id="masterplan" className="relative bg-paper px-6 py-24 md:px-10 md:py-36">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="max-w-3xl">
          <Fade i={0}>
            <Eyebrow>Plate VI — The Masterplan</Eyebrow>
          </Fade>
          <h2 className="mt-6 font-serif text-4xl font-light leading-[1.02] tracking-tight text-ink md:text-6xl">
            <MaskLine>Choose your address</MaskLine>
            <MaskLine delay={0.06} className="italic text-ink/80">
              on the coast of Oman
            </MaskLine>
          </h2>
          <Fade i={1} className="mt-6 max-w-xl">
            <p className="font-sans text-sm font-light leading-relaxed text-ink-soft md:text-[15px]">
              Explore the residential collections across Yamal&apos;s 2.21 million
              m² waterfront masterplan and request your private release details.
            </p>
          </Fade>
        </div>

        {/* Spread: masterplan plate + unit register */}
        <div className="mt-16 grid items-start gap-10 md:grid-cols-2 md:gap-16">
          <PlateImage
            src="/yamal/06-mastermap-cta.jpeg"
            alt="Yamal masterplan"
            plate="Fig. 06 — Full Masterplan"
            caption="Districts & shoreline"
            aspect="aspect-[4/5]"
          />

          <div>
            {/* Unit switcher */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 border-b border-ink/15 pb-4">
              {UNIT_TYPES.map((u) => {
                const on = active.id === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setActive(u)}
                    aria-pressed={on}
                    className={`relative font-sans text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${
                      on ? "text-ink" : "text-ink/40 hover:text-ink/70"
                    }`}
                  >
                    {u.name}
                    {on && (
                      <motion.span
                        layoutId="unit-underline"
                        className="absolute -bottom-[17px] left-0 h-px w-full bg-gold-ink"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, ease: [0.19, 1, 0.22, 1] }}
                className="pt-8"
              >
                <h3 className="font-serif text-3xl font-light tracking-tight text-ink md:text-4xl">
                  {active.name}
                </h3>
                <p className="mt-4 max-w-md font-sans text-sm font-light leading-relaxed text-ink-soft">
                  {active.tagline}
                </p>
                <dl className="mt-8 divide-y divide-ink/12 border-y border-ink/12">
                  {active.specs.map((s) => (
                    <div
                      key={s.k}
                      className="flex items-baseline justify-between py-3"
                    >
                      <dt className="font-sans text-[10px] font-medium uppercase tracking-[0.2em] text-ink/45">
                        {s.k}
                      </dt>
                      <dd className="font-serif text-lg text-ink">{s.v}</dd>
                    </div>
                  ))}
                </dl>
              </motion.div>
            </AnimatePresence>

            {/* VIP CTA */}
            <button
              type="button"
              onClick={() => onRequestBrochure(active.name)}
              className="group mt-10 flex w-full items-center justify-between gap-6 border border-ink bg-ink px-7 py-5 text-left transition-colors duration-500 hover:bg-transparent"
            >
              <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.16em] text-paper transition-colors duration-500 group-hover:text-ink">
                Request the official VIP brochure &amp; floor plans
              </span>
              <span className="font-serif text-2xl text-gold-hi transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer / colophon */}
      <footer className="mx-auto mt-28 max-w-6xl border-t border-ink/15 pt-10">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/40 font-serif text-sm text-ink">
              T
            </span>
            <span className="font-serif text-base tracking-[0.16em] text-ink">
              YAMAL{" "}
              <span className="font-sans text-[10px] tracking-[0.24em] text-ink/50">
                BY TMG
              </span>
            </span>
          </div>
          <p className="font-sans text-[10px] tracking-[0.22em] text-ink/45">
            AL SEEB · MUSCAT · SULTANATE OF OMAN
          </p>
          <p className="font-sans text-[10px] tracking-[0.14em] text-ink/35">
            INSPIRED BY OMAN VISION 2040
          </p>
        </div>
      </footer>
    </section>
  );
}
