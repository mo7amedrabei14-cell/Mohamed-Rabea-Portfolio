import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Accessible, responsive interactive presentation viewer modal.
 * - Renders via Portal so parent transforms/stacking contexts never clip it.
 * - Pauses Lenis smooth scroll and locks document scroll while open.
 * - Traps Tab focus, closes via Close button, Escape key, or backdrop click.
 * - Fixes cross-origin iframe blank-screen failure in `eoc-command-deck.html`
 *   (whose inline script calls `localStorage.getItem()` without try/catch, throwing
 *   SecurityError in third-party-storage-blocked or local-host iframes) by fetching
 *   the CORS-enabled single-file deck and injecting a safe in-memory localStorage
 *   fallback shim + `<base>` tag for `srcDoc` rendering.
 * - Gracefully falls back to direct `<iframe src={url}>` + prominent "Open in a new tab"
 *   action if fetch fails or embedding is restricted — never a blank modal.
 */
function injectIframeSafeShim(rawHtml, sourceUrl, preferredLang) {
  const baseHref = sourceUrl.slice(0, sourceUrl.lastIndexOf('/') + 1);
  const safeLang = preferredLang === 'ar' ? 'ar' : 'en';
  const shim = '<base href="' + baseHref + '"><script>(function(){' +
    'var initLang=' + JSON.stringify(safeLang) + ';' +
    'try{window.localStorage.getItem("__probe");}' +
    'catch(e){var store={"deck-lang":initLang};try{' +
      'Object.defineProperty(window,"localStorage",{configurable:true,value:{' +
        'getItem:function(k){return Object.prototype.hasOwnProperty.call(store,k)?store[k]:null;},' +
        'setItem:function(k,v){store[k]=String(v);},' +
        'removeItem:function(k){delete store[k];},' +
        'clear:function(){store={};}' +
      '}});' +
    '}catch(_){}}' +
  '})();</script>';

  if (/<head[^>]*>/i.test(rawHtml)) {
    return rawHtml.replace(/<head([^>]*)>/i, '<head$1>' + shim);
  }
  return shim + rawHtml;
}

export function PresentationModal({
  url,
  title,
  eyebrow,
  description,
  openNewTabLabel,
  closeLabel,
  rtl = false,
  onClose,
}) {
  const isSameOrigin = (() => {
    try {
      return new URL(url, window.location.href).origin === window.location.origin;
    } catch {
      return false;
    }
  })();

  // Production portfolio and EOC deck share the same github.io origin.
  // Stream the page directly in an iframe instead of fetching the full HTML,
  // converting it to a string, and creating a second document via srcDoc.
  const [mode, setMode] = useState(() => (isSameOrigin ? 'direct' : 'loading'));
  const [srcDocHtml, setSrcDocHtml] = useState('');
  const [frameReady, setFrameReady] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);

  const closeRef = useRef(null);
  const panelRef = useRef(null);
  const frameRef = useRef(null);

  // In same-origin production and srcDoc local preview, we can inspect the deck
  // document directly. Mark it ready at DOM parse time, not after its images load.
  useEffect(() => {
    let frame = 0;
    let disposed = false;

    const inspectDeck = () => {
      if (disposed) return;
      try {
        const doc = frameRef.current?.contentDocument;
        if (doc && doc.readyState !== 'loading' && doc.querySelector('.s')) {
          setFrameReady(true);
          setShowSlowHint(false);
          return;
        }
      } catch {
        // A cross-origin fallback cannot be inspected; its native load event handles readiness.
      }
      frame = window.setTimeout(inspectDeck, 100);
    };

    inspectDeck();
    return () => {
      disposed = true;
      window.clearTimeout(frame);
    };
  }, [mode]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    window.__portfolioLenis?.stop?.();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = panelRef.current?.querySelectorAll(
        'button:not([disabled]), a[href], iframe, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    const focusTimer = setTimeout(() => closeRef.current?.focus(), 20);
    const slowTimer = setTimeout(() => setShowSlowHint(true), 6000);

    return () => {
      clearTimeout(focusTimer);
      clearTimeout(slowTimer);
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.__portfolioLenis?.start?.();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  useEffect(() => {
    // Same-origin production path: let the browser stream the real document.
    if (isSameOrigin) {
      setMode('direct');
      return undefined;
    }

    // Localhost / custom preview path: use srcDoc only when the remote deck is
    // cross-origin, retaining the storage-safe shim for restrictive browsers.
    let active = true;
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12000);

    const loadDeck = async () => {
      setMode('loading');
      setFrameReady(false);
      setShowSlowHint(false);
      try {
        const res = await fetch(url, { mode: 'cors', signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const html = await res.text();
        if (!active) return;
        const patched = injectIframeSafeShim(html, url, rtl ? 'ar' : 'en');
        setSrcDocHtml(patched);
        setMode('srcdoc');
      } catch {
        if (!active) return;
        // A timed-out or unavailable fetch must not leave a permanent loader.
        setMode('direct');
      }
    };

    loadDeck();
    return () => {
      active = false;
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [url, rtl, isSameOrigin]);

  return createPortal(
    <div
      className="ec-modal ec-modal--presentation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="presentation-modal-title"
      dir={rtl ? 'rtl' : 'ltr'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ec-modal-panel" ref={panelRef}>
        <div className="ec-modal-bar">
          <div className="ec-modal-title-group">
            <small>{eyebrow}</small>
            <strong id="presentation-modal-title">{title}</strong>
          </div>
          <div className="ec-modal-actions">
            <a
              className="ec-modal-ext"
              href={url}
              target="_blank"
              rel="noreferrer"
            >
              <span>{openNewTabLabel}</span>
              <span aria-hidden="true">↗</span>
            </a>
            <button
              ref={closeRef}
              type="button"
              className="ec-modal-close"
              onClick={onClose}
              aria-label={closeLabel}
            >
              <span>{rtl ? 'إغلاق' : 'Close'}</span>
              <kbd>Esc</kbd>
            </button>
          </div>
        </div>

        <div className="ec-modal-stage">
          {!frameReady && mode !== 'error' && (
            <div className="ec-modal-loader" role="status" aria-live="polite">
              <span className="ec-modal-spinner" aria-hidden="true" />
              <span>
                {rtl ? 'جارٍ تحميل العرض التفاعلي...' : 'Loading interactive presentation...'}
              </span>
            </div>
          )}

          {mode === 'error' ? (
            <div className="ec-modal-fallback">
              <span className="ec-tag">{rtl ? 'وضع التبويب المستقل' : 'DIRECT ACCESS'}</span>
              <h3>
                {rtl
                  ? 'افتح العرض التفاعلي في نافذة مستقلة'
                  : 'Open the live presentation in a new tab'}
              </h3>
              <p>{description}</p>
              <a
                className="button button--primary"
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                {openNewTabLabel} ↗
              </a>
            </div>
          ) : mode === 'srcdoc' ? (
            <iframe
              className={`ec-modal-frame ec-modal-frame--dark${frameReady ? ' is-ready' : ''}`}
              ref={frameRef}
              srcDoc={srcDocHtml}
              title={title}
              allow="fullscreen; autoplay"
              allowFullScreen
              onLoad={() => {
                setFrameReady(true);
                setShowSlowHint(false);
              }}
              onError={() => setMode('error')}
            />
          ) : mode === 'direct' ? (
            <iframe
              className={`ec-modal-frame ec-modal-frame--dark${frameReady ? ' is-ready' : ''}`}
              ref={frameRef}
              src={url}
              title={title}
              allow="fullscreen; autoplay"
              allowFullScreen
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => {
                setFrameReady(true);
                setShowSlowHint(false);
              }}
              onError={() => setMode('error')}
            />
          ) : null}

          {showSlowHint && !frameReady && mode !== 'error' && (
            <div className="ec-modal-banner" role="status">
              <span>
                {rtl
                  ? 'إذا استغرق التحميل وقتًا طويلًا أو منع المتصفح التضمين، يمكنك فتحه مباشرة في تبويب مستقل.'
                  : 'Taking a moment or restricted by your browser? Open the live presentation directly in a new tab.'}
              </span>
              <a href={url} target="_blank" rel="noreferrer">
                {openNewTabLabel} ↗
              </a>
            </div>
          )}
        </div>

        <p className="ec-modal-hint">
          {rtl
            ? `${description} · اضغط Esc أو خارج النافذة للإغلاق.`
            : `${description} · Press Esc or click outside to close.`}
        </p>
      </div>
    </div>,
    document.body
  );
}
