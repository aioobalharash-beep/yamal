"use client";

import { MaskLine, Fade, Eyebrow, PlateImage } from "./primitives";

export type SpreadData = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  metric?: string;
  src: string;
  plate: string;
  caption: string;
  reverse?: boolean;
};

export default function PlateSpread({
  data,
  children,
}: {
  data: SpreadData;
  children?: React.ReactNode;
}) {
  return (
    <section
      id={data.id}
      className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-24 md:grid-cols-2 md:gap-16 md:px-10 md:py-36"
    >
      {/* Image plate */}
      <PlateImage
        src={data.src}
        alt={data.title}
        plate={data.plate}
        caption={data.caption}
        className={data.reverse ? "md:order-2" : ""}
      />

      {/* Text column */}
      <div className={data.reverse ? "md:order-1 md:pr-8" : "md:pl-8"}>
        <Fade i={0}>
          <Eyebrow>{data.eyebrow}</Eyebrow>
        </Fade>

        <h2 className="mt-6 font-serif text-4xl font-light leading-[1.02] tracking-tight text-ink md:text-6xl">
          <MaskLine>{data.title}</MaskLine>
        </h2>

        <Fade i={1} className="mt-6 max-w-md">
          <p className="font-sans text-sm font-light leading-relaxed text-ink-soft md:text-[15px]">
            {data.body}
          </p>
        </Fade>

        {data.metric && (
          <Fade i={2} className="mt-8">
            <span className="inline-flex items-center gap-2 border border-gold-ink/40 bg-gold-ink/[0.06] px-4 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-gold-ink">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-ink" />
              {data.metric}
            </span>
          </Fade>
        )}

        {children && <Fade i={2} className="mt-8">{children}</Fade>}
      </div>
    </section>
  );
}
