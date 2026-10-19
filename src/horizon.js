import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const TONE = import.meta.env.BASE_URL + 'images/face-tone.png';
const DOT = [
  'rgba(238,240,255,.46)',
  'rgba(238,240,255,.76)',
  'rgba(238,240,255,.96)',
  '#ffc62e',
];
const NAME = 'MOHAMED RABEA';

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a += 0x6D2B79F5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Sample a controlled number of pixels: enough detail to read as a face,
// without creating tens of thousands of draw calls on every animation frame.
async function stipple(coarse) {
  const img = new Image();
  img.decoding = 'async';
  img.src = TONE;
  await img.decode();

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth || img.width;
  canvas.height = img.naturalHeight || img.height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Portrait pixel sampling is unavailable.');
  ctx.drawImage(img, 0, 0);

  const width = canvas.width;
  const height = canvas.height;
  const pixels = ctx.getImageData(0, 0, width, height).data;
  const cap = coarse ? 1500 : 5600;
  const stride = Math.max(coarse ? 3 : 2, Math.ceil(Math.sqrt((width * height) / cap)));
  const random = rng(241019);
  const points = [];

  for (let y = 0; y < height && points.length < cap; y += stride) {
    for (let x = 0; x < width && points.length < cap; x += stride) {
      const offset = (y * width + x) * 4;
      if (pixels[offset + 3] < 90) continue;
      const lum = (pixels[offset] * 0.2126 + pixels[offset + 1] * 0.7152 + pixels[offset + 2] * 0.0722) / 255;
      // Keep shadow detail as well as highlights; brightness changes the density
      // gently rather than erasing the darker contours of the face.
      const keep = 0.48 + 0.52 * Math.pow(lum, 0.62);
      if (random() > keep) continue;
      const shade = random() < 0.022 ? 3 : lum > 0.7 ? 2 : lum > 0.39 ? 1 : 0;
      points.push({
        q: [(x + stride * 0.5) / width - 0.5, (y + stride * 0.5) / height - 0.5],
        c: shade,
        s: coarse ? 1.45 : 1.15 + random() * 0.85,
      });
    }
  }

  return { points, width, height };
}

// A small, continuously moving particle field. The cursor acts as a lens:
// particles inside it snap into a grid, a signal curve, or an orbit pattern.
function startField(hero, coarse, seed, staticMode = false) {
  const canvas = hero.querySelector('.hz-field');
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const firstRect = canvas.getBoundingClientRect();
  let width = Math.max(1, firstRect.width || window.innerWidth);
  let height = Math.max(1, firstRect.height || window.innerHeight);
  const count = coarse ? 850 : 2600;
  const random = rng(9137);
  let raf = 0;
  let visible = true;
  let inside = coarse;
  let lensX = width * 0.62;
  let lensY = height * 0.47;
  let lastMove = performance.now();
  let state = 0;
  let lastState = performance.now();
  const stateBox = hero.querySelector('.hz-state');
  const stateNumber = stateBox ? stateBox.querySelector('b') : null;
  const stateText = stateBox ? stateBox.querySelector('span') : null;
  const labels = stateBox ? (stateBox.dataset.labels || '').split('|') : [];
  const patterns = [[], [], []];

  const points = Array.from({ length: count }, (_, i) => {
    const initial = seed && seed[i] ? seed[i] : null;
    return {
      i,
      x: initial ? initial.x : random() * width,
      y: initial ? initial.y : random() * height,
      vx: initial ? initial.vx || 0 : (random() - 0.5) * 0.2,
      vy: initial ? initial.vy || 0 : (random() - 0.5) * 0.2,
      hx: random() * width,
      hy: random() * height,
      phase: random() * Math.PI * 2,
      size: initial && initial.s ? initial.s : 1 + random() * 1.25,
      color: initial && Number.isInteger(initial.c) ? initial.c : (() => { const roll = random(); return roll < 0.035 ? 3 : roll < 0.22 ? 2 : roll < 0.62 ? 1 : 0; })(),
      influence: 0,
    };
  });
  points.sort((a, b) => a.color - b.color);

  function updateLabel() {
    if (stateNumber) stateNumber.textContent = '0' + (state + 1) + ' / 03';
    if (stateText) stateText.textContent = labels[state] || '';
  }

  function layout() {
    const oldWidth = width;
    const oldHeight = height;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width || window.innerWidth);
    height = Math.max(1, rect.height || window.innerHeight);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const randomLayout = rng(8101 + Math.round(width) + Math.round(height));
    for (const p of points) {
      p.x = p.x * width / oldWidth;
      p.y = p.y * height / oldHeight;
      p.hx = randomLayout() * width;
      p.hy = randomLayout() * height;
    }

    const columns = Math.max(1, Math.ceil(Math.sqrt(count * width / height)));
    const rows = Math.ceil(count / columns);
    const cellX = width / columns;
    const cellY = height / rows;
    const bins = coarse ? 10 : 20;
    const pitch = width * 0.84 / bins;
    const barWidth = pitch * 0.68;
    const baseY = height * 0.87;
    const heights = Array.from({ length: bins }, (_, i) => 0.24 + 0.76 * Math.abs(Math.sin(i * 1.47 + 0.7) * Math.cos(i * 0.39 + 0.3)));
    const totalHeight = heights.reduce((sum, value) => sum + value, 0);
    const radius = Math.min(width, height) * 0.44;

    for (const p of points) {
      patterns[0][p.i] = [(p.i % columns + 0.5) * cellX, (Math.floor(p.i / columns) + 0.5) * cellY];
      let bucket = randomLayout() * totalHeight;
      let bin = 0;
      while (bin < bins - 1 && bucket > heights[bin]) {
        bucket -= heights[bin];
        bin += 1;
      }
      patterns[1][p.i] = [
        width * 0.08 + bin * pitch + (pitch - barWidth) / 2 + randomLayout() * barWidth,
        baseY - randomLayout() * heights[bin] * height * 0.62,
      ];
      const ring = 1 + Math.floor(Math.pow(randomLayout(), 0.62) * 7);
      const angle = randomLayout() * Math.PI * 2;
      const ringRadius = radius * ring / 7;
      patterns[2][p.i] = [
        width * 0.5 + Math.cos(angle) * ringRadius + (randomLayout() - 0.5) * 3,
        height * 0.47 + Math.sin(angle) * ringRadius * 0.78 + (randomLayout() - 0.5) * 3,
      ];
    }

    if (staticMode) {
      state = 2;
      for (const p of points) {
        const target = patterns[state][p.i];
        p.x = target[0];
        p.y = target[1];
        p.influence = 1;
      }
    }
    updateLabel();
  }

  function frame(now) {
    ctx.clearRect(0, 0, width, height);
    if (staticMode) {
      drawParticles();
      return;
    }

    if (!coarse && now - lastMove > 2400) {
      lensX = width * (0.59 + 0.13 * Math.sin(now * 0.00019));
      lensY = height * (0.46 + 0.13 * Math.sin(now * 0.00027 + 1.1));
      inside = true;
    }
    if (now - lastState > 9200) {
      state = (state + 1) % 3;
      lastState = now;
      updateLabel();
    }

    const radius = Math.min(width, height) * (coarse ? 0.23 : 0.215);
    const radius2 = radius * radius;

    for (const p of points) {
      p.influence = 0;
      const dx = lensX - p.x;
      const dy = lensY - p.y;
      const d2 = dx * dx + dy * dy;

      const inLens = inside && d2 < radius2;
      if (inLens) {
        // Inside the lens, let the geometric attractor dominate. Ambient drift
        // resumes outside the lens so the two forces do not cancel each other.
        const strength = 1 - Math.sqrt(d2) / radius;
        const slot = patterns[state][p.i];
        const targetX = lensX + (slot[0] / width - 0.5) * radius * 1.45;
        const targetY = lensY + (slot[1] / height - 0.5) * radius * 1.45;
        const force = 0.018 + strength * 0.075;
        p.vx += (targetX - p.x) * force;
        p.vy += (targetY - p.y) * force;
        p.influence = strength;
      } else {
        // Free particles remain soft and restless outside the lens.
        p.vx += (p.hx - p.x) * 0.00056 + Math.sin(p.y * 0.007 + now * 0.00048 + p.phase) * 0.018;
        p.vy += (p.hy - p.y) * 0.00056 + Math.cos(p.x * 0.007 - now * 0.00042 + p.phase) * 0.018;
      }

      const damping = p.influence > 0.02 ? 0.78 : 0.94;
      p.vx *= damping;
      p.vy *= damping;
      p.x += p.vx;
      p.y += p.vy;
    }

    drawParticles();

    if (inside) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(238,240,255,.22)';
      ctx.beginPath();
      ctx.arc(lensX, lensY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(245,194,66,.24)';
      ctx.beginPath();
      ctx.arc(lensX, lensY, radius * 0.965, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(245,194,66,.42)';
      ctx.beginPath();
      ctx.moveTo(lensX - 7, lensY);
      ctx.lineTo(lensX + 7, lensY);
      ctx.moveTo(lensX, lensY - 7);
      ctx.lineTo(lensX, lensY + 7);
      ctx.stroke();
    }
  }

  function drawParticles() {
    for (let color = 0; color < 4; color += 1) {
      ctx.fillStyle = DOT[color];
      for (const p of points) {
        if (p.color !== color) continue;
        ctx.globalAlpha = p.influence > 0.02 ? 0.56 + p.influence * 0.44 : 0.75;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;
  }

  function loop(now) {
    if (staticMode || !visible) {
      raf = 0;
      return;
    }
    frame(now);
    raf = requestAnimationFrame(loop);
  }

  function onPointerMove(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    inside = x >= 0 && y >= 0 && x <= width && y <= height;
    if (inside) {
      lensX = x;
      lensY = y;
      lastMove = performance.now();
    }
  }

  function onClick(event) {
    if (event.target.closest('a,button,input,textarea,select')) return;
    state = (state + 1) % 3;
    lastState = performance.now();
    updateLabel();
  }

  let resizeTimer = 0;
  function onResize() {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(layout, 120);
  }

  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (staticMode) return;
    if (visible && !raf) raf = requestAnimationFrame(loop);
    else if (!visible && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  });
  observer.observe(hero);
  layout();
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize);
  hero.addEventListener('click', onClick);

  if (staticMode) {
    frame(0);
  } else if (visible) {
    raf = requestAnimationFrame(loop);
  }

  return () => {
    cancelAnimationFrame(raf);
    window.clearTimeout(resizeTimer);
    observer.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
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
  let ticker;
  let dead = false;
  let stopField = null;

  const startScroll = () => {
    if (reduced || coarse || lenis || dead) return;
    lenis = new Lenis({ lerp: 0.085, anchors: { offset: -84 } });
    lenis.on('scroll', ScrollTrigger.update);
    ticker = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);
  };

  const beginField = (seed, staticMode = false) => {
    if (!stopField) stopField = startField(hero, coarse, seed, staticMode);
  };

  const spot = (event) => {
    const card = event.target.closest && event.target.closest('.hz-spot');
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--sx', (event.clientX - rect.left) + 'px');
    card.style.setProperty('--sy', (event.clientY - rect.top) + 'px');
  };
  window.addEventListener('pointermove', spot, { passive: true });
  off.push(() => window.removeEventListener('pointermove', spot));

  const clock = hero.querySelector('.hz-clock');
  const formatter = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Africa/Cairo',
  });
  const updateClock = () => {
    if (clock) clock.textContent = formatter.format(new Date());
  };
  updateClock();
  const clockId = window.setInterval(updateClock, 1000);
  off.push(() => window.clearInterval(clockId));

  const ctx = gsap.context(() => {
    if (reduced) return;
    gsap.fromTo('.hz-manifesto .w', { opacity: 0.14 }, {
      opacity: 1,
      ease: 'none',
      stagger: 0.12,
      scrollTrigger: { trigger: '.hz-manifesto', start: 'top 82%', end: 'bottom 46%', scrub: true },
    });

    const cards = gsap.utils.toArray('.hz-card');
    cards.forEach((card, index) => {
      if (!cards[index + 1]) return;
      gsap.to(card, {
        scale: 0.93,
        opacity: 0.5,
        ease: 'none',
        transformOrigin: '50% 0',
        scrollTrigger: { trigger: cards[index + 1], start: 'top 82%', end: 'top 14%', scrub: true },
      });
    });

    gsap.fromTo('.hz-tl-line', { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      transformOrigin: '50% 0',
      scrollTrigger: { trigger: '.hz-ledger', start: 'top 70%', end: 'bottom 60%', scrub: true },
    });

    gsap.utils.toArray('.hz-job').forEach((element) => {
      ScrollTrigger.create({
        trigger: element,
        start: 'top 68%',
        onEnter: () => element.classList.add('is-on'),
        onLeaveBack: () => element.classList.remove('is-on'),
      });
    });

    const skew = gsap.quickTo('.hz-skew', 'skewX', { duration: 0.5, ease: 'power3.out' });
    ScrollTrigger.create({ onUpdate: (trigger) => skew(gsap.utils.clamp(-9, 9, trigger.getVelocity() / -260)) });
  });
  off.push(() => ctx.revert());

  const reveal = () => {
    gsap.from('.hz-meta, .hz-hint, .hz-lead span, .hz-side > *, .hz-state', {
      y: 25,
      opacity: 0,
      duration: 0.9,
      ease: 'expo.out',
      stagger: 0.055,
      delay: 0.04,
      clearProps: 'transform,opacity',
    });
  };

  const cleanup = () => {
    if (dead) return;
    dead = true;
    if (stopField) stopField();
    off.forEach((dispose) => dispose());
    if (ticker) gsap.ticker.remove(ticker);
    if (lenis) lenis.destroy();
    root.classList.remove('hz-intro');
  };

  if (reduced) {
    beginField(null, true);
    return cleanup;
  }

  // Intro sequence: one letter cycles through the name, expands to the full
  // name, dissolves into particles, and resolves into the portrait.
  const introCanvas = Object.assign(document.createElement('canvas'), { className: 'hz-fx' });
  const introContext = introCanvas.getContext('2d');
  const curtain = document.createElement('div');
  curtain.className = 'hz-curtain';
  curtain.innerHTML = '<div class="hz-top"><span>Field record</span><span>Cairo · EG</span></div><div class="hz-one" aria-hidden="true"></div><div class="hz-name" aria-hidden="true"></div><div class="hz-bottom"><b class="hz-count">000</b><button class="hz-skip" type="button">Skip</button></div>';
  document.body.append(curtain, introCanvas);

  const one = curtain.querySelector('.hz-one');
  const nameElement = curtain.querySelector('.hz-name');
  const count = curtain.querySelector('.hz-count');
  const skipButton = curtain.querySelector('.hz-skip');
  skipButton.textContent = document.querySelector('.site--ar') || document.documentElement.dir === 'rtl' ? 'تخطي' : 'Skip';

  const letters = Array.from(NAME).map((character) => {
    const element = document.createElement('i');
    element.className = character === ' ' ? 'sp' : 'ch';
    element.textContent = character === ' ' ? '' : character;
    nameElement.append(element);
    return element;
  });
  const nameLetters = letters.filter((element) => element.classList.contains('ch'));
  gsap.set(nameLetters, { opacity: 0 });

  const cycleLetters = Array.from(NAME.replace(' ', ''));
  let viewWidth = 0;
  let viewHeight = 0;
  let portrait = { points: [], width: 1, height: 1 };
  let portraitPoints = [];
  let raf = 0;
  let phase = 'cycle';
  let elapsed = 0;
  let pointerX = -999;
  let pointerY = -999;
  let done = false;
  let gatherStart = 0;
  const startTime = performance.now();
  const totalDuration = 8500;
  const timers = [];
  const portraitPromise = stipple(coarse);

  function sizeCanvas() {
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    viewWidth = window.innerWidth;
    viewHeight = window.innerHeight;
    introCanvas.width = Math.round(viewWidth * ratio);
    introCanvas.height = Math.round(viewHeight * ratio);
    introContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function aimAtPortrait() {
    const aspect = portrait.width / portrait.height;
    const targetWidth = Math.min(viewWidth * 0.9, viewHeight * 0.78 * aspect);
    const targetHeight = targetWidth / aspect;
    for (const point of portraitPoints) {
      point.tx = viewWidth * 0.5 + point.q[0] * targetWidth;
      point.ty = viewHeight * 0.49 + point.q[1] * targetHeight;
    }
  }

  function drawIntro(now) {
    introContext.clearRect(0, 0, viewWidth, viewHeight);
    if (!portraitPoints.length) return;

    const gatherProgress = phase === 'gather' ? Math.min(1, (now - gatherStart) / 2400) : 0;
    const spring = phase === 'gather' ? 0.006 + 0.02 * Math.pow(gatherProgress, 1.2) : phase === 'dots' ? 0.018 : 0;
    const drift = phase === 'dots' ? 0.34 : phase === 'gather' ? (1 - gatherProgress) * 0.12 : 0;

    for (const point of portraitPoints) {
      const dx = pointerX - point.x;
      const dy = pointerY - point.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 14500) {
        const distance = Math.sqrt(d2) || 1;
        const push = (1 - d2 / 14500) * 1.8;
        point.vx -= dx / distance * push;
        point.vy -= dy / distance * push;
      }
      point.vx += (point.tx - point.x) * spring + Math.sin(now * 0.0014 + point.y * 0.014) * drift;
      point.vy += (point.ty - point.y) * spring + Math.cos(now * 0.0013 + point.x * 0.012) * drift;
      point.vx *= 0.88;
      point.vy *= 0.88;
      point.x += point.vx;
      point.y += point.vy;
    }

    for (let shade = 0; shade < 4; shade += 1) {
      introContext.fillStyle = DOT[shade];
      for (const point of portraitPoints) {
        if (point.c !== shade) continue;
        introContext.fillRect(point.x, point.y, point.s, point.s);
      }
    }
  }

  function loop(now) {
    elapsed = Math.min(1, (performance.now() - startTime) / totalDuration);
    count.textContent = String(Math.round(elapsed * 100)).padStart(3, '0');
    drawIntro(now);
    raf = requestAnimationFrame(loop);
  }

  function toDots() {
    if (dead || done) return;
    phase = 'dots';
    portraitPromise.then(async (imageData) => {
      if (dead || done) return;
      await document.fonts.ready;
      portrait = imageData;
      const rects = nameLetters.map((element) => element.getBoundingClientRect());
      const textCanvas = document.createElement('canvas');
      textCanvas.width = Math.max(1, Math.floor(viewWidth));
      textCanvas.height = Math.max(1, Math.floor(viewHeight));
      const textContext = textCanvas.getContext('2d', { willReadFrequently: true });
      if (!textContext) {
        finish();
        return;
      }

      const styles = getComputedStyle(nameElement);
      textContext.font = styles.fontWeight + ' ' + styles.fontSize + ' ' + styles.fontFamily;
      textContext.textAlign = 'center';
      textContext.textBaseline = 'middle';
      textContext.fillStyle = '#fff';
      nameLetters.forEach((element, index) => {
        const rect = rects[index];
        textContext.fillText(element.textContent, rect.left + rect.width / 2, rect.top + rect.height * 0.53);
      });

      const top = Math.max(0, Math.floor(Math.min.apply(null, rects.map((rect) => rect.top)) - 8));
      const bottom = Math.min(viewHeight, Math.ceil(Math.max.apply(null, rects.map((rect) => rect.bottom)) + 8));
      const pixels = textContext.getImageData(0, 0, textCanvas.width, textCanvas.height).data;
      const shape = [];
      const textStep = coarse ? 3 : 2;
      for (let y = top; y < bottom; y += textStep) {
        for (let x = 0; x < viewWidth; x += textStep) {
          if (pixels[(y * textCanvas.width + x) * 4 + 3] > 128) shape.push([x, y]);
        }
      }
      if (!shape.length) {
        finish();
        return;
      }

      for (let index = shape.length - 1; index > 0; index -= 1) {
        const j = Math.floor(Math.random() * (index + 1));
        const hold = shape[index];
        shape[index] = shape[j];
        shape[j] = hold;
      }

      portraitPoints = imageData.points.map((point, index) => {
        const origin = shape[index % shape.length];
        return {
          q: point.q,
          c: point.c,
          s: point.s,
          x: origin[0],
          y: origin[1],
          vx: 0,
          vy: 0,
          tx: 0,
          ty: 0,
        };
      });
      aimAtPortrait();
      phase = 'dots';
      gsap.to(nameLetters, { opacity: 0, duration: 0.28, ease: 'power1.out' });
      timers.push(window.setTimeout(() => {
        if (dead || done) return;
        phase = 'gather';
        gatherStart = performance.now();
      }, 850));
    }).catch(() => finish());
  }

  // The final dispersion IS the entrance. There is deliberately no second
  // curtain wipe or circle transition after the portrait has formed.
  function finish() {
    if (done || dead) return;
    done = true;

    const spreadCount = coarse ? 850 : 2600;
    const stride = Math.max(1, Math.ceil(portraitPoints.length / spreadCount));
    const seed = [];
    for (let index = 0; index < portraitPoints.length && seed.length < spreadCount; index += stride) {
      const point = portraitPoints[index];
      const dx = point.x - viewWidth * 0.5;
      const dy = point.y - viewHeight * 0.49;
      const distance = Math.hypot(dx, dy) || 1;
      const speed = 4.5 + Math.random() * 5.5;
      seed.push({
        x: point.x,
        y: point.y,
        vx: point.vx + (dx / distance) * speed - (dy / distance) * 1.2,
        vy: point.vy + (dy / distance) * speed + (dx / distance) * 1.2,
        c: point.c,
        s: point.s,
      });
    }

    root.classList.remove('hz-intro');
    curtain.remove();
    cancelAnimationFrame(raf);
    introCanvas.remove();
    beginField(seed.length ? seed : null);
    reveal();
    startScroll();
  }

  function onPointerMove(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
  }
  function onResize() {
    sizeCanvas();
    if (portraitPoints.length) aimAtPortrait();
  }
  function onKeyDown(event) {
    if (event.key === 'Escape') finish();
  }

  sizeCanvas();
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', onKeyDown);
  skipButton.addEventListener('click', finish);
  raf = requestAnimationFrame(loop);

  const expandAt = 300 + cycleLetters.length * 170 + 380;
  cycleLetters.forEach((character, index) => {
    timers.push(window.setTimeout(() => {
      if (dead || done) return;
      one.textContent = character;
      one.classList.toggle('last', index === cycleLetters.length - 1);
      gsap.fromTo(one, { scale: 1.13, opacity: 0.12, filter: 'blur(9px)' }, {
        scale: 1,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 0.17,
        ease: 'power2.out',
        overwrite: true,
      });
    }, 300 + index * 170));
  });

  timers.push(window.setTimeout(() => {
    if (dead || done) return;
    phase = 'expand';
    gsap.to(one, { opacity: 0, scale: 1.3, duration: 0.44, ease: 'power2.in' });
    gsap.fromTo(nameLetters, {
      x: (index, element) => viewWidth * 0.5 - (element.getBoundingClientRect().left + element.offsetWidth * 0.5),
      scale: 3,
      opacity: 0,
    }, {
      x: 0,
      scale: 1,
      opacity: 1,
      duration: 1.12,
      ease: 'expo.out',
      stagger: { each: 0.04, from: 'center' },
    });
    timers.push(window.setTimeout(toDots, 1700));
  }, expandAt));

  timers.push(window.setTimeout(finish, totalDuration + 450));
  portraitPromise.catch(() => finish());

  off.push(() => {
    cancelAnimationFrame(raf);
    timers.forEach((timer) => window.clearTimeout(timer));
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('keydown', onKeyDown);
    curtain.remove();
    introCanvas.remove();
  });

  return cleanup;
}
