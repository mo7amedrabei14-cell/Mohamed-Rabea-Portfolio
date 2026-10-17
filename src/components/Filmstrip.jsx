import { useEffect, useRef, useState } from 'react';

/*
 * Horizontal case-study filmstrip. Drag to scrub, arrows/dots to step.
 * On touch and reduced-motion it collapses to a vertical stack — the same
 * content, no horizontal chrome, no motion dependency.
 */
export default function Filmstrip({ items, activeIndex, onActivate, rtl }) {
  const scrollerRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startScroll: 0 });

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;
    const onWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        scroller.scrollLeft += e.deltaX;
      }
    };
    scroller.addEventListener('wheel', onWheel, { passive: false });
    return () => scroller.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e) => {
    setDragging(true);
    dragRef.current = { startX: e.clientX, startScroll: scrollerRef.current.scrollLeft };
  };
  const onPointerMove = (e) => {
    if (!dragging) return;
    const dx = e.clientX - dragRef.current.startX;
    scrollerRef.current.scrollLeft = dragRef.current.startScroll - dx;
  };
  const onPointerUp = () => setDragging(false);

  const step = (dir) => {
    if (!scrollerRef.current) return;
    const card = scrollerRef.current.querySelector('.film-card');
    const w = card ? card.offsetWidth : scrollerRef.current.clientWidth;
    scrollerRef.current.scrollBy({ left: dir * w, behavior: 'smooth' });
  };

  const onDot = (i) => {
    if (!scrollerRef.current) return;
    const card = scrollerRef.current.querySelectorAll('.film-card')[i];
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <div className={`filmstrip${rtl ? ' filmstrip--ar' : ''}`}>
      <div className="filmstrip__rail" aria-hidden="true"><span /><span /><span /></div>
      <div
        className="filmstrip__scroller"
        ref={scrollerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <div className="filmstrip__track">
          {items.map((item, i) => (
            <article
              key={item.id}
              className={`film-card${i === activeIndex ? ' film-card--active' : ''}`}
              id={`film-${item.id}`}
            >
              <div className="film-card__frame">
                <img src={item.image} alt={item.imageAlt} loading={i === 0 ? 'eager' : 'lazy'} />
                <div className="film-card__cap"><span>{item.index}</span><span>{item.imageLabel}</span></div>
              </div>
              <div className="film-card__body">
                <div className="film-card__kicker">{item.kicker}</div>
                <h3>{item.title}</h3>
                <p>{item.lede}</p>
                <div className="film-card__meta">
                  <span>{item.tech.join(' · ')}</span>
                  <button type="button" className="film-card__cta" onClick={() => onActivate(item.id)}>{item.title}</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="filmstrip__controls">
        <button type="button" className="filmstrip__arrow" aria-label={rtl ? 'السابق' : 'Previous'} onClick={() => step(rtl ? 1 : -1)}>{rtl ? '›' : '‹'}</button>
        <div className="filmstrip__dots" role="tablist" aria-label={rtl ? 'المشروعات' : 'Projects'}>
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`${rtl ? 'المشروع' : 'Project'} ${i + 1}`}
              className={i === activeIndex ? 'filmstrip__dot filmstrip__dot--on' : 'filmstrip__dot'}
              onClick={() => onDot(i)}
            />
          ))}
        </div>
        <button type="button" className="filmstrip__arrow" aria-label={rtl ? 'التالي' : 'Next'} onClick={() => step(rtl ? -1 : 1)}>{rtl ? '‹' : '›'}</button>
      </div>
    </div>
  );
}
