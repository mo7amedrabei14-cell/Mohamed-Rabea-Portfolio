import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The scenes after the hero: a curved project reel, a hexagonal toolkit ring, a horizontal experience track,
// ghost type, and a signal that settles. Everything here moves with transform/opacity only (no blur, no clip-path, no filters),
// and the pinned scenes run on desktop only.
export function startEcho() {
  if (reduced()) return () => {};
  const root = document.documentElement;
  const mm = gsap.matchMedia();
  const off = [];
  const dir = () => (root.dir === 'rtl' ? -1 : 1);
  const contact = document.querySelector('.ec-contact');

  // Metallic LET'S TALK: the sheen follows the pointer (throttled to one update per frame).
  if (contact && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let raf = 0, ex = 0;
    const apply = () => { raf = 0; const r = contact.getBoundingClientRect(); contact.style.setProperty('--ec-x', `${Math.max(0, Math.min(100, ((ex - r.left) / r.width) * 100))}%`); };
    const onSheen = (e) => { ex = e.clientX; if (!raf) raf = requestAnimationFrame(apply); };
    contact.addEventListener('pointermove', onSheen, { passive: true });
    off.push(() => { contact.removeEventListener('pointermove', onSheen); cancelAnimationFrame(raf); });
  }

  const ctx = gsap.context(() => {
    // The About card opens as it arrives.
    const card = document.querySelector('.ec-about-card');
    if (card) gsap.fromTo(card, { scale: 0.92, opacity: 0.35, transformOrigin: '50% 100%' }, { scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: card, start: 'top 98%', end: 'top 45%', scrub: true } });

    // Ghost type drifts behind the experience section.
    gsap.utils.toArray('.ec-ghost').forEach((el) => {
      gsap.fromTo(el.firstElementChild, { xPercent: 0 }, { xPercent: -34, ease: 'none', scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    // Ending: noise resolves into one straight red signal as the contact section arrives.
    const line = document.querySelector('.ec-signal-line');
    if (line && contact) {
      const N = 90;
      const seed = Array.from({ length: N + 1 }, (_, i) => (Math.sin(i * 12.9898) * 43758.5453) % 1);
      const draw = (p) => {
        const amp = (1 - p) * (1 - p) * 46;
        let pts = '';
        for (let i = 0; i <= N; i += 1) pts += `${((i / N) * 1200).toFixed(1)},${(60 + (Math.sin(i * 1.7 + p * 6) * 0.6 + seed[i] * 0.8) * amp).toFixed(1)} `;
        line.setAttribute('points', pts.trim());
      };
      draw(0);
      ScrollTrigger.create({ trigger: contact, start: 'top 85%', end: 'top 12%', scrub: true, onUpdate: (st) => draw(st.progress), onRefresh: (st) => draw(st.progress) });
    }

    mm.add('(min-width: 861px)', () => {
      // 1. Curved project reel
      const reel = document.querySelector('.ec-reel');
      if (reel) {
        const cards = gsap.utils.toArray('.ec-card', reel);
        const count = reel.querySelector('.ec-count b');
        const bar = reel.querySelector('.ec-bar i');
        const n = cards.length;
        const place = (t) => {
          cards.forEach((c, i) => {
            const d = i - t; const a = Math.abs(d);
            gsap.set(c, { xPercent: -50, x: d * dir() * window.innerWidth * 0.33, z: -a * 240, rotationY: -d * dir() * 34, scale: 1 - Math.min(a, 2) * 0.1, opacity: 1 - Math.min(a, 2) * 0.4, zIndex: 10 - Math.round(a * 2) });
          });
          if (count) count.textContent = String(Math.min(n, Math.round(t) + 1)).padStart(2, '0');
          if (bar) bar.style.transform = `scaleX(${n > 1 ? t / (n - 1) : 1})`;
        };
        place(0);
        ScrollTrigger.create({ trigger: reel, start: 'top top', end: () => `+=${window.innerHeight * (n - 1) * 0.9}`, pin: true, refreshPriority: 10, invalidateOnRefresh: true, onUpdate: (s) => place(s.progress * (n - 1)), onRefresh: (s) => place(s.progress * (n - 1)) });
      }
      // 2. Hexagonal toolkit ring
      const stage = document.querySelector('.ec-ring-stage');
      if (stage) {
        const ring = stage.querySelector('.ec-ring');
        const count = stage.querySelector('.ec-count b');
        const spin = (p) => { gsap.set(ring, { rotationY: -p * 300 * dir() }); if (count) count.textContent = String(Math.min(6, Math.round(p * 5) + 1)).padStart(2, '0'); };
        spin(0);
        ScrollTrigger.create({ trigger: stage, start: 'top top', end: () => `+=${window.innerHeight * 3}`, pin: true, refreshPriority: 9, invalidateOnRefresh: true, onUpdate: (s) => spin(s.progress), onRefresh: (s) => spin(s.progress) });
      }
      // 3. Horizontal experience track
      const pin = document.querySelector('.ec-exp-pin');
      const track = pin?.querySelector('.ec-track');
      if (pin && track) {
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);
        const slide = (p) => gsap.set(track, { x: -dist() * p * dir() });
        ScrollTrigger.create({ trigger: pin, start: 'top top', end: () => `+=${dist()}`, pin: true, refreshPriority: 8, invalidateOnRefresh: true, onUpdate: (s) => slide(s.progress), onRefresh: (s) => slide(s.progress) });
      }
      return undefined;
    });
  });

  // Layout settles late (intro, fonts, images): measure again afterwards.
  const refresh = () => ScrollTrigger.refresh();
  const timers = [600, 2500, 6000].map((ms) => setTimeout(refresh, ms));
  window.addEventListener('load', refresh);
  window.addEventListener('ec-intro-done', refresh);
  document.fonts?.ready.then(refresh);

  return () => {
    timers.forEach(clearTimeout);
    window.removeEventListener('load', refresh);
    window.removeEventListener('ec-intro-done', refresh);
    off.forEach((f) => f());
    mm.revert();
    ctx.revert();
  };
}
