# YAMAL by TMG — Flagship Digital Sales Gallery

A scroll-driven, high-contrast dark-luxury sales gallery for **YAMAL by TMG** — a
2.21 million m² smart coastal destination in Al Seeb, Muscat, Oman.

Built with **Next.js (App Router)**, **Tailwind CSS**, **Framer Motion**, and
**Lenis** inertia scroll.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Design system

| Token | Value | Role |
| --- | --- | --- |
| Obsidian Night | `#080A0E` | Primary canvas |
| Gulf Aqua | `#1F6B7A` | Turquoise lagoon accent / glow rim |
| Metallic Gold | `#D4AF37` | Editorial dividers, CTA rim |
| Travertine Stone | `#C8B29B` | Warm neutral accents |
| Card Fill | `#12161F` | Glass surface |
| Pure White | `#FFFFFF` | Headlines |
| Muted Body | `#8A94A6` | Body copy |

Typography: **Cormorant Garamond** (editorial serif) + **Plus Jakarta Sans**
(geometric sans for UI/metadata).

## Architecture

- `SmoothScroll` — global Lenis inertia scroll (`lerp: 0.08`, `smoothWheel`).
- `KeyframeCanvas` — fixed full-viewport harness stacking the 5 asset keyframes
  with continuous scroll-driven crossfades and depth scale.
- `SpatialHUD` — bottom-right glass step counter with a live gold progress arc.
- `SiteHeader` — `mix-blend-difference` header: TMG mark, soundscape toggle,
  gold-rim Register Interest CTA.
- `sections/*` — the five 100vh keyframe viewports + the solid-background
  masterplan / VIP concierge section.
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
