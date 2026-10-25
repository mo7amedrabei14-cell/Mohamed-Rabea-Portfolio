import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const EXTS = ['.webp', '.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG'];

// Loads /public/images/<name>.<ext>, trying common extensions; falls back to a neutral tile.
export function ReportImage({ name, alt = '', className }) {
  const [i, setI] = useState(0);
  const hasExt = /\.[A-Za-z0-9]{3,4}$/.test(name || '');
  const base = `${import.meta.env.BASE_URL}images/`;
  if (!name || (!hasExt && i >= EXTS.length) || (hasExt && i > 0)) {
    return <div className={`ec-ph ${className || ''}`} role="img" aria-label={alt || 'Preview image pending'}><span>Preview pending</span></div>;
  }
  const src = hasExt ? `${base}${encodeURIComponent(name)}` : `${base}${encodeURIComponent(name)}${EXTS[i]}`;
  return <img className={className} src={src} alt={alt} loading="lazy" decoding="async" onError={() => setI((n) => n + 1)} />;
}

export function ReportTile({ report, index, onOpen, rtl }) {
  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  const n = String(index + 1).padStart(2, '0');
  return (
    <button type="button" className={`ec-tile ec-tile--${index + 1}`} onPointerMove={move} onClick={(e) => onOpen(report, e.currentTarget)} aria-haspopup="dialog">
      <ReportImage name={report.img} alt="" />
      <span className="ec-tile-glow" aria-hidden="true" />
      <span className="ec-tile-meta">
        <small>{rtl ? `تقرير ${n} · Power BI` : `Report ${n} · Power BI`}</small>
        <strong>{report.title}</strong>
        <em>{rtl ? 'افتح التقرير التفاعلي' : 'Open the interactive report'} →</em>
      </span>
    </button>
  );
}

export function ReportModal({ report, rtl, onClose }) {
  const closeRef = useRef(null);
  const panelRef = useRef(null);
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const f = panelRef.current?.querySelectorAll('button, a[href], iframe');
      if (!f?.length) return;
      const first = f[0]; const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', onKey);
    closeRef.current?.focus();
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey); };
  }, [onClose]);
  return createPortal(
    <div className="ec-modal" role="dialog" aria-modal="true" aria-label={report.title} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="ec-modal-panel" ref={panelRef}>
        <div className="ec-modal-bar">
          <div><small>{rtl ? 'تقرير Power BI منشور' : 'Published Power BI report'}</small><strong>{report.title}</strong></div>
          <div className="ec-modal-actions">
            <a className="text-link" href={report.url} target="_blank" rel="noreferrer">{rtl ? 'فتح الأصل في تبويب جديد' : 'Open original in a new tab'} ↗</a>
            <button ref={closeRef} type="button" className="ec-modal-close" onClick={onClose}>{rtl ? 'إغلاق' : 'Close'} <kbd>Esc</kbd></button>
          </div>
        </div>
        <iframe className="ec-modal-frame" src={report.url} title={report.title} allowFullScreen loading="eager" />
        <p className="ec-modal-hint">{rtl ? 'إن لم يظهر التقرير، استخدم رابط الفتح في تبويب جديد.' : 'If the report does not load here, use the link to open it in a new tab.'}</p>
      </div>
    </div>, document.body);
}
