"use client";

import { useState } from "react";

const UNITS = [
  { id: "1bed", label: "1-Bed", area: "75 m²" },
  { id: "2bed", label: "2-Bed", area: "115 m²" },
  { id: "3bed", label: "3-Bed", area: "165 m²" },
];

export function UnitFilter() {
  const [active, setActive] = useState("2bed");
  return (
    <div className="flex flex-wrap gap-3">
      {UNITS.map((u) => {
        const on = active === u.id;
        return (
          <button
            key={u.id}
            type="button"
            onClick={() => setActive(u.id)}
            aria-pressed={on}
            className={`flex items-baseline gap-2 border px-5 py-2.5 font-sans text-[11px] font-medium tracking-[0.12em] transition-colors duration-500 ${
              on
                ? "border-ink bg-ink text-paper"
                : "border-ink/20 text-ink/70 hover:border-ink/50 hover:text-ink"
            }`}
          >
            <span className="uppercase">{u.label}</span>
            <span className={on ? "text-gold-hi" : "text-ink/40"}>
              {u.area}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function FeatureBadges({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((f) => (
        <span
          key={f}
          className="inline-flex items-center gap-2 border border-ink/15 bg-panel/60 px-4 py-2 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-ink/70"
        >
          <span className="h-1 w-1 rounded-full bg-gold-ink" />
          {f}
        </span>
      ))}
    </div>
  );
}
