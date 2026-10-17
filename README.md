# Mohamed Rabea — Digital Field Intelligence

A bilingual, responsive digital experience connecting operational reality, data intelligence, full-stack systems and humanitarian work. Built as a narrative-led showcase—not a generic collection of project cards.

## Creative direction

**Digital Field Intelligence**: cinematic dark surfaces, signal-lime accents, editorial typography, an interactive three-discipline radar, real project imagery, and a contrasting signal-to-action narrative.

## Motion & interaction

- GSAP + ScrollTrigger for restrained scroll-linked scene motion.
- Lenis for smooth scrolling, synchronized to the GSAP ticker.
- Original React Bits-inspired pointer spotlights, interactive discipline radar, kinetic typography and editorial reveals.
- Reduced-motion preferences preserve immediate content access and disable scroll-driven motion.
- Pointer effects are disabled for touch/coarse-pointer devices.

## Stack

React 19 · Vite 7 · GSAP 3.15 · Lenis 1.3 · Custom CSS

## Run locally

```bash
npm install
npm run dev
```

## Build and preview

```bash
npm run build
npm run preview
```

## Public site

https://mo7amedrabei14-cell.github.io/Mohamed-Rabea-Portfolio/

## Deployment and validation

The production workflow publishes only from `main`. A separate validation workflow builds feature branches and pull requests without publishing them.

## Content principles

- Project descriptions reflect documented work and responsibilities.
- Dashboard mockups are illustrative, not live source data or measured outcomes.
- Humanitarian and operational details stay high-level; sensitive field data is excluded.
- Third-party model keys and agent credentials never belong in the client bundle.
