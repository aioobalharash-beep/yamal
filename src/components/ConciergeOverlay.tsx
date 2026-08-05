"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

/** Muscat concierge line — replace with the live sales number before launch. */
const WHATSAPP_NUMBER = "96890000000"; // +968 (Muscat / International)

export default function ConciergeOverlay({
  open,
  onClose,
  context,
}: {
  open: boolean;
  onClose: () => void;
  context?: string;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", onKey);
      document.documentElement.classList.add("lenis-stopped");
    }
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.classList.remove("lenis-stopped");
    };
  }, [open, onClose]);

  const buildLink = () => {
    const intro = name.trim() ? `My name is ${name.trim()}. ` : "";
    const focus = context ? `I'm interested in ${context}. ` : "";
    const message = `Hello YAMAL by TMG concierge. ${intro}${focus}I would like to request the official VIP brochure and floor plans.`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-obsidian/85 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Request VIP brochure"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/[0.08] bg-surface/90 shadow-glass backdrop-blur-2xl"
          >
            <div className="hairline-gold h-px w-full" />
            <div className="p-8 md:p-10">
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-sans text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">
                    VIP Concierge
                  </span>
                  <h3 className="mt-3 font-serif text-3xl font-light leading-tight tracking-tight text-white">
                    Request Your Private Brochure
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="ml-4 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/40 hover:text-white"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1 1l12 12M13 1L1 13"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <p className="mt-4 font-sans text-sm font-light leading-relaxed text-muted">
                A dedicated TMG advisor will share the official YAMAL brochure,
                master floor plans, and current release pricing directly via
                WhatsApp.
              </p>

              <label className="mt-7 block">
                <span className="font-sans text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">
                  Your Name
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sultan Al Harthy"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-obsidian/60 px-4 py-3 font-sans text-sm text-white placeholder:text-white/25 outline-none transition-colors focus:border-gold/50"
                />
              </label>

              <a
                href={buildLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-[#25D366] px-6 py-4 font-sans text-[12px] font-semibold tracking-[0.12em] text-[#062012] transition-transform duration-300 hover:scale-[1.01]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
                </svg>
                CONTINUE ON WHATSAPP
              </a>

              <p className="mt-4 text-center font-sans text-[10px] tracking-[0.14em] text-white/35">
                +968 · MUSCAT / INTERNATIONAL LINE
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
