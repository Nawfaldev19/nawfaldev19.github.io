import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { ACCENTS, useSettings, type AccentKey, type Settings, type Theme } from '../store/settings';
import { withViewTransition } from '../lib/viewTransition';

const THEMES: { value: Theme; label: string }[] = [
  { value: 'paper', label: 'Paper' },
  { value: 'blueprint', label: 'Blueprint' },
];

const DENSITIES: { value: Settings['density']; label: string }[] = [
  { value: 0, label: 'Compact' },
  { value: 1, label: 'Default' },
  { value: 2, label: 'Airy' },
];

/** Header settings: theme, accent, pause motion, density. The same store drives FIG. 1. */
export function SettingsTray() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const resetRef = useRef<HTMLButtonElement>(null);
  const id = useId();

  const theme = useSettings((s) => s.theme);
  const accent = useSettings((s) => s.accent);
  const motion = useSettings((s) => s.motion);
  const density = useSettings((s) => s.density);
  const set = useSettings((s) => s.set);
  const reset = useSettings((s) => s.reset);

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    if (!panel) return;
    (panel.querySelector<HTMLElement>('input:checked') ?? closeRef.current)?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(true);
        return;
      }
      if (e.key !== 'Tab') return;
      // The first and last tab stops are always the Close and Reset buttons.
      const first = closeRef.current;
      const last = resetRef.current;
      if (!panel.contains(document.activeElement)) {
        e.preventDefault();
        first?.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!panel.contains(t) && !buttonRef.current?.contains(t)) close(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, close]);

  const setTheme = (value: Theme) => withViewTransition(() => set({ theme: value }), motion);

  return (
    <div className="tray">
      <button
        ref={buttonRef}
        type="button"
        className="btn btn--plain tray__toggle"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => (open ? close(false) : setOpen(true))}
      >
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" className="tray__icon">
          <path className="d-line" d="M2 4h12M2 8h12M2 12h12" />
          <circle cx="5" cy="4" r="1.6" className="tray__knob" />
          <circle cx="11" cy="8" r="1.6" className="tray__knob" />
          <circle cx="7" cy="12" r="1.6" className="tray__knob" />
        </svg>
        <span className="tray__toggle-label">Settings</span>
      </button>

      <div
        ref={panelRef}
        id={`${id}-panel`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        className="tray__panel"
        hidden={!open}
      >
        <div className="tray__head">
          <p id={`${id}-title`} className="mono-label">
            Page settings
          </p>
          <button ref={closeRef} type="button" className="btn btn--plain btn--small" onClick={() => close(true)}>
            Close
          </button>
        </div>

        <fieldset className="tray__group">
          <legend className="mono-label">Theme</legend>
          <div className="segmented">
            {THEMES.map((t) => (
              <label key={t.value} className="segmented__opt">
                <input
                  type="radio"
                  name={`${id}-theme`}
                  value={t.value}
                  checked={theme === t.value}
                  onChange={() => setTheme(t.value)}
                />
                <span>{t.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="tray__group">
          <legend className="mono-label">Accent</legend>
          <div className="swatches">
            {(Object.keys(ACCENTS) as AccentKey[]).map((key) => (
              <label key={key} className="swatch" title={ACCENTS[key].label}>
                <input
                  type="radio"
                  name={`${id}-accent`}
                  value={key}
                  checked={accent === key}
                  onChange={() => set({ accent: key })}
                />
                <span className="swatch__chip" style={{ background: ACCENTS[key][theme] }} aria-hidden="true" />
                <span className="visually-hidden">{ACCENTS[key].label}</span>
              </label>
            ))}
          </div>
          <p className="tray__hint mono-label">{ACCENTS[accent].label}</p>
        </fieldset>

        <fieldset className="tray__group">
          <legend className="mono-label">Motion</legend>
          <label className="check">
            <input type="checkbox" checked={!motion} onChange={(e) => set({ motion: !e.target.checked })} />
            <span>Pause motion</span>
          </label>
        </fieldset>

        <fieldset className="tray__group">
          <legend className="mono-label">Density</legend>
          <div className="segmented">
            {DENSITIES.map((d) => (
              <label key={d.value} className="segmented__opt">
                <input
                  type="radio"
                  name={`${id}-density`}
                  value={d.value}
                  checked={density === d.value}
                  onChange={() => set({ density: d.value })}
                />
                <span>{d.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <button ref={resetRef} type="button" className="btn btn--plain btn--small tray__reset" onClick={reset}>
          Reset to defaults
        </button>
      </div>
    </div>
  );
}
