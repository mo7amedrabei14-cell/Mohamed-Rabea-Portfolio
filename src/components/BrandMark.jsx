import React from 'react';

/**
 * Original geometric MR Monogram for Mohamed Rabea.
 * Engineered on a 64x64 architectural grid using the portfolio's exact palette:
 * - Bg: #0D0D0D | Charcoal: #2A2A2A | Moonlit Silver: #C0C0C0 / #E4E4E4 | Signal Red: #E10600
 * Works seamlessly on dark and light surfaces, from 16px favicon up to full-screen intro reveal.
 */
export function BrandMark({
  size = 40,
  variant = 'dark', // 'dark' | 'light' | 'bare'
  animated = false,
  className = '',
  title = 'Mohamed Rabea MR Monogram',
}) {
  const isLight = variant === 'light';
  const isBare = variant === 'bare';
  const primaryFill = isLight ? '#141414' : '#E4E4E4';
  const bgFill = isLight ? '#EAEAEA' : '#111111';
  const frameStroke = isLight ? 'rgba(20,20,20,0.22)' : 'rgba(192,192,192,0.28)';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`mr-logo${animated ? ' mr-logo--animated' : ''}${className ? ` ${className}` : ''}`}
      role="img"
      aria-label={title}
    >
      {!isBare && (
        <>
          <path
            d="M9 2h46l7 7v46l-7 7H9l-7-7V9l7-7z"
            fill={bgFill}
          />
          <path
            className="mr-logo-frame"
            d="M9.5 3h45L61 9.5v45L54.5 61h-45L3 54.5v-45L9.5 3z"
            stroke={frameStroke}
            strokeWidth="1.5"
          />
          {/* Subtle top-left telemetry chamfer accent */}
          <path
            d="M3 16V9.5L9.5 3H16"
            stroke="#E10600"
            strokeWidth="1.5"
            strokeOpacity="0.85"
          />
        </>
      )}
      <path
        className="mr-logo-glyph"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 49V15h7.2l7.3 12.6L31.8 15H49l5 5v8.2l-5 5H37.8V49h-6V27.6l-7.3 12.2-7.3-12.2V49H10zm27.8-28.4v7.1h8.8l1.7-1.7v-3.7l-1.7-1.7h-8.8z"
        fill={primaryFill}
      />
      <path
        className="mr-logo-leg"
        d="M40.2 33.2h7.6L55 49h-7.8l-7-15.8z"
        fill="#E10600"
      />
      <rect
        className="mr-logo-datum"
        x="22.2"
        y="13.8"
        width="4.6"
        height="4.6"
        rx="0.8"
        fill="#E10600"
      />
    </svg>
  );
}
