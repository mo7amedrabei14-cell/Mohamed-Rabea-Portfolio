import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export const prefersReduced = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Use the browser's native scrolling instead of a second wheel/RAF loop.
 * This keeps trackpads, touch, keyboard navigation, and interruption by
 * direct user input predictable.
 */
export function scrollToId(id) {
  if (typeof window === 'undefined') return;

  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: prefersReduced() ? 'auto' : 'smooth' });
    return;
  }

  const target = document.getElementById(id);
  if (!target) return;

  const header = document.querySelector('.topbar');
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 14;

  window.scrollTo({
    top: Math.max(0, targetTop),
    behavior: prefersReduced() ? 'auto' : 'smooth',
  });
}

export function setupMotion(root) {
  if (!root) return () => {};

  let active = true;
  const ctx = gsap.context(() => {
    if (prefersReduced()) return;

    // The hero animates once on entry; the document keeps native scrolling.
    gsap.from('[data-hero-line]', {
      yPercent: 106,
      duration: 1.05,
      ease: 'expo.out',
      stagger: 0.075,
      delay: 0.04,
      clearProps: 'transform',
    });

    gsap.from('.hero__eyebrow, .hero__intro, .hero__actions', {
      y: 16,
      autoAlpha: 0,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.07,
      delay: 0.28,
      clearProps: 'transform',
    });

    gsap.from('.console', {
      y: 22,
      autoAlpha: 0,
      duration: 0.8,
      ease: 'power3.out',
      delay: 0.18,
      clearProps: 'transform',
    });

    // Short, one-shot reveals only: no scrubbed timelines that lag behind
    // a user's wheel or trackpad movement.
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      if (el.closest('.hero')) return;
      gsap.from(el, {
        y: 18,
        autoAlpha: 0,
        duration: 0.68,
        ease: 'power3.out',
        clearProps: 'transform',
        scrollTrigger: {
          trigger: el,
          start: 'top 91%',
          once: true,
          invalidateOnRefresh: true,
        },
      });
    });

    const statement = root.querySelector('.manifesto__statement');
    if (statement) {
      gsap.fromTo(
        statement.querySelectorAll('.word'),
        { opacity: 0.28, y: 5 },
        {
          opacity: 1,
          y: 0,
          duration: 0.48,
          ease: 'power2.out',
          stagger: 0.018,
          clearProps: 'transform',
          scrollTrigger: {
            trigger: statement,
            start: 'top 84%',
            once: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }

    gsap.from('.contact__title span', {
      y: 30,
      autoAlpha: 0,
      duration: 0.72,
      ease: 'expo.out',
      stagger: 0.06,
      clearProps: 'transform',
      scrollTrigger: { trigger: '.contact', start: 'top 76%', once: true },
    });

    gsap.from('.contact__grid > *', {
      y: 18,
      autoAlpha: 0,
      duration: 0.65,
      ease: 'power3.out',
      stagger: 0.06,
      clearProps: 'transform',
      scrollTrigger: { trigger: '.contact__grid', start: 'top 91%', once: true },
    });
  }, root);

  const refresh = () => {
    if (active) ScrollTrigger.refresh();
  };

  window.addEventListener('load', refresh, { once: true });
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('pageshow', refresh);

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => {
      if (active) ScrollTrigger.refresh();
    });
  }

  // Measure triggers after their first layout has landed.
  requestAnimationFrame(() => {
    if (active) ScrollTrigger.refresh();
  });

  return () => {
    active = false;
    ctx.revert();
    window.removeEventListener('load', refresh);
    window.removeEventListener('resize', refresh);
    window.removeEventListener('pageshow', refresh);
  };
}

export function refreshMotion() {
  ScrollTrigger.refresh();
}
