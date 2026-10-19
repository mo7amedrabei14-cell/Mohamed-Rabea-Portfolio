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
  const g = cv.getContext('2d'), N = FIELD_N(coarse), M = Math.floor(N / 3);
  const stEl = hero.querySelector('.hz-state'), stIdx = stEl?.querySelector('b'), stTxt = stEl?.querySelector('span');
  const labels = (stEl?.dataset.labels || '').split('|');
  const hintEl = hero.querySelector('.hz-hint'), hintTxt = hintEl?.querySelector('span');
  const hints = (hintEl?.dataset.hints || '').split('|');
  const lines = [...hero.querySelectorAll('.hz-ln')];
  const slots = [[], [], []], anchors = [];
  let w = 0, h = 0, stage = 0, ptr = [0, 0, 0], lx = -999, ly = -999, lastMove = -1e9, raf = 0, vis = true, shown = '';
  const P = Array.from({ length: N }, (_, i) => ({ i, x: seed?.[i]?.x ?? Math.random() * innerWidth, y: seed?.[i]?.y ?? Math.random() * innerHeight, vx: seed?.[i]?.vx || 0, vy: seed?.[i]?.vy || 0, hx: 0, hy: 0, ph: Math.random() * 6.28, s: 1.1 + Math.random() * 1.1, lock: 0, si: 0 }));

  const setUI = () => {
    const pct = Math.round(ptr[stage] / M * 100), txt = `${labels[stage] || ''} — ${pct}%`;
    if (stIdx) stIdx.textContent = `0${stage + 1} / 03`;
    if (stTxt && txt !== shown) { stTxt.textContent = txt; shown = txt; }
    if (hintTxt) hintTxt.textContent = hints[stage] || '';
  };
  const scatter = () => {
    for (const p of P) if (p.lock) { p.lock = 0; p.vx = (Math.random() - .5) * 30; p.vy = (Math.random() - .5) * 30; }
    ptr = [0, 0, 0]; stage = 0;
    lines.forEach((l, i) => l.classList.toggle('on', i === 0));
  };
  const advance = () => { if (stage < 2) { stage++; lines[stage]?.classList.add('on'); } else scatter(); setUI(); };

  const layout = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect(), mob = r.width < 760;
    w = r.width; h = r.height;
    cv.width = w * dpr; cv.height = h * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const R = rng(7);
    // layer 1: a table
    const gx0 = w * (mob ? .06 : .07), gx1 = w * (mob ? .94 : .4), gy0 = h * (mob ? .2 : .27), gy1 = h * (mob ? .34 : .52);
    const cols = Math.ceil(Math.sqrt(M * (gx1 - gx0) / (gy1 - gy0))), rows = Math.ceil(M / cols);
    // layer 2: a trend
    const B = mob ? 10 : 16, bx0 = w * (mob ? .06 : .44), bx1 = w * (mob ? .94 : .76), base = h * (mob ? .5 : .55), bh = h * (mob ? .12 : .27), pitch = (bx1 - bx0) / B, bw = pitch * .64;
    const hs = Array.from({ length: B }, (_, b) => .28 + .72 * Math.abs(Math.sin(b * 1.7 + .6) * Math.cos(b * .5)));
    const sum = hs.reduce((a, b) => a + b, 0);
    // layer 3: an operations picture
    const cx = w * (mob ? .5 : .87), cy = h * (mob ? .64 : .38), RR = Math.min(w, h) * (mob ? .1 : .2);
    anchors[0] = [gx0, gy0 - 14]; anchors[1] = [bx0, base + 24]; anchors[2] = [cx - RR, cy - RR * .78 - 16];
    for (let i = 0; i < N; i++) {
      const p = P[i], j = i % M;
      p.hx = R() * w; p.hy = R() * h;
      slots[0][j] = [gx0 + (j % cols + .5) * (gx1 - gx0) / cols, gy0 + (Math.floor(j / cols) + .5) * (gy1 - gy0) / rows];
      let u = R() * sum, b = 0;
      while (u > hs[b] && b < B - 1) { u -= hs[b]; b++; }
      slots[1][j] = [bx0 + b * pitch + (pitch - bw) / 2 + R() * bw, base - R() * hs[b] * bh];
      const k = Math.floor(R() ** .6 * 6) + 1, rr = RR * k / 6, an = R() * 6.2832;
      slots[2][j] = [cx + Math.cos(an) * rr + (R() - .5) * 3, cy + Math.sin(an) * rr * .78 + (R() - .5) * 3];
    }
  };

  const frame = (t) => {
    g.clearRect(0, 0, w, h);
    const manual = t - lastMove < 2600;
    if (!manual && !still) { lx = w * (.5 + .34 * Math.sin(t * .00021)); ly = h * (.46 + .26 * Math.sin(t * .00033 + 1.3)); }
    const RL = Math.min(w, h) * (coarse ? .22 : .16);
    for (const p of P) {
      if (p.lock) {
        const s = slots[p.lock - 1][p.si % M];
        p.vx += (s[0] - p.x) * .06 + Math.sin(t * .002 + p.ph) * .012;
        p.vy += (s[1] - p.y) * .06 + Math.cos(t * .0018 + p.ph) * .012;
        p.vx *= .84; p.vy *= .84;
      } else {
        p.vx += Math.sin(p.y * .007 + t * .0005 + p.ph) * .035 + (p.hx - p.x) * .0007;
        p.vy += Math.cos(p.x * .007 - t * .0004 + p.ph) * .035 + (p.hy - p.y) * .0007;
        const dx = lx - p.x, dy = ly - p.y;
        if (!still && dx * dx + dy * dy < RL * RL && ptr[stage] < (manual ? M : M * .16)) { p.lock = stage + 1; p.si = ptr[stage]++; }
        p.vx *= .93; p.vy *= .93;
      }
      p.x += p.vx; p.y += p.vy;
    }
    g.fillStyle = 'rgba(238,240,255,.3)';
    for (const p of P) if (!p.lock) g.fillRect(p.x, p.y, p.s, p.s);
    const cols = [ICE, PERI, ACCENT];
    for (let s = 1; s <= 3; s++) { g.fillStyle = cols[s - 1]; for (const p of P) if (p.lock === s) g.fillRect(p.x, p.y, p.s + .5, p.s + .5); }
    g.font = '500 11px "DM Mono", monospace'; g.textBaseline = 'alphabetic';
    for (let s = 0; s < 3; s++) if (ptr[s] > 0 || still) { g.fillStyle = 'rgba(238,240,255,.72)'; g.fillText(`0${s + 1}  ${(labels[s] || '').toUpperCase()}`, anchors[s][0], anchors[s][1]); }
    if (!still) {
      g.lineWidth = 1; g.strokeStyle = ptr[stage] < M ? 'rgba(238,240,255,.5)' : 'rgba(238,240,255,.15)';
      g.beginPath(); g.arc(lx, ly, RL, 0, 6.2832); g.stroke();
      g.beginPath(); g.moveTo(lx - 6, ly); g.lineTo(lx + 6, ly); g.moveTo(lx, ly - 6); g.lineTo(lx, ly + 6); g.stroke();
      if ((t | 0) % 6 === 0) setUI();
    }
  };
  const loop = (t) => { if (vis) frame(t); raf = requestAnimationFrame(loop); };

  layout();
  if (still) { P.forEach((p) => { p.lock = Math.floor(p.i / M) + 1; if (p.lock > 3) p.lock = 3; p.si = p.i % M; }); for (let k = 0; k < 90; k++) frame(k * 16); lines.forEach((l) => l.classList.add('on')); hintEl?.remove(); stEl?.remove(); return () => {}; }
  setUI();
  const onMove = (e) => { const r = cv.getBoundingClientRect(); if (e.clientY < r.top || e.clientY > r.bottom) return; lx = e.clientX - r.left; ly = e.clientY - r.top; lastMove = performance.now(); };
  const onClick = (e) => { if (e.target.closest('a,button') || !hero.contains(e.target)) return; advance(); };
  let rt; const onResize = () => { clearTimeout(rt); rt = setTimeout(layout, 150); };
  const io = new IntersectionObserver(([en]) => { vis = en.isIntersecting; });
  io.observe(hero);
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('resize', onResize);
  hero.addEventListener('click', onClick);
  raf = requestAnimationFrame(loop);
  return () => { cancelAnimationFrame(raf); io.disconnect(); clearTimeout(rt); removeEventListener('pointermove', onMove); removeEventListener('resize', onResize); hero.removeEventListener('click', onClick); };
}

export function startHorizon() {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  if (!hero) return () => {};
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const off = [];
  let lenis, tick, dead = false, stopField = null;

  const startScroll = () => {
    if (reduced || coarse || lenis || dead) return;
    lenis = new Lenis({ lerp: 0.085, anchors: { offset: -84 } });
    lenis.on('scroll', ScrollTrigger.update);
    tick = (t) => lenis.raf(t * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  };
  const beginField = (seed) => { if (!stopField) stopField = startField(hero, seed, coarse, reduced); };

  const spot = (e) => { const c = e.target.closest?.('.hz-spot'); if (!c) return; const r = c.getBoundingClientRect(); c.style.setProperty('--sx', `${e.clientX - r.left}px`); c.style.setProperty('--sy', `${e.clientY - r.top}px`); };
  addEventListener('pointermove', spot, { passive: true });
  off.push(() => removeEventListener('pointermove', spot));

  const clock = hero.querySelector('.hz-clock');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Cairo' });
  const tickClock = () => { if (clock) clock.textContent = fmt.format(new Date()); };
  tickClock();
  const clockId = setInterval(tickClock, 1000);
  off.push(() => clearInterval(clockId));

  const ctx = gsap.context(() => {
    if (reduced) return;
    gsap.fromTo('.hz-manifesto .w', { opacity: .14 }, { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: '.hz-manifesto', start: 'top 82%', end: 'bottom 46%', scrub: true } });
    const cards = gsap.utils.toArray('.hz-card');
    cards.forEach((card, i) => { if (cards[i + 1]) gsap.to(card, { scale: .93, opacity: .5, ease: 'none', transformOrigin: '50% 0', scrollTrigger: { trigger: cards[i + 1], start: 'top 82%', end: 'top 14%', scrub: true } }); });
    gsap.fromTo('.hz-tl-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', transformOrigin: '50% 0', scrollTrigger: { trigger: '.hz-ledger', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    gsap.utils.toArray('.hz-job').forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 68%', onEnter: () => el.classList.add('is-on'), onLeaveBack: () => el.classList.remove('is-on') }));
    const skew = gsap.quickTo('.hz-skew', 'skewX', { duration: .5, ease: 'power3.out' });
    ScrollTrigger.create({ onUpdate: (s) => skew(gsap.utils.clamp(-9, 9, s.getVelocity() / -260)) });
  });
  off.push(() => ctx.revert());

  const reveal = () => {
    gsap.from('.hz-meta, .hz-hint, .hz-side > *, .hz-state', { y: 32, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, delay: .5 });
    setTimeout(() => hero.querySelector('.hz-ln')?.classList.add('on'), 450);
  };
  const cleanup = () => { dead = true; stopField?.(); off.forEach((f) => f()); if (tick) gsap.ticker.remove(tick); lenis?.destroy(); };

  if (reduced) { beginField(null); return cleanup; }

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
    const k = phase === 'gather' ? .006 + .02 * e ** 1.2 : .02;
    const sw = phase === 'dots' ? .22 : phase === 'gather' ? (1 - e) * .28 : 0;
    const buckets = [[], [], [], [], [], [], [], [], [], [], [], []], acc = [];
    for (const p of P) {
      const dx = mx - p.x, dy = my - p.y, d2 = dx * dx + dy * dy;
      if (d2 < 15000) { const d = Math.sqrt(d2) || 1, f = (1 - d2 / 15000) * 2.6; p.vx -= dx / d * f; p.vy -= dy / d * f; }
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
    gsap.fromTo(CH, { x: (i, el) => vw / 2 - (el.getBoundingClientRect().left + el.offsetWidth / 2), scale: 1, opacity: 0 }, { x: 0, opacity: 1, duration: 1.1, ease: 'expo.out', delay: .12, stagger: { each: .05, from: 'center' } });
    timers.push(setTimeout(toDots, 1500));
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
    g2.fillStyle = '#fff'; g2.textAlign = 'center'; g2.textBaseline = 'middle';
    g2.font = `800 ${getComputedStyle(CH[0]).fontSize} Anybody, system-ui, sans-serif`;
    CH.forEach((s, i) => g2.fillText(s.textContent, rects[i].left + rects[i].width / 2, rects[i].top + rects[i].height * .54));
    const y0 = Math.max(0, Math.floor(Math.min(...rects.map((r) => r.top)) - 10)), y1 = Math.min(vh, Math.ceil(Math.max(...rects.map((r) => r.bottom)) + 10));
    const d = g2.getImageData(0, 0, vw, vh).data, shape = [];
    for (let y = y0; y < y1; y += 2) for (let x = 0; x < vw; x += 2) if (d[(y * vw + x) * 4 + 3] > 128) shape.push([x, y]);
    for (let i = shape.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [shape[i], shape[j]] = [shape[j], shape[i]]; }
    P = pts.map((p, i) => { const q = shape[i % shape.length] || [vw / 2, vh / 2]; return { ...p, rt: 1.3, cr: 1.1 + Math.random() * .5, x: q[0] + Math.random() * 2, y: q[1] + Math.random() * 2, vx: 0, vy: 0, tx: q[0], ty: q[1] }; });
    phase = 'dots';
    gsap.to(CH, { opacity: 0, duration: .3 });
    timers.push(setTimeout(() => { phase = 'gather'; tGather = performance.now(); aim(); P.forEach((p) => { p.rt = p.r; }); }, 800));
  };

  // 5. we go in
  const finish = () => {
    if (done || dead) return;
    done = true; phase = 'release';
    const step = Math.max(1, Math.floor(P.length / FIELD_N));
    const seed = P.filter((_, i) => i % step === 0).slice(0, FIELD_N).map((p) => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy }));
    root.classList.remove('hz-intro');
    reveal();
    beginField(seed.length ? seed : null);
    gsap.fromTo(cur, { clipPath: 'circle(150% at 50% 42%)' }, { clipPath: 'circle(0% at 50% 42%)', duration: 1.35, ease: 'expo.inOut', onComplete: () => { cur.remove(); startScroll(); } });
    gsap.to(cv, { opacity: 0, duration: .5, delay: .2, onComplete: () => { cancelAnimationFrame(raf); cv.remove(); } });
  };

  const onMove = (e) => { mx = e.clientX; my = e.clientY; };
  const onResize = () => { size(); if (phase === 'gather') aim(); };
  const onKey = (e) => { if (e.key === 'Escape') finish(); };
  size();
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('resize', onResize);
  addEventListener('keydown', onKey);
  cur.querySelector('.hz-skip').addEventListener('click', finish);
  raf = requestAnimationFrame(loop);
  timers.push(setTimeout(expand, tExpand), setTimeout(finish, total + 400));
  tone.catch(() => finish());

  return () => {
    cancelAnimationFrame(raf); timers.forEach(clearTimeout);
    removeEventListener('pointermove', onMove); removeEventListener('resize', onResize); removeEventListener('keydown', onKey);
    cleanup();
    cv.remove(); cur.remove();
    root.classList.remove('hz-intro');
  };
}
