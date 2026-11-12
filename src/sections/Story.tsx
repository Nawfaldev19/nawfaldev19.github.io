import { lazy, useEffect, useRef, useState } from 'react';
import { BeatDiagram } from '../components/BeatDiagram';
import { FigureFrame } from '../components/FigureFrame';
import { Fig2Poster } from '../components/Posters';
import { SectionHead } from '../components/SectionHead';
import { BEATS } from '../content/site';

const Fig2FpsToggle = lazy(() => import('../fig2/Fig2FpsToggle'));

export function Story() {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  // The sticky diagram (wide screens) shows the last beat whose top has passed the middle of the viewport.
  // A rAF-throttled scroll check, so fast scrolls and jumps never leave it out of step.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll<HTMLElement>('[data-beat]'));
    let raf = 0;
    const update = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let idx = 0;
      items.forEach((el, i) => {
        if (el.getBoundingClientRect().top < mid) idx = i;
      });
      setActive(idx);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);

  return (
    <section id="story" className="section page" aria-labelledby="story-title">
      <SectionHead
        code="S.01"
        label="Story · 01–04"
        id="story-title"
        lede="Where the FPS numbers in my stats line come from. The editor is under NDA, so the drawings are synthetic; the numbers are real."
      >
        From under 10 FPS to 40–56
      </SectionHead>

      <div className="story">
        <div className="story__sticky" aria-hidden="true">
          <BeatDiagram beat={active} />
        </div>
        <ol className="story__beats" ref={listRef}>
          {BEATS.map((b, i) => (
            <li key={b.no} className={`beat ${active === i ? 'is-active' : ''}`} data-beat={i}>
              <p className="beat__no mono-label">{b.no}</p>
              <h3 className="beat__title">{b.title}</h3>
              <p className="beat__body">{b.body}</p>
              <BeatDiagram beat={i} className="beat__inline" />
            </li>
          ))}
        </ol>
      </div>

      <FigureFrame
        n={2}
        caption="Same graph, two renderers. Measured on your device."
        minHeight={360}
        poster={<Fig2Poster />}
        figure={Fig2FpsToggle}
      />
    </section>
  );
}
