import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const TONE = `${import.meta.env.BASE_URL}images/face-tone.png`;
const ACCENT = '#A37E63', ICE = '#E9E7E6';
const NAME = 'MOHAMED RABEA';

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

export function startHorizon() {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  if (!hero) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const off = [];
  let lenis, tick, dead = false;

  const startScroll = () => {
    if (reduced || coarse || lenis || dead) return;
    lenis = new Lenis({ lerp: 0.085, anchors: { offset: -84 } });
    lenis.on('scroll', ScrollTrigger.update);
    tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  };
  const ctx = gsap.context(() => {
    if (reduced) return;
    gsap.fromTo('.hz-manifesto .w', { opacity: .14 }, { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: '.hz-manifesto', start: 'top 82%', end: 'bottom 46%', scrub: true } });
    const cards = gsap.utils.toArray('.hz-card');
    cards.forEach((card, i) => { if (cards[i + 1]) gsap.to(card, { scale: .93, opacity: .5, ease: 'none', transformOrigin: '50% 0', scrollTrigger: { trigger: cards[i + 1], start: 'top 82%', end: 'top 14%', scrub: true } }); });
    gsap.fromTo('.hz-tl-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', transformOrigin: '50% 0', scrollTrigger: { trigger: '.hz-ledger', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    gsap.utils.toArray('.hz-job').forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 68%', onEnter: () => el.classList.add('is-on'), onLeaveBack: () => el.classList.remove('is-on') }));
  });
  off.push(() => ctx.revert());

  const reveal = () => {
    gsap.from('.hz-meta, .hz-side > *', { y: 18, opacity: 0, duration: .78, ease: 'power2.out', stagger: .07, delay: .15 });
    hero.querySelectorAll('.hz-ln').forEach((line, index) => {
      timers.push(setTimeout(() => line.classList.add('on'), 180 + index * 105));
    });
  };
  const cleanup = () => { dead = true; off.forEach((f) => f()); if (tick) gsap.ticker.remove(tick); lenis?.destroy(); };

  if (reduced) { hero.querySelectorAll('.hz-ln').forEach((line) => line.classList.add('on')); return cleanup; }

  // ---- Intro: one letter cycles fast through the name → it unfolds into the name → the name melts into dots → the dots become a halftone portrait → we go in ----
  root.classList.add('hz-intro');
  const cv = Object.assign(document.createElement('canvas'), { className: 'hz-fx' });
  const g = cv.getContext('2d');
  const cur = document.createElement('div');
  cur.className = 'hz-curtain';
  cur.innerHTML = '<div class="hz-top"><span>Field record</span><span>Cairo · EG</span></div><div class="hz-one" aria-hidden="true"></div><div class="hz-name" aria-hidden="true"></div><div class="hz-bottom"><b class="hz-count">000</b><button class="hz-skip" type="button">Skip</button></div>';
  document.body.append(cur, cv);
  const one = cur.querySelector('.hz-one'), nameEl = cur.querySelector('.hz-name'), count = cur.querySelector('.hz-count');
  const L = [...NAME].map((ch) => { const s = document.createElement('i'); s.className = ch === ' ' ? 'sp' : 'ch'; s.textContent = ch === ' ' ? '' : ch; nameEl.append(s); return s; });
  const CH = L.filter((s) => s.classList.contains('ch'));
  gsap.set(CH, { opacity: 0 });
  const LET = [...NAME.replace(' ', '')];

  let vw = 0, vh = 0, P = [], raf = 0, phase = 'cycle', done = false, tGather = 0, morphStartedAt = 0, morphLetters = [], S = 600, PG = 5;
  const T0 = performance.now(), total = 9000, morphDuration = 1450, timers = [];
  const size = () => { const dpr = Math.min(devicePixelRatio || 1, 2); vw = innerWidth; vh = innerHeight; cv.width = vw * dpr; cv.height = vh * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const portraitBox = () => { S = Math.min(vh * .74, vw * .92, 700); PG = Math.max(3, Math.min(5.2, S / 140)); };
  const aim = () => { portraitBox(); for (const p of P) { p.tx = vw / 2 + p.q[0] * S; p.ty = vh * .46 + p.q[1] * S; } };
  const tone = loadTone();

  const draw = (t) => {
    g.clearRect(0, 0, vw, vh);
    if (!P.length) return;
    const e = phase === 'gather' ? Math.min(1, (performance.now() - tGather) / 1900) : 0;
    const morphProgress = phase === 'morph' ? Math.min(1, (performance.now() - morphStartedAt) / morphDuration) : (phase === 'hold' || phase === 'gather' || phase === 'release') ? 1 : 0;
    if (phase === 'morph') {
      for (const letter of morphLetters) {
        const local = Math.max(0, Math.min(1, (morphProgress - letter.start) / .09));
        letter.el.style.opacity = String(1 - local);
      }
    }
    const k = phase === 'gather' ? .006 + .02 * e ** 1.2 : (phase === 'morph' || phase === 'hold') ? 0 : .02;
    const sw = phase === 'gather' ? (1 - e) * .24 : 0;
    const buckets = [[], [], [], [], [], [], [], [], [], [], [], []], acc = [];
    for (const p of P) {
      p.vx += (p.tx - p.x) * k + Math.sin(t * .0017 + p.y * .013) * sw;
      p.vy += (p.ty - p.y) * k + Math.cos(t * .0015 + p.x * .011) * sw;
      p.vx *= .88; p.vy *= .88; p.x += p.vx; p.y += p.vy;
      p.cr += (p.rt - p.cr) * .05;
      if (phase === 'morph' && p.morphAt > morphProgress) continue;
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
    gsap.fromTo(CH, { x: (i, el) => vw / 2 - (el.getBoundingClientRect().left + el.offsetWidth / 2), y: 0, scale: 1, rotation: 0, skewX: 0, opacity: 0 }, { x: 0, y: 0, scale: 1, rotation: 0, skewX: 0, opacity: 1, filter: 'none', duration: 1.1, ease: 'expo.out', delay: .12, stagger: { each: .05, from: 'center' }, onComplete: () => {
      gsap.set(CH, { x: 0, y: 0, scale: 1, rotation: 0, skewX: 0, opacity: 1, filter: 'none' });
      timers.push(setTimeout(toDots, 520));
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
    g2.fillStyle = '#F8F6F4';
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
    // Sample pixels remain ordered by horizontal position for a left-to-right conversion.
    shape.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (!shape.length) rects.forEach((r) => shape.push([r.left + r.width / 2, r.top + r.height / 2]));
    const textLeft = Math.min(...rects.map((r) => r.left));
    const textRight = Math.max(...rects.map((r) => r.right));
    const textWidth = Math.max(1, textRight - textLeft);
    morphLetters = CH.map((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      const textRect = range.getBoundingClientRect();
      range.detach?.();
      return { el, start: Math.max(0, Math.min(1, (textRect.left - textLeft) / textWidth)) };
    });
    gsap.killTweensOf(CH);
    gsap.set(CH, { x: 0, y: 0, scale: 1, rotation: 0, skewX: 0, opacity: 1, filter: 'none' });
    const lastShapeIndex = Math.max(0, shape.length - 1);
    const lastParticleIndex = Math.max(1, pts.length - 1);
    P = pts.map((p, i) => {
      const q = shape[Math.round(i * lastShapeIndex / lastParticleIndex)] || [textLeft, rects[0].top];
      const morphAt = Math.max(0, Math.min(1, (q[0] - textLeft) / textWidth));
      return { ...p, morphAt, rt: 1.3, cr: 1.1 + Math.random() * .25, x: q[0], y: q[1], vx: 0, vy: 0, tx: q[0], ty: q[1] };
    });
    phase = 'morph';
    morphStartedAt = performance.now();
    // Keep every dot in the measured name position until its left-to-right reveal.
    timers.push(setTimeout(() => { phase = 'hold'; CH.forEach((el) => { el.style.opacity = '0'; }); }, morphDuration));
    timers.push(setTimeout(() => {
      phase = 'gather';
      tGather = performance.now();
      aim();
      P.forEach((p) => { p.rt = p.r; });
    }, morphDuration + 380));
  };

  // 5. we go in
  const finish = () => {
    if (done || dead) return;
    done = true; phase = 'release';
    root.classList.remove('hz-intro');
    reveal();
    gsap.to(cur, { opacity: 0, yPercent: -1.5, duration: .82, ease: 'power2.inOut', onComplete: () => { cur.remove(); startScroll(); } });
    gsap.to(cv, { opacity: 0, duration: .42, delay: .18, onComplete: () => { cancelAnimationFrame(raf); cv.remove(); } });
  };

  const onResize = () => { size(); if (phase === 'gather') aim(); };
  const onKey = (e) => { if (e.key === 'Escape') finish(); };
  size();
  addEventListener('resize', onResize);
  addEventListener('keydown', onKey);
  cur.querySelector('.hz-skip').addEventListener('click', finish);
  raf = requestAnimationFrame(loop);
  timers.push(setTimeout(expand, tExpand), setTimeout(finish, total + 400));
  tone.catch(() => finish());

  return () => {
    cancelAnimationFrame(raf); timers.forEach(clearTimeout);
    removeEventListener('resize', onResize); removeEventListener('keydown', onKey);
    cleanup();
    cv.remove(); cur.remove();
    root.classList.remove('hz-intro');
  };
}
