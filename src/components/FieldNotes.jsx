/*
 * "Field Notes" — a quiet, image-led documentary strip.
 * These are operational moments, not marketing copy. Kept short and factual.
 * Drawn with glyphs, not photos: these are written notes from the field.
 */
function Pin() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M12 21s-7-4.4-7-10a7 7 0 0 1 14 0c0 5.6-7 10-7 10Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><circle cx="12" cy="11" r="2.4" stroke="currentColor" strokeWidth="1.6" /></svg>;
}
function Clipboard() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M9 5h6M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 9h6M9 13h6M9 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function Radio() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width="15" height="15" fill="none"><path d="M4 12a8 8 0 0 1 13-6.3M20 12a8 8 0 0 1-13 6.3M4 12h.1M20 12h.1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="12" r="2.6" fill="currentColor" /></svg>;
}

export default function FieldNotes({ notes, rtl }) {
  return (
    <section className="field-notes" aria-label={rtl ? 'ملاحظات ميدانية' : 'Field notes'}>
      <div className="section-wrap field-notes__inner">
        <div className="field-notes__head">
          <div className="eyebrow"><span className="eyebrow-dot" />{rtl ? 'ملاحظات ميدانية' : 'FIELD NOTES'}</div>
          <h2>{rtl ? 'عمل على أرض الحدث' : 'Work where the event happens'}</h2>
          <p>{rtl ? 'ضُبطت الأدوات لاحقًا لتناسب هذه اللحظات — والصور تُظهر الوضع الفعلي، لا واجهات تجريبية.' : 'The tools were built to fit these moments. The images show the real situation, not mockups.'}</p>
        </div>
        <div className="field-notes__grid">
          {notes.map((note) => (
            <article key={note.id} className="field-notes__card" data-reveal>
              <div className="field-notes__glyph">{note.glyph === 'pin' ? <Pin /> : note.glyph === 'board' ? <Clipboard /> : <Radio />}</div>
              <div className="field-notes__copy">
                <div className="field-notes__tag">{note.tag}</div>
                <div className="field-notes__place">{note.place}</div>
                <h3>{note.title}</h3>
                <p>{note.body}</p>
              </div>
            </article>
          ))}
        </div>
        <p className="field-notes__disclaimer">{rtl ? 'معاينة توضيحية · ليست بيانات تشغيل حية' : 'Conceptual preview · not live operational data'}</p>
      </div>
    </section>
  );
}
