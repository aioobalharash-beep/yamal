"use client";

import { motion, type Variants } from "framer-motion";

export const ease = [0.16, 1, 0.3, 1] as const;

export const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease, delay: 0.12 + 0.09 * i },
  }),
};

/**
 * Entrance animation. Sections crossfade via their scroll band, so this plays
 * once on mount purely to give the hero (and card interiors) a staged arrival.
 */
export function Reveal({
  children,
  i = 0,
  className,
}: {
  children: React.ReactNode;
  i?: number;
  className?: string;
}) {
  return (
    <motion.div
      variants={rise}
      custom={i}
      initial="hidden"
      animate="show"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-px w-8 bg-gold/70" />
      <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
        {children}
      </span>
    </div>
  );
}

export function MetricTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-aqua/40 bg-aqua/10 px-4 py-1.5 font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-[#8fd4e0]">
      <span className="inline-block h-1.5 w-1.5 rounded-full bg-aqua" />
      {children}
    </span>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-3xl border border-white/[0.08] bg-obsidian/60 p-8 shadow-glass backdrop-blur-2xl md:p-10 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * Fill layer for a keyframe section. All five stack absolutely inside the one
 * pinned stage (see KeyframeSections) and crossfade with the background.
 */
export function SectionShell({
  id,
  align,
  children,
}: {
  id: string;
  align: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className={`absolute inset-0 flex h-full w-full ${align} px-6 md:px-8`}
    >
      {children}
    </div>
  );
}
