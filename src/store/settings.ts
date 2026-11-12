import { create } from 'zustand';

/** Shared page settings. Driven by the FIG. 1 playground, the settings tray and the mobile form. */
export type Theme = 'paper' | 'blueprint';
export type AccentKey = 'orange' | 'ink' | 'green' | 'teal' | 'ochre';

/** Every accent passes WCAG AA (>= 4.5:1) for text on its theme's background. */
export const ACCENTS: Record<AccentKey, { label: string; paper: string; blueprint: string }> = {
  orange: { label: 'Burnt orange', paper: '#B4441A', blueprint: '#F08A4B' },
  ink: { label: 'Ink blue', paper: '#24509E', blueprint: '#8FB3F2' },
  green: { label: 'Drafting green', paper: '#2E6B3E', blueprint: '#7FC99A' },
  teal: { label: 'Teal', paper: '#0E6A6A', blueprint: '#6FD0CC' },
  ochre: { label: 'Ochre', paper: '#8A5A00', blueprint: '#E7B451' },
};

export interface Settings {
  theme: Theme;
  accent: AccentKey;
  /** true = animations run; false = paused (also the default under prefers-reduced-motion). */
  motion: boolean;
  /** 0 = compact, 1 = default, 2 = airy. */
  density: 0 | 1 | 2;
}

export const DEFAULTS: Settings = { theme: 'paper', accent: 'orange', motion: true, density: 1 };
export const STORAGE_KEY = 'nf-settings';

interface Store extends Settings {
  set: (patch: Partial<Settings>) => void;
  reset: () => void;
}

function initial(): Settings {
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let saved: Partial<Settings> = {};
  try {
    saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    /* storage blocked: fall back to defaults */
  }
  return { ...DEFAULTS, motion: !reduced, ...saved };
}

/** Writes settings to <html> so CSS (tokens.css) restyles the whole page. Mirrors the inline script in index.html. */
export function applyToDocument(s: Settings) {
  const root = document.documentElement;
  root.dataset.theme = s.theme;
  root.dataset.motion = s.motion ? 'on' : 'off';
  root.dataset.density = String(s.density);
  root.style.setProperty('--accent', ACCENTS[s.accent][s.theme]);
  root.style.colorScheme = s.theme === 'blueprint' ? 'dark' : 'light';
}

export const useSettings = create<Store>((set, get) => ({
  ...initial(),
  set: (patch) => {
    set(patch);
    const { theme, accent, motion, density } = get();
    const s = { theme, accent, motion, density };
    applyToDocument(s);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  },
  reset: () => get().set({ ...DEFAULTS }),
}));
