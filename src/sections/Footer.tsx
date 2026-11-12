import { BUILD_DATE, LINKS } from '../content/site';

const CELLS = [
  ['Name', 'Nawfal Imran'],
  ['Role', 'Senior Full Stack Developer'],
  ['Sheet', '1/1'],
  ['Rev', BUILD_DATE],
  ['Scale', '1:1'],
];

/** Engineering-drawing title block. */
export function Footer() {
  return (
    <footer className="site-footer page">
      <dl className="title-block">
        {CELLS.map(([k, v]) => (
          <div key={k} className={`title-block__cell title-block__cell--${k.toLowerCase()}`}>
            <dt className="mono-label">{k}</dt>
            <dd>{k === 'Rev' ? <time dateTime={v}>{v}</time> : v}</dd>
          </div>
        ))}
      </dl>
      <p className="site-footer__note mono-label">
        Built with React, React Flow, Konva.{' '}
        <a href={LINKS.source} target="_blank" rel="noopener">
          Source on GitHub<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
        .
      </p>
    </footer>
  );
}
