// Hero dot field. Lighter than before: fewer particles, a lower pixel-ratio cap, and it sleeps while off-screen.
const ACCENT = '#E10600', ICE = '#C0C0C0';
const FIELD_N = (coarse) => (coarse ? 800 : 2000);

// ---- Hero: dots are scattered everywhere. Sweep the circle — every dot it touches locks into a sentence.
//      Click: finish the sentence → next sentence → scatter and start again. ----
export function startField(hero, seed, coarse, still) {
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
    const dpr = Math.min(devicePixelRatio || 1, 1.5), r = cv.getBoundingClientRect();
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
    g.fillStyle = 'rgba(192,192,192,.3)';
    for (const p of P) if (p.slot < 0) g.fillRect(p.x, p.y, p.s, p.s);
    g.fillStyle = ICE;
    for (const p of P) if (p.slot >= 0 && p.c !== 3) { const z = p.s * .8 + 1 + p.fl * 1.8; g.fillRect(p.x - z / 2, p.y - z / 2, z, z); }
    g.fillStyle = ACCENT;
    for (const p of P) if (p.slot >= 0 && p.c === 3) { const z = p.s * .8 + 1.1 + p.fl * 1.8; g.fillRect(p.x - z / 2, p.y - z / 2, z, z); }
    if (!still && !formed) {
      g.lineWidth = 1; g.strokeStyle = 'rgba(192,192,192,.5)';
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

