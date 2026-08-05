"use client";

import { motion } from "framer-motion";

export default function SiteHeader({
  soundOn,
  onToggleSound,
  onRegister,
}: {
  soundOn: boolean;
  onToggleSound: () => void;
  onRegister: () => void;
}) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed left-0 top-0 z-50 flex w-full items-center justify-between px-6 py-6 mix-blend-difference md:px-8"
    >
      {/* Left: TMG mark + wordmark */}
      <a href="#top" className="group flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/70 font-serif text-[15px] leading-none tracking-tight text-white">
          T
        </span>
        <span className="flex flex-col leading-none">
          <span className="font-serif text-lg tracking-[0.18em] text-white">
            YAMAL
          </span>
          <span className="mt-1 font-sans text-[9px] font-medium tracking-[0.3em] text-white/80">
            AL SEEB · MUSCAT
          </span>
        </span>
      </a>

      {/* Right: soundscape toggle + register CTA */}
      <div className="flex items-center gap-3 md:gap-5">
        <button
          type="button"
          onClick={onToggleSound}
          aria-pressed={soundOn}
          className="hidden items-center gap-2 font-sans text-[10px] font-medium tracking-[0.28em] text-white transition-opacity hover:opacity-60 sm:flex"
        >
          <span
            className={`inline-block h-1.5 w-1.5 rounded-full ${
              soundOn ? "bg-white" : "bg-white/40"
            }`}
          />
          SOUNDSCAPE: {soundOn ? "ON" : "OFF"}
        </button>

        <button
          type="button"
          onClick={onRegister}
          className="rounded-full border border-white px-5 py-2.5 font-sans text-[10px] font-semibold tracking-[0.26em] text-white transition-all duration-500 ease-gallery hover:bg-white hover:text-black"
        >
          REGISTER INTEREST
        </button>
      </div>
    </motion.header>
  );
}
