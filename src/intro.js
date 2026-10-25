// Intro: noise → the name, drawn upright and revealed left→right → the name turns into dots,
// again left→right, a column at a time → the dots flow into a halftone portrait, left→right → we go in.
// One 2D canvas, no WebGL, no animation library.
const TONE = `${import.meta.env.BASE_URL}images/face-tone.png`;
const SI = '#C0C0C0', RED = '#E10600';
const NAME = 'MOHAMED RABEA';
const out = (t) => 1 - (1 - t) ** 3;
const inOut = (t) => (t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const clamp01 = (t) => Math.max(0, Math.min(1, t));

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

// A hex halftone: dot size follows the picture's brightness.
function halftone(tone, S, P) {
  const pts = [];
  let row = 0;
  for (let y = P / 2; y < S; y += P * .866, row++) {
    for (let x = P / 2 + (row % 2 ? P / 2 : 0); x < S; x += P) {
      const tx = Math.min(tone.w - 1, (x / S * tone.w) | 0), ty = Math.min(tone.h - 1, (y / S * tone.h) | 0), i = (ty * tone.w + tx) * 4;
      if (tone.d[i + 3] < 140) continue;
      const u = x / S, v = y / S, e = Math.min(1, u / .08, (1 - u) / .08, (1 - v) / .2), f = e * e * (3 - 2 * e);
      const r = P * .5 * Math.sqrt(tone.d[i] / 255) * .96 * f;
      if (r > .42) pts.push({ q: [u - .5, v - .5], r, c: Math.random() < .006 ? 1 : 0 });
    }
  }
  return pts;
}

export function runIntro({ coarse = false, onReveal, onFinish }) {
  const root = document.documentElement;
  root.classList.add('hz-intro');
  const cur = document.createElement('div');
  cur.className = 'hz-curtain';
  cur.innerHTML = '<div class="ec-intro-glow"></div><canvas class="hz-fx"></canvas><div class="hz-top"><span>Field record</span><span>Cairo · EG</span></div><div class="hz-bottom"><b class="hz-count">000</b><button class="hz-skip" type="button">Skip</button></div>';
  document.body.append(cur);
  const cv = cur.querySelector('canvas'), g = cv.getContext('2d');
  const count = cur.querySelector('.hz-count'), glow = cur.querySelector('.ec-intro-glow');

  // Timeline (ms)
  const T = { nameFrom: 500, nameTo: 1700, convFrom: 2200, convTo: 3900, gatherFrom: 4300, gatherSpan: 2300, total: 7400 };
  let vw = 0, vh = 0, S = 600, PG = 5, P = [], noise = [], raf = 0, done = false, dead = false, mx = -999, my = -999;
  let nameBox = null, lastCount = '', lastGlow = -1;
  const T0 = performance.now(), timers = [];
  const dpr = () => Math.min(devicePixelRatio || 1, 1.5);

  const size = () => { const d = dpr(); vw = innerWidth; vh = innerHeight; cv.width = vw * d; cv.height = vh * d; g.setTransform(d, 0, 0, d, 0, 0); };
  const portraitBox = () => { S = Math.min(vh * .74, vw * .92, coarse ? 460 : 640); PG = Math.max(3.2, Math.min(5.4, S / 120)); };
  const aim = () => { portraitBox(); for (const p of P) { p.tx = vw / 2 + p.q[0] * S; p.ty = vh * .46 + p.q[1] * S; } };
  const setFont = (px) => { g.font = `800 ${px}px Anybody, system-ui, sans-serif`; try { g.fontStretch = 'semi-condensed'; g.letterSpacing = `${Math.round(px * .02)}px`; } catch { /* optional */ } };

  // Layout of the name + the dot shape it is made of.
  const buildName = (nPts) => {
    let px = Math.min(vh * .2, 150);
    do { setFont(px); px *= .95; } while (g.measureText(NAME).width > vw * .84 && px > 24);
    px /= .95; setFont(px);
    const w = g.measureText(NAME).width, cx = vw / 2, cy = vh * .46;
    const left = cx - w / 2, h = px * 1.3, top = cy - h / 2;
    // sample the text pixels on a small offscreen canvas
    const c = document.createElement('canvas'); c.width = Math.ceil(w + 24); c.height = Math.ceil(h);
    const x = c.getContext('2d', { willReadFrequently: true });
    x.font = g.font; try { x.fontStretch = 'semi-condensed'; x.letterSpacing = `${Math.round(px * .02)}px`; } catch { /* optional */ }
    x.fillStyle = '#fff'; x.textBaseline = 'middle'; x.fillText(NAME, 12, h / 2);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let area = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 128) area++;
    let step = Math.max(1.2, Math.sqrt(area / (nPts * 1.15))), pts = [];
    for (let a = 0; a < 8; a++) {
      pts = [];
      for (let yy = 0; yy < c.height; yy += step) for (let xx = 0; xx < c.width; xx += step) {
        const qx = Math.min(c.width - 1, Math.round(xx + (Math.random() - .5) * step * .6)), qy = Math.min(c.height - 1, Math.round(yy + (Math.random() - .5) * step * .6));
        if (d[(qy * c.width + qx) * 4 + 3] > 128) pts.push([left - 12 + qx, top + qy]);
      }
      if (pts.length >= nPts) break;
      step *= .9;
    }
    for (let i = pts.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [pts[i], pts[j]] = [pts[j], pts[i]]; }
    nameBox = { px, left, cy, w };
    return pts;
  };

  const draw = (now) => {
    const t = now - T0;
    g.clearRect(0, 0, vw, vh);

    // noise: scattered specks that settle as the portrait forms
    const settle = clamp01((t - T.gatherFrom) / T.gatherSpan);
    if (settle < 1) {
      g.fillStyle = `rgba(192,192,192,${(.3 * (1 - settle)).toFixed(3)})`;
      for (const n of noise) { n.x += n.vx; n.y += n.vy; if (n.x < 0) n.x = vw; else if (n.x > vw) n.x = 0; if (n.y < 0) n.y = vh; else if (n.y > vh) n.y = 0; g.fillRect(n.x, n.y, n.s, n.s); }
    }

    // signal: a red line that starts as noise and becomes straight once the name is drawn
    const amp = 16 * (1 - out(clamp01((t - 200) / (T.nameTo - 200))));
    if (t < T.gatherFrom + 400) {
      g.strokeStyle = 'rgba(225,6,0,.85)'; g.lineWidth = 1.3; g.beginPath();
      const y0 = vh * .86;
      for (let x = 0; x <= vw; x += 8) {
        const n = Math.sin(x * .045 + t * .012) * .5 + Math.sin(x * .11 - t * .021) * .35 + Math.sin(x * .27 + t * .04) * .15;
        const edge = Math.min(1, x / (vw * .15), (vw - x) / (vw * .15));
        const y = y0 + n * amp * edge;
        if (x) g.lineTo(x, y); else g.moveTo(x, y);
      }
      g.stroke();
    }

    if (!nameBox) return;
    const { left, w, cy, px } = nameBox;
    const band = Math.max(60, w * .09);
    // 1. the name is drawn upright, left → right
    const rev = out(clamp01((t - T.nameFrom) / (T.nameTo - T.nameFrom)));
    // 2. then it turns into dots, left → right
    const conv = inOut(clamp01((t - T.convFrom) / (T.convTo - T.convFrom)));
    const front = left - band + conv * (w + band * 2);            // where the dots begin
    if (t < T.convTo + 200) {
      setFont(px); g.textBaseline = 'middle'; g.textAlign = 'left';
      const reach = left + rev * w;                                  // how far the name has been drawn
      g.save();
      g.beginPath(); g.rect(0, 0, Math.min(reach, vw), vh); g.clip();
      const gr = g.createLinearGradient(front, 0, front + band, 0);
      gr.addColorStop(0, 'rgba(192,192,192,0)'); gr.addColorStop(1, SI);
      g.fillStyle = conv > 0 ? gr : SI;
      g.fillText(NAME, left, cy);
      g.restore();
      if (rev < 1) { g.fillStyle = 'rgba(225,6,0,.9)'; g.fillRect(reach - 1, cy - px * .62, 2, px * 1.24); }
      if (conv > 0 && conv < 1) { g.fillStyle = 'rgba(225,6,0,.55)'; g.fillRect(front + band * .5 - 1, cy - px * .62, 2, px * 1.24); }
    }

    if (!P.length) return;
    // 3. the dots: each one wakes when the front passes it, and (later) leaves for the portrait, again left → right
    const gt = t - T.gatherFrom;
    const buckets = [[], [], [], [], [], [], [], [], [], [], [], []], acc = [];
    for (const p of P) {
      if (!p.on) { if (p.sx <= front + band * .5 && conv > 0) { p.on = true; p.vx = (Math.random() - .5) * 2.4; p.vy = (Math.random() - .5) * 2.4; } else continue; }
      if (gt > 0) {
        const wait = (p.sx - left) / w * 900, k = Math.min(.03, Math.max(0, gt - wait) / 2400 * .03);
        if (gt > wait) {
          const dx = mx - p.x, dy = my - p.y, d2 = dx * dx + dy * dy;
          if (d2 < 15000) { const d = Math.sqrt(d2) || 1, f = (1 - d2 / 15000) * 2.2; p.vx -= dx / d * f; p.vy -= dy / d * f; }
          p.vx += (p.tx - p.x) * (.004 + k); p.vy += (p.ty - p.y) * (.004 + k);
          p.cr += (p.r - p.cr) * .05;
        }
      }
      p.vx *= .9; p.vy *= .9; p.x += p.vx; p.y += p.vy;
      (p.c ? acc : buckets[Math.min(11, (p.cr * 2.6) | 0)]).push(p);
    }
    g.fillStyle = SI;
    for (const b of buckets) { if (!b.length) continue; g.beginPath(); for (const p of b) { g.moveTo(p.x + p.cr, p.y); g.arc(p.x, p.y, p.cr, 0, 6.2832); } g.fill(); }
    if (acc.length) { g.fillStyle = RED; g.beginPath(); for (const p of acc) { g.moveTo(p.x + p.cr, p.y); g.arc(p.x, p.y, p.cr, 0, 6.2832); } g.fill(); }
  };

  const loop = (now) => {
    if (dead) return;
    const t = now - T0, c = String(Math.round(clamp01(t / T.total) * 100)).padStart(3, '0');
    if (c !== lastCount) { count.textContent = c; lastCount = c; }
    const o = +clamp01((t - T.gatherFrom) / T.gatherSpan).toFixed(2);
    if (o !== lastGlow) { lastGlow = o; glow.style.opacity = o; }
    draw(now);
    raf = requestAnimationFrame(loop);
  };

  const finish = () => {
    if (done || dead) return;
    done = true;
    const step = Math.max(1, Math.floor(P.length / 2000));
    const seed = P.filter((p, i) => p.on && i % step === 0).slice(0, 2000).map((p) => ({ x: p.x, y: p.y, vx: p.vx, vy: p.vy }));
    root.classList.remove('hz-intro');
    onFinish?.(seed.length ? seed : null);
    timers.push(setTimeout(() => onReveal?.(), 420));
    const D = 2 * 1.5 * Math.sqrt((vw * vw + vh * vh) / 2);
    const ring = document.createElement('div');
    ring.className = 'ec-wipe-ring'; ring.style.width = ring.style.height = `${D}px`;
    document.body.append(ring);
    const ease = 'cubic-bezier(.76,0,.24,1)';
    ring.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(.001)', opacity: 1, offset: .88 }, { transform: 'translate(-50%,-50%) scale(.001)', opacity: 0 }], { duration: 1250, easing: ease, fill: 'forwards' }).onfinish = () => ring.remove();
    cur.animate([{ clipPath: 'circle(150% at 50% 42%)' }, { clipPath: 'circle(0% at 50% 42%)' }], { duration: 1250, easing: ease, fill: 'forwards' }).onfinish = () => { cancelAnimationFrame(raf); cur.remove(); };
  };

  const onMove = (e) => { mx = e.clientX; my = e.clientY; };
  const onResize = () => { size(); if (P.length) aim(); };
  const onKey = (e) => { if (e.key === 'Escape') finish(); };
  size();
  noise = Array.from({ length: coarse ? 90 : 200 }, () => ({ x: Math.random() * vw, y: Math.random() * vh, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, s: Math.random() < .2 ? 2 : 1.2 }));
  addEventListener('pointermove', onMove, { passive: true });
  addEventListener('resize', onResize);
  addEventListener('keydown', onKey);
  cur.querySelector('.hz-skip').addEventListener('click', finish);

  // Everything the dots need: the portrait tone map and the font. Drawing starts straight away; the dots join in once ready.
  (async () => {
    raf = requestAnimationFrame(loop);
    try { await Promise.race([document.fonts.load('800 100px Anybody'), new Promise((r) => setTimeout(r, 1500))]); } catch { /* fall back to system-ui */ }
    const tone = await loadTone();
    if (dead || done) return;
    portraitBox();
    const pts = halftone(tone, S, PG);
    const shape = buildName(pts.length);
    P = pts.map((p, i) => { const q = shape[i % shape.length] || [vw / 2, vh / 2]; return { ...p, cr: 1.15 + Math.random() * .45, x: q[0], y: q[1], sx: q[0], vx: 0, vy: 0, tx: q[0], ty: q[1], on: false }; });
    aim();
  })().catch(() => finish());
  timers.push(setTimeout(finish, T.total + 400));

  return () => {
    dead = true; cancelAnimationFrame(raf); timers.forEach(clearTimeout);
    removeEventListener('pointermove', onMove); removeEventListener('resize', onResize); removeEventListener('keydown', onKey);
    cur.remove(); root.classList.remove('hz-intro');
  };
}
