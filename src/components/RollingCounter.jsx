import { useEffect, useRef, useState } from 'react';

/**
 * Scroll-triggered kinetic numeric counter (React Bits Counter inspired).
 * Respects prefers-reduced-motion and renders tabular numerals without layout shift.
 */
export function RollingCounter({
  to,
  from = 0,
  pad = 0,
  suffix = '',
  duration = 1100,
}) {
  const ref = useRef(null);
  const [val, setVal] = useState(to);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(to);
      return undefined;
    }

    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasAnimated.current) return;
        hasAnimated.current = true;
        io.disconnect();
        const t0 = performance.now();
        const step = (now) => {
          const p = Math.min(1, (now - t0) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          setVal(Math.round(from + (to - from) * eased));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      },
      { threshold: 0.3 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [from, to, duration]);

  const formatted = pad > 0 ? String(val).padStart(pad, '0') : String(val);
  return (
    <span ref={ref} className="rb-counter">
      {formatted}
      {suffix}
    </span>
  );
}
