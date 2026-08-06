"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";

export const ease = [0.19, 1, 0.22, 1] as const;

const vp = { once: true, margin: "-10% 0px -10% 0px" } as const;

/**
 * Masked line rise — the child slides up from beneath a clip. The scroll
 * trigger lives on the OUTER (unclipped) wrapper and propagates to the child;
 * watching the clipped child directly would never intersect, so it'd never fire.
 */
export function MaskLine({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.span
      className="block overflow-hidden"
      initial="hidden"
      whileInView="show"
      viewport={vp}
    >
      <motion.span
        className={`block ${className}`}
        variants={{
          hidden: { y: "115%" },
          show: {
            y: "0%",
            transition: { duration: 1.1, ease, delay },
          },
        }}
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

export const fade: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease, delay: 0.1 + i * 0.08 },
  }),
};

export function Fade({
  children,
  i = 0,
  className = "",
}: {
  children: React.ReactNode;
  i?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={fade}
      custom={i}
      initial="hidden"
      whileInView="show"
      viewport={vp}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Small wide-tracked index label with a gold tick. */
export function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-3 font-sans text-[10px] font-semibold uppercase tracking-[0.34em] text-gold-ink ${className}`}
    >
      <span className="h-px w-7 bg-gold-ink/70" />
      {children}
    </span>
  );
}

/**
 * A framed gallery plate: the render sits inside a hairline frame, drifts with
 * a slow parallax, and is unveiled by an ivory curtain lifting on scroll-in.
 */
export function PlateImage({
  src,
  alt,
  plate,
  caption,
  className = "",
  aspect = "aspect-[4/5]",
}: {
  src: string;
  alt: string;
  plate: string;
  caption: string;
  className?: string;
  aspect?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-7%", "7%"]);

  return (
    <div className={className}>
      <div
        ref={ref}
        className={`relative overflow-hidden ${aspect} w-full bg-panel ring-1 ring-ink/10`}
      >
        <motion.img
          src={src}
          alt={alt}
          style={{ y }}
          className="absolute -top-[7%] left-0 h-[114%] w-full object-cover"
          draggable={false}
        />
        {/* veil lift */}
        <motion.div
          className="absolute inset-0 origin-bottom bg-paper"
          initial={{ scaleY: 1 }}
          whileInView={{ scaleY: 0 }}
          viewport={vp}
          transition={{ duration: 1.2, ease }}
        />
        {/* inner hairline frame */}
        <div className="pointer-events-none absolute inset-[10px] border border-cream/25" />
      </div>

      {/* plate caption line */}
      <div className="mt-4 flex items-baseline justify-between border-t border-ink/15 pt-3">
        <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-ink/50">
          {plate}
        </span>
        <span className="font-serif text-base italic text-ink/70">{caption}</span>
      </div>
    </div>
  );
}
