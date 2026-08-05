"use client";

import { GlassCard, Kicker, MetricTag, Reveal, SectionShell } from "../ui";

export default function Section03Lagoons() {
  return (
    <SectionShell id="hydro-urbanism" align="items-center justify-end">
      <Reveal className="mr-0 w-full max-w-md md:mr-12">
        <GlassCard>
          <Kicker>03 / Coastal Ecology</Kicker>
          <h2 className="mt-6 font-serif text-4xl font-light leading-[1.02] tracking-tight text-white md:text-5xl">
            Interconnected Crystal Lagoons
          </h2>
          <p className="mt-6 font-sans text-sm font-light leading-relaxed text-muted md:text-[15px]">
            Continuous turquoise channels connecting standalone villas and beach
            cabins directly to quiet swimming coves and Al Naseem Heritage Park.
          </p>
          <div className="mt-8">
            <MetricTag>50% Water &amp; Landscape Ratio</MetricTag>
          </div>
        </GlassCard>
      </Reveal>
    </SectionShell>
  );
}
