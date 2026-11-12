import { lazy } from 'react';
import { FigureFrame } from '../components/FigureFrame';
import { Fig3Poster } from '../components/Posters';
import { SectionHead } from '../components/SectionHead';
import { LINKS } from '../content/site';

const Fig3SeatScrubber = lazy(() => import('../fig3/Fig3SeatScrubber'));

const GENERATIONS = [
  { when: 'Oct 2025', gen: 'Gen 1', what: 'MUI grid of DOM elements', note: 'One element per seat.' },
  { when: 'Jun 2026', gen: 'Gen 2', what: 'Plain SVG', note: 'Lighter, but still every seat at every zoom.' },
  { when: '24–26 Jun 2026', gen: 'Gen 3', what: 'Konva canvas', note: 'Zoom-based level of detail.' },
];

const FACTS = [
  { k: '94%', v: 'of the first canvas builder written by me (8,446 of 8,942 lines), before it became a shared package' },
  { k: '5', v: 'element kinds: sections with curved rows, standing zones, décor objects, text, section groups' },
  { k: '40 × 30 × 40', v: 'sections × rows × seats at most, with a warning above 3,000 seats' },
  { k: '5,760', v: 'seats in the stress test' },
  { k: '143', v: 'package tests passing' },
  { k: '≈ 2/3', v: 'of the organiser dashboard and the check-in app written by me' },
];

export function SeatMapCase() {
  return (
    <section id="seat-map" className="section page" aria-labelledby="seat-title">
      <SectionHead code="S.03" label="Case study · seat map" id="seat-title">
        The seat-map builder, three times
      </SectionHead>

      <div className="case">
        <div className="case__intro prose">
          <p className="case__meta mono-label">
            <a href={LINKS.tixters} target="_blank" rel="noopener">
              Tixters<span className="visually-hidden"> (opens in a new tab)</span>
            </a>{' '}
            · event ticketing · lead developer, team of three
          </p>
          <p>
            Tixters is an event-ticketing platform I built with a small team as a side project. I was the lead
            developer. Organisers draw their venue’s seating in the browser, and the builder for that went through
            three generations in eight months.
          </p>
        </div>

        <ol className="timeline" aria-label="Three generations">
          {GENERATIONS.map((g) => (
            <li key={g.gen} className="timeline__item">
              <p className="mono-label timeline__when">
                {g.gen} · {g.when}
              </p>
              <p className="timeline__what">{g.what}</p>
              <p className="timeline__note">{g.note}</p>
            </li>
          ))}
        </ol>

        <dl className="facts">
          {FACTS.map((f) => (
            <div key={f.k} className="facts__item">
              <dt className="facts__k">{f.k}</dt>
              <dd className="facts__v">{f.v}</dd>
            </div>
          ))}
        </dl>

        <div className="callout">
          <h3 className="callout__title mono-label">What failed</h3>
          <ul className="prose">
            <li>The first DOM grid drew one element per seat. It could not scale to a real venue.</li>
            <li>The SVG version was lighter but still drew every seat at every zoom level.</li>
            <li>
              The fix was level of detail: a section draws as one block until you zoom in, then its rows and seats
              appear.
            </li>
          </ul>
        </div>
      </div>

      <FigureFrame
        n={3}
        caption="DOM → SVG → Canvas. Scrub to compare."
        minHeight={360}
        poster={<Fig3Poster />}
        figure={Fig3SeatScrubber}
      />
    </section>
  );
}
