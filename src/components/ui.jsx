import { useEffect, useRef } from 'react';

export function Arrow({ diagonal = false }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="arrow" fill="none">
      {diagonal ? (
        <path d="M7 17 17 7M7 7h10v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      ) : (
        <path d="M4 12h15m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" />
      )}
    </svg>
  );
}

export function Asterisk({ className = '' }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className={`asterisk ${className}`} fill="none">
      <path d="M12 2v20M3.3 7l17.4 10M20.7 7 3.3 17" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

export function Label({ children, tone = 'default' }) {
  return (
    <p className={`label label--${tone}`}>
      <span className="label__tick" aria-hidden="true" />
      {children}
    </p>
  );
}

export function Marquee({ items, className = '', reverse = false }) {
  return (
    <div className={`marquee ${className} ${reverse ? 'marquee--reverse' : ''}`} aria-hidden="true">
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <div className="marquee__group" key={copy}>
            {items.map((item, index) => (
              <span className="marquee__item" key={`${copy}-${item}-${index}`}>
                {item}
                <Asterisk className="marquee__mark" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Pointer-magnetic control. Reads and writes only CSS custom properties, so it
// never triggers a React render while the pointer moves.
export function Magnetic({ as: Tag = 'a', children, className = '', strength = 7, ...props }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;

    let frame = 0;
    let latest = null;

    const move = (event) => {
      if (event.pointerType === 'touch') return;
      latest = event;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!latest) return;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = (latest.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (latest.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        el.style.setProperty('--mx', `${Math.max(-1, Math.min(1, x)) * strength}px`);
        el.style.setProperty('--my', `${Math.max(-1, Math.min(1, y)) * strength * 0.7}px`);
      });
    };

    const leave = () => {
      el.style.setProperty('--mx', '0px');
      el.style.setProperty('--my', '0px');
    };

    el.addEventListener('pointermove', move, { passive: true });
    el.addEventListener('pointerleave', leave, { passive: true });
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      cancelAnimationFrame(frame);
    };
  }, [strength]);

  return (
    <Tag ref={ref} className={`magnetic ${className}`} {...props}>
      {children}
    </Tag>
  );
}

export function BrowserFrame({ image, onImage, tone = 'paper', priority = false }) {
  const src = `${import.meta.env.BASE_URL}${image.src}`;
  const trackSpotlight = (event) => {
    if (event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    event.currentTarget.style.setProperty('--fx', `${((event.clientX - rect.left) / rect.width) * 100}%`);
    event.currentTarget.style.setProperty('--fy', `${((event.clientY - rect.top) / rect.height) * 100}%`);
  };
  return (
    <figure className={`frame frame--${tone}`} data-parallax onPointerMove={trackSpotlight}>
      <div className="frame__bar" aria-hidden="true">
        <span className="frame__dots"><i /><i /><i /></span>
        <span className="frame__url">field / {image.code}</span>
        <span className="frame__live"><i />REC</span>
      </div>
      <button
        type="button"
        className="frame__screen"
        onClick={() => onImage?.({ src, alt: image.alt })}
        aria-label={`${image.alt} — open full screen`}
      >
        <img
          src={src}
          alt={image.alt}
          width="1917"
          height="1078"
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
        <span className="frame__zoom" aria-hidden="true"><Arrow diagonal /></span>
      </button>
      <figcaption>
        <span>{image.label}</span>
        <span>{image.code}</span>
      </figcaption>
    </figure>
  );
}

export function SectionHead({ label, title, intro, tone = 'paper', index }) {
  return (
    <header className={`section-head section-head--${tone}`} data-reveal>
      <div className="section-head__meta">
        <Label>{label}</Label>
        {index && <span className="section-head__index">{index}</span>}
      </div>
      <div className="section-head__main">
        <h2>{title}</h2>
        {intro && <p>{intro}</p>}
      </div>
    </header>
  );
}
