import { useRef } from 'react';

/**
 * Adapted from React Bits SpotlightCard (https://reactbits.dev/components/spotlight-card)
 * Tailored strictly to the portfolio palette (Charcoal #2A2A2A, Silver #C0C0C0, Signal Red #E10600).
 */
export function SpotlightCard({
  as: Tag = 'article',
  className = '',
  spotlightColor = 'rgba(225, 6, 0, 0.16)',
  silverColor = 'rgba(192, 192, 192, 0.12)',
  children,
  ...rest
}) {
  const ref = useRef(null);

  const onPointerMove = (e) => {
    if (e.pointerType === 'touch') return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`);
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`);
  };

  return (
    <Tag
      ref={ref}
      className={`rb-spotlight-card${className ? ` ${className}` : ''}`}
      style={{
        '--spot-color': spotlightColor,
        '--spot-silver': silverColor,
      }}
      onPointerMove={onPointerMove}
      {...rest}
    >
      {children}
    </Tag>
  );
}
