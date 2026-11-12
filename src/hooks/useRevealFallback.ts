import { useEffect } from 'react';

/**
 * Line-draw reveals use CSS scroll-driven animations where supported (see global.css).
 * Elsewhere this adds `.is-in` to each [data-reveal] element as it enters the viewport.
 * The drawn state is the default: without JS, or with motion off, nothing is hidden.
 */
export function useRevealFallback() {
  useEffect(() => {
    const supportsScrollTimeline =
      typeof CSS !== 'undefined' && CSS.supports('animation-timeline: view()');
    if (supportsScrollTimeline || typeof IntersectionObserver === 'undefined') return;

    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));
    root.classList.add('reveal-io');
    return () => {
      io.disconnect();
      root.classList.remove('reveal-io');
    };
  }, []);
}
