import { useEffect, useState } from 'react';

const SECTIONS = [
  { id: 'top', n: '00', en: 'Signal', ar: 'البداية' },
  { id: 'about', n: '01', en: 'About', ar: 'نبذة' },
  { id: 'work', n: '02', en: 'Work', ar: 'الأعمال' },
  { id: 'capabilities', n: '03', en: 'Toolkit', ar: 'المهارات' },
  { id: 'experience', n: '04', en: 'Field', ar: 'الخبرة' },
  { id: 'education', n: '05', en: 'Training', ar: 'التعليم' },
  { id: 'contact', n: '06', en: 'Contact', ar: 'التواصل' },
];

/**
 * Minimal desktop chapter telemetry rail — gives clear spatial orientation
 * across the 7 portfolio chapters without crowding the reading surface.
 */
export function CommandSectionNav({ rtl = false }) {
  const [activeId, setActiveId] = useState('top');

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    if (!els.length) return undefined;

    let raf = 0;
    const measure = () => {
      raf = 0;
      const anchor = window.innerHeight * 0.36;
      let current = els[0].id;
      for (const el of els) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchor) {
          current = el.id;
        }
      }
      setActiveId(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <nav
      className="cmd-rail"
      aria-label={rtl ? 'فهرس أقسام الصفحة' : 'Page sections'}
    >
      {SECTIONS.map((sec) => {
        const isActive = activeId === sec.id;
        return (
          <a
            key={sec.id}
            href={`#${sec.id}`}
            className={`cmd-rail-item${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'true' : undefined}
          >
            <span className="cmd-rail-label">{rtl ? sec.ar : sec.en}</span>
            <i className="cmd-rail-tick" aria-hidden="true" />
            <b className="cmd-rail-num">{sec.n}</b>
          </a>
        );
      })}
    </nav>
  );
}
