"use client";

import { useCallback, useRef, useState } from "react";
import { useScroll } from "framer-motion";
import dynamic from "next/dynamic";

import SmoothScroll from "./SmoothScroll";
import KeyframeSections from "./KeyframeSections";
import SiteHeader from "./SiteHeader";
import SpatialHUD from "./SpatialHUD";
import CustomCursor from "./CustomCursor";
import ConciergeOverlay from "./ConciergeOverlay";
import Section06Masterplan from "./sections/Section06Masterplan";

// WebGL fly-through — client-only (no SSR for three.js / canvas).
const FlyThrough = dynamic(() => import("./three/FlyThrough"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-obsidian" />,
});

export default function GalleryExperience() {
  const galleryRef = useRef<HTMLDivElement>(null);

  // Progress across the five keyframe viewports (0 → 1). Drives the 3D camera
  // fly-through, the crossfading text stations, and the HUD in lockstep.
  const { scrollYProgress } = useScroll({
    target: galleryRef,
    offset: ["start start", "end end"],
  });

  const [soundOn, setSoundOn] = useState(false);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayContext, setOverlayContext] = useState<string | undefined>(
    undefined
  );

  const openBrochure = useCallback((context?: string) => {
    setOverlayContext(context);
    setOverlayOpen(true);
  }, []);

  return (
    <SmoothScroll>
      <span id="top" className="absolute top-0" aria-hidden="true" />

      <FlyThrough progress={scrollYProgress} />
      <CustomCursor />

      <SiteHeader
        soundOn={soundOn}
        onToggleSound={() => setSoundOn((s) => !s)}
        onRegister={() => openBrochure()}
      />

      <SpatialHUD progress={scrollYProgress} />

      <main className="relative">
        {/* Five keyframe viewports pinned into one stage, crossfading on scroll */}
        <KeyframeSections ref={galleryRef} progress={scrollYProgress} />

        {/* Solid-background transition + VIP concierge */}
        <Section06Masterplan onRequestBrochure={openBrochure} />
      </main>

      <ConciergeOverlay
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        context={overlayContext}
      />
    </SmoothScroll>
  );
}
