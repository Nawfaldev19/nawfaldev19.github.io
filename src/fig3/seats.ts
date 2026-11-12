/** Synthetic venue: a stage at the top, three curved sections fanning out below it. World space is 1000 x 540. */
export interface Seat { i: number; x: number; y: number; sec: number; row: number; num: number; r: number }

export const WORLD_W = 1000;
export const WORLD_H = 540;
export const CX = 500;
export const CY = 20;
export const R_IN = 130;
export const R_OUT = 500;
/** Angles are degrees measured from straight down. */
export const SECTIONS = [
  { name: 'A', a0: -72, a1: -26 },
  { name: 'B', a0: -20, a1: 20 },
  { name: 'C', a0: 26, a1: 72 },
];
export const STAGE = { x: 390, y: 6, w: 220, h: 26 };

const cache = new Map<number, Seat[]>();

export function buildSeats(count: number): Seat[] {
  const hit = cache.get(count);
  if (hit) return hit;
  const spans = SECTIONS.map((s) => ((s.a1 - s.a0) * Math.PI) / 180);
  const area = (spans.reduce((a, b) => a + b, 0) * (R_OUT ** 2 - R_IN ** 2)) / 2;
  const pitch = Math.sqrt(area / count);
  const rows = Math.max(4, Math.round((R_OUT - R_IN) / pitch));
  const dr = (R_OUT - R_IN) / rows;
  const arcPitch = (pitch * pitch) / dr;
  const r = 0.4 * Math.min(dr, arcPitch);
  const seats: Seat[] = [];
  SECTIONS.forEach((s, si) => {
    for (let row = 0; row < rows; row++) {
      const radius = R_IN + (row + 0.5) * dr;
      const n = Math.max(1, Math.round((spans[si] * radius) / arcPitch));
      for (let k = 0; k < n; k++) {
        const th = ((s.a0 + ((k + 0.5) / n) * (s.a1 - s.a0)) * Math.PI) / 180;
        seats.push({ i: seats.length, x: CX + radius * Math.sin(th), y: CY + radius * Math.cos(th), sec: si, row: row + 1, num: k + 1, r });
      }
    }
  });
  cache.set(count, seats);
  return seats;
}

const CELL = 12;
const key = (cx: number, cy: number) => cx * 512 + cy;
const indexCache = new WeakMap<Seat[], Map<number, number[]>>();

/** Nearest seat within `tol` world units of (wx, wy), or -1. */
export function nearestSeat(seats: Seat[], wx: number, wy: number, tol: number): number {
  let idx = indexCache.get(seats);
  if (!idx) {
    idx = new Map();
    for (const s of seats) {
      const k = key(Math.floor(s.x / CELL), Math.floor(s.y / CELL));
      const a = idx.get(k);
      if (a) a.push(s.i); else idx.set(k, [s.i]);
    }
    indexCache.set(seats, idx);
  }
  const cx = Math.floor(wx / CELL);
  const cy = Math.floor(wy / CELL);
  let best = -1;
  let bd = Infinity;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const a = idx.get(key(cx + dx, cy + dy));
      if (!a) continue;
      for (const id of a) {
        const s = seats[id];
        const d = Math.hypot(s.x - wx, s.y - wy);
        if (d < bd && d <= Math.max(tol, s.r * 1.4)) { bd = d; best = id; }
      }
    }
  }
  return best;
}

export function sectionAt(wx: number, wy: number): number {
  const dx = wx - CX;
  const dy = wy - CY;
  const rad = Math.hypot(dx, dy);
  if (rad < R_IN || rad > R_OUT) return -1;
  const th = (Math.atan2(dx, dy) * 180) / Math.PI;
  return SECTIONS.findIndex((s) => th >= s.a0 && th <= s.a1);
}

export type Active = { kind: 'seat'; i: number } | { kind: 'sec'; s: number } | null;
export interface Measure { ms: number; els: string }

/** Scripted-pan hook each renderer registers; offsets are in world units. */
export interface PanApi { apply: (x: number, y: number) => void; reset: () => void }
