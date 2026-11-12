/** Runs a DOM update inside a view transition when the browser supports it and motion is allowed. */
export function withViewTransition(update: () => void, motion: boolean) {
  const reduced =
    typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (motion && !reduced && 'startViewTransition' in document) {
    document.startViewTransition(update);
  } else {
    update();
  }
}
