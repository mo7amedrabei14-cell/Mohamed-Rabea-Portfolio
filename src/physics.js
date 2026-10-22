const STIFFNESS = 120;
const DAMPING = 18;
const MASS = 1;

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function finePointer() {
  return typeof window !== 'undefined'
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function attachSpringMagnet(el, { strength = 12 } = {}) {
  if (!el || prefersReducedMotion() || !finePointer()) return () => {};

  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;
  let vx = 0;
  let vy = 0;
  let raf = 0;
  let last = performance.now();

  const step = (now) => {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    const ax = (-STIFFNESS * (x - tx) - DAMPING * vx) / MASS;
    const ay = (-STIFFNESS * (y - ty) - DAMPING * vy) / MASS;
    vx += ax * dt;
    vy += ay * dt;
    x += vx * dt;
    y += vy * dt;
    el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    const still = Math.abs(vx) + Math.abs(vy) + Math.abs(x - tx) + Math.abs(y - ty) < 0.04;
    raf = still ? 0 : requestAnimationFrame(step);
  };

  const kick = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(step);
    }
  };

  const onMove = (event) => {
    if (event.pointerType === 'touch') return;
    const rect = el.getBoundingClientRect();
    const dx = (event.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const dy = (event.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    tx = Math.max(-1, Math.min(1, dx)) * strength;
    ty = Math.max(-1, Math.min(1, dy)) * strength * 0.72;
    kick();
  };

  const onLeave = () => {
    tx = 0;
    ty = 0;
    kick();
  };

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);
  el.addEventListener('blur', onLeave);

  return () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    el.removeEventListener('blur', onLeave);
    if (raf) cancelAnimationFrame(raf);
    el.style.transform = '';
  };
}

export function attachTilt(el, { max = 9 } = {}) {
  if (!el || prefersReducedMotion() || !finePointer()) return () => {};

  let trx = 0;
  let try_ = 0;
  let rx = 0;
  let ry = 0;
  let vrx = 0;
  let vry = 0;
  let raf = 0;
  let last = performance.now();

  const step = (now) => {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    vrx += ((-STIFFNESS * (rx - trx) - DAMPING * vrx) / MASS) * dt;
    vry += ((-STIFFNESS * (ry - try_) - DAMPING * vry) / MASS) * dt;
    rx += vrx * dt;
    ry += vry * dt;
    el.style.setProperty('--tilt-x', `${rx.toFixed(2)}deg`);
    el.style.setProperty('--tilt-y', `${ry.toFixed(2)}deg`);
    const still = Math.abs(vrx) + Math.abs(vry) + Math.abs(rx - trx) + Math.abs(ry - try_) < 0.05;
    raf = still ? 0 : requestAnimationFrame(step);
  };

  const kick = () => {
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(step);
    }
  };

  const onMove = (event) => {
    if (event.pointerType === 'touch') return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    try_ = px * max * 2;
    trx = -py * max * 2;
    el.style.setProperty('--art-x', `${50 + px * 8}%`);
    el.style.setProperty('--art-y', `${50 + py * 8}%`);
    kick();
  };

  const onLeave = () => {
    trx = 0;
    try_ = 0;
    el.style.setProperty('--art-x', '50%');
    el.style.setProperty('--art-y', '50%');
    kick();
  };

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerleave', onLeave);

  return () => {
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    if (raf) cancelAnimationFrame(raf);
  };
}
