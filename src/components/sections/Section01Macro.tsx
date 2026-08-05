"use client";

import { Reveal, SectionShell } from "../ui";

const STATS = [
  { value: "1,760m", label: "Direct Gulf Shoreline" },
  { value: "15%", label: "Built-Up Density" },
  { value: "50%", label: "Lagoons & Green Parks" },
];

export default function Section01Macro() {
  return (
    <SectionShell id="macro-horizon" align="items-end justify-center pb-14 md:pb-20">
      <div className="w-full max-w-4xl text-center">
        <Reveal i={0}>
          <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.34em] text-gold">
            01 / Macro Horizon
          </span>
        </Reveal>

        <Reveal i={1}>
          <h1 className="mt-5 font-serif text-5xl font-light leading-[0.98] tracking-tight text-white text-balance md:text-7xl lg:text-[5.5rem]">
            Yamal — Coast of Oman
          </h1>
        </Reveal>

        <Reveal i={2}>
          <p className="mx-auto mt-5 max-w-2xl font-sans text-sm font-light leading-relaxed tracking-wide text-muted md:text-base">
            A 2.21 Million m² Smart Coastal Destination Inspired by Oman Vision
            2040
          </p>
        </Reveal>

        {/* Stat matrix — 3 columns, golden dividers */}
        <Reveal i={3}>
          <div className="mx-auto mt-10 flex max-w-3xl items-stretch rounded-2xl border border-white/[0.08] bg-obsidian/60 shadow-glass backdrop-blur-2xl">
            {STATS.map((s, idx) => (
              <div
                key={s.label}
                className={`flex flex-1 flex-col items-center px-4 py-6 md:px-8 md:py-8 ${
                  idx > 0 ? "border-l border-gold/20" : ""
                }`}
              >
                <span className="font-serif text-3xl font-light tracking-tight text-white md:text-5xl">
                  {s.value}
                </span>
                <span className="mt-2 font-sans text-[9px] font-medium uppercase tracking-[0.2em] text-muted md:text-[10px]">
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal i={4}>
          <div className="mt-10 flex flex-col items-center gap-2">
            <span className="font-sans text-[9px] font-medium uppercase tracking-[0.3em] text-white/40">
              Scroll to explore
            </span>
            <span className="h-10 w-px bg-gradient-to-b from-white/50 to-transparent" />
          </div>
        </Reveal>
      </div>
    </SectionShell>
  );
}
