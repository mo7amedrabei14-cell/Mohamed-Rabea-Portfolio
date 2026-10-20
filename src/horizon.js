import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const TONE = `${import.meta.env.BASE_URL}images/face-tone.png`;
const ACCENT = '#ff5a3c', ICE = '#eef0ff', PERI = '#9aa6ff';
const NAME = 'MOHAMED RABEA';
const FIELD_N = (coarse) => (coarse ? 900 : 2600);
const rng = (a) => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

// ---- Portrait: a hex halftone. Dot size follows the picture's brightness. ----
let toneCache;
async function loadTone() {
  if (toneCache) return toneCache;
  const img = new Image();
  img.src = TONE;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  toneCache = { d: g.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
  return toneCache;
}
function halftone(tone, S, P) {
  const pts = [];
  let row = 0;
  for (let y = P / 2; y < S; y += P * .866, row++) {
    for (let x = P / 2 + (row % 2 ? P / 2 : 0); x < S; x += P) {
      const tx = Math.min(tone.w - 1, (x / S * tone.w) | 0), ty = Math.min(tone.h - 1, (y / S * tone.h) | 0), i = (ty * tone.w + tx) * 4;
      if (tone.d[i + 3] < 140) continue;
      const u = x / S, v = y / S, e = Math.min(1, u / .08, (1 - u) / .08, (1 - v) / .2), f = e * e * (3 - 2 * e);   // shoulders fade out instead of a hard crop
      const r = P * .5 * Math.sqrt(tone.d[i] / 255) * .96 * f;
      if (r > .42) pts.push({ q: [u - .5, v - .5], r, c: Math.random() < .006 ? 1 : 0 });
    }
  }
  return pts;
}

// ---- Hero: a field of dots. Sweep the circle over them — each one locks in. Click: next sentence / next layer. ----
function startField(hero, seed, coarse, still) {
  const cv = hero.querySelector('.hz-field');
  if (!cv) return () => {};
  const g = cv.getContext('2d');
  if (!g) return () => {};
  const N = FIELD_N(coarse);
  const stEl = hero.querySelector('.hz-state');
  const stIdx = stEl?.querySelector('b');
  const stTxt = stEl?.querySelector('span');
  const hintEl = hero.querySelector('.hz-hint');
  const hintTxt = hintEl?.querySelector(':scope > span');
  const advanceControl = hero.querySelector('[data-hz-advance]');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const touchTarget = document.createElement('div');
  touchTarget.className = 'hz-touch-target';
  touchTarget.setAttribute('aria-hidden', 'true');
  touchTarget.style.touchAction = 'none';

  let w = 0, h = 0, stage = 0, clickStep = 0, assigned = 0;
  let lx = 0, ly = 0, manualUntil = 0, raf = 0, visible = true, running = false, disposed = false;
  let activePointer = null, pointerStartX = 0, pointerStartY = 0, didDrag = false, suppressClick = false;
  let phrases = [];
  let labels = (stEl?.dataset.labels || 'Collecting signal|Signal captured|Second signal').split('|');
  let hints = (hintEl?.dataset.hints || 'Sweep the lens to collect the first message.|The first signal is assembled. Press again for the next.|Collect the second signal, then press once more to scatter and reset.').split('|');
  const particles = Array.from({ length: N }, (_, i) => ({
    i,
    x: seed?.[i]?.x ?? Math.random() * Math.max(1, hero.clientWidth),
    y: seed?.[i]?.y ?? Math.random() * Math.max(1, hero.clientHeight),
    vx: seed?.[i]?.vx || 0,
    vy: seed?.[i]?.vy || 0,
    tx: 0, ty: 0,
    ph: Math.random() * 6.2832,
    size: 1 + Math.random() * .65,
    locked: false,
  }));

  let lastStatusText = '';
  let lastHintText = '';
  const setUI = () => {
    const pct = Math.round(assigned / N * 100);
    const index = '0' + (clickStep + 1) + ' / 03';
    const statusText = (labels[clickStep] || labels[0] || 'Signal') + ' — ' + pct + '%';
    const hintText = hints[clickStep] || hints[0] || '';
    if (stIdx && stIdx.textContent !== index) stIdx.textContent = index;
    if (stTxt && statusText !== lastStatusText) { stTxt.textContent = statusText; lastStatusText = statusText; }
    if (hintTxt && hintText !== lastHintText) { hintTxt.textContent = hintText; lastHintText = hintText; }
  };

  const makeTargets = () => {
    phrases = (hero.dataset.phrases || 'Hello, curious mind.|Noise in. Order out.').split('|');
    const phrase = phrases[stage] || phrases[0];
    const arabic = /[\u0600-\u06ff]/.test(phrase);
    const mask = document.createElement('canvas');
    mask.width = Math.max(1, Math.ceil(w));
    mask.height = Math.max(1, Math.ceil(h));
    const brush = mask.getContext('2d', { willReadFrequently: true });
    if (!brush) return;
    let size = Math.max(20, Math.min(74, w * .105));
    const family = arabic ? '"IBM Plex Sans Arabic", sans-serif' : '"DM Sans", sans-serif';
    brush.font = '700 ' + size + 'px ' + family;
    while (brush.measureText(phrase).width > w * .82 && size > 18) {
      size -= 1;
      brush.font = '700 ' + size + 'px ' + family;
    }
    brush.clearRect(0, 0, mask.width, mask.height);
    brush.fillStyle = '#fff';
    brush.textAlign = 'center';
    brush.textBaseline = 'middle';
    brush.direction = arabic ? 'rtl' : 'ltr';
    brush.fillText(phrase, w * .5, h * .405);
    const pixels = brush.getImageData(0, 0, mask.width, mask.height).data;
    const raw = [];
    for (let y = 0; y < mask.height; y += 2) {
      for (let x = 0; x < mask.width; x += 2) {
        if (pixels[(y * mask.width + x) * 4 + 3] > 100) raw.push([x, y]);
      }
    }
    if (!raw.length) raw.push([w * .5, h * .405]);
    particles.forEach((p, i) => {
      const point = raw[Math.floor(i * raw.length / N)] || raw[raw.length - 1];
      p.tx = point[0];
      p.ty = point[1];
    });
  };

  const layout = () => {
    const rect = cv.getBoundingClientRect();
    const oldW = w, oldH = h;
    w = Math.max(1, rect.width || hero.clientWidth);
    h = Math.max(1, rect.height || hero.clientHeight);
    const dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (oldW && oldH) {
      particles.forEach((p) => { p.x *= w / oldW; p.y *= h / oldH; });
    }
    lx = w * .5;
    ly = h * .405;
    makeTargets();
    if (still || clickStep === 1) {
      particles.forEach((p) => {
        p.locked = true;
        p.x = p.tx; p.y = p.ty; p.vx = 0; p.vy = 0;
      });
      assigned = N;
    }
    if (coarse && !still && !touchTarget.isConnected) hero.appendChild(touchTarget);
    else if (still) touchTarget.remove();
    setUI();
    if (still) draw(performance.now());
  };

  const releaseField = (nextStage) => {
    stage = nextStage;
    assigned = 0;
    makeTargets();
    particles.forEach((p) => {
      p.locked = false;
      p.vx += (Math.random() - .5) * 7;
      p.vy += (Math.random() - .5) * 7;
      if (still) {
        p.locked = true;
        p.x = p.tx; p.y = p.ty; p.vx = 0; p.vy = 0;
      }
    });
    if (still) assigned = N;
    manualUntil = 0;
    setUI();
    if (still) draw(performance.now());
  };

  const advance = () => {
    if (clickStep === 0) {
      clickStep = 1;
      particles.forEach((p) => {
        p.locked = true;
        if (still) { p.x = p.tx; p.y = p.ty; p.vx = 0; p.vy = 0; }
      });
      assigned = N;
      setUI();
      if (still) draw(performance.now());
      return;
    }
    if (clickStep === 1) {
      clickStep = 2;
      releaseField(1);
      return;
    }
    clickStep = 0;
    releaseField(0);
  };

  const draw = (time) => {
    if (!w || !h) return;
    g.clearRect(0, 0, w, h);
    const radius = Math.min(w, h) * (coarse ? .22 : .16);
    if (!still && !touchTarget.isConnected && coarse) hero.appendChild(touchTarget);
    if (coarse && touchTarget.isConnected) {
      touchTarget.style.width = (radius * 2) + 'px';
      touchTarget.style.height = (radius * 2) + 'px';
      touchTarget.style.transform = 'translate3d(' + (lx - radius) + 'px,' + (ly - radius) + 'px,0)';
    }
    if (!still && time > manualUntil) {
      lx = w * (.5 + .32 * Math.sin(time * .00022));
      ly = h * (.30 + .08 * Math.sin(time * .00031 + 1.1));
    }
    for (const p of particles) {
      if (!still && !p.locked && clickStep !== 1 && Math.hypot(p.x - lx, p.y - ly) < radius) {
        p.locked = true;
        assigned = Math.min(N, assigned + 1);
        setUI();
      }
      if (p.locked) {
        p.vx = (p.vx + (p.tx - p.x) * .055) * .79;
        p.vy = (p.vy + (p.ty - p.y) * .055) * .79;
      } else if (!still) {
        p.vx = (p.vx + Math.sin(time * .00045 + p.ph) * .025 + (Math.sin(p.i * 2.3) * w - p.x) * .00012) * .985;
        p.vy = (p.vy + Math.cos(time * .00037 + p.ph) * .025 + (Math.cos(p.i * 1.7) * h - p.y) * .00012) * .985;
        if (p.x < -2) p.x = w + 2;
        if (p.x > w + 2) p.x = -2;
        if (p.y < -2) p.y = h + 2;
        if (p.y > h + 2) p.y = -2;
      }
      if (!still) { p.x += p.vx; p.y += p.vy; }
      g.fillStyle = p.locked ? (stage === 0 ? ICE : ACCENT) : (p.i % 31 === 0 ? PERI : 'rgba(238,240,255,.28)');
      g.fillRect(p.x, p.y, p.locked ? 1.7 : p.size, p.locked ? 1.7 : p.size);
    }
    if (!still) {
      g.strokeStyle = 'rgba(238,240,255,.7)';
      g.lineWidth = 1;
      g.beginPath(); g.arc(lx, ly, radius, 0, 6.2832); g.stroke();
      g.beginPath();
      g.moveTo(lx - 6, ly); g.lineTo(lx + 6, ly);
      g.moveTo(lx, ly - 6); g.lineTo(lx, ly + 6);
      g.stroke();
    }
  };

  const loop = (time) => {
    if (disposed || still || !visible || document.hidden) { running = false; return; }
    draw(time);
    raf = requestAnimationFrame(loop);
  };
  const startLoop = () => {
    if (!running && !still && visible && !document.hidden && !disposed) {
      running = true;
      raf = requestAnimationFrame(loop);
    }
  };
  const stopLoop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };
  const onDocumentVisibility = () => {
    if (document.hidden) stopLoop();
    else startLoop();
  };

  const placePointer = (event, force = false) => {
    const rect = cv.getBoundingClientRect();
    if (!force && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) return;
    lx = Math.max(0, Math.min(w, event.clientX - rect.left));
    ly = Math.max(0, Math.min(h, event.clientY - rect.top));
    manualUntil = performance.now() + 2600;
  };
  const onPointerMove = (event) => {
    if (event.pointerType === 'touch') {
      if (activePointer !== event.pointerId) return;
      if (Math.hypot(event.clientX - pointerStartX, event.clientY - pointerStartY) > 6) didDrag = true;
      placePointer(event, true);
      return;
    }
    if (activePointer === null) placePointer(event);
  };
  const onPointerDown = (event) => {
    if (event.pointerType !== 'touch') return;
    activePointer = event.pointerId;
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    didDrag = false;
    suppressClick = false;
    placePointer(event, true);
    try { touchTarget.setPointerCapture(event.pointerId); } catch { /* Pointer capture may not be supported. */ }
  };
  const onPointerEnd = (event) => {
    if (activePointer !== event.pointerId) return;
    suppressClick = didDrag;
    activePointer = null;
    didDrag = false;
  };
  const onClick = (event) => {
    if (!hero.contains(event.target) || event.target.closest('a,button')) return;
    if (suppressClick) {
      suppressClick = false;
      event.preventDefault();
      return;
    }
    advance();
  };
  const onMotionChange = (event) => {
    still = event.matches;
    if (still) {
      stopLoop();
      layout();
      draw(performance.now());
    } else {
      layout();
      particles.forEach((p) => {
        if (clickStep === 1) {
          p.locked = true; p.x = p.tx; p.y = p.ty; p.vx = 0; p.vy = 0;
        } else {
          p.locked = false; p.vx += (Math.random() - .5) * 2; p.vy += (Math.random() - .5) * 2;
        }
      });
      assigned = clickStep === 1 ? N : 0;
      manualUntil = 0;
      setUI();
      startLoop();
    }
  };

  const languageObserver = new MutationObserver((records) => {
    const changed = new Set(records.map((record) => record.attributeName));
    labels = (stEl?.dataset.labels || '').split('|');
    hints = (hintEl?.dataset.hints || '').split('|');
    if (changed.has('data-phrases')) {
      clickStep = 0;
      releaseField(0);
    } else {
      setUI();
    }
  });
  languageObserver.observe(hero, { attributes: true, subtree: true, attributeFilter: ['data-phrases', 'data-labels', 'data-hints'] });
  layout();
  const resizeObserver = new ResizeObserver(layout);
  resizeObserver.observe(hero);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) startLoop();
    else stopLoop();
  });
  intersection.observe(hero);
  addEventListener('pointermove', onPointerMove, { passive: true });
  if (coarse) {
    touchTarget.addEventListener('pointerdown', onPointerDown);
    touchTarget.addEventListener('pointerup', onPointerEnd);
    touchTarget.addEventListener('pointercancel', onPointerEnd);
  }
  hero.addEventListener('click', onClick);
  advanceControl?.addEventListener('click', advance);
  motionPreference.addEventListener?.('change', onMotionChange);
  document.addEventListener('visibilitychange', onDocumentVisibility);
  if (still) draw(performance.now());
  else startLoop();
  document.fonts.ready.then(() => { if (!disposed) layout(); });

  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    resizeObserver.disconnect();
    intersection.disconnect();
    languageObserver.disconnect();
    removeEventListener('pointermove', onPointerMove);
    hero.removeEventListener('click', onClick);
    advanceControl?.removeEventListener('click', advance);
    motionPreference.removeEventListener?.('change', onMotionChange);
    document.removeEventListener('visibilitychange', onDocumentVisibility);
    if (coarse) {
      touchTarget.removeEventListener('pointerdown', onPointerDown);
      touchTarget.removeEventListener('pointerup', onPointerEnd);
      touchTarget.removeEventListener('pointercancel', onPointerEnd);
    }
    touchTarget.remove();
  };
}

export function startHorizon() {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  if (!hero) return () => {};
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const reduced = motionPreference.matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const off = [];
  let lenis, tick, dead = false, stopField = null;

  const startScroll = () => {
    if (motionPreference.matches || coarse || lenis || dead) return;
    lenis = new Lenis({ lerp: 0.085, anchors: { offset: -84 } });
    lenis.on('scroll', ScrollTrigger.update);
    tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  };
  const beginField = (seed) => { if (!stopField) stopField = startField(hero, seed, coarse, motionPreference.matches); };

  const spot = (e) => { const c = e.target.closest?.('.hz-spot'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--sx', `${e.clientX - r.left}px`); c.style.setProperty('--sy', `${e.clientY - r.top}px`); };
  addEventListener('pointermove', spot, { passive: true });
  off.push(() => removeEventListener('pointermove', spot));

  const clock = hero.querySelector('.hz-clock');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Cairo' });
  const tickClock = () => { if (clock) clock.textContent = fmt.format(new Date()); };
  tickClock();
  const clockId = setInterval(tickClock, 1000);
  off.push(() => clearInterval(clockId));

  let ctx;
  const buildScrollAnimations = () => {
    ctx?.revert();
    ctx = gsap.context(() => {

    if (motionPreference.matches) return;
    gsap.fromTo('.hz-manifesto .w', { opacity: .14 }, { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: '.hz-manifesto', start: 'top 82%', end: 'bottom 46%', scrub: true } });
    const cards = gsap.utils.toArray('.hz-card');
    cards.forEach((card, i) => { if (cards[i + 1]) gsap.to(card, { scale: .93, opacity: .5, ease: 'none', transformOrigin: '50% 0', scrollTrigger: { trigger: cards[i + 1], start: 'top 82%', end: 'top 14%', scrub: true } }); });
    gsap.fromTo('.hz-tl-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', transformOrigin: '50% 0', scrollTrigger: { trigger: '.hz-ledger', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    gsap.utils.toArray('.hz-job').forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 68%', onEnter: () => el.classList.add('is-on'), onLeaveBack: () => el.classList.remove('is-on') }));
    const skew = gsap.quickTo('.hz-skew', 'skewX', { duration: .5, ease: 'power3.out' });
    ScrollTrigger.create({ onUpdate: (s) => skew(gsap.utils.clamp(-9, 9, s.getVelocity() / -260)) });
    });
  };
  buildScrollAnimations();
  off.push(() => ctx?.revert());
  const reveal = () => {
    if (motionPreference.matches) return;
    gsap.from('.hz-meta, .hz-hint, .hz-side > *, .hz-state', { y: 24, opacity: 0, duration: .85, ease: 'expo.out', stagger: .07, delay: .25 });
  };
  const onMotionPreference = (event) => {
    if (event.matches) {
      const skip = document.querySelector('.hz-curtain .hz-skip');
      if (skip) {
        ctx?.revert();
        if (tick) gsap.ticker.remove(tick);
        tick = null;
        lenis?.destroy();
        lenis = null;
        if (done) {
          // A user may enable reduced motion during the exit transition itself.
          gsap.killTweensOf(cur);
          gsap.killTweensOf(cv);
          cancelAnimationFrame(raf);
          cur.remove();
          cv.remove();
          root.classList.remove('hz-intro');
          removeEventListener('keydown', onKey);
          restoreIntroBackground();
          document.querySelector('#main')?.focus({ preventScroll: true });
          startScroll();
        } else {
          skip.click();
        }
        return;
      }
      ctx?.revert();
      if (tick) gsap.ticker.remove(tick);
      tick = null;
      lenis?.destroy();
      lenis = null;
    } else {
      if (!root.classList.contains('hz-intro')) {
        buildScrollAnimations();
        startScroll();
      }
    }
  };
  motionPreference.addEventListener?.('change', onMotionPreference);
  off.push(() => motionPreference.removeEventListener?.('change', onMotionPreference));
  const cleanup = () => { dead = true; stopField?.(); off.forEach((f) => f()); if (tick) gsap.ticker.remove(tick); lenis?.destroy(); };

  if (reduced) { beginField(null); return cleanup; }

  // ---- Intro: one letter cycles fast through the name → it unfolds into the name → the name melts into dots → the dots become a halftone portrait → we go in ----
  root.classList.add('hz-intro');
  const cv = Object.assign(document.createElement('canvas'), { className: 'hz-fx' });
  const g = cv.getContext('2d');
  const cur = document.createElement('div');
  cur.className = 'hz-curtain';
  cur.setAttribute('role', 'dialog');
  cur.setAttribute('aria-modal', 'true');
  cur.setAttribute('aria-label', document.documentElement.lang === 'ar' ? 'مقدمة الموقع' : 'Portfolio introduction');
  cv.setAttribute('aria-hidden', 'true');
  const introArabic = document.documentElement.lang === 'ar';
  cur.innerHTML = '<div class="hz-top"><span>' + (introArabic ? 'سجل ميداني' : 'Field record') + '</span><span>Cairo · EG</span></div><div class="hz-one" aria-hidden="true"></div><div class="hz-name" aria-hidden="true"></div><div class="hz-bottom"><b class="hz-count">000</b><button class="hz-skip" type="button">' + (introArabic ? 'تخطّ المقدمة' : 'Skip intro') + '</button></div>';
  document.body.append(cur, cv);
  const introBackgroundNodes = [...document.querySelectorAll('.site-header, #main, .site-footer, .embedded-presentation-section, .skip-link')];
  const introPreviousInert = introBackgroundNodes.map((node) => node.inert);
  introBackgroundNodes.forEach((node) => { node.inert = true; });
  let introBackgroundRestored = false;
  const restoreIntroBackground = () => {
    if (introBackgroundRestored) return;
    introBackgroundRestored = true;
    introBackgroundNodes.forEach((node, index) => { node.inert = introPreviousInert[index]; });
  };
  const one = cur.querySelector('.hz-one'), nameEl = cur.querySelector('.hz-name'), count = cur.querySelector('.hz-count');
  const L = [...NAME].map((ch) => { const s = document.createElement('i'); s.className = ch === ' ' ? 'sp' : 'ch'; s.textContent = ch === ' ' ? '' : ch; nameEl.append(s); return s; });
  const CH = L.filter((s) => s.classList.contains('ch'));
  gsap.set(CH, { opacity: 0 });
  const LET = [...NAME.replace(' ', '')];

  let vw = 0, vh = 0, P = [], raf = 0, phase = 'cycle', mx = -999, my = -999, done = false, tGather = 0, S = 600, PG = 5;
  const T0 = performance.now(), total = 7600, timers = [];
  const size = () => { const dpr = Math.min(devicePixelRatio || 1, 2); vw = innerWidth; vh = innerHeight; cv.width = vw * dpr; cv.height = vh * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const portraitBox = () => { S = Math.min(vh * .74, vw * .92, 700); PG = Math.max(3, Math.min(5.2, S / 140)); };
  const aim = () => { portraitBox(); for (const p of P) { p.tx = vw / 2 + p.q[0] * S; p.ty = vh * .46 + p.q[1] * S; } };
  const tone = loadTone();

  const draw = (t) => {
    g.clearRect(0, 0, vw, vh);
    if (!P.length) return;
    const e = phase === 'gather' ? Math.min(1, (performance.now() - tGather) / 2600) : 0;
    const k = phase === 'gather' ? .006 + .02 * e ** 1.2 : phase === 'dots' ? 0 : .02;
    const sw = phase === 'gather' ? (1 - e) * .28 : 0;
    const buckets = [[], [], [], [], [], [], [], [], [], [], [], []], acc = [];
    for (const p of P) {
      const dx = mx - p.x, dy = my - p.y, d2 = dx * dx + dy * dy;
      if (phase !== 'dots' && d2 < 15000) { const d = Math.sqrt(d2) || 1, f = (1 - d2 / 15000) * 2.6; p.vx -= dx / d * f; p.vy -= dy / d * f; }
      p.vx += (p.tx - p.x) * k + Math.sin(t * .0017 + p.y * .013) * sw;
      p.vy += (p.ty - p.y) * k + Math.cos(t * .0015 + p.x * .011) * sw;
      p.vx *= .88; p.vy *= .88; p.x += p.vx; p.y += p.vy;
      p.cr += (p.rt - p.cr) * .05;
      (p.c ? acc : buckets[Math.min(11, (p.cr * 2.6) | 0)]).push(p);
    }
    g.fillStyle = ICE;
    for (const b of buckets) { if (!b.length) continue; g.beginPath(); for (const p of b) { g.moveTo(p.x + p.cr, p.y); g.arc(p.x, p.y, p.cr, 0, 6.2832); } g.fill(); }
    g.fillStyle = ACCENT;
    g.beginPath(); for (const p of acc) { g.moveTo(p.x + p.cr, p.y); g.arc(p.x, p.y, p.cr, 0, 6.2832); } g.fill();
  };
  const loop = (t) => { const pr = Math.min(1, (performance.now() - T0) / total); count.textContent = String(Math.round(pr * 100)).padStart(3, '0'); draw(t); raf = requestAnimationFrame(loop); };

  // 1. one letter, changing fast
  const STEP = 115;
  LET.forEach((ch, i) => timers.push(setTimeout(() => {
    if (dead || done) return;
    one.textContent = ch; one.classList.toggle('last', i === LET.length - 1);
    gsap.fromTo(one, { scale: 1.12, opacity: .2, filter: 'blur(8px)' }, { scale: 1, opacity: 1, filter: 'blur(0px)', duration: .1, ease: 'power2.out', overwrite: true });
  }, 300 + i * STEP)));
  const tExpand = 300 + LET.length * STEP + 300;

  // 2. the letter unfolds into the name
  const expand = () => {
    if (dead || done) return;
    phase = 'expand';
    gsap.to(one, { scale: .3, opacity: 0, duration: .35, ease: 'power3.in' });
    gsap.fromTo(CH, { x: (i, el) => vw / 2 - (el.getBoundingClientRect().left + el.offsetWidth / 2), scale: 1, opacity: 0 }, { x: 0, y: 0, scale: 1, opacity: 1, filter: 'none', duration: 1.1, ease: 'expo.out', delay: .12, stagger: { each: .05, from: 'center' }, onComplete: () => {
      // Lock the complete name in place before the pixel-morph begins.
      gsap.set(CH, { x: 0, y: 0, scale: 1, opacity: 1, filter: 'none' });
      timers.push(setTimeout(toDots, 450));
    } });
  };

  // 3. the name melts into dots that keep its exact shape; 4. the dots become the portrait
  const toDots = async () => {
    if (dead || done) return;
    const tn = await tone; if (dead || done) return;
    portraitBox();
    const pts = halftone(tn, S, PG);
    const rects = CH.map((s) => s.getBoundingClientRect());
    const c2 = document.createElement('canvas'); c2.width = vw; c2.height = vh;
    const g2 = c2.getContext('2d', { willReadFrequently: true });
    g2.fillStyle = '#fff';
    g2.textAlign = 'center';
    g2.textBaseline = 'alphabetic';
    // Match each rendered DOM glyph's font metrics and baseline, rather than guessing a y offset.
    // This keeps the text-particle silhouette anchored to the exact on-screen name position.
    const nameStyle = getComputedStyle(CH[0]);
    g2.font = `${nameStyle.fontStyle} ${nameStyle.fontVariant} ${nameStyle.fontWeight} ${nameStyle.fontSize} ${nameStyle.fontFamily}`;
    CH.forEach((s, i) => {
      const rect = rects[i];
      const style = getComputedStyle(s);
      const metrics = g2.measureText(s.textContent);
      const fontSize = parseFloat(style.fontSize) || rect.height;
      const ascent = metrics.fontBoundingBoxAscent || fontSize * .8;
      const descent = metrics.fontBoundingBoxDescent || fontSize * .2;
      const lineHeight = parseFloat(style.lineHeight) || fontSize;
      const leading = (lineHeight - ascent - descent) / 2;
      const baselineY = rect.top + leading + ascent;
      g2.fillText(s.textContent, rect.left + rect.width / 2, baselineY);
    });
    const y0 = Math.max(0, Math.floor(Math.min(...rects.map((r) => r.top)) - 10)), y1 = Math.min(vh, Math.ceil(Math.max(...rects.map((r) => r.bottom)) + 10));
    const d = g2.getImageData(0, 0, vw, vh).data, shape = [];
    for (let y = y0; y < y1; y += 2) for (let x = 0; x < vw; x += 2) if (d[(y * vw + x) * 4 + 3] > 128) shape.push([x, y]);
    for (let i = shape.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [shape[i], shape[j]] = [shape[j], shape[i]]; }
    P = pts.map((p, i) => { const q = shape[i % shape.length] || [vw / 2, vh / 2]; return { ...p, rt: 1.3, cr: 1.1 + Math.random() * .5, x: q[0], y: q[1], vx: 0, vy: 0, tx: q[0], ty: q[1] }; });
    phase = 'dots';
    // Dots inherit the exact letter positions and stay still; only then do they gather into the portrait.
    gsap.to(CH, { opacity: 0, duration: .3 });
    timers.push(setTimeout(() => { phase = 'gather'; tGather = performance.now(); aim(); P.forEach((p) => { p.rt = p.r; }); }, 500));
  };

  // 5. we go in
  const finish = () => {
    if (done || dead) return;
    done = true; phase = 'release';
    const step = Math.max(1, Math.floor(P.length / FIELD_N(coarse)));
    const seed = P.filter((_, i) => i % step === 0).slice(0, FIELD_N(coarse)).map((p) => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy }));
    removeEventListener('pointermove', onMove);
    removeEventListener('resize', onResize);
    if (motionPreference.matches) {
      root.classList.remove('hz-intro');
      removeEventListener('keydown', onKey);
      restoreIntroBackground();
      cancelAnimationFrame(raf);
      reveal();
      beginField(seed.length ? seed : null);
      cur.remove();
      cv.remove();
      document.querySelector('#main')?.focus({ preventScroll: true });
      startScroll();
      return;
    }
    reveal();
    beginField(seed.length ? seed : null);
    gsap.fromTo(cur, { clipPath: 'circle(150% at 50% 42%)' }, { clipPath: 'circle(0% at 50% 42%)', duration: 1.35, ease: 'expo.inOut', onComplete: () => {
      cur.remove();
      root.classList.remove('hz-intro');
      removeEventListener('keydown', onKey);
      restoreIntroBackground();
      document.querySelector('#main')?.focus({ preventScroll: true });
      startScroll();
    } });
    gsap.to(cv, { opacity: 0, duration: .5, delay: .2, onComplete: () => { cancelAnimationFrame(raf); cv.remove(); } });
  };

  const onMove = (e) => { mx = e.clientX; my = e.clientY; };
  const onResize = () => { size(); if (phase === 'gather') aim(); };
  const onKey = (e) => {
    if (e.key === 'Escape') { finish(); return; }
    if (e.key === 'Tab') {
      e.preventDefault();
      cur.querySelector('.hz-skip')?.focus({ preventScroll: true });
    }
  };
  size();
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('resize', onResize);
  addEventListener('keydown', onKey);
  cur.querySelector('.hz-skip').addEventListener('click', finish);
  cur.querySelector('.hz-skip').focus({ preventScroll: true });
  raf = requestAnimationFrame(loop);
  timers.push(setTimeout(expand, tExpand), setTimeout(finish, total + 400));
  tone.catch(() => finish());

  return () => {
    cancelAnimationFrame(raf); timers.forEach(clearTimeout);
    removeEventListener('pointermove', onMove); removeEventListener('resize', onResize); removeEventListener('keydown', onKey);
    cleanup();
    cv.remove(); cur.remove();
    restoreIntroBackground();
    root.classList.remove('hz-intro');
  };
}
