import { SectionHead } from '../components/SectionHead';
import { LINKS, WORK } from '../content/site';

export function Work() {
  return (
    <section id="work" className="section page" aria-labelledby="work-title">
      <SectionHead
        code="S.02"
        label="Selected work"
        id="work-title"
        lede="Public demos with source. Each one is a working editor or a hard backend rule, with tests."
      >
        Register of drawings
      </SectionHead>

      <div className="register">
        <div className="register__head mono-label" aria-hidden="true">
          <span>Sheet</span>
          <span>Title</span>
          <span>What it shows</span>
          <span>Stack</span>
          <span>Status</span>
          <span>Links</span>
        </div>
        <ol className="register__list">
          {WORK.map((w) => (
            <li key={w.slug} className="register__row">
              <article aria-labelledby={`work-${w.slug}`}>
                <p className="register__sheet mono-label">
                  <span className="register__k">Sheet </span>
                  {w.sheet}
                </p>
                <div className="register__title">
                  <h3 id={`work-${w.slug}`}>{w.title}</h3>
                  <p className="mono-label register__slug">{w.slug}</p>
                </div>
                <p className="register__shows">{w.shows}</p>
                <p className="register__stack mono-label">{w.stack.join(' · ')}</p>
                <p className="register__status">
                  <span className={`badge badge--${w.status.toLowerCase()}`}>{w.status}</span>
                  {w.statusNote && <span className="register__note mono-label">{w.statusNote}</span>}
                </p>
                <ul className="register__links">
                  {w.links.map((l) => (
                    <li key={l.href}>
                      <a href={l.href} target="_blank" rel="noopener" className="link-arrow">
                        {l.label} <span aria-hidden="true">↗</span>
                        <span className="visually-hidden"> for {w.title} (opens in a new tab)</span>
                      </a>
                      {l.note && <span className="register__note mono-label">{l.note}</span>}
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ol>
        <p className="register__more">
          <a href={LINKS.github} target="_blank" rel="noopener" className="link-arrow mono-label">
            +7 more on GitHub <span aria-hidden="true">↗</span>
          </a>
        </p>
      </div>
    </section>
  );
}
