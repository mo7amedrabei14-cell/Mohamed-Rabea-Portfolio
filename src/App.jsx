import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { CONTENT } from './content.js';
import { setupMotion, prefersReduced, scrollToId } from './motion.js';
import {
  Header,
  Footer,
  Lightbox,
  CursorGlow,
  Grain,
  ScrollRail,
} from './components/Chrome.jsx';
import {
  Hero,
  Manifesto,
  Work,
  Capabilities,
  Experience,
  Operator,
  Credentials,
  Contact,
} from './components/Sections.jsx';

function EntryGate({ c, lang, onEnter, onLanguage, phase, gateRef }) {
  const rtl = lang === 'ar';

  const trackPointer = (event) => {
    if (event.pointerType === 'touch' || prefersReduced()) return;
    const rect = event.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    event.currentTarget.style.setProperty('--entry-x', `${x * 100}%`);
    event.currentTarget.style.setProperty('--entry-y', `${y * 100}%`);
    event.currentTarget.style.setProperty('--entry-drift-x', `${(0.5 - x) * 15}px`);
    event.currentTarget.style.setProperty('--entry-drift-y', `${(0.5 - y) * 12}px`);
  };

  return (
    <section
      className={`entry-gate ${phase === 'entering' ? 'is-leaving' : ''} ${phase === 'entered' ? 'is-gone' : ''}`}
      ref={gateRef}
      aria-label={rtl ? 'مقدمة البورتفوليو' : 'Portfolio introduction'}
      aria-hidden={phase === 'entered'}
      dir={c.dir}
      onPointerMove={trackPointer}
    >
      <div className="entry-gate__grid" aria-hidden="true" />
      <div className="entry-gate__glow entry-gate__glow--one" aria-hidden="true" />
      <div className="entry-gate__glow entry-gate__glow--two" aria-hidden="true" />

      <header className="entry-gate__top">
        <a className="entry-brand" href="#entry" onClick={(event) => event.preventDefault()} aria-label="Mohamed Rabea">
          <span className="entry-brand__mark">MR<span /></span>
          <span className="entry-brand__copy">
            <strong>MOHAMED RABEA</strong>
            <small>{c.brandTag}</small>
          </span>
        </a>
        <div className="entry-gate__top-meta">
          <span className="entry-gate__status"><i />{c.hero.status}</span>
          <button className="entry-language" type="button" onClick={onLanguage} aria-label={c.localeAria}>
            {c.localeLabel}<span aria-hidden="true">↗</span>
          </button>
        </div>
      </header>

      <div className="entry-gate__body">
        <div className="entry-gate__copy">
          <p className="entry-gate__eyebrow">
            <span className="entry-gate__eyebrow-dot" />
            {rtl ? 'الخبرة التشغيلية × ذكاء البيانات × هندسة الأنظمة' : 'OPERATIONAL EXPERIENCE × DATA INTELLIGENCE × SYSTEMS'}
          </p>
          <p className="entry-gate__index">{rtl ? 'ملف شخصي — ٢٠٢٦' : 'PERSONAL INDEX — 2026'}</p>
          <h1 className="entry-gate__headline">
            {c.hero.title.map((line, index) => (
              <span className={line.accent ? 'is-accent' : ''} key={line.text}>
                {line.text}
                {index === 0 && <i aria-hidden="true">.</i>}
              </span>
            ))}
          </h1>
          <p className="entry-gate__intro">{c.hero.intro}</p>

          <div className="entry-gate__actions">
            <button className="entry-enter" type="button" onClick={onEnter} disabled={phase !== 'intro'}>
              <span>{rtl ? 'ادخل إلى البورتفوليو' : 'Enter the portfolio'}</span>
              <span className="entry-enter__icon" aria-hidden="true">↗</span>
            </button>
            <span className="entry-gate__hint">
              <span className="entry-gate__hint-key">↵</span>
              {rtl ? 'ابدأ الاستكشاف' : 'Step inside'}
            </span>
          </div>

          <div className="entry-gate__footnote">
            <span className="entry-gate__coordinates">30° 02′ 40″ N / 31° 14′ 08″ E</span>
            <span className="entry-gate__footnote-rule" />
            <span>{c.hero.place}</span>
          </div>
        </div>

        <div className="entry-gate__visual" aria-hidden="true">
          <div className="entry-gate__visual-caption">
            <span>MR / 01</span>
            <span>{rtl ? 'منظومة عمل' : 'A SYSTEMS MINDSET'}</span>
          </div>
          <div className="entry-artifact">
            <div className="entry-artifact__halo entry-artifact__halo--outer" />
            <div className="entry-artifact__halo entry-artifact__halo--middle" />
            <div className="entry-artifact__halo entry-artifact__halo--inner" />
            <div className="entry-artifact__axis entry-artifact__axis--x" />
            <div className="entry-artifact__axis entry-artifact__axis--y" />
            <svg className="entry-artifact__signal" viewBox="0 0 480 260" fill="none">
              <path className="entry-artifact__signal-shadow" d="M12 186 62 186 88 151 119 151 145 179 176 179 209 101 241 101 263 133 293 133 325 72 356 72 382 116 414 116 441 45 468 45" />
              <path className="entry-artifact__signal-line" d="M12 186 62 186 88 151 119 151 145 179 176 179 209 101 241 101 263 133 293 133 325 72 356 72 382 116 414 116 441 45 468 45" />
              <circle className="entry-artifact__signal-node" cx="441" cy="45" r="5" />
              <circle className="entry-artifact__signal-ring" cx="441" cy="45" r="13" />
            </svg>
            <div className="entry-artifact__core">
              <span className="entry-artifact__core-label">IDENTITY / 001</span>
              <strong>MR</strong>
              <span className="entry-artifact__core-bottom">FIELD TO SYSTEM</span>
            </div>
            <div className="entry-data-card entry-data-card--top">
              <span className="entry-data-card__n">01</span>
              <span className="entry-data-card__label">{rtl ? 'ذكاء البيانات' : 'DATA INTELLIGENCE'}</span>
              <span className="entry-data-card__mark">↗</span>
            </div>
            <div className="entry-data-card entry-data-card--right">
              <span className="entry-data-card__n">02</span>
              <span className="entry-data-card__label">{rtl ? 'هندسة الأنظمة' : 'SYSTEMS ENGINEERING'}</span>
              <span className="entry-data-card__mark">↗</span>
            </div>
            <div className="entry-data-card entry-data-card--bottom">
              <span className="entry-data-card__n">03</span>
              <span className="entry-data-card__label">{rtl ? 'العمليات الإنسانية' : 'HUMANITARIAN OPERATIONS'}</span>
              <span className="entry-data-card__mark">↗</span>
            </div>
            <span className="entry-artifact__vertical-label">{rtl ? 'الفهم ← التنظيم ← الإجراء' : 'UNDERSTAND / STRUCTURE / ACT'}</span>
          </div>
          <div className="entry-gate__visual-foot">
            <span>{rtl ? 'خبرة متصلة بالواقع' : 'GROUNDED IN REAL WORK'}</span>
            <span>31° E — EGY</span>
          </div>
        </div>
      </div>

      <footer className="entry-gate__bottom">
        <span>{rtl ? 'البيانات · الأنظمة · الأثر' : 'DATA · SYSTEMS · IMPACT'}</span>
        <span className="entry-gate__bottom-center"><i />{rtl ? 'تجربة تفاعلية' : 'INTERACTIVE EXPERIENCE'}</span>
        <span>© {new Date().getFullYear()} MOHAMED RABEA</span>
      </footer>
      <span className="entry-gate__edge-mark" aria-hidden="true">MR—26</span>
    </section>
  );
}

function App() {
  const [lang, setLang] = useState('en');
  const [phase, setPhase] = useState('intro');
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const gateRef = useRef(null);
  const siteRef = useRef(null);
  const entryTimelineRef = useRef(null);
  const c = CONTENT[lang];
  const rtl = lang === 'ar';

  const toggleLanguage = useCallback(() => {
    setLang((previous) => previous === 'en' ? 'ar' : 'en');
    setMenuOpen(false);
  }, []);

  const navigate = useCallback((id) => {
    setMenuOpen(false);
    if (id === 'top') {
      scrollToId('top');
      return;
    }
    scrollToId(id);
  }, []);

  const enterSite = useCallback(() => {
    if (phase !== 'intro') return;
    setPhase('entering');

    if (prefersReduced() || !gateRef.current) {
      setPhase('entered');
      return;
    }

    entryTimelineRef.current?.kill();
    entryTimelineRef.current = gsap.timeline({
      defaults: { ease: 'expo.inOut' },
      onComplete: () => setPhase('entered'),
    }).to(gateRef.current, {
      clipPath: 'inset(0 0 100% 0)',
      duration: 1.12,
    });
  }, [phase]);

  useLayoutEffect(() => {
    if (phase !== 'intro' || !gateRef.current || prefersReduced()) return undefined;
    const ctx = gsap.context(() => {
      gsap.from('.entry-gate__top, .entry-gate__bottom', {
        y: 12,
        autoAlpha: 0,
        duration: 0.7,
        ease: 'power3.out',
      });
      gsap.from('.entry-gate__eyebrow, .entry-gate__index', {
        y: 14,
        autoAlpha: 0,
        duration: 0.72,
        stagger: 0.09,
        delay: 0.12,
        ease: 'power3.out',
      });
      gsap.from('.entry-gate__headline > span', {
        yPercent: 112,
        rotate: 1.2,
        autoAlpha: 0,
        duration: 1.05,
        stagger: 0.105,
        delay: 0.2,
        ease: 'expo.out',
      });
      gsap.from('.entry-gate__intro, .entry-gate__actions, .entry-gate__footnote', {
        y: 17,
        autoAlpha: 0,
        duration: 0.78,
        stagger: 0.11,
        delay: 0.58,
        ease: 'power3.out',
      });
      gsap.from('.entry-artifact__core', {
        scale: 0.78,
        rotate: -8,
        autoAlpha: 0,
        duration: 1.1,
        delay: 0.27,
        ease: 'back.out(1.3)',
      });
      gsap.from('.entry-artifact__halo', {
        scale: 0.84,
        autoAlpha: 0,
        duration: 1.2,
        stagger: 0.12,
        delay: 0.18,
        ease: 'expo.out',
      });
      gsap.from('.entry-data-card', {
        y: 16,
        autoAlpha: 0,
        duration: 0.72,
        stagger: 0.1,
        delay: 0.5,
        ease: 'power3.out',
      });
    }, gateRef);
    return () => ctx.revert();
  }, [lang, phase]);

  useLayoutEffect(() => {
    if (phase !== 'entered' || !siteRef.current) return undefined;
    return setupMotion(siteRef.current);
  }, [phase, lang]);

  useEffect(() => {
    document.documentElement.lang = c.dir;
    document.documentElement.dir = c.dir;
    document.documentElement.classList.toggle('is-arabic', rtl);
    document.title = rtl
      ? 'محمد ربيع — البيانات والأنظمة والعمليات الإنسانية'
      : 'Mohamed Rabea — Data, Systems & Humanitarian Operations';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0b1711');
    try { window.localStorage.setItem('portfolio-language', lang); } catch { /* Storage is optional. */ }
  }, [c.dir, lang, rtl]);

  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setLightboxImage(null);
      }
      if (
        event.key === 'Enter' &&
        phase === 'intro' &&
        !(event.target instanceof HTMLElement && ['BUTTON', 'A', 'INPUT', 'TEXTAREA'].includes(event.target.tagName))
      ) enterSite();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [enterSite, phase]);

  useEffect(() => () => entryTimelineRef.current?.kill(), []);

  return (
    <>
      <EntryGate
        c={c}
        lang={lang}
        onEnter={enterSite}
        onLanguage={toggleLanguage}
        phase={phase}
        gateRef={gateRef}
      />

      <div
        className={`portfolio-shell ${phase !== 'intro' ? 'is-uncovered' : ''} ${rtl ? 'portfolio-shell--ar' : ''}`}
        ref={siteRef}
        aria-hidden={phase === 'intro'}
        inert={phase === 'intro'}
        dir={c.dir}
      >
        <div className="portfolio-atmosphere" aria-hidden="true">
          <CursorGlow />
          <Grain />
        </div>
        <ScrollRail c={c} />
        <Header
          c={c}
          menuOpen={menuOpen}
          onMenu={setMenuOpen}
          onLang={toggleLanguage}
          onNavigate={navigate}
          tone="paper"
        />
        <main id="main">
          <a className="skip-link" href="#main">{c.skip}</a>
          <Hero c={c} lang={lang} onNavigate={navigate} />
          <Manifesto c={c} />
          <Work c={c} onImage={setLightboxImage} />
          <Capabilities c={c} />
          <Experience c={c} />
          <Operator c={c} />
          <Credentials c={c} />
          <Contact c={c} lang={lang} />
        </main>
        <Footer c={c} onNavigate={navigate} />
        <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      </div>
    </>
  );
}

export default App;
