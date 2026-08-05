"use client";

import { GlassCard, Kicker, MetricTag, Reveal, SectionShell } from "../ui";

export default function Section02Marina() {
  return (
    <SectionShell id="maritime-crescent" align="items-center justify-start">
      <Reveal className="ml-0 w-full max-w-md md:ml-12">
        <GlassCard>
          <Kicker>02 / The Destination Hub</Kicker>
          <h2 className="mt-6 font-serif text-4xl font-light leading-[1.02] tracking-tight text-white md:text-5xl">
            International Marina &amp; Yacht Club
          </h2>
          <p className="mt-6 font-sans text-sm font-light leading-relaxed text-muted md:text-[15px]">
            Featuring deep-water berths, a 70,000&nbsp;m² dining promenade,
            113-key beachfront hotel suites, and direct open Gulf access.
          </p>
          <div className="mt-8">
            <MetricTag>Luxury Hospitality &amp; Berths</MetricTag>
          </div>
        </GlassCard>
      </Reveal>
    </SectionShell>
  );
}
