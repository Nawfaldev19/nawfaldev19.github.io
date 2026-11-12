import type { ReactNode } from 'react';

/** Drawing-sheet section label: "S.02 ──── SELECTED WORK", then the heading. */
export function SectionHead({
  code,
  label,
  id,
  children,
  lede,
}: {
  code: string;
  label: string;
  id: string;
  children: ReactNode;
  lede?: ReactNode;
}) {
  return (
    <div className="sec-head" data-reveal>
      <p className="sec-head__code mono-label" aria-hidden="true">
        <span>{code}</span>
        <span className="rule" />
        <span>{label}</span>
      </p>
      <h2 id={id} className="sec-head__title">
        {children}
      </h2>
      {lede && <p className="sec-head__lede">{lede}</p>}
    </div>
  );
}
