"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function MonographHeader({
  onRegister,
}: {
  onRegister: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.1, ease: [0.19, 1, 0.22, 1], delay: 0.2 }}
      className={`fixed left-0 top-0 z-50 w-full transition-colors duration-500 ${
        scrolled ? "bg-paper/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-6 md:px-10">
        {/* Wordmark */}
        <a href="#top" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/40 font-serif text-[15px] leading-none text-ink">
            T
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-serif text-lg tracking-[0.2em] text-ink">
              YAMAL
            </span>
            <span className="mt-1 font-sans text-[9px] font-medium tracking-[0.3em] text-ink/55">
              AL SEEB · MUSCAT
            </span>
          </span>
        </a>

        {/* Right — monograph label + CTA */}
        <div className="flex items-center gap-6">
          <span className="hidden font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-ink/50 md:inline">
            A Coastal Monograph
          </span>
          <button
            type="button"
            onClick={onRegister}
            className="group relative overflow-hidden rounded-full border border-ink/25 px-6 py-2.5 font-sans text-[10px] font-semibold uppercase tracking-[0.24em] text-ink transition-colors duration-500"
          >
            <span className="absolute inset-0 -translate-y-full bg-ink transition-transform duration-500 ease-[cubic-bezier(0.19,1,0.22,1)] group-hover:translate-y-0" />
            <span className="relative transition-colors duration-500 group-hover:text-paper">
              Register Interest
            </span>
          </button>
        </div>
      </div>
      {/* baseline hairline */}
      <div className="mx-6 h-px bg-ink/10 md:mx-10" />
    </motion.header>
  );
}
