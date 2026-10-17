import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const TONE = `${import.meta.env.BASE_URL}images/face-tone.png`;
const DOT = ['rgba(238,240,255,.5)', 'rgba(238,240,255,.78)', 'rgba(238,240,255,.97)', '#ffc62e'];
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&@*+<>/';
const NAME = 'MOHAMED RABEA';
const rnd = () => GLYPHS[(Math.random() * GLYPHS.length) | 0];

// Light dots, denser where the portrait is brighter.
async function stipple(step, keep) {
  const img = new Image();
  img.src = TONE;
  await img.decode();
  const c = document.createElement('canvas');
  c.width = img.width; c.height = img.height;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.drawImage(img, 0, 0);
  const d = g.getImageData(0, 0, c.width, c.height).data, pts = [];
  for (let y = 0; y < c.height; y += step) for (let x = 0; x < c.width; x += step) {
    const i = (y * c.width + x) * 4;
    if (d[i + 3] < 140) continue;
    const l = d[i] / 255;
    if (Math.random() < keep * (.03 + .97 * l ** 1.1)) pts.push({ q: [(x + Math.random() * step) / c.width - .5, (y + Math.random() * step) / c.height - .5], c: Math.random() < .03 ? 3 : l > .65 ? 2 : l > .35 ? 1 : 0 });
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

  // Cairo clock
  const clock = hero.querySelector('.hz-clock');
  const fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Cairo' });
  const tickClock = () => { if (clock) clock.textContent = fmt.format(new Date()); };
  tickClock();
  const clockId = setInterval(tickClock, 1000);
  off.push(() => clearInterval(clockId));

  // The name is alive: letters swell wide and light near the cursor.
  const chars = [...hero.querySelectorAll('.hz-ch')];
  let busy = false, px = 0, py = 0;
  const swell = () => {
    busy = false;
    for (const el of chars) {
      const r = el.getBoundingClientRect();
      const t = Math.max(0, 1 - Math.hypot(px - (r.left + r.width / 2), py - (r.top + r.height / 2)) / 360);
      el.style.fontVariationSettings = `'wght' ${Math.round(840 - 440 * t)}, 'wdth' ${Math.round(62 + 78 * t)}`;
    }
  };
  if (chars.length && !coarse && !reduced) {
    const move = (e) => { px = e.clientX; py = e.clientY; if (!busy) { busy = true; requestAnimationFrame(swell); } };
    addEventListener('pointermove', move, { passive: true });
    off.push(() => removeEventListener('pointermove', move));
  }

  const ctx = gsap.context(() => {
    if (reduced) return;
    gsap.to('.hz-word:nth-child(1)', { xPercent: -7, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hz-word:nth-child(2)', { xPercent: 7, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    const skew = gsap.quickTo('.hz-skew', 'skewX', { duration: .5, ease: 'power3.out' });
    ScrollTrigger.create({ onUpdate: (s) => skew(gsap.utils.clamp(-9, 9, s.getVelocity() / -260)) });
  });
  off.push(() => ctx.revert());

  const reveal = () => {
    gsap.from('.hz-hero-name .hz-ch, .hz-hero-name .hz-aw', { yPercent: 118, duration: 1.3, ease: 'expo.out', stagger: .035, delay: .25 });
    gsap.from('.hz-meta, .hz-lead span, .hz-side > *, .hz-badge', { y: 30, opacity: 0, duration: 1, ease: 'expo.out', stagger: .07, delay: .55 });
  };
  if (reduced) return () => { dead = true; off.forEach((f) => f()); };

  // ---- Intro: name scrambles → resolves → collapses → dots find a face → we go in through the eye ----
  root.classList.add('hz-intro');
  const cv = Object.assign(document.createElement('canvas'), { className: 'hz-fx' });
  const g = cv.getContext('2d');
  const cur = document.createElement('div');
  cur.className = 'hz-curtain';
  cur.innerHTML = '<div class="hz-top"><span>Field record</span><span>Cairo · EG</span></div><div class="hz-name" aria-hidden="true"></div><div class="hz-bottom"><b class="hz-count">000</b><button class="hz-skip" type="button">Skip</button></div>';
  document.body.append(cur, cv);
  const nameEl = cur.querySelector('.hz-name'), count = cur.querySelector('.hz-count');
  const L = [...NAME].map((ch) => { const s = document.createElement('i'); s.className = ch === ' ' ? 'sp' : 'ch'; s.textContent = ch === ' ' ? '' : rnd(); nameEl.append(s); return s; });

  let vw = 0, vh = 0, P = [], raf = 0, phase = 'scramble', prog = 0, mx = -999, my = -999, done = false;
  const T0 = performance.now(), total = 6000, timers = [];
  const size = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    vw = innerWidth; vh = innerHeight;
    cv.width = vw * dpr; cv.height = vh * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const faceSize = () => Math.min(vh * .78, vw * .9, 700);
  const aim = () => { const s = faceSize(); for (const p of P) { p.tx = vw / 2 + p.q[0] * s; p.ty = vh * .5 + p.q[1] * s; } };
  const pts = stipple(coarse ? 2 : 1, coarse ? 1 : .6);

  const draw = (t) => {
    g.clearRect(0, 0, vw, vh);
    if (!P.length) return;
    const k = phase === 'gather' ? .006 + .02 * prog ** 1.2 : phase === 'burst' ? .004 : 0;
    const sw = phase === 'gather' ? (1 - prog) * .28 : 0;
    let last = -1;
    for (const p of P) {
      const dx = mx - p.x, dy = my - p.y, d2 = dx * dx + dy * dy;
      if (d2 < 15000) { const d = Math.sqrt(d2) || 1, f = (1 - d2 / 15000) * 2.6; p.vx -= dx / d * f; p.vy -= dy / d * f; }
      p.vx += (p.tx - p.x) * k + Math.sin(t * .0017 + p.y * .013) * sw;
      p.vy += (p.ty - p.y) * k + Math.cos(t * .0015 + p.x * .011) * sw;
      p.vx *= .88; p.vy *= .88; p.x += p.vx; p.y += p.vy;
      if (p.c !== last) { g.fillStyle = DOT[p.c]; last = p.c; }
      g.fillRect(p.x, p.y, p.s, p.s);
    }
  };
  const loop = (t) => {
    const el = performance.now() - T0;
    prog = Math.min(1, el / total);
    count.textContent = String(Math.round(prog * 100)).padStart(3, '0');
    if (phase === 'scramble') L.forEach((s, i) => {                       // letters flicker, then lock in left → right
      if (s.classList.contains('sp') || s.classList.contains('is-set')) return;
      if (el > 500 + i * 105) { s.textContent = NAME[i]; s.classList.add('is-set'); } else if ((el / 45 | 0) !== s._f) { s._f = el / 45 | 0; s.textContent = rnd(); }
    });
    draw(t);
    raf = requestAnimationFrame(loop);
  };

  const collapse = async () => {
    phase = 'collapse';
    const rects = L.filter((s) => s.classList.contains('ch')).map((s) => s.getBoundingClientRect());
    const pt = await pts; if (dead) return;
    P = pt.map((p) => { const r = rects[(Math.random() * rects.length) | 0]; return { ...p, s: coarse ? 1.6 : 1.3 + Math.random() * .8, x: r.left + Math.random() * r.width, y: r.top + Math.random() * r.height, vx: 0, vy: 0, tx: 0, ty: 0 }; }).sort((a, b) => a.c - b.c);
    aim();
    gsap.to(L, { x: (i, el) => vw / 2 - (el.getBoundingClientRect().left + el.offsetWidth / 2), scale: 0, opacity: 0, duration: .75, ease: 'power3.in', stagger: { each: .03, from: 'edges' } });
    timers.push(setTimeout(() => { phase = 'gather'; }, 500));
  };

  const finish = () => {
    if (done || dead) return;
    done = true; phase = 'burst';
    for (const p of P) { const a = Math.atan2(p.y - vh * .5, p.x - vw / 2), r = 200 + Math.random() * 600; p.tx = p.x + Math.cos(a) * r; p.ty = p.y + Math.sin(a) * r; }
    root.classList.remove('hz-intro');
    reveal();
    gsap.fromTo(cur, { clipPath: 'circle(150% at 50% 42%)' }, { clipPath: 'circle(0% at 50% 42%)', duration: 1.35, ease: 'expo.inOut', onComplete: () => { cur.remove(); startScroll(); } });
    gsap.to(cv, { opacity: 0, duration: 1, ease: 'power2.in', onComplete: () => { cancelAnimationFrame(raf); cv.remove(); } });
  };

  const onMove = (e) => { mx = e.clientX; my = e.clientY; };
  const onResize = () => { size(); aim(); };
  const onKey = (e) => { if (e.key === 'Escape') finish(); };
  size();
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('resize', onResize);
  addEventListener('keydown', onKey);
  cur.querySelector('.hz-skip').addEventListener('click', finish);
  raf = requestAnimationFrame(loop);
  timers.push(setTimeout(collapse, 2700), setTimeout(finish, total + 600));
  pts.catch(() => finish());

  return () => {
    dead = true;
    cancelAnimationFrame(raf); timers.forEach(clearTimeout);
    removeEventListener('pointermove', onMove); removeEventListener('resize', onResize); removeEventListener('keydown', onKey);
    off.forEach((f) => f());
    if (tick) gsap.ticker.remove(tick);
    lenis?.destroy();
    cv.remove(); cur.remove();
    root.classList.remove('hz-intro');
  };
}
