"use client";

import { useCallback, useRef, useState } from "react";
import { useScroll } from "framer-motion";

import SmoothScroll from "./SmoothScroll";
import KeyframeCanvas from "./KeyframeCanvas";
import KeyframeSections from "./KeyframeSections";
import SiteHeader from "./SiteHeader";
import SpatialHUD from "./SpatialHUD";
import ConciergeOverlay from "./ConciergeOverlay";
import Section06Masterplan from "./sections/Section06Masterplan";

export default function GalleryExperience() {
  const galleryRef = useRef<HTMLDivElement>(null);

  // Progress across the five keyframe viewports only (0 → 1), driving both the
  // background crossfades and the HUD. Section 06 lives beyond this track.
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

      <KeyframeCanvas progress={scrollYProgress} />

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
