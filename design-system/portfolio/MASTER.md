# Portfolio Experience System — ORBIT

## Product direction

This is not a template résumé page. It presents Mohamed Rabea as the intersection of operational intelligence, data analysis, software engineering and humanitarian response. Its flow moves from a deliberate introduction, to an interactive operational-console hero, to the reasoning behind the work, then detailed project chapters, capabilities, field experience, the person behind the work, qualifications and contact.

The site should feel like a carefully designed digital product: editorial hierarchy, calm precision, distinctive interactions and strong accessibility. Apple and Google are reference standards for clarity, consistency, restraint and interaction quality—not a claim that this design is an official expression of either brand.

## Color primitives

- **Deep forest:** #0B1710 / #101E16 / #192D20 — main cinematic surfaces and project chapter backgrounds.
- **Signal lime:** #C8F36B — primary call to action, active data states and high-value accents.
- **Ember:** #F0785E — sparse contrast accent and secondary signal.
- **Paper:** #F5F6F0 — long-form reading surfaces.
- **Paper secondary:** #E9EDE5 — transition surfaces between chapters.
- **Elevated surface:** #FFFEFA — screenshots, framed content and small light surfaces.
- **Muted copy:** gray-green values must be checked against their exact rendered surface; body copy should not use a low-contrast color just to appear subtle.

## Typography

- DM Sans for Latin UI and body text.
- IBM Plex Sans Arabic for Arabic UI, with RTL-aware line height and spacing.
- DM Mono for short metadata, coordinates, indexes and technical labels only.
- DM Serif Display for a small number of expressive headline accents.
- Display type should be large and confident; long paragraphs should have a readable measure and line-height around 1.7–1.95.
- Body text should generally remain at least 12px for this portfolio's compact visual system; decorative metadata may be smaller, but must not carry essential instructions or information.

## Shape and layout system

- Use a responsive 4/8 spacing rhythm, with larger section jumps at 32/48/64/96/128px.
- Pills are reserved for controls and compact metadata. Cards use the 12–26px radius range; major immersive surfaces can use 28–30px.
- Each chapter has a clear purpose and its own density. Avoid turning every section into the same card grid.
- Project case studies alternate dark and paper surfaces. Their screenshot frame can remain sticky on desktop but must return to normal document flow on tablet and mobile.
- The entry screen is an explicit invitation, not a timed preloader. Visitors choose to enter; keyboard activation and reduced-motion preferences must work.

## Motion contract

- GSAP and ScrollTrigger own choreographed entrances and scroll-linked reveals.
- Lenis is progressive enhancement for desktop fine-pointer contexts only; native scrolling remains the fallback.
- Motion should preserve spatial continuity, communicate hierarchy or give state feedback. Prefer opacity and transforms over layout animation.
- Entry transitions can be expressive; routine UI feedback should be short and clear.
- Do not stack multiple reveal engines on the same elements. Ensure content never stays hidden when JavaScript, observers or animation libraries fail.
- Respect `prefers-reduced-motion`, disable non-essential loops, and never block keyboard navigation or text selection.

## Accessibility and interaction

- EN/LTR and AR/RTL must both remain first-class layouts.
- Keep visible focus states and logical heading order. Ensure menu items cannot be tabbed to while the menu is closed.
- Interactive items need descriptive labels and useful pressed/expanded states.
- Minimum practical touch target is 44px for primary buttons and controls, with adequate separation.
- Aim for WCAG AA contrast: at least 4.5:1 for normal text and 3:1 for large text and meaningful non-text UI. Validate the rendered colors, not only the token values.
- No hover-only critical affordances, artificial scroll locking, forced zoom or inaccessible cursor effects.
- The intro must remain escapable: visible entry action, keyboard Enter support and reduced-motion flow.

## Content integrity

- Preserve all factual EN/AR text, project links, contact options, embedded live presentation, image lightbox, operational field records, education and training from `src/content.js` and existing components.
- Keep illustrative screenshots clearly identified as previews when applicable; never imply mocked interface data is live.
- Never invent project performance numbers, results, or endorsements.

## Performance and delivery checks

- Avoid unnecessary dependencies and large continuous effects.
- Use responsive layout and reserved image dimensions; lazy-load below-the-fold imagery.
- Check browser console, production build and network errors.
- Visually review 1920×1080, 1440×900, 1366×768, tablet and mobile widths; verify no clipped headlines, horizontal overflow or sticky-frame overlap.
- Test Arabic RTL, English LTR, keyboard-only navigation, closed/open menu focus, lightbox Escape behavior and reduced-motion.
- Capture actual screenshots before declaring visual QA complete. A green build by itself is not visual approval.
