"use client";

import { MaskLine, Fade, Eyebrow, PlateImage } from "./primitives";

const STATS = [
  { v: "1,760m", l: "Direct Gulf Shoreline" },
  { v: "15%", l: "Built-Up Density" },
  { v: "50%", l: "Lagoons & Green Parks" },
];

export default function Cover() {
  return (
    <header id="top" className="relative px-6 pt-32 md:px-10 md:pt-40">
      {/* Title page */}
      <div className="mx-auto flex min-h-[78vh] max-w-5xl flex-col items-center justify-center text-center">
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
      </div>

      {/* Frontispiece plate — the aerial masterplan */}
      <div className="mx-auto mt-20 max-w-6xl">
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
