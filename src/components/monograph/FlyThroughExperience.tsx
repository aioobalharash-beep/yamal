"use client";

import { useCallback, useRef, useState } from "react";
import { useScroll } from "framer-motion";
import dynamic from "next/dynamic";

import SmoothScroll from "../SmoothScroll";
import CustomCursor from "../CustomCursor";
import MonographHeader from "./MonographHeader";
import Spine from "./Spine";
import JourneySections from "./JourneySections";
import Finale from "./Finale";
import Concierge from "./Concierge";

// Scroll-scrubbed video fly-through — client-only (no SSR for the <video> chain).
const JourneyFlyThrough = dynamic(() => import("../three/JourneyFlyThrough"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-paper" />,
});

const USE_VIDEO = process.env.NEXT_PUBLIC_USE_VIDEO_FLYTHROUGH === "1";

/**
 * The whole site as one continuous scroll-driven journey: sea arrival, the
 * marina, the commercial promenade, the lagoon villas, a single villa, the
 * apartments — then the existing Finale/masterplan CTA. Replaces Monograph
 * as the live design.
 */
export default function FlyThroughExperience() {
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end end"],
  });

  const [overlayOpen, setOverlayOpen] = useState(false);
  const [overlayContext, setOverlayContext] = useState<string | undefined>();

  const openBrochure = useCallback((context?: string) => {
    setOverlayContext(context);
    setOverlayOpen(true);
  }, []);

  return (
    <SmoothScroll>
      <div className="paper-grain relative min-h-screen">
        <CustomCursor />
        <MonographHeader onRegister={() => openBrochure()} />
        <Spine />

        {USE_VIDEO && <JourneyFlyThrough progress={scrollYProgress} />}

        <main>
          <span id="top" className="absolute top-0" aria-hidden="true" />
          <JourneySections ref={stageRef} progress={scrollYProgress} />
          <Finale onRequestBrochure={openBrochure} />
        </main>

        <Concierge
          open={overlayOpen}
          onClose={() => setOverlayOpen(false)}
          context={overlayContext}
        />
      </div>
    </SmoothScroll>
  );
}
