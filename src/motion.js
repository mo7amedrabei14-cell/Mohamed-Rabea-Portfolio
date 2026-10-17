import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const finePointer = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(hover: hover) and (pointer: fine)').matches;

let lenis = null;
let ticker = null;

function ensureLenis() {
  if (lenis || prefersReduced() || !finePointer()) return lenis;

  lenis = new Lenis({
    lerp: 0.09,
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.2,
  });

  lenis.on('scroll', ScrollTrigger.update);
  ticker = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(ticker);
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function scrollToId(id) {
  const target = id === 'top' ? document.body : document.getElementById(id);
  if (!target) return;

  if (lenis) {
    lenis.scrollTo(id === 'top' ? 0 : target, { offset: id === 'top' ? 0 : -72, duration: 1.15 });
    return;
  }

  const top = id === 'top'
    ? 0
    : target.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top, behavior: prefersReduced() ? 'auto' : 'smooth' });
}

export function setupMotion(root) {
  if (!root) return () => {};
  ensureLenis();

  const ctx = gsap.context(() => {
    if (prefersReduced()) return;

    // Opening scene: the headline rises line by line, then the console resolves.
    gsap.from('[data-hero-line]', {
      yPercent: 118,
      duration: 1.25,
      ease: 'expo.out',
      stagger: 0.09,
      delay: 0.08,
    });

    gsap.from('.hero__eyebrow, .hero__intro, .hero__actions', {
      y: 22,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      stagger: 0.09,
      delay: 0.42,
    });

    gsap.from('.console', {
      y: 34,
      autoAlpha: 0,
      duration: 1.05,
      ease: 'power3.out',
      delay: 0.3,
    });

    // Everything below the fold reveals once, with a short travel distance.
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      if (el.closest('.hero')) return;
      gsap.from(el, {
        y: 28,
        autoAlpha: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });

    // The position statement fills in as it is read.
    const statement = root.querySelector('.manifesto__statement');
    if (statement) {
      gsap.fromTo(
        statement.querySelectorAll('.word'),
        { opacity: 0.16 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.04,
          scrollTrigger: {
            trigger: statement,
            start: 'top 78%',
            end: 'bottom 58%',
            scrub: 0.4,
          },
        },
      );
    }

    // Slow image drift inside the frame; the frame itself stays fixed.
    gsap.utils.toArray('[data-parallax]').forEach((frame) => {
      const image = frame.querySelector('img');
      if (!image) return;
      gsap.fromTo(
        image,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: {
            trigger: frame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        },
      );
    });

    gsap.from('.contact__title span', {
      y: 48,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.08,
      scrollTrigger: { trigger: '.contact', start: 'top 72%', once: true },
    });

    gsap.from('.contact__grid > *', {
      y: 24,
      autoAlpha: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.08,
      scrollTrigger: { trigger: '.contact__grid', start: 'top 88%', once: true },
    });

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }, root);

  const onResize = () => ScrollTrigger.refresh();
  window.addEventListener('load', onResize, { once: true });

  return () => {
    ctx.revert();
    window.removeEventListener('load', onResize);
  };
}

export function refreshMotion() {
  ScrollTrigger.refresh();
}
