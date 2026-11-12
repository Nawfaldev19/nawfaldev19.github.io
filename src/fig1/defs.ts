import { create } from 'zustand';
import type { Edge, FitViewOptions, Node } from '@xyflow/react';
import { ACCENTS, type Settings } from '../store/settings';

/** Port types. Shape encodes type (never colour alone): circle, square, diamond, bar, triangle. */
export type PortType = 'color' | 'mode' | 'bool' | 'number' | 'seed';
export const PORT_LABEL: Record<PortType, string> = {
  color: 'COLOR',
  mode: 'MODE',
  bool: 'BOOL',
  number: 'NUMBER',
  seed: 'SEED',
};

export type ControlKind = 'accent' | 'theme' | 'motion' | 'density';
export type SettingKey = keyof Settings;

export interface ControlDef {
  kind: ControlKind;
  code: string;
  title: string;
  name: string;
  port: PortType;
}

export const CONTROLS: ControlDef[] = [
  { kind: 'accent', code: 'N.01', title: 'ACCENT', name: 'Accent', port: 'color' },
  { kind: 'theme', code: 'N.02', title: 'THEME', name: 'Theme', port: 'mode' },
  { kind: 'motion', code: 'N.03', title: 'MOTION', name: 'Motion', port: 'bool' },
  { kind: 'density', code: 'N.04', title: 'DENSITY', name: 'Density', port: 'number' },
];
export const CONTROL_BY_KIND = Object.fromEntries(CONTROLS.map((c) => [c.kind, c])) as Record<ControlKind, ControlDef>;
export const KIND_BY_PORT: Partial<Record<PortType, ControlKind>> = {
  color: 'accent',
  mode: 'theme',
  bool: 'motion',
  number: 'density',
};

export const PAGE_CODE = 'N.05';
export const SEED_CODE = 'N.00';
export const DENSITY_LABEL = ['Compact', 'Default', 'Airy'] as const;

/** Handle ids carry their type: "out-color", "in-color", "in-seed". */
export const outId = (p: PortType) => `out-${p}`;
export const inId = (p: PortType) => `in-${p}`;
export function portOf(handleId?: string | null): PortType | null {
  const p = handleId?.split('-')[1];
  return p && p in PORT_LABEL ? (p as PortType) : null;
}

/* ---------- layout (graph units) ---------- */
export const CONTROL_W = 208;
export const CONTROL_H = 78;
export const CONTROL_GAP = 20;
export const PAGE_X = 330;
export const PAGE_Y = 6;
export const PAGE_W = 272;
export const PAGE_H = 360;
const rowY = (i: number) => i * (CONTROL_H + CONTROL_GAP);
/** Page input handle offsets line up with each control's centre, so wires run straight. */
export const PAGE_INPUT_TOP: Record<Exclude<PortType, 'seed'>, number> = {
  color: rowY(0) + CONTROL_H / 2 - PAGE_Y,
  mode: rowY(1) + CONTROL_H / 2 - PAGE_Y,
  bool: rowY(2) + CONTROL_H / 2 - PAGE_Y,
  number: rowY(3) + CONTROL_H / 2 - PAGE_Y,
};
/** The Seed node sits off-sheet below the drawing; fitView ignores it. Pan to find it. */
export const SEED_POS = { x: -232, y: rowY(4) + 90 };

export type ControlNodeT = Node<{ kind: ControlKind }, 'control'>;
export type PageNodeT = Node<Record<string, never>, 'page'>;
export type SeedNodeT = Node<Record<string, never>, 'seed'>;
export type Fig1Node = ControlNodeT | PageNodeT | SeedNodeT;

export function initialNodes(): Fig1Node[] {
  return [
    ...CONTROLS.map(
      (c, i): ControlNodeT => ({
        id: c.kind,
        type: 'control',
        position: { x: 0, y: rowY(i) },
        data: { kind: c.kind },
        ariaLabel: `${c.code} ${c.name} control node`,
        width: CONTROL_W,
        height: CONTROL_H,
        deletable: false,
      }),
    ),
    {
      id: 'page',
      type: 'page',
      position: { x: PAGE_X, y: PAGE_Y },
      data: {},
      ariaLabel: `${PAGE_CODE} Page output node: a live miniature of this site`,
      width: PAGE_W,
      height: PAGE_H,
      deletable: false,
    },
    {
      id: 'seed',
      type: 'seed',
      position: SEED_POS,
      data: {},
      ariaLabel: `${SEED_CODE} Seed node: shuffles the accent when wired to Accent`,
      width: 168,
      height: CONTROL_H,
      deletable: false,
    },
  ];
}
export const VISIBLE_IDS = [...CONTROLS.map((c) => ({ id: c.kind })), { id: 'page' }];
/** Fit the visible drawing; the top band leaves room for the hint chip, the bottom for the zoom buttons. */
export const FIT: FitViewOptions = {
  nodes: VISIBLE_IDS,
  padding: { top: '40px', bottom: '44px', left: '28px', right: '28px' },
  maxZoom: 1.15,
};

export function wireFor(kind: ControlKind): Edge {
  const p = CONTROL_BY_KIND[kind].port;
  return {
    id: `w-${kind}`,
    source: kind,
    target: 'page',
    sourceHandle: outId(p),
    targetHandle: inId(p),
    type: 'wire',
    ariaLabel: `${CONTROL_BY_KIND[kind].name} wire to Page`,
  };
}
export const initialEdges = (): Edge[] => CONTROLS.map((c) => wireFor(c.kind));

/* ---------- local UI store: announcements, seed pulses, toasts ---------- */
interface Fig1UI {
  message: string;
  toast: string;
  seedTick: number;
  announce: (m: string) => void;
  showToast: (t: string) => void;
  bumpSeed: () => void;
}
let toastTimer: ReturnType<typeof setTimeout> | undefined;
export const useFig1 = create<Fig1UI>((set, get) => ({
  message: '',
  toast: '',
  seedTick: 0,
  // A trailing nbsp toggle makes repeated identical messages re-announce.
  announce: (m) => set({ message: get().message === m ? `${m} ` : m }),
  showToast: (t) => {
    clearTimeout(toastTimer);
    set({ toast: t });
    toastTimer = setTimeout(() => set({ toast: '' }), 1800);
  },
  bumpSeed: () => set({ seedTick: get().seedTick + 1 }),
}));

export function cssVarsText(s: Settings): string {
  return [
    `--accent: ${ACCENTS[s.accent][s.theme]};`,
    `data-theme="${s.theme}";`,
    `data-motion="${s.motion ? 'on' : 'off'}";`,
    `data-density="${s.density}";`,
  ].join(' ');
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

export const HINT_KEY = 'nf-fig1-hint';
export function storageGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
export function storageSet(key: string, v: string) {
  try {
    sessionStorage.setItem(key, v);
  } catch {
    /* storage blocked */
  }
}
