"use client";

import { GlassCard, Kicker, Reveal, SectionShell } from "../ui";

const FEATURES = ["Smart City Infrastructure", "Private Lagoon Access"];

export default function Section05Materiality() {
  return (
    <SectionShell id="materiality" align="items-center justify-start">
      <Reveal className="ml-0 w-full max-w-md md:ml-12">
        <GlassCard>
          <Kicker>05 / Omani Heritage Architecture</Kicker>
          <h2 className="mt-6 font-serif text-4xl font-light leading-[1.02] tracking-tight text-white md:text-5xl">
            Limestone Facades &amp; Private Pools
          </h2>
          <p className="mt-6 font-sans text-sm font-light leading-relaxed text-muted md:text-[15px]">
            Local Omani stone cladding, climate-responsive mashrabiya shading
            screens, floor-to-ceiling thermal glazing, and private plot access.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {FEATURES.map((f) => (
              <span
                key={f}
                className="inline-flex items-center gap-2 rounded-full border border-travertine/30 bg-travertine/10 px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-travertine"
              >
                <span className="inline-block h-1 w-1 rounded-full bg-gold" />
                {f}
              </span>
            ))}
          </div>
        </GlassCard>
      </Reveal>
    </SectionShell>
  );
}
