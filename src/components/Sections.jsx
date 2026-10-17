import { Fragment, useEffect, useRef, useState } from 'react';
import {
  Arrow,
  Asterisk,
  BrowserFrame,
  Label,
  Magnetic,
  Marquee,
  SectionHead,
} from './ui.jsx';

function useCairoTime(lang) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const format = () => {
      try {
        setTime(new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'Africa/Cairo',
          hour12: false,
        }).format(new Date()));
      } catch {
        setTime('');
      }
    };
    format();
    const timer = window.setInterval(format, 30000);
    return () => window.clearInterval(timer);
  }, [lang]);

  return time;
}

export function Hero({ c, lang, onNavigate }) {
  const [role, setRole] = useState('data');
  const time = useCairoTime(lang);
  const active = c.hero.console.tabs.find((tab) => tab.id === role) || c.hero.console.tabs[0];

  const go = (id) => (event) => {
    event.preventDefault();
    onNavigate(id);
  };

  return (
    <section className="hero" id="top">
      <div className="shell hero__inner">
        <div className="hero__copy">
          <p className="hero__eyebrow" data-reveal>
            <span>{c.hero.eyebrow}</span>
            <span className="hero__coords">{c.hero.coords}</span>
          </p>

          <h1 className="hero__title">
            {c.hero.title.map((line) => (
              <span className={`hero__line ${line.accent ? 'is-accent' : ''}`} key={line.text}>
                <span data-hero-line>{line.text}</span>
              </span>
            ))}
          </h1>

          <div className="hero__body">
            <p className="hero__intro" data-reveal>{c.hero.intro}</p>
            <div className="hero__actions" data-reveal>
              <Magnetic as="a" className="button button--solid" href="#work" onClick={go('work')}>
                {c.hero.primary}
                <Arrow diagonal />
              </Magnetic>
              <a className="textlink" href="#contact" onClick={go('contact')}>
                {c.hero.secondary}
                <Arrow />
              </a>
            </div>
          </div>
        </div>

        <aside className="console" aria-label={c.hero.console.label} data-reveal>
          <div className="console__bar">
            <span className="console__brand">
              <i className="console__logo">MR</i>
              {c.hero.console.label}
            </span>
            <span className="console__state"><i />{c.hero.console.state}</span>
          </div>

          <div className="console__head">
            <p className="console__title">{c.hero.console.title}</p>
            <span className="console__time">{time} <i>/ CAI</i></span>
          </div>

          <div className="console__viz" aria-hidden="true">
            <span className="console__viz-label">SIGNAL / 24H</span>
            <svg viewBox="0 0 420 108" preserveAspectRatio="none">
              <defs>
                <linearGradient id="signalFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--signal)" stopOpacity=".26" />
                  <stop offset="100%" stopColor="var(--signal)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <g className="console__grid">
                <path d="M0 27h420M0 54h420M0 81h420M70 0v108M140 0v108M210 0v108M280 0v108M350 0v108" />
              </g>
              <path
                className="console__area"
                d="M0 88 24 76 48 82 72 61 96 70 120 50 144 58 168 38 192 47 216 29 240 42 264 24 288 35 312 21 336 30 360 14 384 25 408 9 420 13V108H0Z"
              />
              <path
                className="console__line"
                d="M0 88 24 76 48 82 72 61 96 70 120 50 144 58 168 38 192 47 216 29 240 42 264 24 288 35 312 21 336 30 360 14 384 25 408 9 420 13"
              />
              <circle className="console__pulse" cx="408" cy="9" r="3.4" />
            </svg>
            <div className="console__ticks">
              <span>00</span><span>06</span><span>12</span><span>18</span><span>24</span>
            </div>
          </div>

          <div className="console__tabs" role="tablist" aria-label={c.hero.console.hint}>
            {c.hero.console.tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={active.id === tab.id}
                aria-controls={`panel-${tab.id}`}
                className={`console__tab ${active.id === tab.id ? 'is-active' : ''}`}
                onClick={() => setRole(tab.id)}
              >
                <span>{tab.n}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className="console__panel"
            role="tabpanel"
            id={`panel-${active.id}`}
            aria-labelledby={`tab-${active.id}`}
            key={active.id}
          >
            <p>{active.desc}</p>
            <div className="console__stack">
              {active.stack.map((item) => <span key={item}>{item}</span>)}
            </div>
          </div>

          <div className="console__rows">
            {c.hero.console.rows.map(([name, state], index) => (
              <div className="console__row" key={name}>
                <span className="console__row-index">{String(index + 1).padStart(2, '0')}</span>
                <span>{name}</span>
                <span className="console__row-state"><i />{state}</span>
              </div>
            ))}
          </div>

          <p className="console__foot">
            <span>{c.hero.console.footer}</span>
            <span>{c.hero.coords}</span>
          </p>
        </aside>
      </div>

      <div className="hero__footer shell">
        <a href="#approach" className="scroll-cue" onClick={go('approach')}>
          <span className="scroll-cue__line" aria-hidden="true"><i /></span>
          {c.hero.scroll}
        </a>
        <span className="hero__place">{c.hero.place} — {time}</span>
      </div>

      <Marquee className="hero__marquee" items={c.marquee} />
    </section>
  );
}

export function Manifesto({ c }) {
  const words = [];

  c.manifesto.statement.forEach((part, partIndex) => {
    part.text.split(/\s+/).filter(Boolean).forEach((word, wordIndex) => {
      words.push(
        <Fragment key={`${partIndex}-${wordIndex}`}>
          <span className={`word ${part.accent ? 'is-accent' : ''}`}>{word}</span>{' '}
        </Fragment>,
      );
    });
  });

  return (
    <section className="manifesto" id="approach">
      <div className="shell">
        <Label>{c.manifesto.label}</Label>

        <div className="manifesto__grid">
          <h2 className="manifesto__statement" aria-label={c.manifesto.statement.map((part) => part.text).join('')}>
            {words}
          </h2>

          <div className="manifesto__side" data-reveal>
            <p className="manifesto__body">{c.manifesto.body}</p>
            <ol className="steps">
              {c.manifesto.steps.map((step) => (
                <li key={step.n}>
                  <span className="steps__n">{step.n}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <ul className="facts">
          {c.manifesto.facts.map((fact) => (
            <li key={fact.label} data-reveal>
              <strong>{fact.value}</strong>
              <span>{fact.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Project({ project, c, onImage, onEmbed, embedOpen }) {
  const tone = project.tone;
  return (
    <article className={`project project--${tone}`} data-tone={tone === 'dark' ? 'dark' : undefined}>
      <div className="shell">
        <div className="project__top" data-reveal>
          <span className="project__n">{project.n}<i>/ 03</i></span>
          <div className="project__heading">
            <p className="project__kicker">{project.kicker}</p>
            <h3>{project.title}</h3>
          </div>
          <p className="project__summary">{project.summary}</p>
        </div>

        <div className="project__body">
          <div className="project__visual">
            <BrowserFrame image={project.image} onImage={onImage} tone={tone} />
          </div>

          <div className="project__info">
            <div className="project__block" data-reveal>
              <span className="micro-label">{project.briefLabel}</span>
              <p>{project.brief}</p>
            </div>
            <div className="project__block" data-reveal>
              <span className="micro-label">{project.builtLabel}</span>
              <p>{project.built}</p>
            </div>
            <div className="project__block" data-reveal>
              <span className="micro-label">{project.focusLabel}</span>
              <p>{project.focus}</p>
            </div>

            {project.modules && (
              <div className="project__modules" data-reveal>
                <span className="micro-label">{project.modulesLabel}</span>
                <ul>
                  {project.modules.map((module, index) => (
                    <li key={module}>
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      {module}
                      <Arrow diagonal />
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {project.facts && (
              <div className="project__facts" data-reveal>
                {project.facts.map((fact, index) => (
                  <div key={fact.title}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div>
                      <strong>{fact.title}</strong>
                      <p>{fact.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {project.points && (
              <div className="project__points" data-reveal>
                {project.points.map((point) => (
                  <div key={point.n}>
                    <span>{point.n}</span>
                    <strong>{point.title}</strong>
                    <p>{point.text}</p>
                  </div>
                ))}
              </div>
            )}

            {project.workflow && (
              <div className="project__workflow" data-reveal>
                <span className="micro-label">{project.workflowLabel}</span>
                <p>{project.workflow}</p>
              </div>
            )}

            <div className="tags" data-reveal>
              {project.stack.map((tech) => <span key={tech}>{tech}</span>)}
            </div>

            {project.links.length > 0 && (
              <div className="project__links" data-reveal>
                {project.links.map((link) => (
                  link.embed ? (
                    <button
                      key={link.label}
                      type="button"
                      className="button button--solid"
                      onClick={onEmbed}
                      aria-expanded={embedOpen}
                    >
                      {embedOpen ? c.work.hidePresentation : c.work.openPresentation}
                      <Arrow diagonal />
                    </button>
                  ) : link.style === 'solid' ? (
                    <Magnetic
                      key={link.label}
                      as="a"
                      className="button button--solid"
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noreferrer' : undefined}
                    >
                      {link.label}
                      <Arrow diagonal />
                    </Magnetic>
                  ) : (
                    <a
                      key={link.label}
                      className="textlink"
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noreferrer' : undefined}
                    >
                      {link.label}
                      <Arrow diagonal />
                    </a>
                  )
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function Work({ c, onImage }) {
  const [embedOpen, setEmbedOpen] = useState(false);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const embedRef = useRef(null);

  useEffect(() => {
    if (!embedOpen) {
      setEmbedLoaded(false);
      return undefined;
    }
    const timer = window.setTimeout(() => {
      embedRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [embedOpen]);

  return (
    <section className="work" id="work">
      <div className="shell">
        <SectionHead
          label={c.work.label}
          title={c.work.title}
          intro={c.work.intro}
        />
      </div>

      {c.work.projects.map((project) => (
        <Project
          key={project.id}
          project={project}
          c={c}
          onImage={onImage}
          onEmbed={() => setEmbedOpen((value) => !value)}
          embedOpen={embedOpen}
        />
      ))}

      {embedOpen && (
        <div className="embed" ref={embedRef} id="live-presentation">
          <div className="shell embed__inner">
            <div className="embed__head">
              <div>
                <Label>{c.work.projects[2].kicker}</Label>
                <h3>{c.work.projects[2].title}</h3>
              </div>
              <div className="embed__actions">
                <a className="textlink" href={c.work.projects[2].links[0].href} target="_blank" rel="noreferrer">
                  {c.work.openInTab}
                  <Arrow diagonal />
                </a>
                <button type="button" className="embed__close" onClick={() => setEmbedOpen(false)}>
                  {c.work.hidePresentation}
                  <span aria-hidden="true">×</span>
                </button>
              </div>
            </div>
            <div className={`embed__frame ${embedLoaded ? 'is-loaded' : ''}`}>
              {!embedLoaded && (
                <div className="embed__loading">
                  <span className="embed__loader" aria-hidden="true" />
                  {c.work.loadingPresentation}
                </div>
              )}
              <iframe
                src={c.work.projects[2].links[0].href}
                title={c.work.projects[2].title}
                loading="lazy"
                allow="fullscreen; autoplay; clipboard-write"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => setEmbedLoaded(true)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="shell">
        <p className="disclaimer">{c.work.disclaimer}</p>
      </div>
    </section>
  );
}

export function Capabilities({ c }) {
  const [open, setOpen] = useState('01');

  return (
    <section className="caps" id="capabilities" data-tone="dark">
      <Asterisk className="caps__watermark" />
      <div className="shell">
        <SectionHead
          label={c.capabilities.label}
          title={c.capabilities.title}
          intro={c.capabilities.intro}
          tone="dark"
        />

        <div className="caps__list">
          {c.capabilities.items.map((item) => {
            const isOpen = open === item.n;
            return (
              <article className={`cap ${isOpen ? 'is-open' : ''}`} key={item.n}>
                <h3>
                  <button
                    type="button"
                    className="cap__trigger"
                    aria-expanded={isOpen}
                    aria-controls={`cap-panel-${item.n}`}
                    onClick={() => setOpen(isOpen ? '' : item.n)}
                  >
                    <span className="cap__n">{item.n}</span>
                    <span className="cap__title">{item.title}</span>
                    <span className="cap__plus" aria-hidden="true"><i /><i /></span>
                  </button>
                </h3>
                <div className="cap__panel" id={`cap-panel-${item.n}`}>
                  <div className="cap__panel-inner">
                    <p>{item.desc}</p>
                    <ul>
                      {item.tools.map((tool) => <li key={tool}>{tool}</li>)}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

const FIELD_NODES = [
  { x: 286, y: 370, labelX: 286, labelY: 392, anchor: 'middle' },
  { x: 462, y: 92, labelX: 476, labelY: 88, anchor: 'start' },
  { x: 418, y: 232, labelX: 432, labelY: 228, anchor: 'start' },
];

const FIELD_ROUTES = [
  'M300 282 C 288 316 283 344 286 370',
  'M300 282 C 340 240 400 160 462 92',
  'M300 282 C 345 272 385 250 418 232',
];

function FieldMap({ items, active }) {
  const node = FIELD_NODES[active] || FIELD_NODES[0];
  const record = items[active] || items[0];

  return (
    <div className="fieldmap" data-reveal>
      <div className="fieldmap__head">
        <span>FIELD GRID / MENA</span>
        <span>03 RECORDS</span>
      </div>
      <svg viewBox="0 0 620 430" role="img" aria-label="Field deployment map">
        <defs>
          <pattern id="fieldGrid" width="38" height="38" patternUnits="userSpaceOnUse">
            <path d="M38 0H0v38" fill="none" stroke="rgba(242,239,230,.07)" />
          </pattern>
        </defs>
        <rect width="620" height="430" fill="url(#fieldGrid)" />
        {FIELD_ROUTES.map((route, index) => (
          <path
            key={route}
            d={route}
            className={`fieldmap__route ${active === index ? 'is-active' : ''}`}
          />
        ))}
        <line x1={node.x} y1="0" x2={node.x} y2="430" className="fieldmap__cross" />
        <line x1="0" y1={node.y} x2="620" y2={node.y} className="fieldmap__cross" />
        <g className="fieldmap__cairo">
          <circle cx="300" cy="282" r="13" />
          <circle cx="300" cy="282" r="3.4" />
          <text x="316" y="279">CAIRO</text>
          <text x="316" y="291">EOC / BASE</text>
        </g>
        {FIELD_NODES.map((item, index) => (
          <g key={item.labelX} className={`fieldmap__node ${active === index ? 'is-active' : ''}`}>
            <circle className="fieldmap__ring" cx={item.x} cy={item.y} r="11" />
            <circle className="fieldmap__dot" cx={item.x} cy={item.y} r="4" />
            <text className="fieldmap__label" x={item.labelX} y={item.labelY} textAnchor={item.anchor}>
              {items[index]?.n}
            </text>
          </g>
        ))}
        <g className="fieldmap__axis">
          <text x="10" y="373">22°N</text>
          <text x="10" y="285">30°N</text>
          <text x="10" y="95">38°N</text>
          <text x="286" y="422" textAnchor="middle">31°E</text>
          <text x="418" y="422" textAnchor="middle">34°E</text>
          <text x="540" y="422" textAnchor="middle">37°E</text>
        </g>
        <g className="fieldmap__compass">
          <text x="570" y="32" textAnchor="middle">N</text>
          <line x1="570" y1="40" x2="570" y2="66" />
          <circle cx="570" cy="40" r="2" />
        </g>
      </svg>
      <div className="fieldmap__readout">
        <span>{record.n} — {record.coords}</span>
        <strong>{record.place}</strong>
      </div>
    </div>
  );
}

export function Experience({ c }) {
  const [activeField, setActiveField] = useState(0);

  return (
    <section className="experience" id="experience">
      <div className="shell">
        <SectionHead
          label={c.experience.label}
          title={c.experience.title}
          intro={c.experience.intro}
        />

        <div className="roles">
          {c.experience.roles.map((role) => (
            <article className="role" key={role.n} data-reveal>
              <span className="role__n">{role.n}</span>
              <div className="role__main">
                <h3>{role.title}</h3>
                <p className="role__org">{role.org}</p>
              </div>
              <p className="role__date">{role.date}</p>
              <p className="role__desc">{role.desc}</p>
            </article>
          ))}
        </div>

        <div className="field" data-tone="dark">
          <div className="field__head" data-reveal>
            <div>
              <Label tone="dark">{c.experience.fieldLabel}</Label>
              <h3>{c.experience.fieldTitle}</h3>
            </div>
            <p>30.0444° N / 31.2357° E — EGY</p>
          </div>
          <div className="field__body">
            <FieldMap items={c.experience.field} active={activeField} />
            <div className="field__list">
              {c.experience.field.map((item, index) => (
                <button
                  type="button"
                  key={item.n}
                  className={`fieldrow ${activeField === index ? 'is-active' : ''}`}
                  aria-pressed={activeField === index}
                  onMouseEnter={() => setActiveField(index)}
                  onFocus={() => setActiveField(index)}
                  onClick={() => setActiveField(index)}
                >
                  <span className="fieldrow__n">{item.n}</span>
                  <span className="fieldrow__main">
                    <strong>{item.place}</strong>
                    <span>{item.context}</span>
                    <small>{item.coords}</small>
                  </span>
                  <Arrow diagonal />
                  <span className="fieldrow__text">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DotPortrait() {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const src = `${import.meta.env.BASE_URL}images/Personal.jpg`;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pointer = { x: -999, y: -999, active: false };
    let dots = [];
    let width = 0;
    let height = 0;
    let raf = 0;
    let startedAt = 0;
    let visible = false;
    let lastFrame = 0;
    let imageReady = false;

    const draw = (now) => {
      if (!width || !height || !dots.length) return;
      const t = reduced ? 1.5 : Math.min(1.5, (now - startedAt) / 1200);
      const scan = ((now * 0.035) % (height + 160)) - 80;
      const soft = new Path2D();
      const mid = new Path2D();
      const strong = new Path2D();
      const hot = new Path2D();

      for (const dot of dots) {
        const appear = Math.min(1, Math.max(0, t * 1.8 - dot.delay));
        if (appear <= 0) continue;

        let x = dot.x;
        let y = dot.y;
        let radius = dot.r * (0.45 + appear * 0.55);
        let group = dot.level;

        if (pointer.active) {
          const dx = x - pointer.x;
          const dy = y - pointer.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 96) {
            const force = 1 - distance / 96;
            x += (dx / (distance || 1)) * force * 11;
            y += (dy / (distance || 1)) * force * 11;
            radius += force * 1.1;
            group = 4;
          }
        }

        const path = group === 4 ? hot : group === 3 ? strong : group === 2 ? mid : soft;
        path.moveTo(x + radius, y);
        path.arc(x, y, radius, 0, Math.PI * 2);
      }

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(242, 239, 230, 0.2)';
      ctx.fill(soft);
      ctx.fillStyle = 'rgba(242, 239, 230, 0.42)';
      ctx.fill(mid);
      ctx.fillStyle = 'rgba(242, 239, 230, 0.72)';
      ctx.fill(strong);
      ctx.fillStyle = 'rgba(232, 69, 27, 0.88)';
      ctx.fill(hot);

      // A single scanning signal line, not a band of recoloured dots.
      const band = ctx.createLinearGradient(0, scan - 30, 0, scan + 30);
      band.addColorStop(0, 'rgba(232, 69, 27, 0)');
      band.addColorStop(0.5, 'rgba(232, 69, 27, 0.14)');
      band.addColorStop(1, 'rgba(232, 69, 27, 0)');
      ctx.fillStyle = band;
      ctx.fillRect(0, scan - 30, width, 60);
      ctx.fillStyle = 'rgba(232, 69, 27, 0.62)';
      ctx.fillRect(0, scan, width, 1);
    };

    const frame = (now) => {
      if (!visible) return;
      raf = requestAnimationFrame(frame);
      if (now - lastFrame < 30) return;
      lastFrame = now;
      draw(now);
    };

    const build = () => {
      if (!imageReady) return;
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      if (!width || !height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const grid = 86;
      const offscreen = document.createElement('canvas');
      offscreen.width = grid;
      offscreen.height = grid;
      const offctx = offscreen.getContext('2d', { willReadFrequently: true });
      if (!offctx) return;

      const image = wrap.querySelector('img');
      const natural = image.naturalWidth || 1280;
      const crop = natural * 0.42;
      offctx.drawImage(image, natural * 0.29, natural * 0.2, crop, crop, 0, 0, grid, grid);
      const pixels = offctx.getImageData(0, 0, grid, grid).data;

      const cellW = width / grid;
      const cellH = height / grid;
      dots = [];

      for (let y = 0; y < grid; y += 1) {
        for (let x = 0; x < grid; x += 1) {
          const index = (y * grid + x) * 4;
          const luminance = (pixels[index] * 0.2126 + pixels[index + 1] * 0.7152 + pixels[index + 2] * 0.0722) / 255;
          const darkness = 1 - luminance;
          if (darkness < 0.07) continue;
          dots.push({
            x: (x + 0.5) * cellW,
            y: (y + 0.5) * cellH,
            r: 0.55 + darkness * 3.1,
            level: darkness > 0.62 ? 3 : darkness > 0.34 ? 2 : 1,
            delay: (x + y) * 0.012,
          });
        }
      }
      setReady(true);
      if (reduced) draw(performance.now());
    };

    const onPointerMove = (event) => {
      if (reduced || !width) return;
      const rect = wrap.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    };
    const onPointerLeave = () => { pointer.active = false; };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) {
        if (!startedAt) startedAt = performance.now();
        if (!reduced && !raf) raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }, { threshold: 0.12 });

    const image = wrap.querySelector('img');
    const onLoad = () => {
      imageReady = true;
      build();
      observer.observe(wrap);
    };

    if (image.complete && image.naturalWidth) onLoad();
    else image.addEventListener('load', onLoad, { once: true });

    const resize = new ResizeObserver(() => build());
    resize.observe(wrap);
    wrap.addEventListener('pointermove', onPointerMove, { passive: true });
    wrap.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      resize.disconnect();
      wrap.removeEventListener('pointermove', onPointerMove);
      wrap.removeEventListener('pointerleave', onPointerLeave);
      image.removeEventListener('load', onLoad);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`operator__frame ${ready ? 'is-ready' : ''}`}>
      <img src={src} alt="Mohamed Rabea" />
      <canvas ref={canvasRef} role="img" aria-label="Halftone data portrait of Mohamed Rabea" />
      <div className="operator__hud operator__hud--top">
        <span>OPERATOR / MR-01</span>
        <span className="operator__live"><i />SCAN</span>
      </div>
      <div className="operator__hud operator__hud--bottom">
        <span>30.0444°N / 31.2357°E</span>
        <span>PORTRAIT / 2026</span>
      </div>
    </div>
  );
}

export function Operator({ c }) {
  return (
    <section className="operator" id="operator" data-tone="dark">
      <div className="shell operator__grid">
        <div className="operator__visual" data-reveal>
          <DotPortrait />
        </div>

        <div className="operator__copy">
          <Label tone="dark">{c.operator.label}</Label>
          <h2>
            {c.operator.title[0]}
            <br />
            <em>{c.operator.title[1]}</em>
          </h2>
          <p>{c.operator.body}</p>

          <dl className="operator__facts">
            {c.operator.facts.map((fact) => (
              <div key={fact.key}>
                <dt>{fact.key}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>

          <blockquote>
            <span>{c.operator.principleLabel}</span>
            <p>{c.operator.principle}</p>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

export function Credentials({ c }) {
  return (
    <section className="credentials" id="credentials">
      <div className="shell">
        <SectionHead label={c.credentials.label} title={c.credentials.title} />

        <div className="creds">
          <div className="creds__education" data-reveal>
            <Label>{c.credentials.educationLabel}</Label>
            {c.credentials.education.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.org}</p>
                <span>{item.note}</span>
              </article>
            ))}
          </div>

          <div className="creds__training" data-reveal>
            <Label>{c.credentials.trainingLabel}</Label>
            <ul>
              {c.credentials.trainings.map((training, index) => (
                <li key={training}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {training}
                </li>
              ))}
            </ul>
          </div>

          <div className="creds__languages" data-reveal>
            <Label>{c.credentials.languagesLabel}</Label>
            <p>{c.credentials.languages}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact({ c, lang }) {
  const time = useCairoTime(lang);
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    const value = c.contact.email;
    try {
      if (!navigator.clipboard || !window.isSecureContext) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(value);
    } catch {
      const field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();
      field.setSelectionRange(0, value.length);
      try { document.execCommand('copy'); } catch { /* The visible email link remains available. */ }
      field.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="contact" id="contact" data-tone="signal">
      <div className="contact__rings" aria-hidden="true"><i /><i /><i /></div>
      <div className="shell">
        <div className="contact__head">
          <Label tone="ink">{c.contact.label}</Label>
          <p className="contact__status"><i />{c.contact.availability}</p>
        </div>

        <h2 className="contact__title">
          {c.contact.title.map((line, index) => (
            <span className={index === c.contact.title.length - 1 ? 'is-accent' : ''} key={line}>
              {line}
            </span>
          ))}
        </h2>

        <div className="contact__grid">
          <p className="contact__desc">{c.contact.desc}</p>

          <div className="contact__actions">
            <Magnetic as="a" className="button button--ink" href={c.contact.email}>
              {c.contact.emailBtn}
              <Arrow diagonal />
            </Magnetic>
            <a className="textlink textlink--ink" href="https://wa.me/201090509181" target="_blank" rel="noreferrer">
              {c.contact.whatsappBtn}
              <Arrow diagonal />
            </a>
            <a className="textlink textlink--ink" href="https://www.linkedin.com/in/mohamed-rabea-50644436b" target="_blank" rel="noreferrer">
              {c.contact.linkedinBtn}
              <Arrow diagonal />
            </a>
          </div>

          <div className="contact__meta">
            <div>
              <span>{c.contact.localLabel}</span>
              <strong>{time} <i>GMT+2</i></strong>
            </div>
            <p className="contact__email">
              <a href={c.contact.email}>{c.contact.email}</a>
              <button type="button" onClick={copyEmail} aria-live="polite">
                {copied ? c.contact.copied : c.contact.copy}
              </button>
            </p>
            <a href="tel:+201090509181">{c.contact.phone}</a>
            <span>{c.contact.location}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
