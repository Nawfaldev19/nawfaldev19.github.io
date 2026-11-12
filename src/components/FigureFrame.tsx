import { Component, Suspense, useId, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import { useInView } from '../hooks/useInView';

/** If a figure chunk fails to load (offline, stale deploy), keep the static poster. */
class FigureBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface Props {
  n: number;
  caption: string;
  /** Height reserved before the figure loads, so nothing below it jumps. */
  minHeight: number;
  poster: ReactNode;
  figure: LazyExoticComponent<ComponentType>;
}

/** A drawing-sheet frame (hairline edges, corner ticks, FIG caption) around a lazy-loaded interactive figure. */
export function FigureFrame({ n, caption, minHeight, poster, figure: Figure }: Props) {
  const [ref, near] = useInView<HTMLElement>('400px 0px');
  const capId = useId();
  const posterEl = (
    <div className="fig__poster" style={{ minHeight }}>
      {poster}
    </div>
  );

  return (
    <figure ref={ref} className="fig" aria-labelledby={capId} data-reveal>
      <div className="fig__frame">
        <span className="fig__edge fig__edge--t" aria-hidden="true" />
        <span className="fig__edge fig__edge--r" aria-hidden="true" />
        <span className="fig__edge fig__edge--b" aria-hidden="true" />
        <span className="fig__edge fig__edge--l" aria-hidden="true" />
        <span className="fig__tick fig__tick--tl" aria-hidden="true" />
        <span className="fig__tick fig__tick--tr" aria-hidden="true" />
        <span className="fig__tick fig__tick--bl" aria-hidden="true" />
        <span className="fig__tick fig__tick--br" aria-hidden="true" />
        <div className="fig__body" style={{ minHeight }}>
          {near ? (
            <FigureBoundary fallback={posterEl}>
              <Suspense fallback={posterEl}>
                <Figure />
              </Suspense>
            </FigureBoundary>
          ) : (
            posterEl
          )}
        </div>
      </div>
      <figcaption id={capId} className="fig__caption mono-label">
        <span className="fig__no">FIG. {n}</span>
        <span aria-hidden="true"> · </span>
        <span className="fig__text">{caption}</span>
      </figcaption>
    </figure>
  );
}
