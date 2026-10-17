import { useEffect, useRef, useState } from 'react';
import { Arrow, Magnetic } from './ui.jsx';

export function Preloader({ c, lang, onDone }) {
  const [value, setValue] = useState(0);
  const [exiting, setExiting] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      doneRef.current();
      return undefined;
    }

    let current = 0;
    let exitTimer;
    let finishTimer;
    const counter = window.setInterval(() => {
      current = Math.min(100, current + Math.max(2, Math.round(Math.random() * 9)));
      setValue(current);
      if (current >= 100) {
        window.clearInterval(counter);
        exitTimer = window.setTimeout(() => setExiting(true), 240);
        finishTimer = window.setTimeout(() => doneRef.current(), 1040);
      }
    }, 42);

    return () => {
      window.clearInterval(counter);
      window.clearTimeout(exitTimer);
      window.clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div className={`preloader ${exiting ? 'is-done' : ''}`} aria-hidden={exiting ? 'true' : undefined}>
      <div className="preloader__top">
        <span>MR / {c.preloader.year}</span>
        <span>{c.preloader.place}</span>
      </div>
      <div className="preloader__center">
        <p className="preloader__name">{lang === 'ar' ? 'محمد ربيع' : 'MOHAMED RABEA'}</p>
        <p className="preloader__role">{c.brandTag}</p>
      </div>
      <div className="preloader__count" aria-hidden="true">
        {String(value).padStart(3, '0')}
      </div>
      <div className="preloader__bar" aria-hidden="true">
        <i style={{ transform: `scaleX(${value / 100})` }} />
      </div>
      <div className="preloader__foot">
        <span>{c.preloader.note}</span>
        <span>DATA · SYSTEMS · IMPACT</span>
      </div>
    </div>
  );
}

export function CursorGlow() {
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
      latest = { x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!latest) return;
        el.style.setProperty('--cx', `${latest.x}px`);
        el.style.setProperty('--cy', `${latest.y}px`);
      });
    };

    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div className="cursor-glow" ref={ref} aria-hidden="true" />;
}

export function Grain() {
  return <div className="grain" aria-hidden="true" />;
}

export function ScrollRail({ c }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let frame = 0;
    const compute = () => {
      frame = 0;
      const range = document.documentElement.scrollHeight - window.innerHeight;
      setPct(range > 0 ? Math.min(100, Math.max(0, (window.scrollY / range) * 100)) : 0);
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(compute);
    };
    compute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <aside className="rail" aria-hidden="true">
      <span className="rail__year">2026</span>
      <span className="rail__track"><i style={{ transform: `scaleY(${pct / 100})` }} /></span>
      <span className="rail__pct">{String(Math.round(pct)).padStart(3, '0')}</span>
      <span className="rail__label">{c.dir === 'rtl' ? 'السجل الميداني' : 'Field record'}</span>
    </aside>
  );
}

export function LanguageWipe({ label, note, phase }) {
  return (
    <div className={`lang-wipe ${phase ? `is-${phase}` : ''}`} aria-hidden="true">
      <div className="lang-wipe__inner">
        <span className="lang-wipe__note">{note}</span>
        <strong>{label}</strong>
        <span className="lang-wipe__line" />
      </div>
    </div>
  );
}

export function Header({ c, menuOpen, onMenu, onLang, onNavigate, tone = 'paper' }) {
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef(null);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setScrolled(window.scrollY > 24);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') {
        onMenu(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen, onMenu]);

  return (
    <>
      <header className={`topbar tone-${tone} ${scrolled ? 'is-scrolled' : ''} ${menuOpen ? 'is-menu' : ''}`}>
        <div className="topbar__inner">
          <a
            className="brand"
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              onNavigate('top');
            }}
            aria-label="Mohamed Rabea — home"
          >
            <span className="brand__mark">MR<i /></span>
            <span className="brand__text">
              <strong>{c.dir === 'rtl' ? 'محمد ربيع' : 'Mohamed Rabea'}</strong>
              <small>{c.brandTag}</small>
            </span>
          </a>

          <nav className="topbar__nav" aria-label={c.dir === 'rtl' ? 'التنقل الرئيسي' : 'Main navigation'}>
            {c.nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(item.id);
                }}
              >
                <span>{item.n}</span>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="topbar__actions">
            <span className="topbar__status"><i />{c.hero.status}</span>
            <button type="button" className="locale" onClick={onLang} aria-label={c.localeAria}>
              {c.localeLabel}
              <Arrow diagonal />
            </button>
            <button
              ref={toggleRef}
              type="button"
              className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={c.menuAria}
              onClick={() => onMenu(!menuOpen)}
            >
              <span /><span />
            </button>
          </div>
        </div>
      </header>

      <div id="site-menu" className={`menu ${menuOpen ? 'is-open' : ''}`} aria-hidden={menuOpen ? 'false' : 'true'}>
        <div className="menu__inner">
          <div className="menu__head">
            <span>MR / INDEX</span>
            <span>{c.hero.coords}</span>
          </div>
          <nav className="menu__nav" aria-label={c.dir === 'rtl' ? 'قائمة التنقل' : 'Menu'}>
            {c.nav.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                tabIndex={menuOpen ? 0 : -1}
                onClick={(event) => {
                  event.preventDefault();
                  onNavigate(item.id);
                }}
              >
                <span className="menu__n">{item.n}</span>
                <span className="menu__label">{item.label}</span>
                <Arrow diagonal />
              </a>
            ))}
          </nav>
          <div className="menu__foot">
            <Magnetic
              as="a"
              className="button button--solid"
              href={c.contact.email}
              tabIndex={menuOpen ? 0 : -1}
            >
              {c.contact.emailBtn}
              <Arrow diagonal />
            </Magnetic>
            <div className="menu__links">
              <a href={c.contact.email}>{c.contact.email}</a>
              <span>{c.contact.location}</span>
            </div>
            <button
              type="button"
              className="locale locale--menu"
              onClick={onLang}
              tabIndex={menuOpen ? 0 : -1}
            >
              {c.localeLabel}
              <Arrow diagonal />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export function Footer({ c, onNavigate }) {
  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <a
          className="brand brand--footer"
          href="#top"
          onClick={(event) => {
            event.preventDefault();
            onNavigate('top');
          }}
        >
          <span className="brand__mark">MR<i /></span>
          <span className="brand__text">
            <strong>{c.dir === 'rtl' ? 'محمد ربيع' : 'Mohamed Rabea'}</strong>
            <small>{c.brandTag}</small>
          </span>
        </a>
        <p className="footer__note">{c.contact.footerNote}</p>
        <button type="button" className="footer__top" onClick={() => onNavigate('top')}>
          {c.contact.backTop}
          <Arrow diagonal />
        </button>
        <p className="footer__legal">
          <span>{c.contact.rights}</span>
          <span>© {new Date().getFullYear()}</span>
          <span>{c.hero.place}</span>
        </p>
      </div>
    </footer>
  );
}

export function Lightbox({ image, onClose }) {
  const closeRef = useRef(null);

  useEffect(() => {
    if (!image) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={image.alt}
      onClick={onClose}
    >
      <button ref={closeRef} type="button" className="lightbox__close" onClick={onClose} aria-label="Close image">
        <span /><span />
      </button>
      <img
        className="lightbox__image"
        src={image.src}
        alt={image.alt}
        onClick={(event) => event.stopPropagation()}
      />
      <p className="lightbox__caption">{image.alt}</p>
    </div>
  );
}
