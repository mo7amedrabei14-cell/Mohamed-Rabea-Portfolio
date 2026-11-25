import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { BrandMark } from './BrandMark.jsx';
import './SignalIntro.css';

const SCENES = {
  en: [
    {
      id: 'wave',
      caption: 'Every operation generates raw, fragmented signals.',
      counterLabel: 'SIGNALS ANALYZED',
    },
    {
      id: 'capture',
      caption: 'Structured systems capture every layer.',
      counterLabel: 'SIGNALS ANALYZED',
    },
    {
      id: 'network',
      caption: 'Mapping how data, teams, and workflows connect.',
      counterLabel: 'NODES MAPPED',
    },
    {
      id: 'spike',
      caption: 'Turning complexity into clear decisions.',
      counterLabel: 'RECORDS INDEXED',
    },
    {
      id: 'reveal',
      caption: '',
      counterLabel: '',
    },
  ],
  ar: [
    {
      id: 'wave',
      caption: 'كل عملية تشغيلية تولّد إشارات متفرّقة ومعقّدة.',
      counterLabel: 'إشارات محلّلة',
    },
    {
      id: 'capture',
      caption: 'الأنظمة المترابطة تلتقط كل طبقة بوضوح.',
      counterLabel: 'إشارات محلّلة',
    },
    {
      id: 'network',
      caption: 'ربط البيانات والفرق ومسارات العمل في صورة واحدة.',
      counterLabel: 'عُقد مترابطة',
    },
    {
      id: 'spike',
      caption: 'تحويل التعقيد إلى قرارات واضحة قابلة للتنفيذ.',
      counterLabel: 'سجلات منظّمة',
    },
    {
      id: 'reveal',
      caption: '',
      counterLabel: '',
    },
  ],
};

const SOURCE_TAGS = [
  { label: 'Power BI', x: 0.41, y: 0.19, delay: 0.05 },
  { label: 'PostgreSQL', x: 0.67, y: 0.21, delay: 0.14 },
  { label: 'Field Data', x: 0.19, y: 0.34, delay: 0.2 },
  { label: 'FastAPI', x: 0.81, y: 0.37, delay: 0.26 },
  { label: 'QGIS', x: 0.22, y: 0.59, delay: 0.32 },
  { label: 'React', x: 0.48, y: 0.72, delay: 0.38 },
  { label: 'EOC Logs', x: 0.77, y: 0.63, delay: 0.44 },
];

const CLUSTERS_DEF = [
  { id: 'field', labelEn: 'Field Data', labelAr: 'البيانات الميدانية', x: -0.24, y: -0.04, z: 0.08, r: 0.125, ch: 0, highlight: false },
  { id: 'bi', labelEn: 'Power BI', labelAr: 'لوحات Power BI', x: -0.01, y: -0.22, z: -0.06, r: 0.095, ch: 1, highlight: false },
  { id: 'stack', labelEn: 'Full-Stack', labelAr: 'الأنظمة المتكاملة', x: 0.22, y: -0.06, z: 0.05, r: 0.13, ch: 2, highlight: false },
  { id: 'ops', labelEn: 'Operations', labelAr: 'العمليات الميدانية', x: -0.01, y: 0.16, z: 0.1, r: 0.105, ch: 1, highlight: false },
  { id: 'eoc', labelEn: 'EOC Command', labelAr: 'غرفة العمليات', x: 0.29, y: 0.21, z: 0.14, r: 0.072, ch: 3, highlight: true },
];

const CLUSTER_LINKS = [
  [0, 1], [1, 2], [0, 3], [1, 3], [2, 3], [2, 4], [3, 4],
];

// Portfolio-only color palette (Moonlit Silver, Charcoal, Signal Red & luminous derivatives)
const PALETTE = [
  { r: 238, g: 238, b: 238 }, // 0: Bright Silver-White
  { r: 192, g: 192, b: 192 }, // 1: Moonlit Silver (#C0C0C0)
  { r: 132, g: 132, b: 132 }, // 2: Brushed Steel Charcoal
  { r: 225, g: 6, b: 0 },     // 3: Signal Red (#E10600)
  { r: 255, g: 64, b: 56 },   // 4: Luminous Signal Ember
];

// Deterministic PRNG for clean repeatable choreography
function createRng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sampleWordmarkTargets(width, height, count) {
  const c = document.createElement('canvas');
  c.width = Math.max(320, Math.round(width));
  c.height = Math.max(200, Math.round(height));
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  const isMob = width < 700;
  const fontSize = Math.min(width * (isMob ? 0.105 : 0.078), 108);
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `800 ${fontSize}px "Anybody", "DM Sans", system-ui, sans-serif`;
  ctx.fillText('MOHAMED RABEA', c.width / 2, c.height * 0.47);

  const y0 = Math.max(0, Math.floor(c.height * 0.47 - fontSize * 0.8));
  const y1 = Math.min(c.height, Math.ceil(c.height * 0.47 + fontSize * 0.8));
  const data = ctx.getImageData(0, y0, c.width, y1 - y0).data;

  const raw = [];
  const step = isMob ? 2 : 3;
  for (let y = 0; y < y1 - y0; y += step) {
    for (let x = 0; x < c.width; x += step) {
      if (data[(y * c.width + x) * 4 + 3] > 128) {
        raw.push([x, y + y0]);
      }
    }
  }
  if (!raw.length) return [];

  const rand = createRng(4207);
  for (let i = raw.length - 1; i > 0; i--) {
    const j = (rand() * (i + 1)) | 0;
    const tmp = raw[i];
    raw[i] = raw[j];
    raw[j] = tmp;
  }

  const out = [];
  for (let i = 0; i < count; i++) {
    const pt = raw[i % raw.length];
    out.push([
      pt[0] + (rand() - 0.5) * 2.2,
      pt[1] + (rand() - 0.5) * 2.2,
    ]);
  }
  return out;
}

export function SignalIntro({ lang = 'en', onReveal, onComplete }) {
  const rootRef = useRef(null);
  const canvasRef = useRef(null);
  const counterRef = useRef(null);
  const barRef = useRef(null);
  const finishedRef = useRef(false);

  const [sceneIdx, setSceneIdx] = useState(0);
  const [revealLock, setRevealLock] = useState(false);

  const rtl = lang === 'ar';
  const scenes = SCENES[lang] || SCENES.en;

  // Store latest callbacks without re-triggering the canvas loop
  const cbRef = useRef({ onReveal, onComplete });
  cbRef.current = { onReveal, onComplete };

  const exitIntro = useRef(() => {});

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      finishedRef.current = true;
      cbRef.current.onReveal?.();
      cbRef.current.onComplete?.();
      return undefined;
    }

    document.documentElement.classList.add('hz-intro');
    window.__portfolioLenis?.stop?.();

    const cv = canvasRef.current;
    const root = rootRef.current;
    if (!cv || !root) return undefined;
    const g = cv.getContext('2d');
    if (!g) return undefined;

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const isMobInit = window.innerWidth < 760;
    const N = coarse || isMobInit ? 860 : 1850;
    const rand = createRng(1337);

    // Typed arrays for GC-free 60fps particle physics
    const px = new Float32Array(N);
    const py = new Float32Array(N);
    const prevX = new Float32Array(N);
    const prevY = new Float32Array(N);
    const vx = new Float32Array(N);
    const vy = new Float32Array(N);

    // Parametric UV for undulating wave ribbon
    const uArr = new Float32Array(N);
    const vArr = new Float32Array(N);
    // Cluster membership & spherical local coords
    const cId = new Uint8Array(N);
    const cOx = new Float32Array(N);
    const cOy = new Float32Array(N);
    const cOz = new Float32Array(N);
    // Time-series chart normalized coords
    const chartU = new Float32Array(N);
    const chartH = new Float32Array(N);
    const chartBand = new Uint8Array(N); // 0 baseline, 1 mid, 2 spike
    // Final reveal role: 0 = wordmark particle, 1 = orbital halo ring
    const ringRole = new Uint8Array(N);
    const ringAngle = new Float32Array(N);
    const ringRad = new Float32Array(N);
    const ringSpeed = new Float32Array(N);
    // Palette channel & size
    const chArr = new Uint8Array(N);
    const sizeArr = new Float32Array(N);
    const phaseArr = new Float32Array(N);

    let wordTargets = [];
    const cols = Math.round(Math.sqrt(N * 2.1));
    const rows = Math.ceil(N / cols);

    for (let i = 0; i < N; i++) {
      const col = i % cols;
      const row = (i / cols) | 0;
      uArr[i] = (col / Math.max(1, cols - 1)) * 2 - 1 + (rand() - 0.5) * 0.035;
      vArr[i] = (row / Math.max(1, rows - 1)) * 2 - 1 + (rand() - 0.5) * 0.045;

      // Assign to 5 clusters with weighted distribution
      const rPick = rand();
      const ci = rPick < 0.25 ? 0 : rPick < 0.45 ? 1 : rPick < 0.72 ? 2 : rPick < 0.89 ? 3 : 4;
      cId[i] = ci;
      // Spherical distribution denser near core
      const theta = rand() * Math.PI * 2;
      const phi = Math.acos(2 * rand() - 1);
      const rad = Math.pow(rand(), 0.65);
      cOx[i] = Math.sin(phi) * Math.cos(theta) * rad;
      cOy[i] = Math.sin(phi) * Math.sin(theta) * rad;
      cOz[i] = Math.cos(phi) * rad;

      // Channel color assigned by cluster / operational layer (strictly portfolio palette)
      if (ci === 4) {
        chArr[i] = rand() < 0.72 ? 3 : 4; // Signal Red + Crimson Ember
      } else if (ci === 0) {
        chArr[i] = rand() < 0.14 ? 3 : 0; // Crisp Silver-White + occasional Signal Red dot
      } else if (ci === 1) {
        chArr[i] = rand() < 0.12 ? 4 : 1; // Moonlit Silver
      } else if (ci === 2) {
        chArr[i] = rand() < 0.16 ? 3 : 2; // Brushed Steel + Signal Red accents
      } else {
        chArr[i] = rand() < 0.1 ? 3 : 1;
      }

      // Time-series chart distribution (matching video's iconic peak at u ~ 0.64)
      let tu = rand();
      // Concentrate 42% of particles around the major spike for dense visual punch
      if (rand() < 0.44) {
        const g1 = (rand() + rand() + rand()) / 3 - 0.5;
        tu = Math.max(0.02, Math.min(0.98, 0.64 + g1 * 0.22));
      }
      chartU[i] = tu;
      const bump1 = Math.exp(-Math.pow((tu - 0.26) / 0.09, 2)) * 0.16;
      const bump2 = Math.exp(-Math.pow((tu - 0.64) / 0.052, 2)) * 0.92;
      const bump3 = Math.exp(-Math.pow((tu - 0.74) / 0.075, 2)) * 0.24;
      const baseEnv = 0.06 + bump1 + bump2 + bump3;
      const hFrac = Math.pow(rand(), 0.72) * baseEnv;
      chartH[i] = hFrac;
      chartBand[i] = hFrac > 0.42 ? 2 : hFrac > 0.18 ? 1 : 0;

      // Final orbital halo vs wordmark split
      ringRole[i] = i < N * 0.54 ? 0 : 1;
      ringAngle[i] = rand() * Math.PI * 2;
      ringRad[i] = 0.72 + rand() * 0.36;
      ringSpeed[i] = (0.14 + rand() * 0.22) * (rand() < 0.5 ? 1 : -1);

      sizeArr[i] = 1.0 + rand() * 1.45;
      phaseArr[i] = rand() * Math.PI * 2;
    }

    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    let mx = 0;
    let my = 0;
    let smx = 0;
    let smy = 0;

    const resize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
      cv.width = Math.round(vw * dpr);
      cv.height = Math.round(vh * dpr);
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      wordTargets = sampleWordmarkTargets(vw, vh, Math.ceil(N * 0.56));
    };
    resize();

    // Seed initial particle positions directly onto the Scene 1 wave so frame 1 is immediately rich
    const computeWavePoint = (i, tSec, out) => {
      const u = uArr[i];
      const v = vArr[i];
      const mobScale = vw < 700 ? 0.88 : 1;
      const rx = u * vw * 0.33 * mobScale;
      const rz = v * Math.min(vw, vh) * 0.26 * mobScale;
      // Traveling multi-harmonic cloth wave (faithful to video 00:00–00:05)
      const wave1 = Math.sin(u * 2.8 - tSec * 1.75 + v * 0.9) * vh * 0.115;
      const wave2 = Math.cos(u * 4.6 + tSec * 1.3 - v * 2.2) * vh * 0.045;
      const twist = Math.sin(tSec * 0.55) * 0.38;
      const ry = wave1 + wave2 + v * Math.sin(u * 1.8 - tSec) * vh * 0.04;

      // 3D Camera Orbit + subtle pointer parallax
      const yaw = Math.sin(tSec * 0.42) * 0.36 + smx * 0.18 + twist * 0.25;
      const pitch = 0.32 + Math.cos(tSec * 0.34) * 0.08 + smy * 0.12;
      const cosY = Math.cos(yaw), sinY = Math.sin(yaw);
      const cosP = Math.cos(pitch), sinP = Math.sin(pitch);

      const x1 = rx * cosY - rz * sinY;
      const z1 = rx * sinY + rz * cosY;
      const y2 = ry * cosP - z1 * sinP;
      const z2 = ry * sinP + z1 * cosP;

      const fov = 880;
      const sc = fov / (fov + z2 + 220);
      out[0] = vw * 0.5 + x1 * sc;
      out[1] = vh * 0.47 + y2 * sc;
      out[2] = sc;
    };

    const tmpPt = [0, 0, 1];
    for (let i = 0; i < N; i++) {
      computeWavePoint(i, 0, tmpPt);
      px[i] = prevX[i] = tmpPt[0];
      py[i] = prevY[i] = tmpPt[1];
    }

    // Scene timeline beats (seconds) — tight, energetic, zero dead air
    const T_CAPTURE = 2.4;
    const T_NETWORK = 4.7;
    const T_SPIKE = 7.4;
    const T_REVEAL = 10.0;
    const T_LOCK = 10.8;
    const T_END = 12.6;

    let currentScene = 0;
    let locked = false;
    let burstDoneNet = false;
    let burstDoneSpike = false;
    let burstDoneReveal = false;
    let raf = 0;
    const startTs = performance.now();
    let prevTs = startTs;

    const triggerFinish = () => {
      if (finishedRef.current) return;
      finishedRef.current = true;
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove('hz-intro');
      window.__portfolioLenis?.start?.();
      cbRef.current.onReveal?.();

      gsap.to(root, {
        opacity: 0,
        scale: 1.03,
        duration: 0.72,
        ease: 'expo.inOut',
        onComplete: () => {
          cbRef.current.onComplete?.();
        },
      });
    };

    exitIntro.current = triggerFinish;

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      mx = (e.clientX / Math.max(1, vw) - 0.5) * 2;
      my = (e.clientY / Math.max(1, vh) - 0.5) * 2;
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') triggerFinish();
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('resize', resize);
    window.addEventListener('keydown', onKeyDown);

    // Precompute cluster hub screen positions helper
    const clusterHubs = CLUSTERS_DEF.map(() => ({ x: 0, y: 0, s: 1 }));

    const drawFrame = (now) => {
      if (finishedRef.current) return;
      const dt = Math.min(0.05, Math.max(0.008, (now - prevTs) / 1000));
      const dtScale = dt / 0.01667;
      prevTs = now;
      const t = (now - startTs) / 1000;

      // Smooth pointer parallax
      smx += (mx - smx) * 0.06;
      smy += (my - smy) * 0.06;

      // Update React UI scene state at exact choreography beats
      const nextScene =
        t < T_CAPTURE ? 0 :
        t < T_NETWORK ? 1 :
        t < T_SPIKE ? 2 :
        t < T_REVEAL ? 3 : 4;

      if (nextScene !== currentScene) {
        currentScene = nextScene;
        setSceneIdx(nextScene);
      }
      if (!locked && t >= T_LOCK) {
        locked = true;
        setRevealLock(true);
      }
      if (t >= T_END) {
        triggerFinish();
        return;
      }

      // Trigger energetic velocity impulses at scene transitions (matching video streak bursts!)
      if (t >= T_NETWORK && !burstDoneNet) {
        burstDoneNet = true;
        for (let i = 0; i < N; i++) {
          const ang = Math.atan2(py[i] - vh * 0.47, px[i] - vw * 0.5) + (rand() - 0.5) * 0.55;
          const spd = 12 + rand() * 20;
          vx[i] += Math.cos(ang) * spd;
          vy[i] += Math.sin(ang) * spd;
        }
      }
      if (t >= T_SPIKE && !burstDoneSpike) {
        burstDoneSpike = true;
        for (let i = 0; i < N; i++) {
          vx[i] += (rand() - 0.5) * 14;
          vy[i] += 10 + rand() * 14;
        }
      }
      if (t >= T_REVEAL && !burstDoneReveal) {
        burstDoneReveal = true;
        for (let i = 0; i < N; i++) {
          const dx = px[i] - vw * 0.5;
          const dy = py[i] - vh * 0.47;
          const ang = Math.atan2(dy, dx) + 1.15;
          const spd = 9 + rand() * 15;
          vx[i] += Math.cos(ang) * spd;
          vy[i] += Math.sin(ang) * spd;
        }
      }

      // Update top-right telemetry counter & bottom progress bar directly via DOM (zero React re-renders)
      if (counterRef.current && t < T_REVEAL) {
        const val = Math.floor(Math.pow(t / T_REVEAL, 1.35) * 42860 + t * 340);
        counterRef.current.textContent = val.toLocaleString('en-US');
      }
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${Math.min(1, t / T_END)})`;
      }

      // Clear frame with deep portfolio background + faint motion trail persistence during transitions
      const inTransition =
        (t >= T_NETWORK && t < T_NETWORK + 0.55) ||
        (t >= T_SPIKE && t < T_SPIKE + 0.55) ||
        (t >= T_REVEAL && t < T_REVEAL + 0.55);

      g.fillStyle = inTransition ? 'rgba(13, 13, 13, 0.34)' : 'rgba(13, 13, 13, 0.52)';
      g.fillRect(0, 0, vw, vh);

      // Subtle atmospheric radial depth behind active scene
      const grad = g.createRadialGradient(
        vw * 0.5 + smx * 30,
        vh * 0.46 + smy * 20,
        10,
        vw * 0.5,
        vh * 0.46,
        Math.max(vw, vh) * 0.62
      );
      if (currentScene === 3 || currentScene === 4) {
        grad.addColorStop(0, 'rgba(225, 6, 0, 0.055)');
        grad.addColorStop(0.45, 'rgba(42, 42, 42, 0.09)');
        grad.addColorStop(1, 'rgba(13, 13, 13, 0)');
      } else {
        grad.addColorStop(0, 'rgba(192, 192, 192, 0.045)');
        grad.addColorStop(0.5, 'rgba(42, 42, 42, 0.05)');
        grad.addColorStop(1, 'rgba(13, 13, 13, 0)');
      }
      g.fillStyle = grad;
      g.fillRect(0, 0, vw, vh);

      // Compute vertical scanline sweep X during Scene 2 (2.4s -> 3.65s)
      const sweepP = Math.max(0, Math.min(1, (t - T_CAPTURE) / 1.15));
      const sweepEased = sweepP < 0.5 ? 4 * sweepP * sweepP * sweepP : 1 - Math.pow(-2 * sweepP + 2, 3) / 2;
      const sweepX = vw * (0.04 + sweepEased * 0.92);

      // Compute 3D cluster hub positions during Scene 3
      const netT = Math.max(0, t - T_NETWORK);
      const netOrbit = netT * 0.16;
      const scaleDim = Math.min(vw, vh);
      for (let c = 0; c < CLUSTERS_DEF.length; c++) {
        const def = CLUSTERS_DEF[c];
        const rx = def.x * vw * (vw < 700 ? 0.85 : 1);
        const ry = def.y * vh * 0.92;
        const rz = def.z * scaleDim;
        const x1 = rx * Math.cos(netOrbit * 0.5) - rz * Math.sin(netOrbit * 0.5);
        const z1 = rx * Math.sin(netOrbit * 0.5) + rz * Math.cos(netOrbit * 0.5);
        const sc = 900 / (900 + z1 + 120);
        clusterHubs[c].x = vw * 0.5 + x1 * sc + smx * 16;
        clusterHubs[c].y = vh * 0.46 + ry * sc + smy * 12;
        clusterHubs[c].s = sc;
      }

      // Draw Scene 3 inter-cluster network edges BEFORE particles
      if (currentScene === 2) {
        const edgeAlpha = Math.min(1, Math.max(0, (netT - 0.35) / 0.85));
        if (edgeAlpha > 0.01) {
          g.lineWidth = 0.75;
          for (let l = 0; l < CLUSTER_LINKS.length; l++) {
            const [a, b] = CLUSTER_LINKS[l];
            const ha = clusterHubs[a];
            const hb = clusterHubs[b];
            const isRed = CLUSTERS_DEF[a].highlight || CLUSTERS_DEF[b].highlight;
            g.strokeStyle = isRed
              ? `rgba(225, 6, 0, ${0.26 * edgeAlpha})`
              : `rgba(192, 192, 192, ${0.14 * edgeAlpha})`;
            g.beginPath();
            g.moveTo(ha.x, ha.y);
            g.lineTo(hb.x, hb.y);
            g.stroke();
          }

          // Intra-cluster delicate web rays from hub to first 24 particles of each cluster
          for (let c = 0; c < CLUSTERS_DEF.length; c++) {
            const hub = clusterHubs[c];
            const isRed = CLUSTERS_DEF[c].highlight;
            g.strokeStyle = isRed
              ? `rgba(225, 6, 0, ${0.18 * edgeAlpha})`
              : `rgba(192, 192, 192, ${0.08 * edgeAlpha})`;
            g.beginPath();
            let drawn = 0;
            for (let i = c; i < N && drawn < 22; i += 7) {
              if (cId[i] !== c) continue;
              g.moveTo(hub.x, hub.y);
              g.lineTo(px[i], py[i]);
              drawn++;
            }
            g.stroke();
          }
        }
      }

      // Draw Scene 4 calibrated time-series axis & spike callout
      if (currentScene === 3) {
        const spT = Math.max(0, t - T_SPIKE);
        const axisAlpha = Math.min(1, spT / 0.65);
        const baseLineY = vh * 0.72;
        const leftX = vw * 0.09;
        const rightX = vw * 0.91;

        g.strokeStyle = `rgba(192, 192, 192, ${0.16 * axisAlpha})`;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(leftX, baseLineY);
        g.lineTo(rightX, baseLineY);
        g.stroke();

        // Time ticks
        const ticks = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00', '24:00'];
        g.fillStyle = `rgba(192, 192, 192, ${0.46 * axisAlpha})`;
        g.font = '500 10px "DM Mono", monospace';
        g.textAlign = 'center';
        ticks.forEach((lbl, idx) => {
          const tx = leftX + (idx / (ticks.length - 1)) * (rightX - leftX);
          g.fillRect(tx - 0.5, baseLineY, 1, 5);
          g.fillText(lbl, tx, baseLineY + 18);
        });

        // Spike apex vertical reticle & live pulse (appears 0.75s into Scene 4)
        const calloutAlpha = Math.min(1, Math.max(0, (spT - 0.7) / 0.55));
        if (calloutAlpha > 0.01) {
          const peakX = leftX + 0.64 * (rightX - leftX);
          const peakY = baseLineY - vh * 0.44;
          const pulse = 1 + Math.sin(t * 7) * 0.25;

          g.strokeStyle = `rgba(225, 6, 0, ${0.38 * calloutAlpha})`;
          g.setLineDash([3, 4]);
          g.beginPath();
          g.moveTo(peakX, peakY);
          g.lineTo(peakX, baseLineY);
          g.stroke();
          g.setLineDash([]);

          g.strokeStyle = `rgba(225, 6, 0, ${0.75 * calloutAlpha})`;
          g.lineWidth = 1.4;
          g.beginPath();
          g.arc(peakX, peakY, 7 * pulse, 0, Math.PI * 2);
          g.stroke();

          g.fillStyle = `rgba(225, 6, 0, ${calloutAlpha})`;
          g.beginPath();
          g.arc(peakX, peakY, 3, 0, Math.PI * 2);
          g.fill();

          // Callout text next to spike
          const alignRight = peakX > vw * 0.72;
          const tx = alignRight ? peakX - 16 : peakX + 16;
          g.textAlign = alignRight ? 'right' : 'left';
          g.fillStyle = `rgba(238, 238, 238, ${0.95 * calloutAlpha})`;
          g.font = '700 12px "DM Sans", system-ui, sans-serif';
          g.fillText(rtl ? '15:20 ذروة تشغيلية مرصودة' : '15:20 Spike detected', tx, peakY + 2);
          g.fillStyle = `rgba(192, 192, 192, ${0.7 * calloutAlpha})`;
          g.font = '400 10.5px "DM Mono", monospace';
          g.fillText(rtl ? 'أولوية استجابة فورية محددة' : 'Decision signal isolated', tx, peakY + 18);
        }
      }

      // Physics update & directional streak rendering for every particle
      const revealT = Math.max(0, t - T_REVEAL);
      const wordFadeOut = locked ? Math.max(0.08, 1 - (t - T_LOCK) / 0.85) : 1;

      for (let i = 0; i < N; i++) {
        prevX[i] = px[i];
        prevY[i] = py[i];

        let tx = vw * 0.5;
        let ty = vh * 0.5;
        let depthScale = 1;
        let spring = 0.085;
        let damp = 0.84;

        if (currentScene === 0 || currentScene === 1) {
          computeWavePoint(i, t, tmpPt);
          tx = tmpPt[0];
          ty = tmpPt[1];
          depthScale = tmpPt[2];
          spring = 0.14;
          damp = 0.76;
        } else if (currentScene === 2) {
          const ci = cId[i];
          const def = CLUSTERS_DEF[ci];
          const hub = clusterHubs[ci];
          const rPx = def.r * scaleDim * hub.s;
          const spin = netT * 0.42 + phaseArr[i] * 0.15;
          const lx = cOx[i] * Math.cos(spin) - cOz[i] * Math.sin(spin);
          const ly = cOy[i];
          tx = hub.x + lx * rPx;
          ty = hub.y + ly * rPx;
          depthScale = hub.s;
          spring = 0.075;
          damp = 0.84;
        } else if (currentScene === 3) {
          const leftX = vw * 0.09;
          const rightX = vw * 0.91;
          const baseLineY = vh * 0.72;
          const spT = Math.max(0, t - T_SPIKE);
          const rise = Math.min(1, spT / 0.85);
          const riseEased = 1 - Math.pow(1 - rise, 3);
          const flutter = Math.sin(t * 2.6 + phaseArr[i]) * 2.2;
          tx = leftX + chartU[i] * (rightX - leftX);
          ty = baseLineY - chartH[i] * vh * 0.47 * riseEased + flutter;
          spring = 0.085;
          damp = 0.83;
        } else {
          // Scene 5: Elliptical stardust halo + wordmark convergence
          if (ringRole[i] === 0 && wordTargets.length) {
            const wt = wordTargets[i % wordTargets.length];
            tx = wt[0];
            ty = wt[1];
            spring = 0.095;
            damp = 0.82;
          } else {
            const ang = ringAngle[i] + revealT * ringSpeed[i];
            const rx = vw * (vw < 700 ? 0.44 : 0.36) * ringRad[i];
            const ry = vh * (vw < 700 ? 0.24 : 0.29) * ringRad[i];
            tx = vw * 0.5 + Math.cos(ang) * rx + smx * 18;
            ty = vh * 0.49 + Math.sin(ang) * ry + smy * 12;
            spring = 0.06;
            damp = 0.88;
          }
        }

        vx[i] = (vx[i] + (tx - px[i]) * spring * dtScale) * Math.pow(damp, dtScale);
        vy[i] = (vy[i] + (ty - py[i]) * spring * dtScale) * Math.pow(damp, dtScale);
        px[i] += vx[i] * dtScale;
        py[i] += vy[i] * dtScale;

        // Pick particle color strictly from portfolio palette
        let palIdx = 1;
        let alpha = 0.84;
        if (currentScene === 0) {
          palIdx = i % 3 === 0 ? 0 : 1;
          alpha = 0.38 + Math.min(0.58, depthScale * 0.52);
        } else if (currentScene === 1) {
          const colored = px[i] <= sweepX;
          palIdx = colored ? chArr[i] : (i % 3 === 0 ? 0 : 1);
          alpha = colored ? 0.9 : 0.65;
        } else if (currentScene === 2) {
          palIdx = chArr[i];
          alpha = CLUSTERS_DEF[cId[i]].highlight ? 0.95 : 0.78;
        } else if (currentScene === 3) {
          palIdx = chartBand[i] === 2 ? 3 : chartBand[i] === 1 ? 0 : 2;
          alpha = chartBand[i] === 2 ? 0.95 : 0.72;
        } else {
          if (ringRole[i] === 0) {
            palIdx = px[i] > vw * 0.54 ? 3 : 0;
            alpha = 0.92 * wordFadeOut;
          } else {
            palIdx = i % 7 === 0 ? 3 : i % 2 === 0 ? 1 : 2;
            alpha = 0.42;
          }
        }

        if (alpha < 0.03) continue;
        const col = PALETTE[palIdx];

        // Compute directional streak length from velocity or wave tangent
        let dx = px[i] - prevX[i];
        let dy = py[i] - prevY[i];
        if (currentScene === 0 || currentScene === 1) {
          // Give the flowing cloth ribbon its signature directional fiber strokes
          const tangentAng = Math.cos(uArr[i] * 2.8 - t * 1.75) * 0.75 + 0.35;
          const fiberLen = (5.5 + sizeArr[i] * 3.8) * depthScale;
          dx = Math.cos(tangentAng) * fiberLen + dx * 0.6;
          dy = Math.sin(tangentAng) * fiberLen + dy * 0.6;
        } else {
          // Elongate streaks during fast scene morphs, tighten into crisp dots when settled
          dx *= 2.3;
          dy *= 2.3;
        }

        const speed2 = dx * dx + dy * dy;
        g.strokeStyle = `rgba(${col.r},${col.g},${col.b},${alpha.toFixed(2)})`;
        if (speed2 > 5) {
          g.lineWidth = Math.max(0.9, sizeArr[i] * 0.85 * Math.min(1.25, depthScale));
          g.beginPath();
          g.moveTo(px[i] - dx, py[i] - dy);
          g.lineTo(px[i], py[i]);
          g.stroke();
        } else {
          const r = sizeArr[i] * 0.72 * Math.min(1.2, depthScale);
          g.fillStyle = `rgba(${col.r},${col.g},${col.b},${alpha.toFixed(2)})`;
          g.fillRect(px[i] - r, py[i] - r, r * 2, r * 2);
        }
      }

      // Draw Scene 2 luminous vertical scanline front
      if (currentScene === 1 && sweepP > 0 && sweepP < 1) {
        const beam = g.createLinearGradient(sweepX - 44, 0, sweepX + 12, 0);
        beam.addColorStop(0, 'rgba(225, 6, 0, 0)');
        beam.addColorStop(0.75, 'rgba(225, 6, 0, 0.24)');
        beam.addColorStop(0.95, 'rgba(238, 238, 238, 0.75)');
        beam.addColorStop(1, 'rgba(225, 6, 0, 0)');
        g.fillStyle = beam;
        g.fillRect(sweepX - 44, 0, 56, vh);
      }

      // Draw Scene 3 cluster hubs, labels & Signal Red EOC reticle
      if (currentScene === 2) {
        const lblAlpha = Math.min(1, Math.max(0, (netT - 0.55) / 0.65));
        if (lblAlpha > 0.01) {
          for (let c = 0; c < CLUSTERS_DEF.length; c++) {
            const def = CLUSTERS_DEF[c];
            const hub = clusterHubs[c];
            const isRed = def.highlight;

            // Core glow
            const glowR = isRed ? 24 : 18;
            const hg = g.createRadialGradient(hub.x, hub.y, 1, hub.x, hub.y, glowR);
            hg.addColorStop(0, isRed ? `rgba(225,6,0,${0.9 * lblAlpha})` : `rgba(240,240,240,${0.85 * lblAlpha})`);
            hg.addColorStop(1, 'rgba(0,0,0,0)');
            g.fillStyle = hg;
            g.beginPath();
            g.arc(hub.x, hub.y, glowR, 0, Math.PI * 2);
            g.fill();

            // Highlight reticle on EOC Command cluster
            if (isRed) {
              const ringR = def.r * scaleDim * hub.s * 0.92;
              g.strokeStyle = `rgba(225, 6, 0, ${0.72 * lblAlpha})`;
              g.lineWidth = 1.25;
              g.beginPath();
              g.arc(hub.x, hub.y, ringR, 0, Math.PI * 2);
              g.stroke();

              g.strokeStyle = `rgba(225, 6, 0, ${0.35 * lblAlpha})`;
              g.beginPath();
              g.arc(hub.x, hub.y, ringR * (1.16 + Math.sin(t * 5) * 0.05), 0, Math.PI * 2);
              g.stroke();
            }

            // Label above cluster
            const labelY = hub.y - def.r * scaleDim * hub.s - 10;
            g.textAlign = 'center';
            g.font = isRed ? '600 12px "DM Sans", sans-serif' : '500 11px "DM Mono", monospace';
            g.fillStyle = isRed
              ? `rgba(255, 72, 64, ${0.95 * lblAlpha})`
              : `rgba(224, 224, 224, ${0.86 * lblAlpha})`;
            g.fillText(rtl ? def.labelAr : def.labelEn, hub.x, labelY);

            if (isRed) {
              g.font = '500 10px "DM Mono", monospace';
              g.fillStyle = `rgba(192, 192, 192, ${0.72 * lblAlpha})`;
              g.fillText(
                rtl ? 'تنسيق مباشر · غرفة العمليات' : 'Active · Real-time coordination',
                hub.x,
                hub.y + def.r * scaleDim * hub.s + 18
              );
            }
          }
        }
      }

      raf = requestAnimationFrame(drawFrame);
    };

    raf = requestAnimationFrame(drawFrame);

    return () => {
      finishedRef.current = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', resize);
      window.removeEventListener('keydown', onKeyDown);
      document.documentElement.classList.remove('hz-intro');
      window.__portfolioLenis?.start?.();
    };
  }, [rtl]);

  const activeScene = scenes[sceneIdx] || scenes[0];

  return (
    <div
      ref={rootRef}
      className={`si-stage${rtl ? ' si-stage--rtl' : ''}`}
      dir={rtl ? 'rtl' : 'ltr'}
      role="region"
      aria-label={rtl ? 'مقدمة تفاعلية — محمد ربيع' : 'Cinematic introduction — Mohamed Rabea'}
    >
      <canvas ref={canvasRef} className="si-canvas" aria-hidden="true" />

      {/* Top telemetry HUD */}
      <div className="si-top">
        <div className="si-top-left">
          <span className="si-live-dot" aria-hidden="true" />
          <span>{rtl ? 'سجل العمليات · القاهرة' : 'FIELD RECORD · CAIRO EG'}</span>
        </div>

        <div className={`si-counter${sceneIdx >= 4 ? ' is-hidden' : ''}`} aria-hidden="true">
          <small>{activeScene.counterLabel}</small>
          <strong ref={counterRef}>0</strong>
        </div>
      </div>

      {/* Scene 2 floating source labels */}
      <div className={`si-sources${sceneIdx === 1 ? ' is-active' : ''}`} aria-hidden="true">
        {SOURCE_TAGS.map((tag) => (
          <span
            key={tag.label}
            className="si-source-tag"
            style={{
              left: `${tag.x * 100}%`,
              top: `${tag.y * 100}%`,
              transitionDelay: `${tag.delay}s`,
            }}
          >
            <i />
            {tag.label}
          </span>
        ))}
      </div>

      {/* Scene 4 legend */}
      <div className={`si-legend${sceneIdx === 3 ? ' is-active' : ''}`} aria-hidden="true">
        <span><i className="si-dot--steel" />{rtl ? 'خط الأساس' : 'Baseline'}</span>
        <span><i className="si-dot--silver" />{rtl ? 'تشغيلي' : 'Operational'}</span>
        <span><i className="si-dot--signal" />{rtl ? 'ذروة قرار' : 'Priority Spike'}</span>
      </div>

      {/* Scene 5 Final Brand Lockup (MR Monogram + Wordmark + Title) */}
      <div className={`si-reveal${revealLock ? ' is-active' : ''}`}>
        <div className="si-reveal-mark">
          <BrandMark size={78} variant="dark" animated />
        </div>
        <div className="si-reveal-wordmark">
          <span>MOHAMED</span>
          <span className="si-reveal-accent">RABEA</span>
        </div>
        <p className="si-reveal-tagline">
          {rtl
            ? 'ذكاء البيانات، تطوير الأنظمة، وإدارة العمليات الإنسانية.'
            : 'Data intelligence that turns operational complexity into clear decisions.'}
        </p>
        <span className="si-reveal-rule" aria-hidden="true" />
        <div className="si-reveal-credit">
          <strong>{rtl ? 'محمد ربيع' : 'Mohamed Rabea'}</strong>
          <small>
            {rtl
              ? 'محلل بيانات · مطور أنظمة متكاملة · مشرف عمليات الطوارئ'
              : 'Data Analyst · Full-Stack Developer · Operations Supervisor'}
          </small>
        </div>
      </div>

      {/* Bottom storytelling subtitle & Skip control */}
      <div className="si-bottom">
        <div className="si-caption-wrap" aria-live="polite">
          {activeScene.caption && (
            <p key={activeScene.id} className="si-caption">
              {activeScene.caption.split(' ').map((word, idx) => (
                <span
                  key={`${activeScene.id}-${idx}`}
                  className="si-word"
                  style={{ animationDelay: `${idx * 75}ms` }}
                >
                  {word}{' '}
                </span>
              ))}
            </p>
          )}
        </div>

        <button
          type="button"
          className="si-skip"
          onClick={() => exitIntro.current()}
        >
          <span>{rtl ? 'تخطي المقدمة' : 'Skip intro'}</span>
          <kbd aria-hidden="true">Esc</kbd>
        </button>
      </div>

      {/* Scene progress hairline */}
      <div className="si-progress" aria-hidden="true">
        <i ref={barRef} />
      </div>
    </div>
  );
}
