import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Accessible, responsive viewer for the standalone EOC command deck.
 * The browser streams the real page directly into the iframe. The deck sends
 * a DOM-ready message after its first slide is initialized, so the viewer does
 * not wait for all slide screenshots to finish downloading.
 */
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
  const [frameReady, setFrameReady] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);
  const [frameError, setFrameError] = useState(false);

  const closeRef = useRef(null);
  const panelRef = useRef(null);
  const frameRef = useRef(null);

  // Listen before the iframe begins navigation. Validate both the source
  // window and its expected origin before accepting the deck-ready signal.
  useLayoutEffect(() => {
    let expectedOrigin;
    try {
      expectedOrigin = new URL(url, window.location.href).origin;
    } catch {
      expectedOrigin = '';
    }

    const onFrameMessage = (event) => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (!expectedOrigin || event.origin !== expectedOrigin) return;
      if (event.data?.type !== 'eoc-presentation:dom-ready') return;
      setFrameReady(true);
      setShowSlowHint(false);
      setFrameError(false);
    };

    window.addEventListener('message', onFrameMessage);
    return () => window.removeEventListener('message', onFrameMessage);
  }, [url]);

  // Lock the portfolio behind the modal and preserve keyboard focus behavior.
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
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 20);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      window.__portfolioLenis?.start?.();
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  // This banner never covers the presentation. The iframe remains visible and
  // interactive while its screenshots load; the banner is only a late fallback.
  useEffect(() => {
    if (frameReady || frameError) return undefined;
    const timer = window.setTimeout(() => setShowSlowHint(true), 8000);
    return () => window.clearTimeout(timer);
  }, [frameReady, frameError]);

  const markFrameReady = () => {
    setFrameReady(true);
    setShowSlowHint(false);
    setFrameError(false);
  };

  return createPortal(
    <div
      className="ec-modal ec-modal--presentation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="presentation-modal-title"
      dir={rtl ? 'rtl' : 'ltr'}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="ec-modal-panel" ref={panelRef}>
        <div className="ec-modal-bar">
          <div className="ec-modal-title-group">
            <small>{eyebrow}</small>
            <strong id="presentation-modal-title">{title}</strong>
          </div>
          <div className="ec-modal-actions">
            <a className="ec-modal-ext" href={url} target="_blank" rel="noreferrer">
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
          <iframe
            ref={frameRef}
            className={`ec-modal-frame ec-modal-frame--dark${frameReady ? ' is-ready' : ''}`}
            src={url}
            title={title}
            allow="fullscreen; autoplay"
            allowFullScreen
            loading="eager"
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={markFrameReady}
            onError={() => setFrameError(true)}
          />

          {frameError && (
            <div className="ec-modal-fallback">
              <span className="ec-tag">{rtl ? 'وضع التبويب المستقل' : 'DIRECT ACCESS'}</span>
              <h3>
                {rtl
                  ? 'تعذر تحميل العرض داخل النافذة'
                  : 'The presentation could not load in this window'}
              </h3>
              <p>{description}</p>
              <a className="button button--primary" href={url} target="_blank" rel="noreferrer">
                {openNewTabLabel} ↗
              </a>
            </div>
          )}

          {showSlowHint && !frameReady && !frameError && (
            <div className="ec-modal-banner" role="status">
              <span>
                {rtl
                  ? 'العرض ما زال يحمّل بعض الموارد. يمكنك التفاعل معه الآن أو فتحه في تبويب مستقل.'
                  : 'The deck is still loading some resources. You can interact with it now or open it in a new tab.'}
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
