import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const TONE = `${import.meta.env.BASE_URL}images/face-tone.png`;
const DOT = ['rgba(238,240,255,.46)', 'rgba(238,240,255,.76)', 'rgba(238,240,255,.98)', '#ffc62e'];
const NAME = 'MOHAMED RABEA';
const GLYPHS = [...NAME.replace(/\s/g, '')];
const FIELD_COUNT = (coarse) => (coarse ? 420 : 1400);
const rng = (seed) => () => {
  seed |= 0;
  seed = seed + 0x6D2B79F5 | 0;
  let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
const shuffle = (items) => {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = (Math.random() * (i + 1)) | 0;
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
};

// Read a grayscale portrait into a bounded particle field; preserve the image aspect ratio.
async function stipple(step, keep, maximum) {
  const img = new Image();
  img.src = TONE;
  await img.decode();
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const { width, height } = canvas;
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const points = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      if (pixels[index + 3] < 140) continue;
      const luminance = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / (3 * 255);
      if (Math.random() < keep * (0.025 + 0.975 * luminance ** 1.1)) {
        points.push({
          q: [(x + Math.random() * step) / width - 0.5, ((y + Math.random() * step) / height - 0.5) * height / width],
          c: Math.random() < 0.035 ? 3 : luminance > 0.66 ? 2 : luminance > 0.34 ? 1 : 0,
        });
      }
    }
  }
  if (points.length > maximum) {
    const stride = points.length / maximum;
    return { points: Array.from({ length: maximum }, (_, i) => points[Math.floor(i * stride)]), aspect: height / width };
  }
  return { points, aspect: height / width };
}

// Cursor lens: particles are noisy until the pointer brings their hidden structure into focus.
function startField(hero, seed, coarse, still) {
  const canvas = hero.querySelector('.hz-field');
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const count = FIELD_COUNT(coarse);
  const stateEl = hero.querySelector('.hz-state');
  const stateNumber = stateEl?.querySelector('b');
  const stateLabel = stateEl?.querySelector('span');
  const labels = (stateEl?.dataset.labels || 'Noise|Signal|Structure').split('|');
  let width = 0;
  let height = 0;
  let state = still ? 2 : 0;
  let stateStartedAt = performance.now();
  let cursorX = -9999;
  let cursorY = -9999;
  let lastMove = -1e9;
  let raf = 0;
  let visible = true;
  let disposed = false;
  const targets = [[], [], []];
  const particles = Array.from({ length: count }, (_, i) => ({
    i,
    x: seed?.[i]?.x ?? Math.random() * innerWidth,
    y: seed?.[i]?.y ?? Math.random() * innerHeight,
    vx: seed?.[i]?.vx || 0,
    vy: seed?.[i]?.vy || 0,
    hx: 0,
    hy: 0,
    phase: Math.random() * Math.PI * 2,
    size: 1 + Math.random() * 1.3,
    accent: Math.random() < 0.065,
    order: 0,
  }));

  const updateLabel = () => {
    if (stateNumber) stateNumber.textContent = `0${state + 1} / 03`;
    if (stateLabel) stateLabel.textContent = labels[state] || '';
  };

  const layout = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const random = rng(1103 + Math.round(width) * 3 + Math.round(height));
    const columns = Math.max(1, Math.ceil(Math.sqrt(count * width / Math.max(height, 1))));
    const rows = Math.ceil(count / columns);
    const sx = width / columns;
    const sy = height / rows;
    const bars = coarse ? 12 : 22;
    const pitch = width * 0.86 / bars;
    const barWidth = pitch * 0.56;
    const heights = Array.from({ length: bars }, (_, b) => 0.22 + 0.78 * Math.abs(Math.sin(b * 1.7 + 0.6) * Math.cos(b * 0.47)));
    const heightSum = heights.reduce((a, b) => a + b, 0);
    const nodes = [
      [0.10, 0.50], [0.31, 0.50],
      [0.53, 0.25], [0.53, 0.50], [0.53, 0.75],
      [0.83, 0.25], [0.83, 0.50], [0.83, 0.75],
    ];
    const edges = [[0, 1], [1, 2], [1, 3], [1, 4], [2, 5], [3, 6], [4, 7]];
    const nodeParticleCount = Math.floor(count * 0.18);
    particles.forEach((p) => {
      p.hx = random() * width;
      p.hy = random() * height;
      targets[0][p.i] = [
        (p.i % columns + 0.18 + random() * 0.64) * sx,
        (Math.floor(p.i / columns) + 0.18 + random() * 0.64) * sy,
      ];
      let weight = random() * heightSum;
      let bar = 0;
      while (weight > heights[bar] && bar < bars - 1) { weight -= heights[bar]; bar += 1; }
      targets[1][p.i] = [
        width * 0.07 + bar * pitch + (pitch - barWidth) / 2 + random() * barWidth,
        height * 0.88 - random() * heights[bar] * height * 0.65,
      ];
      if (p.i < nodeParticleCount) {
        const node = nodes[Math.min(nodes.length - 1, Math.floor(p.i * nodes.length / nodeParticleCount))];
        const spread = Math.min(width, height) * 0.018;
        targets[2][p.i] = [node[0] * width + (random() - 0.5) * spread, node[1] * height + (random() - 0.5) * spread];
      } else {
        const particleIndex = p.i - nodeParticleCount;
        const edgeIndex = particleIndex % edges.length;
        const edgeRank = Math.floor(particleIndex / edges.length);
        const edgePopulation = Math.ceil((count - nodeParticleCount) / edges.length);
        const progress = Math.max(0.025, Math.min(0.975, (edgeRank + 0.5 + (random() - 0.5) * 0.3) / edgePopulation));
        const [fromIndex, toIndex] = edges[edgeIndex];
        const from = [nodes[fromIndex][0] * width, nodes[fromIndex][1] * height];
        const to = [nodes[toIndex][0] * width, nodes[toIndex][1] * height];
        const dx = to[0] - from[0], dy = to[1] - from[1];
        const length = Math.hypot(dx, dy) || 1;
        const jitter = (random() - 0.5) * 3;
        targets[2][p.i] = [from[0] + dx * progress - (dy / length) * jitter, from[1] + dy * progress + (dx / length) * jitter];
      }
    });
    if (still) {
      particles.forEach((p) => { [p.x, p.y] = targets[state][p.i]; p.order = 1; });
    }
  };

  const frame = (time) => {
    if (disposed || !width || !height) return;
    ctx.clearRect(0, 0, width, height);
    const elapsed = time - stateStartedAt;
    if (!still && elapsed > 7600) {
      state = (state + 1) % 3;
      stateStartedAt = time;
      updateLabel();
    }
    if (!still && time - lastMove > (coarse ? 2400 : 3200)) {
      cursorX = width * (0.5 + 0.28 * Math.sin(time * 0.00023));
      cursorY = height * (0.48 + 0.22 * Math.sin(time * 0.00031 + 1.4));
    }
    const lensRadius = Math.min(width, height) * (coarse ? 0.29 : 0.23);
    for (const p of particles) {
      if (!still) {
        p.vx += Math.sin(p.y * 0.007 + time * 0.00048 + p.phase) * 0.026 + (p.hx - p.x) * 0.00028;
        p.vy += Math.cos(p.x * 0.007 - time * 0.0004 + p.phase) * 0.026 + (p.hy - p.y) * 0.00028;
        const dx = cursorX - p.x;
        const dy = cursorY - p.y;
        const distanceSq = dx * dx + dy * dy;
        if (distanceSq < lensRadius * lensRadius) {
          const proximity = 1 - Math.sqrt(distanceSq) / lensRadius;
          const target = targets[state][p.i];
          p.vx += (target[0] - p.x) * 0.036 * proximity;
          p.vy += (target[1] - p.y) * 0.036 * proximity;
          p.order = proximity;
        } else {
          p.order *= 0.88;
        }
        p.vx *= 0.93;
        p.vy *= 0.93;
        p.x += p.vx;
        p.y += p.vy;
      }
    }
    ctx.fillStyle = DOT[0];
    for (const p of particles) if (p.order < 0.25) ctx.fillRect(p.x, p.y, p.size, p.size);
    ctx.fillStyle = DOT[2];
    for (const p of particles) if (p.order >= 0.25 && !p.accent) ctx.fillRect(p.x, p.y, p.size + 0.35, p.size + 0.35);
    ctx.fillStyle = DOT[3];
    for (const p of particles) if (p.order >= 0.25 && p.accent) ctx.fillRect(p.x, p.y, p.size + 0.6, p.size + 0.6);
    if (!still) {
      // The lens reveals a different idea at each step: data grid, analytical chart, decision flow.
      ctx.save();
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, lensRadius, 0, Math.PI * 2);
      ctx.clip();
      ctx.lineWidth = 1;
      if (state === 0) {
        ctx.strokeStyle = 'rgba(238,240,255,0.105)';
        for (let row = 1; row < 8; row += 1) {
          const y = height * row / 8;
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
        for (let col = 1; col < 14; col += 1) {
          const x = width * col / 14;
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
      } else if (state === 1) {
        ctx.strokeStyle = 'rgba(238,240,255,0.32)';
        ctx.beginPath();
        ctx.moveTo(width * 0.07, height * 0.20);
        ctx.lineTo(width * 0.07, height * 0.88);
        ctx.lineTo(width * 0.94, height * 0.88);
        ctx.stroke();
        ctx.strokeStyle = 'rgba(245,194,66,0.45)';
        ctx.beginPath();
        ctx.moveTo(width * 0.13, height * 0.69);
        ctx.lineTo(width * 0.31, height * 0.59);
        ctx.lineTo(width * 0.49, height * 0.64);
        ctx.lineTo(width * 0.67, height * 0.38);
        ctx.lineTo(width * 0.86, height * 0.28);
        ctx.stroke();
      } else {
        const nodes = [
          [0.10, 0.50], [0.31, 0.50],
          [0.53, 0.25], [0.53, 0.50], [0.53, 0.75],
          [0.83, 0.25], [0.83, 0.50], [0.83, 0.75],
        ];
        const edges = [[0, 1], [1, 2], [1, 3], [1, 4], [2, 5], [3, 6], [4, 7]];
        ctx.strokeStyle = 'rgba(238,240,255,0.29)';
        ctx.beginPath();
        edges.forEach(([from, to]) => {
          ctx.moveTo(nodes[from][0] * width, nodes[from][1] * height);
          ctx.lineTo(nodes[to][0] * width, nodes[to][1] * height);
        });
        ctx.stroke();
        nodes.forEach(([x, y], index) => {
          ctx.beginPath();
          ctx.arc(x * width, y * height, index === 0 || index === 7 ? 4 : 3, 0, Math.PI * 2);
          ctx.fillStyle = index === 1 || index > 4 ? 'rgba(245,194,66,0.9)' : 'rgba(238,240,255,0.88)';
          ctx.fill();
        });
      }
      ctx.restore();
      // A short rim denotes the moving lens; particles do not assemble into a meaningless circle.
      ctx.strokeStyle = 'rgba(238,240,255,0.13)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, lensRadius, -0.22, 1.05);
      ctx.stroke();
    }
  };

  const loop = (time) => {
    if (!visible || disposed) { raf = requestAnimationFrame(loop); return; }
    frame(time);
    if (!still) raf = requestAnimationFrame(loop);
  };
  layout();
  updateLabel();
  if (still) { frame(performance.now()); return () => { disposed = true; cancelAnimationFrame(raf); }; }

  const onMove = (event) => {
    const rect = canvas.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      cursorX = -9999; cursorY = -9999;
      lastMove = performance.now();
      return;
    }
    cursorX = event.clientX - rect.left;
    cursorY = event.clientY - rect.top;
    lastMove = performance.now();
  };
  const onClick = (event) => {
    if (event.target.closest?.('a,button,input,textarea,select')) return;
    if (!hero.contains(event.target)) return;
    state = (state + 1) % 3;
    stateStartedAt = performance.now();
    updateLabel();
  };
  let resizeTimer;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(layout, 120);
  };
  const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; });
  observer.observe(hero);
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('resize', onResize);
  hero.addEventListener('click', onClick);
  raf = requestAnimationFrame(loop);
  return () => {
    disposed = true;
    cancelAnimationFrame(raf);
    observer.disconnect();
    window.clearTimeout(resizeTimer);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('resize', onResize);
    hero.removeEventListener('click', onClick);
  };
}

export function startHorizon() {
  const root = document.documentElement;
  const hero = document.querySelector('.hero');
  if (!hero) return () => {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const off = [];
  let lenis;
  let tick;
  let dead = false;
  let stopField = null;
  let introCleanup = null;

  const startScroll = () => {
    if (reduced || coarse || lenis || dead) return;
    lenis = new Lenis({ lerp: 0.085, anchors: { offset: -84 } });
    lenis.on('scroll', ScrollTrigger.update);
    tick = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
  };
  const beginField = (seed) => {
    if (!stopField && !dead) stopField = startField(hero, seed, coarse, false);
  };

  const spotlight = (event) => {
    const element = event.target.closest?.('.hz-spot');
    if (!element) return;
    const rect = element.getBoundingClientRect();
    element.style.setProperty('--sx', `${event.clientX - rect.left}px`);
    element.style.setProperty('--sy', `${event.clientY - rect.top}px`);
  };
  window.addEventListener('pointermove', spotlight, { passive: true });
  off.push(() => window.removeEventListener('pointermove', spotlight));

  // Cairo clock
  const clock = hero.querySelector('.hz-clock');
  const formatClock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Africa/Cairo' });
  const updateClock = () => { if (clock) clock.textContent = formatClock.format(new Date()); };
  updateClock();
  const clockId = window.setInterval(updateClock, 1000);
  off.push(() => window.clearInterval(clockId));

  const scrollContext = gsap.context(() => {
    if (reduced) return;
    gsap.fromTo('.hz-manifesto .w', { opacity: 0.14 }, { opacity: 1, ease: 'none', stagger: 0.12, scrollTrigger: { trigger: '.hz-manifesto', start: 'top 82%', end: 'bottom 46%', scrub: true } });
    const cards = gsap.utils.toArray('.hz-card');
    cards.forEach((card, index) => {
      if (cards[index + 1]) gsap.to(card, { scale: 0.93, opacity: 0.5, ease: 'none', transformOrigin: '50% 0', scrollTrigger: { trigger: cards[index + 1], start: 'top 82%', end: 'top 14%', scrub: true } });
    });
    gsap.fromTo('.hz-tl-line', { scaleY: 0 }, { scaleY: 1, ease: 'none', transformOrigin: '50% 0', scrollTrigger: { trigger: '.hz-ledger', start: 'top 70%', end: 'bottom 60%', scrub: true } });
    gsap.utils.toArray('.hz-job').forEach((element) => ScrollTrigger.create({
      trigger: element,
      start: 'top 68%',
      onEnter: () => element.classList.add('is-on'),
      onLeaveBack: () => element.classList.remove('is-on'),
    }));
    const skew = gsap.quickTo('.hz-skew', 'skewX', { duration: 0.5, ease: 'power3.out' });
    ScrollTrigger.create({ onUpdate: (scroll) => skew(gsap.utils.clamp(-9, 9, scroll.getVelocity() / -260)) });
  });
  off.push(() => scrollContext.revert());

  const reveal = () => {
    if (reduced) return;
    gsap.from('.hz-meta, .hz-hint, .hz-lead span, .hz-side > *, .hz-state', {
      y: 28, opacity: 0, duration: 1, ease: 'expo.out', stagger: 0.075, delay: 0.3,
    });
  };

  const cleanupShared = () => {
    off.forEach((dispose) => dispose());
    if (tick) gsap.ticker.remove(tick);
    lenis?.destroy();
  };

  // Reduced-motion users get the same interactive composition without the cinematic sequence.
  if (reduced) {
    stopField = startField(hero, null, coarse, true);
    return () => {
      dead = true;
      stopField?.();
      cleanupShared();
    };
  }

  // Cinematic intro: a single letter changes through the name, expands into the full name,
  // dissolves into dots, those dots converge into the portrait, then the curtain opens.
  root.classList.add('hz-intro');
  const canvas = Object.assign(document.createElement('canvas'), { className: 'hz-fx' });
  const draw = canvas.getContext('2d');
  const curtain = document.createElement('div');
  curtain.className = 'hz-curtain';
  curtain.innerHTML = '<div class="hz-top"><span>FIELD STUDY / 01</span><span>CAIRO · EG</span></div><div class="hz-one" aria-hidden="true"></div><div class="hz-name" aria-hidden="true"></div><div class="hz-bottom"><b class="hz-count">000</b><button class="hz-skip" type="button">Skip intro</button></div>';
  document.body.append(curtain, canvas);
  const one = curtain.querySelector('.hz-one');
  const nameElement = curtain.querySelector('.hz-name');
  const counter = curtain.querySelector('.hz-count');
  const letters = [...NAME].map((character) => {
    const element = document.createElement('i');
    element.className = character === ' ' ? 'sp' : 'ch';
    element.textContent = character === ' ' ? '' : character;
    nameElement.append(element);
    return element;
  });
  const nameLetters = letters.filter((element) => element.classList.contains('ch'));
  const portraitPromise = stipple(coarse ? 3 : 2, coarse ? 0.95 : 0.7, coarse ? 1800 : 6200);

  let viewportWidth = 0;
  let viewportHeight = 0;
  let particles = [];
  let raf = 0;
  let phase = 'letters';
  let gatherStartedAt = 0;
  let gatheringProgress = 0;
  let mouseX = -9999;
  let mouseY = -9999;
  let finished = false;
  const startedAt = performance.now();
  const introDuration = 8000;
  const timers = [];
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    canvas.width = Math.max(1, Math.round(viewportWidth * dpr));
    canvas.height = Math.max(1, Math.round(viewportHeight * dpr));
    draw?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  const faceScale = (aspect) => Math.min(viewportWidth * 0.88, viewportHeight * 0.78 / Math.max(aspect, 0.2), 700);
  const aimPortrait = (aspect) => {
    const scale = faceScale(aspect);
    for (const particle of particles) {
      particle.tx = viewportWidth / 2 + particle.q[0] * scale;
      particle.ty = viewportHeight / 2 + particle.q[1] * scale;
    }
  };

  let portraitAspect = 1;
  const drawFrame = (time) => {
    if (!draw || !viewportWidth || !viewportHeight) return;
    draw.clearRect(0, 0, viewportWidth, viewportHeight);
    const elapsed = performance.now() - startedAt;
    const normalized = Math.min(1, elapsed / introDuration);
    counter.textContent = String(Math.round(normalized * 100)).padStart(3, '0');

    if (phase === 'letters') {
      for (const particle of particles) {
        draw.fillStyle = DOT[particle.c];
        draw.fillRect(particle.x, particle.y, particle.s, particle.s);
      }
      return;
    }
    if (!particles.length) return;
    if (phase === 'wordDots') {
      for (const particle of particles) {
        particle.x += (particle.tx - particle.x) * 0.16;
        particle.y += (particle.ty - particle.y) * 0.16;
      }
    } else if (phase === 'gather' || phase === 'portrait' || phase === 'release') {
      gatheringProgress = Math.min(1, (performance.now() - gatherStartedAt) / 2200);
      const force = phase === 'release' ? 0.004 : 0.005 + 0.023 * gatheringProgress;
      for (const particle of particles) {
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distanceSq = dx * dx + dy * dy;
        if (phase !== 'release' && distanceSq < 13000) {
          const distance = Math.sqrt(distanceSq) || 1;
          const repel = (1 - distanceSq / 13000) * 0.9;
          particle.vx -= dx / distance * repel;
          particle.vy -= dy / distance * repel;
        }
        particle.vx += (particle.tx - particle.x) * force;
        particle.vy += (particle.ty - particle.y) * force;
        particle.vx *= phase === 'portrait' ? 0.82 : 0.86;
        particle.vy *= phase === 'portrait' ? 0.82 : 0.86;
        particle.x += particle.vx;
        particle.y += particle.vy;
      }
    }
    let lastColor = -1;
    for (const particle of particles) {
      if (particle.c !== lastColor) { draw.fillStyle = DOT[particle.c]; lastColor = particle.c; }
      draw.fillRect(particle.x, particle.y, particle.s, particle.s);
    }
  };

  const loop = (time) => {
    if (dead) return;
    drawFrame(time);
    raf = requestAnimationFrame(loop);
  };
  const showWordAsDots = async () => {
    if (dead || finished) return;
    let portrait;
    try { portrait = await portraitPromise; } catch { finish(); return; }
    if (dead || finished) return;
    const mask = document.createElement('canvas');
    mask.width = Math.max(1, viewportWidth);
    mask.height = Math.max(1, viewportHeight);
    const maskContext = mask.getContext('2d', { willReadFrequently: true });
    if (!maskContext) { finish(); return; }
    const fontSize = getComputedStyle(nameLetters[0]).fontSize;
    maskContext.font = `800 ${fontSize} "Anybody", system-ui, sans-serif`;
    maskContext.textAlign = 'center';
    maskContext.textBaseline = 'middle';
    nameLetters.forEach((element) => {
      const rect = element.getBoundingClientRect();
      maskContext.fillText(element.textContent, rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
    const image = maskContext.getImageData(0, 0, mask.width, mask.height).data;
    const shape = [];
    for (let y = Math.max(0, Math.floor(viewportHeight * 0.18)); y < Math.min(viewportHeight, Math.ceil(viewportHeight * 0.82)); y += 2) {
      for (let x = 0; x < viewportWidth; x += 2) {
        if (image[(y * mask.width + x) * 4 + 3] > 100) shape.push([x, y]);
      }
    }
    if (!shape.length) { finish(); return; }
    shuffle(shape);
    portraitAspect = portrait.aspect;
    particles = portrait.points.map((point, index) => {
      const position = shape[index % shape.length];
      return {
        ...point,
        s: coarse ? 1.6 : 1.2 + Math.random() * 0.7,
        x: position[0] + (Math.random() - 0.5),
        y: position[1] + (Math.random() - 0.5),
        vx: 0, vy: 0, tx: position[0], ty: position[1],
      };
    }).sort((a, b) => a.c - b.c);
    phase = 'wordDots';
    gsap.to(nameLetters, { opacity: 0, duration: 0.28, overwrite: true });
    timers.push(window.setTimeout(() => {
      if (dead || finished) return;
      phase = 'gather';
      gatherStartedAt = performance.now();
      aimPortrait(portraitAspect);
      timers.push(window.setTimeout(() => {
        if (dead || finished) return;
        phase = 'portrait';
        timers.push(window.setTimeout(finish, 1150));
      }, 2300));
    }, 780));
  };

  const finish = () => {
    if (finished || dead) return;
    finished = true;
    phase = 'release';
    root.classList.remove('hz-intro');
    const targetCount = FIELD_COUNT(coarse);
    const stride = Math.max(1, Math.ceil(particles.length / targetCount));
    const seed = particles.filter((_, index) => index % stride === 0).slice(0, targetCount)
      .map((particle) => ({ x: particle.x, y: particle.y, vx: particle.vx, vy: particle.vy }));
    reveal();
    beginField(seed.length ? seed : null);
    gsap.fromTo(curtain, { clipPath: 'circle(150% at 50% 42%)' }, {
      clipPath: 'circle(0% at 50% 42%)', duration: 1.35, ease: 'expo.inOut',
      onComplete: () => { curtain.remove(); startScroll(); },
    });
    gsap.to(canvas, { opacity: 0, duration: 0.75, ease: 'power2.in', onComplete: () => { cancelAnimationFrame(raf); canvas.remove(); } });
  };

  const scrambleSequence = [...shuffle([...GLYPHS]), ...shuffle([...GLYPHS])];
  const cycleSingleLetter = () => {
    scrambleSequence.forEach((character, index) => {
      timers.push(window.setTimeout(() => {
        if (dead || finished || phase !== 'letters') return;
        one.textContent = character;
        gsap.fromTo(one, { scale: 1.12, opacity: 0.28, filter: 'blur(8px)' }, {
          scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.115, ease: 'power2.out', overwrite: true,
        });
      }, 180 + index * 78));
    });
  };
  const expandName = () => {
    if (dead || finished) return;
    phase = 'expand';
    gsap.to(one, { opacity: 0, scale: 1.2, duration: 0.45, ease: 'power2.in', overwrite: true });
    gsap.to(nameElement, { opacity: 1, duration: 0.32, ease: 'power2.out', overwrite: true });
    gsap.fromTo(nameLetters,
      { x: (index, element) => viewportWidth / 2 - (element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2), scale: 2.8, opacity: 0 },
      { x: 0, scale: 1, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: { each: 0.035, from: 'center' }, overwrite: true });
    timers.push(window.setTimeout(showWordAsDots, 1500));
  };
  const onPointerMove = (event) => { mouseX = event.clientX; mouseY = event.clientY; };
  const onResize = () => { resize(); if (phase === 'gather' || phase === 'portrait') aimPortrait(portraitAspect); };
  const onKeyDown = (event) => { if (event.key === 'Escape') finish(); };

  resize();
  cycleSingleLetter();
  raf = requestAnimationFrame(loop);
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  const skip = curtain.querySelector('.hz-skip');
  skip.addEventListener('click', finish);

  const expandAt = 180 + scrambleSequence.length * 78 + 280;
  timers.push(window.setTimeout(expandName, expandAt));
  // A final safety net prevents a failed image decode or unusual device from blocking entry.
  timers.push(window.setTimeout(finish, 12500));
  portraitPromise.catch(() => finish());

  introCleanup = () => {
    dead = true;
    timers.forEach((timer) => window.clearTimeout(timer));
    cancelAnimationFrame(raf);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKeyDown);
    skip.removeEventListener('click', finish);
    gsap.killTweensOf([curtain, canvas, one, ...nameLetters]);
    curtain.remove();
    canvas.remove();
    root.classList.remove('hz-intro');
  };

  return () => {
    dead = true;
    introCleanup?.();
    stopField?.();
    cleanupShared();
  };
}
