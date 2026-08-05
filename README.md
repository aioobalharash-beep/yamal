# YAMAL by TMG — Flagship Digital Sales Gallery

A scroll-driven, dark-luxury sales gallery for **YAMAL by TMG** — a 2.21 million m²
smart coastal destination in Al Seeb, Muscat, Oman. The experience is a
**LIKOVA-style 3D fly-through**: a Three.js camera dollies through fog-lit scene
stations that emerge from the haze in lockstep with the scroll.

Built with **Next.js (App Router)**, **Three.js / React Three Fiber**,
**Tailwind CSS**, **Framer Motion**, and **Lenis** inertia scroll.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Design system

The palette is the TMG Yamal brand identity **softened** toward a hazy editorial
calm (the harsh near-black and metallic gold are eased down):

| Token | Value | Role |
| --- | --- | --- |
| Obsidian (warm) | `#0E1618` | Primary canvas / fog color |
| Gulf Aqua | `#2E7C8B` | Softened lagoon accent |
| Aqua Mist | `#6FA9B2` | Pale lagoon highlight / particles |
| Champagne Gold | `#C9A96A` | Editorial dividers, CTA rim, progress arc |
| Travertine Stone | `#CBB6A0` | Warm neutral accents |
| Cream | `#F1EADD` | Off-white headlines (not pure white) |
| Card Fill | `#18201F` | Glass surface |
| Muted Body | `#94A0A2` | Body copy |

Typography: **Cormorant Garamond** (editorial serif) + **Plus Jakarta Sans**
(geometric sans for UI/metadata).

> Note: TMG's live site (`ecommerce.tmg.com.eg`) is blocked by the build
> environment's network policy, so exact hex values could not be scraped; the
> palette above is derived from the brand identity in the original brief.

## Architecture

- `SmoothScroll` — global Lenis inertia scroll (`lerp: 0.08`, `smoothWheel`).
- `three/FlyThrough` — the WebGL engine (React Three Fiber). The 5 assets become
  fog-lit, feathered scene planes that sweep from deep haze toward the camera and
  dissolve as the next emerges — a continuous 3D fly-through driven by scroll,
  with a drifting particle field and pointer parallax. Client-only (`ssr: false`).
  Beautiful gradient fallbacks render until the JPGs are dropped in.
- `KeyframeSections` — the five text stations pinned into one sticky stage,
  crossfading in lockstep with the camera.
- `CustomCursor` — LIKOVA-style dot + easing ring that swells over interactives.
- `SpatialHUD` — bottom-right glass step counter with a live champagne progress arc.
- `SiteHeader` — `mix-blend-difference` header: TMG mark, soundscape toggle,
  gold-rim Register Interest CTA.
- `sections/*` — the five station overlays + the solid-background masterplan /
  VIP concierge section.
- `ConciergeOverlay` — WhatsApp concierge (+968 Muscat / International).

## Assets — required

Drop the five keyframe renders into `public/yamal/` using these exact names:

```
public/yamal/01-aerial-masterplan.jpg
public/yamal/02-marina-crescent.jpg
public/yamal/03-crystal-lagoons.jpg
public/yamal/04-apartment-park.jpg
public/yamal/05-villa-facade.jpg
```

Until the JPGs are present, each keyframe renders an art-directed gradient
fallback so the gallery stays beautiful during development.

Recommended: 2560×1440 (or larger), optimised JPG/WebP, matching the mood of
each scene (aerial → marina → lagoons → park → villa).

## Configuration

- WhatsApp number: update `WHATSAPP_NUMBER` in
  `src/components/ConciergeOverlay.tsx` with the live Muscat sales line.
- Soundscape: the header toggle is wired for state; connect an audio element to
  `soundOn` in `GalleryExperience.tsx` to add the ambient track.
