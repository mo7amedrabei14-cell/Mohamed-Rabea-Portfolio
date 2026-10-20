import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const TONE = `${import.meta.env.BASE_URL}images/face-tone.png`;
const ACCENT = '#ff5a3c', ICE = '#eef0ff', PERI = '#9aa6ff';
const NAME = 'MOHAMED RABEA';
const FIELD_N = (coarse) => (coarse ? 1200 : 3600);
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

// ---- Hero: dots are scattered everywhere. Sweep the circle — every dot it touches locks into a sentence.
//      Click: finish the sentence → next sentence → scatter and start again. ----
function startField(hero, seed, coarse, still) {
  const cv = hero.querySelector('.hz-field');
  if (!cv) return () => {};
  const g = cv.getContext('2d'), N = FIELD_N(coarse), CELL = 16;
  let sentences = ['Welcome.'], labels = [], hints = [];
  const stEl = hero.querySelector('.hz-state'), stIdx = stEl?.querySelector('b'), stTxt = stEl?.querySelector('span');
  const hintEl = hero.querySelector('.hz-hint'), hintTxt = hintEl?.querySelector('span');
  // Texts live in data-attributes so a language switch (React re-render) reaches the field.
  const readCfg = () => {
    sentences = (cv.dataset.sentences || 'Welcome.').split('|');
    labels = (stEl?.dataset.labels || '').split('|');
    hints = (hintEl?.dataset.hints || '').split('|');
  };
  readCfg();
  const touchTarget = document.createElement('div');
  touchTarget.className = 'hz-touch-target';
  touchTarget.setAttribute('aria-hidden', 'true');
  let w = 0, h = 0, sIdx = 0, slots = [], grid = new Map(), used = 0, formed = false, lx = -999, ly = -999, lastMove = -1e9, raf = 0, vis = true, shown = '';
  // Track touch drags separately from taps so the browser cannot turn a drag into a click.
  let activePointer = null, pointerStartX = 0, pointerStartY = 0, didDrag = false, suppressClick = false;
  const P = Array.from({ length: N }, (_, i) => ({ i, x: seed?.[i]?.x ?? Math.random() * innerWidth, y: seed?.[i]?.y ?? Math.random() * innerHeight, vx: seed?.[i]?.vx || 0, vy: seed?.[i]?.vy || 0, hx: 0, hy: 0, ph: Math.random() * 6.28, s: 1.1 + Math.random() * 1.1, slot: -1, fl: 0, c: Math.random() < .05 ? 3 : 0 }));

  const setUI = () => {
    const pct = Math.round(used / N * 100), last = sIdx >= sentences.length - 1;
    const txt = formed ? (labels[1] || '') : `${labels[0] || ''} — ${pct}%`;
    if (stIdx) stIdx.textContent = `0${sIdx + 1} / 0${sentences.length}`;
    if (stTxt && txt !== shown) { stTxt.textContent = txt; shown = txt; }
    if (hintTxt) hintTxt.textContent = (formed ? (last ? hints[2] : hints[1]) : hints[0]) || '';
  };

  // Turn a sentence into N target positions by sampling the pixels of rendered text.
  const wrap = (x, text, maxW) => {
    const lines = []; let cur = '';
    for (const wd of text.split(' ')) { const t = cur ? `${cur} ${wd}` : wd; if (x.measureText(t).width > maxW && cur) { lines.push(cur); cur = wd; } else cur = t; }
    lines.push(cur); return lines;
  };
  const buildSlots = (text) => {
    const mob = w < 760, arabic = /[\u0600-\u06FF]/.test(text);
    const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h);
    const x = c.getContext('2d', { willReadFrequently: true });
    const fam = arabic ? '"IBM Plex Sans Arabic", system-ui, sans-serif' : 'Anybody, system-ui, sans-serif';
    const maxW = w * (mob ? .86 : .84), maxLines = mob ? 3 : 2;
    let size = Math.min(h * (mob ? .12 : .17), w * (mob ? .18 : .1)) * (arabic ? 1.04 : 1), lines = [text];
    for (let k = 0; k < 30; k++) { x.font = `800 ${size}px ${fam}`; lines = wrap(x, text, maxW); if (lines.length <= maxLines && lines.every((l) => x.measureText(l).width <= maxW)) break; size *= .94; }
    const lh = size * (arabic ? 1.25 : 1.04), cy = h * (mob ? .4 : .46) - (lines.length - 1) * lh / 2;
    x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    lines.forEach((l, i) => x.fillText(l, w / 2, cy + i * lh));
    const y0 = Math.max(0, Math.floor(cy - lh)), y1 = Math.min(c.height, Math.ceil(cy + lh * lines.length)), W = c.width, H = y1 - y0;
    const d = x.getImageData(0, y0, W, H).data;
    let area = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 128) area++;
    let step = Math.max(1.4, Math.sqrt(area / N)), pts = [];
    for (let a = 0; a < 10; a++) {
      pts = [];
      for (let yy = 0; yy < H; yy += step) for (let xx = 0; xx < W; xx += step) {
        const px = Math.min(W - 1, Math.round(xx + (Math.random() - .5) * step * .6)), py = Math.min(H - 1, Math.round(yy + (Math.random() - .5) * step * .6));
        if (d[(py * W + px) * 4 + 3] > 128) pts.push([px, py + y0]);
      }
      if (pts.length >= N * .96) break;
      step *= .92;
    }
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    pts = pts.slice(0, N);
    while (pts.length < N) { const q = pts[(Math.random() * pts.length) | 0] || [w / 2, h / 2]; pts.push([q[0] + (Math.random() - .5) * 2, q[1] + (Math.random() - .5) * 2]); }
    slots = pts.map((q) => ({ x: q[0], y: q[1], used: false }));
    grid = new Map();
    slots.forEach((s, i) => { const k = ((s.x / CELL) | 0) * 4096 + ((s.y / CELL) | 0); (grid.get(k) || grid.set(k, []).get(k)).push(i); });
  };
  // Nearest unused slot, searching outward ring by ring on a coarse grid.
  const nearest = (x, y) => {
    const cx = (x / CELL) | 0, cy = (y / CELL) | 0, R = Math.ceil(Math.max(w, h) / CELL);
    let best = -1, bd = 1e12;
    const visit = (gx, gy) => {
      if (gx < 0 || gy < 0) return;
      const arr = grid.get(gx * 4096 + gy); if (!arr) return;
      for (let k = arr.length - 1; k >= 0; k--) {
        const s = slots[arr[k]];
        if (s.used) { arr[k] = arr[arr.length - 1]; arr.pop(); continue; }
        const d = (s.x - x) ** 2 + (s.y - y) ** 2;
        if (d < bd) { bd = d; best = arr[k]; }
      }
    };
    for (let r = 0; r <= R; r++) {
      if (r === 0) visit(cx, cy);
      else { for (let dx = -r; dx <= r; dx++) { visit(cx + dx, cy - r); visit(cx + dx, cy + r); } for (let dy = -r + 1; dy <= r - 1; dy++) { visit(cx - r, cy + dy); visit(cx + r, cy + dy); } }
      if (best >= 0 && ((r + 1) * CELL) ** 2 > bd) break;
    }
    return best;
  };
  const lock = (p) => { const s = nearest(p.x, p.y); if (s < 0) return false; slots[s].used = true; p.slot = s; p.fl = 1; used++; return true; };
  const complete = () => { for (const p of P) if (p.slot < 0) lock(p); formed = true; setUI(); };
  const scatter = () => {
    for (const p of P) { p.slot = -1; p.vx = (Math.random() - .5) * 34; p.vy = (Math.random() - .5) * 34; }
    used = 0; sIdx = 0; formed = false; buildSlots(sentences[0]); setUI();
  };
  const nextSentence = () => {
    if (sIdx + 1 >= sentences.length) { scatter(); return; }
    sIdx++; buildSlots(sentences[sIdx]); used = 0;
    for (const p of P.slice().sort(() => Math.random() - .5)) { p.slot = -1; lock(p); }
    formed = true; setUI();
  };
  const advance = () => { if (!formed) complete(); else nextSentence(); };

  const layout = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2), r = cv.getBoundingClientRect();
    w = r.width; h = r.height;
    cv.width = w * dpr; cv.height = h * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (coarse) { touchTarget.style.width = `${Math.min(w, h) * .44}px`; touchTarget.style.height = `${Math.min(w, h) * .44}px`; }
    for (const p of P) { p.hx = Math.random() * w; p.hy = Math.random() * h; }
    const keep = P.filter((p) => p.slot >= 0).sort(() => Math.random() - .5);
    buildSlots(sentences[sIdx]); used = 0;
    for (const p of P) p.slot = -1;
    for (const p of keep) lock(p);
  };

  const frame = (t) => {
    g.clearRect(0, 0, w, h);
    const manual = t - lastMove < 2600;
    if (!manual && !still && !formed) { lx = w * (.5 + .34 * Math.sin(t * .00021)); ly = h * (.46 + .26 * Math.sin(t * .00033 + 1.3)); }
    const RL = Math.min(w, h) * (coarse ? .22 : .17), R2 = RL * RL, canCollect = !formed && !still && (manual || used < N * .1);
    if (coarse) touchTarget.style.transform = `translate3d(${lx - RL}px, ${ly - RL}px, 0)`;
    for (const p of P) {
      if (p.slot >= 0) {
        const s = slots[p.slot];
        p.vx += (s.x - p.x) * .07 + Math.sin(t * .002 + p.ph) * .01;
        p.vy += (s.y - p.y) * .07 + Math.cos(t * .0018 + p.ph) * .01;
        p.vx *= .82; p.vy *= .82;
        if (p.fl > .02) p.fl *= .9;
      } else {
        p.vx += Math.sin(p.y * .007 + t * .0005 + p.ph) * .035 + (p.hx - p.x) * .0007;
        p.vy += Math.cos(p.x * .007 - t * .0004 + p.ph) * .035 + (p.hy - p.y) * .0007;
        p.vx *= .93; p.vy *= .93;
        if (canCollect) { const dx = lx - p.x, dy = ly - p.y; if (dx * dx + dy * dy < R2) lock(p); }
      }
      p.x += p.vx; p.y += p.vy;
    }
    g.fillStyle = 'rgba(238,240,255,.3)';
    for (const p of P) if (p.slot < 0) g.fillRect(p.x, p.y, p.s, p.s);
    g.fillStyle = ICE;
    for (const p of P) if (p.slot >= 0 && p.c !== 3) { const z = p.s * .8 + 1 + p.fl * 1.8; g.fillRect(p.x - z / 2, p.y - z / 2, z, z); }
    g.fillStyle = ACCENT;
    for (const p of P) if (p.slot >= 0 && p.c === 3) { const z = p.s * .8 + 1.1 + p.fl * 1.8; g.fillRect(p.x - z / 2, p.y - z / 2, z, z); }
    if (!still && !formed) {
      g.lineWidth = 1; g.strokeStyle = 'rgba(238,240,255,.5)';
      g.beginPath(); g.arc(lx, ly, RL, 0, 6.2832); g.stroke();
      g.beginPath(); g.moveTo(lx - 6, ly); g.lineTo(lx + 6, ly); g.moveTo(lx, ly - 6); g.lineTo(lx, ly + 6); g.stroke();
    }
    if (!still) { if ((t | 0) % 6 === 0) setUI(); if (!formed && used >= N * .94) complete(); }
  };
  const loop = (t) => { if (vis) frame(t); raf = requestAnimationFrame(loop); };

  layout();
  if (still) { for (const p of P) lock(p); formed = true; for (const p of P) { const s = slots[p.slot]; p.x = s.x; p.y = s.y; } frame(0); hintEl?.remove(); stEl?.remove(); return () => {}; }
  setUI();
  if (coarse) {
    // Only the moving circle captures a touch. Swipes elsewhere remain normal page scrolling.
    touchTarget.style.transform = 'translate3d(-1000px, -1000px, 0)';
    hero.appendChild(touchTarget);
  }
  const placePointer = (e, clampToField = false) => {
    const r = cv.getBoundingClientRect();
    if (!clampToField && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) return;
    lx = Math.max(0, Math.min(w, e.clientX - r.left));
    ly = Math.max(0, Math.min(h, e.clientY - r.top));
    lastMove = performance.now();
  };
  const onMove = (e) => {
    if (e.pointerType === 'touch') {
      if (activePointer !== e.pointerId) return;
      if (Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY) > 6) didDrag = true;
      placePointer(e, true);
      return;
    }
    // Keep the original desktop hover behavior independent from touch interaction.
    if (activePointer !== null) return;
    placePointer(e);
  };
  const onPointerDown = (e) => {
    if (e.pointerType !== 'touch' || e.target.closest('a,button,input,textarea,select')) return;
    activePointer = e.pointerId;
    pointerStartX = e.clientX;
    pointerStartY = e.clientY;
    didDrag = false;
    suppressClick = false;
    placePointer(e, true);
    try { touchTarget.setPointerCapture(e.pointerId); } catch { /* Older browsers may not expose pointer capture. */ }
  };
  const onPointerEnd = (e) => {
    if (activePointer !== e.pointerId) return;
    suppressClick = didDrag;
    activePointer = null;
    didDrag = false;
  };
  const onClick = (e) => {
    if (e.target.closest('a,button') || !hero.contains(e.target)) return;
    if (suppressClick) {
      suppressClick = false;
      e.preventDefault();
      return;
    }
    advance();
  };
  let rt; const onResize = () => { clearTimeout(rt); rt = setTimeout(layout, 150); };
  const mo = new MutationObserver(() => { readCfg(); sIdx = Math.min(sIdx, sentences.length - 1); shown = ''; layout(); setUI(); });
  mo.observe(cv, { attributes: true, attributeFilter: ['data-sentences'] });
  if (stEl) mo.observe(stEl, { attributes: true, attributeFilter: ['data-labels'] });
  if (hintEl) mo.observe(hintEl, { attributes: true, attributeFilter: ['data-hints'] });
  const io = new IntersectionObserver(([en]) => { vis = en.isIntersecting; });
  io.observe(hero);
  addEventListener('pointermove', onMove, { passive: true });
  if (coarse) {
    touchTarget.addEventListener('pointerdown', onPointerDown);
    touchTarget.addEventListener('pointerup', onPointerEnd);
    touchTarget.addEventListener('pointercancel', onPointerEnd);
  }
  addEventListener('resize', onResize);
  hero.addEventListener('click', onClick);
  raf = requestAnimationFrame(loop);
  return () => {
    cancelAnimationFrame(raf); io.disconnect(); mo.disconnect(); clearTimeout(rt);
    removeEventListener('pointermove', onMove);
    if (coarse) {
      touchTarget.removeEventListener('pointerdown', onPointerDown);
      touchTarget.removeEventListener('pointerup', onPointerEnd);
      touchTarget.removeEventListener('pointercancel', onPointerEnd);
      touchTarget.remove();
    }
    removeEventListener('resize', onResize);
    hero.removeEventListener('click', onClick);
  };
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

  let projectStackMotion;
  const ctx = gsap.context(() => {
    if (reduced) return;
    gsap.fromTo('.hz-manifesto .w', { opacity: .14 }, { opacity: 1, ease: 'none', stagger: .12, scrollTrigger: { trigger: '.hz-manifesto', start: 'top 82%', end: 'bottom 46%', scrub: true } });
    const cards = gsap.utils.toArray('.hz-file');
    projectStackMotion = gsap.matchMedia();
    projectStackMotion.add('(min-width: 981px) and (hover: hover) and (pointer: fine)', () => {
      cards.forEach((card, i) => { if (cards[i + 1]) gsap.to(card, { scale: .93, opacity: .5, ease: 'none', transformOrigin: '50% 0', scrollTrigger: { trigger: cards[i + 1], start: 'top 82%', end: 'top 14%', scrub: true } }); });
    });
    gsap.fromTo('.hz-tl-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', transformOrigin: '50% 0', scrollTrigger: { trigger: '.hz-ledger', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    gsap.utils.toArray('.hz-job').forEach((el) => ScrollTrigger.create({ trigger: el, start: 'top 68%', onEnter: () => el.classList.add('is-on'), onLeaveBack: () => el.classList.remove('is-on') }));
    const skew = gsap.quickTo('.hz-skew', 'skewX', { duration: .5, ease: 'power3.out' });
    ScrollTrigger.create({ onUpdate: (s) => skew(gsap.utils.clamp(-9, 9, s.getVelocity() / -260)) });
  });
  off.push(() => { projectStackMotion?.revert(); ctx.revert(); });

  // Tall case files must stay readable: stick them where their bottom edge is visible.
  const fixStick = () => document.querySelectorAll('.hz-file').forEach((el, i) => { el.style.top = `${Math.min(92 + i * 26, innerHeight - el.offsetHeight - 24)}px`; });
  fixStick();
  addEventListener('resize', fixStick);
  const fro = new ResizeObserver(fixStick);
  document.querySelectorAll('.hz-file').forEach((el) => fro.observe(el));
  off.push(() => { removeEventListener('resize', fixStick); fro.disconnect(); });
  const reel = document.querySelector('.hz-reel video');
  if (reel) {
    const hide = () => reel.closest('.hz-reel')?.setAttribute('hidden', '');
    // preload="none" never raises an error event, so ask the server whether the file really exists.
    fetch(reel.currentSrc || reel.src, { method: 'HEAD' }).then((r) => { if (!r.ok || !/video/.test(r.headers.get('content-type') || '')) hide(); }).catch(hide);
    if (reduced) reel.controls = true;
    else { const rio = new IntersectionObserver(([en]) => { if (en.isIntersecting) reel.play().catch(() => {}); else reel.pause(); }, { threshold: .35 }); rio.observe(reel); off.push(() => rio.disconnect()); }
  }
  const tilt = (e) => { const m = e.target.closest?.('.hz-tilt'); if (!m) return; const r = m.getBoundingClientRect(); m.style.setProperty('--tx', `${((e.clientX - r.left) / r.width - .5) * 7}deg`); m.style.setProperty('--ty', `${-((e.clientY - r.top) / r.height - .5) * 6}deg`); };
  const untilt = (e) => { const m = e.target.closest?.('.hz-tilt'); if (m) { m.style.setProperty('--tx', '0deg'); m.style.setProperty('--ty', '0deg'); } };
  if (!coarse && !reduced) { addEventListener('pointermove', tilt, { passive: true }); addEventListener('pointerout', untilt); off.push(() => { removeEventListener('pointermove', tilt); removeEventListener('pointerout', untilt); }); }

  const reveal = () => {
    gsap.from('.hz-meta, .hz-hint, .hz-lead span, .hz-side > *, .hz-state', { y: 32, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .08, delay: .5 });
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
