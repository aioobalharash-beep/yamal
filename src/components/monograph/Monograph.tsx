"use client";

import { useCallback, useState } from "react";

import SmoothScroll from "../SmoothScroll";
import CustomCursor from "../CustomCursor";
import MonographHeader from "./MonographHeader";
import Spine from "./Spine";
import Cover from "./Cover";
import PlateSpread, { type SpreadData } from "./PlateSpread";
import { UnitFilter, FeatureBadges } from "./interactions";
import Finale from "./Finale";
import Concierge from "./Concierge";

const SPREADS: SpreadData[] = [
  {
    id: "marina",
    eyebrow: "Plate II — The Destination Hub",
    title: "International Marina & Yacht Club",
    body: "Featuring deep-water berths, a 70,000 m² dining promenade, 113-key beachfront hotel suites, and direct open Gulf access.",
    metric: "Luxury Hospitality & Berths",
    src: "/yamal/02-marina-crescent.jpeg",
    plate: "Plate II — Marina Crescent",
    caption: "Deep-water berths",
  },
  {
    id: "lagoons",
    eyebrow: "Plate III — Coastal Ecology",
    title: "Interconnected Crystal Lagoons",
    body: "Continuous turquoise channels connecting standalone villas and beach cabins directly to quiet swimming coves and Al Naseem Heritage Park.",
    metric: "50% Water & Landscape Ratio",
    src: "/yamal/03-crystal-lagoons.jpeg",
    plate: "Plate III — Crystal Lagoons",
    caption: "Turquoise channels",
    reverse: true,
  },
  {
    id: "park",
    eyebrow: "Plate IV — Community Living",
    title: "Jood Club & Park Apartments",
    body: "6,220 residential units configured alongside integrated sports clubs, community mosques, and shaded cycling loops.",
    src: "/yamal/04-apartment-park.jpeg",
    plate: "Plate IV — Apartment Park",
    caption: "Park enclaves",
  },
  {
    id: "villa",
    eyebrow: "Plate V — Omani Heritage Architecture",
    title: "Limestone Facades & Private Pools",
    body: "Local Omani stone cladding, climate-responsive mashrabiya shading screens, floor-to-ceiling thermal glazing, and private plot access.",
    src: "/yamal/05-villa-facade.jpeg",
    plate: "Plate V — Villa Facade",
    caption: "Mashrabiya & stone",
    reverse: true,
  },
];

export default function Monograph() {
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

        <main>
          <Cover />

          {SPREADS.map((data) => {
            let extra: React.ReactNode = null;
            if (data.id === "park") extra = <UnitFilter />;
            if (data.id === "villa")
              extra = (
                <FeatureBadges
                  items={["Smart City Infrastructure", "Private Lagoon Access"]}
                />
              );
            return (
              <PlateSpread key={data.id} data={data}>
                {extra}
              </PlateSpread>
            );
          })}

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
