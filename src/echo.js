import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// The scenes after the hero: a curved 3D project reel, an interactive hexagonal 3D toolkit prism,
// a horizontal experience track, ghost type, and a noise-to-signal waveform.
// Everything moves via transform/opacity only; pinned scenes run on desktop only.
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
    const apply = () => {
      raf = 0;
      const r = contact.getBoundingClientRect();
      contact.style.setProperty('--ec-x', `${Math.max(0, Math.min(100, ((ex - r.left) / Math.max(1, r.width)) * 100))}%`);
    };
    const onSheen = (e) => { ex = e.clientX; if (!raf) raf = requestAnimationFrame(apply); };
    contact.addEventListener('pointermove', onSheen, { passive: true });
    off.push(() => { contact.removeEventListener('pointermove', onSheen); cancelAnimationFrame(raf); });
  }

  let ringManualOffset = 0;
  let ringScrollProgress = 0;
  let applyRing = null;

  const ctx = gsap.context(() => {
    // The About spatial card opens as it arrives with subtle 3D pitch settling to 0deg.
    const card = document.querySelector('.ec-about-card');
    if (card) {
      gsap.fromTo(
        card,
        { scale: 0.94, opacity: 0.45, rotateX: 5, transformPerspective: 1400, transformOrigin: '50% 100%' },
        { scale: 1, opacity: 1, rotateX: 0, ease: 'none', scrollTrigger: { trigger: card, start: 'top 96%', end: 'top 42%', scrub: true } }
      );
    }

    // Ghost type drifts behind the experience section.
    gsap.utils.toArray('.ec-ghost').forEach((el) => {
      gsap.fromTo(
        el.firstElementChild,
        { xPercent: 0 },
        { xPercent: -34, ease: 'none', scrollTrigger: { trigger: el.closest('section'), start: 'top bottom', end: 'bottom top', scrub: true } }
      );
    });

    // Ending: noise resolves into one straight red signal as the contact section arrives.
    const line = document.querySelector('.ec-signal-line');
    if (line && contact) {
      const N = 90;
      const seed = Array.from({ length: N + 1 }, (_, i) => (Math.sin(i * 12.9898) * 43758.5453) % 1);
      const draw = (p) => {
        const amp = (1 - p) * (1 - p) * 46;
        let pts = '';
        for (let i = 0; i <= N; i += 1) {
          pts += `${((i / N) * 1200).toFixed(1)},${(60 + (Math.sin(i * 1.7 + p * 6) * 0.6 + seed[i] * 0.8) * amp).toFixed(1)} `;
        }
        line.setAttribute('points', pts.trim());
      };
      draw(0);
      ScrollTrigger.create({
        trigger: contact,
        start: 'top 85%',
        end: 'top 12%',
        scrub: true,
        onUpdate: (st) => draw(st.progress),
        onRefresh: (st) => draw(st.progress),
      });
    }

    mm.add('(min-width: 861px)', () => {
      // 1. Curved 3D spatial project reel with depth focus & active highlight
      const reel = document.querySelector('.ec-reel');
      if (reel) {
        const cards = gsap.utils.toArray('.ec-card', reel);
        const count = reel.querySelector('.ec-count b');
        const bar = reel.querySelector('.ec-bar i');
        const n = cards.length;
        const place = (t) => {
          const activeIdx = Math.max(0, Math.min(n - 1, Math.round(t)));
          cards.forEach((c, i) => {
            const d = i - t;
            const a = Math.abs(d);
            c.classList.toggle('is-active', i === activeIdx);
            gsap.set(c, {
              xPercent: -50,
              x: d * dir() * window.innerWidth * 0.34,
              z: -a * 260,
              rotationY: -d * dir() * 36,
              scale: 1 - Math.min(a, 2.2) * 0.11,
              opacity: 1 - Math.min(a, 2.2) * 0.42,
              zIndex: 20 - Math.round(a * 4),
            });
          });
          if (count) count.textContent = String(activeIdx + 1).padStart(2, '0');
          if (bar) bar.style.transform = `scaleX(${n > 1 ? t / (n - 1) : 1})`;
        };
        place(0);
        const reelST = ScrollTrigger.create({
          trigger: reel,
          start: 'top top',
          end: () => `+=${window.innerHeight * Math.max(1, n - 1) * 0.85}`,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 10,
          invalidateOnRefresh: true,
          onUpdate: (s) => place(s.progress * (n - 1)),
          onRefresh: (s) => place(s.progress * (n - 1)),
        });

        // Allow direct Prev/Next reel stepping via smooth scroll to exact trigger progress
        const onReelStep = (e) => {
          const delta = Number(e.detail?.delta || 0);
          if (!delta || n <= 1) return;
          const current = Math.round(reelST.progress * (n - 1));
          const targetIdx = Math.max(0, Math.min(n - 1, current + delta));
          const targetScroll = reelST.start + (targetIdx / (n - 1)) * (reelST.end - reelST.start);
          if (window.__portfolioLenis) {
            window.__portfolioLenis.scrollTo(targetScroll, { duration: 0.75 });
          } else {
            window.scrollTo({ top: targetScroll, behavior: 'smooth' });
          }
        };
        window.addEventListener('ec-reel-step', onReelStep);
        off.push(() => window.removeEventListener('ec-reel-step', onReelStep));
      }

      // 2. Interactive 3D hexagonal toolkit prism (scroll + drag + step controls)
      const stage = document.querySelector('.ec-ring-stage');
      if (stage) {
        const ring = stage.querySelector('.ec-ring');
        const nodes = gsap.utils.toArray('.ec-node', ring);
        const count = stage.querySelector('.ec-count b');
        const spin = (p, manualDeg = ringManualOffset) => {
          ringScrollProgress = p;
          const totalDeg = -p * 300 * dir() + manualDeg;
          gsap.set(ring, { rotationY: totalDeg });
          const norm = (((-totalDeg * dir()) % 360) + 360) % 360;
          const frontIdx = Math.round(norm / 60) % 6;
          nodes.forEach((nd, i) => nd.classList.toggle('is-front', i === frontIdx));
          if (count) count.textContent = String(frontIdx + 1).padStart(2, '0');
          window.dispatchEvent(new CustomEvent('ec-ring-change', { detail: { index: frontIdx } }));
        };
        applyRing = spin;
        spin(0, 0);

        ScrollTrigger.create({
          trigger: stage,
          start: 'top top',
          end: () => `+=${window.innerHeight * 2.6}`,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 9,
          invalidateOnRefresh: true,
          onUpdate: (s) => spin(s.progress, ringManualOffset),
          onRefresh: (s) => spin(s.progress, ringManualOffset),
        });

        // Step button interaction for the 3D hexagonal prism
        const onRingStep = (e) => {
          const delta = Number(e.detail?.delta || 0);
          if (!delta) return;
          const obj = { val: ringManualOffset };
          const target = ringManualOffset - delta * 60 * dir();
          gsap.to(obj, {
            val: target,
            duration: 0.65,
            ease: 'power3.out',
            onUpdate: () => {
              ringManualOffset = obj.val;
              applyRing?.(ringScrollProgress, ringManualOffset);
            },
          });
        };
        window.addEventListener('ec-ring-step', onRingStep);
        off.push(() => window.removeEventListener('ec-ring-step', onRingStep));
      }

      // 3. Horizontal experience track
      const pin = document.querySelector('.ec-exp-pin');
      const track = pin?.querySelector('.ec-track');
      if (pin && track) {
        const dist = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);
        const slide = (p) => gsap.set(track, { x: -dist() * p * dir() });
        ScrollTrigger.create({
          trigger: pin,
          start: 'top top',
          end: () => `+=${dist()}`,
          pin: true,
          anticipatePin: 1,
          refreshPriority: 8,
          invalidateOnRefresh: true,
          onUpdate: (s) => slide(s.progress),
          onRefresh: (s) => slide(s.progress),
        });
      }
      return undefined;
    });
  });

  // Safe layout refresh when fonts, images, intro, or work filters settle
  let lastH = document.documentElement.scrollHeight;
  let pending = 0;
  const safeRefresh = () => {
    clearTimeout(pending);
    if (ScrollTrigger.isScrolling()) {
      pending = setTimeout(safeRefresh, 350);
      return;
    }
    lastH = document.documentElement.scrollHeight;
    ScrollTrigger.refresh();
  };
  const onImg = (e) => {
    if (e.target?.tagName === 'IMG' && document.documentElement.scrollHeight !== lastH) safeRefresh();
  };
  document.addEventListener('load', onImg, true);
  const timers = [650].map((ms) => setTimeout(safeRefresh, ms));
  window.addEventListener('load', safeRefresh);
  window.addEventListener('ec-intro-done', safeRefresh);
  window.addEventListener('ec-layout-change', safeRefresh);
  document.fonts?.ready.then(safeRefresh);

  return () => {
    timers.forEach(clearTimeout);
    clearTimeout(pending);
    document.removeEventListener('load', onImg, true);
    window.removeEventListener('load', safeRefresh);
    window.removeEventListener('ec-intro-done', safeRefresh);
    window.removeEventListener('ec-layout-change', safeRefresh);
    off.forEach((f) => f());
    mm.revert();
    ctx.revert();
  };
}
