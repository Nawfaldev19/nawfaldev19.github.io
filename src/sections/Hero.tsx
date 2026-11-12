import { lazy } from 'react';
import { CopyEmail } from '../components/CopyEmail';
import { FigureFrame } from '../components/FigureFrame';
import { Fig1Poster } from '../components/Posters';
import { LINKS, STACK, STATS } from '../content/site';

const Fig1Playground = lazy(() => import('../fig1/Fig1Playground'));

export function Hero() {
  return (
    <section className="hero section page" aria-labelledby="hero-title">
      <p className="sec-head__code mono-label" aria-hidden="true">
        <span>S.00</span>
        <span className="rule" />
        <span>Portfolio · sheet 1 of 1</span>
      </p>

      <div className="hero__grid">
        <div className="hero__text">
          <h1 id="hero-title" className="hero__name">
            Nawfal Imran
          </h1>
          <p className="hero__role">Senior Full Stack Developer</p>
          <p className="hero__niche">
            I build the <em className="accent-word">editors</em> other apps are built around.
          </p>
          <p className="hero__stack mono-label">
            {STACK.map((s, i) => (
              <span key={s}>
                {i > 0 && <span aria-hidden="true"> · </span>}
                {s}
              </span>
            ))}
          </p>

          <p className="hero__status">
            <span className="status-dot" aria-hidden="true" />
            Open to remote roles · Lahore, UTC+5 · working worldwide
          </p>

          <div className="actions">
            <CopyEmail />
            <a className="btn btn--plain" href={LINKS.linkedin} rel="me noopener" target="_blank">
              LinkedIn<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            <a className="btn btn--plain" href={LINKS.github} rel="me noopener" target="_blank">
              GitHub<span className="visually-hidden"> (opens in a new tab)</span>
            </a>
            {/* TODO: add a "CV (PDF)" button once the public CV is exported to public/. */}
          </div>

          <ul className="hero__stats mono-label" aria-label="At a glance">
            {STATS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>

        {/* PHOTO PLACEHOLDER: replace with <img src="/photo.jpg" width="320" height="400" alt="Nawfal Imran" /> (4:5). */}
        <div className="photo-slot" role="img" aria-label="Photo placeholder">
          <svg viewBox="0 0 320 400" aria-hidden="true" className="photo-slot__svg">
            <rect className="d-line" x="0.5" y="0.5" width="319" height="399" />
            <path className="d-line d-faint" d="M0 0 L320 400 M320 0 L0 400" />
            <circle className="d-line" cx="160" cy="200" r="36" />
            <path className="d-line d-accent-stroke" d="M160 148 V252 M108 200 H212" />
            <path className="d-line" d="M16 380 H304 M16 376 V384 M304 376 V384" />
          </svg>
          <span className="photo-slot__label mono-label">Photo · TBD</span>
          <span className="photo-slot__dim mono-label" aria-hidden="true">
            4 : 5
          </span>
        </div>
      </div>

      <FigureFrame
        n={1}
        caption="Configure this page. Every control here restyles the whole site."
        minHeight={420}
        poster={<Fig1Poster />}
        figure={Fig1Playground}
      />

      <p className="hero__skip">
        <a href="#work" className="mono-label link-arrow">
          Skip to work <span aria-hidden="true">↓</span>
        </a>
      </p>
    </section>
  );
}
