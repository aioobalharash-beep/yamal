"use client";

import { useState } from "react";
import { GlassCard, Kicker, Reveal, SectionShell } from "../ui";

const UNITS = [
  { id: "1bed", label: "1-BED", area: "75m²" },
  { id: "2bed", label: "2-BED", area: "115m²" },
  { id: "3bed", label: "3-BED", area: "165m²" },
];

export default function Section04Enclaves() {
  const [active, setActive] = useState("2bed");

  return (
    <SectionShell id="park-enclaves" align="items-end justify-start pb-14 md:pb-12">
      <Reveal className="ml-0 w-full max-w-2xl md:ml-12">
        <GlassCard>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-md">
              <Kicker>04 / Community Living</Kicker>
              <h2 className="mt-6 font-serif text-4xl font-light leading-[1.02] tracking-tight text-white md:text-5xl">
                Jood Club &amp; Park Apartments
              </h2>
              <p className="mt-6 font-sans text-sm font-light leading-relaxed text-muted md:text-[15px]">
                6,220 residential units configured alongside integrated sports
                clubs, community mosques, and shaded cycling loops.
              </p>
            </div>
          </div>

          {/* Interactive filter badges */}
          <div className="mt-8 flex flex-wrap gap-3">
            {UNITS.map((u) => {
              const isActive = active === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setActive(u.id)}
                  aria-pressed={isActive}
                  className={`group flex items-baseline gap-2 rounded-full border px-5 py-2.5 font-sans text-[11px] font-medium tracking-[0.14em] transition-all duration-500 ease-gallery ${
                    isActive
                      ? "border-gold bg-gold/15 text-white shadow-goldrim"
                      : "border-white/15 bg-white/[0.02] text-muted hover:border-white/30 hover:text-white"
                  }`}
                >
                  <span>{u.label}</span>
                  <span
                    className={`text-[10px] tracking-normal ${
                      isActive ? "text-gold" : "text-muted/70"
                    }`}
                  >
                    ({u.area})
                  </span>
                </button>
              );
            })}
          </div>
        </GlassCard>
      </Reveal>
    </SectionShell>
  );
}
