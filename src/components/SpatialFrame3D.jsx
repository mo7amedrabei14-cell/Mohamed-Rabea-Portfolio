import { useRef } from 'react';

/**
 * Multi-Plane 3D Spatial Showcase Frame (Prompt Motion Product-UI + React Bits TiltedCard inspired).
 * Distinct from ordinary flat card tilt: uses true CSS 3D preserve-3d Z-layers:
 *  - Base stage & window chrome at Z=0
 *  - Screenshot viewport recessed slightly with specular sheen at Z=8px
 *  - Floating telemetry code badge at Z=28px
 *  - Interactive action pill at Z=36px
 * Automatically degrades cleanly to static crisp framing on touchscreens and prefers-reduced-motion.
 */
export function SpatialFrame3D({
  code,
  label,
  actionText,
  onClick,
  ariaLabel,
  children,
}) {
  const stageRef = useRef(null);

  const onPointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = stageRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / Math.max(1, r.width) - 0.5;
    const ny = (e.clientY - r.top) / Math.max(1, r.height) - 0.5;
    el.style.setProperty('--rx', `${(-ny * 9).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(nx * 10).toFixed(2)}deg`);
    el.style.setProperty('--glare-x', `${((nx + 0.5) * 100).toFixed(1)}%`);
    el.style.setProperty('--glare-y', `${((ny + 0.5) * 100).toFixed(1)}%`);
  };

  const onPointerLeave = () => {
    const el = stageRef.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--glare-x', '50%');
    el.style.setProperty('--glare-y', '20%');
  };

  return (
    <figure className="sp3d-wrap">
      <div
        ref={stageRef}
        className="sp3d-stage"
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {/* Top spatial chrome bar */}
        <div className="sp3d-bar">
          <div className="sp3d-dots" aria-hidden="true">
            <i className="is-signal" />
            <i />
            <i />
          </div>
          <span className="sp3d-label">{label}</span>
          <span className="sp3d-code">{code}</span>
        </div>

        {/* Interactive media viewport */}
        <div
          className="sp3d-viewport"
          role="button"
          tabIndex={0}
          aria-label={ariaLabel}
          onClick={onClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onClick?.(e);
            }
          }}
        >
          {children}
          <span className="sp3d-glare" aria-hidden="true" />
          <span className="sp3d-floating-cta" aria-hidden="true">
            <span>{actionText}</span>
            <i>↗</i>
          </span>
        </div>

        {/* Depth floor reflection accent */}
        <span className="sp3d-shadow-floor" aria-hidden="true" />
      </div>
    </figure>
  );
}
