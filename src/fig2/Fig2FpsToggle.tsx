import { memo, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type { RefObject } from 'react';
import { flushSync } from 'react-dom';
import { useSettings } from '../store/settings';
import './fig2.css';

/* ---------- shared graph + scripted workload ---------- */
const COLS = 56;
const ROWS = 36;
const GX = 10.4;
const GY = 7.2;
const VW = 600;
const VH = 270;
const X0 = (VW - (COLS - 1) * GX) / 2;
const Y0 = (VH - (ROWS - 1) * GY) / 2;
const DURATION = 3000;
const N = COLS * ROWS;

interface Pt { x: number; y: number }
const ZERO: Pt = { x: 0, y: 0 };

const baseX = (id: number) => X0 + (id % COLS) * GX;
const baseY = (id: number) => Y0 + Math.floor(id / COLS) * GY;

/** The dragged cluster: 10 x 8 nodes in the middle. */
const DRAG_IDS: number[] = [];
for (let r = 14; r < 22; r++) for (let c = 23; c < 33; c++) DRAG_IDS.push(r * COLS + c);
const IS_DRAG = new Set(DRAG_IDS);

const EDGES: Array<[number, number]> = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    const id = r * COLS + c;
    if (c < COLS - 1) EDGES.push([id, id + 1]);
    if (r < ROWS - 1) EDGES.push([id, id + COLS]);
  }
}
const NODE_IDS = Array.from({ length: N }, (_, i) => i);
const TAU = Math.PI * 2;

/** Identical for both renderers: the whole diagram pans while a cluster of nodes is dragged. */
function workload(t: number): { pan: Pt; drag: Pt } {
  return {
    pan: { x: 30 * Math.sin((TAU * t) / 1500), y: 12 * Math.cos((TAU * t) / 1000) },
    drag: { x: 60 * Math.sin((TAU * t) / 2000), y: 40 * Math.sin((TAU * t) / 1200) },
  };
}

interface Driver { frame: (pan: Pt, drag: Pt) => void }
type DriverRef = RefObject<Driver | null>;

/* ---------- NAIVE: one big state object, everything re-renders, no memo ---------- */
interface NState { pan: Pt; drag: Pt }

function NaiveNode({ id, s }: { id: number; s: NState }) {
  const hot = IS_DRAG.has(id);
  const x = baseX(id) + s.pan.x + (hot ? s.drag.x : 0);
  const y = baseY(id) + s.pan.y + (hot ? s.drag.y : 0);
  return <rect className={hot ? 'f2-node f2-hot' : 'f2-node'} x={x - 3.5} y={y - 2.2} width={7} height={4.4} />;
}

function NaiveEdge({ a, b, s }: { a: number; b: number; s: NState }) {
  const ha = IS_DRAG.has(a);
  const hb = IS_DRAG.has(b);
  return (
    <line
      className={ha && hb ? 'f2-edge f2-hot' : 'f2-edge'}
      x1={baseX(a) + s.pan.x + (ha ? s.drag.x : 0)}
      y1={baseY(a) + s.pan.y + (ha ? s.drag.y : 0)}
      x2={baseX(b) + s.pan.x + (hb ? s.drag.x : 0)}
      y2={baseY(b) + s.pan.y + (hb ? s.drag.y : 0)}
    />
  );
}

function NaiveView({ driverRef }: { driverRef: DriverRef }) {
  const [s, setS] = useState<NState>({ pan: ZERO, drag: ZERO });
  useEffect(() => {
    driverRef.current = { frame: (pan, drag) => flushSync(() => setS({ pan, drag })) };
    return () => { driverRef.current = null; };
  }, [driverRef]);
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Flow diagram, naive renderer">
      <g>
        {EDGES.map(([a, b]) => <NaiveEdge key={`${a}-${b}`} a={a} b={b} s={s} />)}
        {NODE_IDS.map((id) => <NaiveNode key={id} id={id} s={s} />)}
      </g>
    </svg>
  );
}

/* ---------- OPTIMISED: per-node store, selective subscriptions, memo, group transform ---------- */
function createStore() {
  let offs: Pt[] = Array.from({ length: N }, () => ZERO);
  const subs = new Map<number, Set<() => void>>();
  return {
    subscribeFor: (id: number) => (cb: () => void) => {
      let set = subs.get(id);
      if (!set) subs.set(id, (set = new Set()));
      set.add(cb);
      return () => { set.delete(cb); };
    },
    get: (id: number) => offs[id],
    /** Only the moved nodes are written and notified. */
    setDrag: (p: Pt) => {
      const next = offs.slice();
      for (const id of DRAG_IDS) next[id] = p;
      offs = next;
      for (const id of DRAG_IDS) subs.get(id)?.forEach((f) => f());
    },
  };
}
type Store = ReturnType<typeof createStore>;

function usePos(store: Store, id: number): Pt {
  const sub = useCallback((cb: () => void) => store.subscribeFor(id)(cb), [store, id]);
  const get = useCallback(() => store.get(id), [store, id]);
  return useSyncExternalStore(sub, get, get);
}

const OptNode = memo(function OptNode({ id, store }: { id: number; store: Store }) {
  const o = usePos(store, id);
  const hot = IS_DRAG.has(id);
  return <rect className={hot ? 'f2-node f2-hot' : 'f2-node'} x={baseX(id) + o.x - 3.5} y={baseY(id) + o.y - 2.2} width={7} height={4.4} />;
});

const OptEdge = memo(function OptEdge({ a, b, store }: { a: number; b: number; store: Store }) {
  const oa = usePos(store, a);
  const ob = usePos(store, b);
  return (
    <line
      className={IS_DRAG.has(a) && IS_DRAG.has(b) ? 'f2-edge f2-hot' : 'f2-edge'}
      x1={baseX(a) + oa.x}
      y1={baseY(a) + oa.y}
      x2={baseX(b) + ob.x}
      y2={baseY(b) + ob.y}
    />
  );
});

function OptimisedView({ driverRef }: { driverRef: DriverRef }) {
  const store = useMemo(createStore, []);
  const gRef = useRef<SVGGElement>(null);
  useEffect(() => {
    driverRef.current = {
      frame: (pan, drag) => {
        // pan: one transform on the group, no React work. drag: only the moved nodes update.
        gRef.current?.setAttribute('transform', `translate(${pan.x} ${pan.y})`);
        store.setDrag(drag);
      },
    };
    return () => { driverRef.current = null; };
  }, [driverRef, store]);
  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMid meet" role="img" aria-label="Flow diagram, optimised renderer">
      <g ref={gRef}>
        {EDGES.map(([a, b]) => <OptEdge key={`${a}-${b}`} a={a} b={b} store={store} />)}
        {NODE_IDS.map((id) => <OptNode key={id} id={id} store={store} />)}
      </g>
    </svg>
  );
}

/* ---------- the figure ---------- */
type Mode = 'naive' | 'opt';
interface Result { avg: number; low: number }

export default function Fig2FpsToggle() {
  const motion = useSettings((s) => s.motion);
  const [mode, setMode] = useState<Mode>('naive');
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Partial<Record<Mode, Result>>>({});
  const driverRef = useRef<Driver | null>(null);
  const rafRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const run = () => {
    const driver = driverRef.current;
    if (running || !driver) return;
    const runMode = mode;
    setRunning(true);
    let t0 = -1;
    let last = 0;
    let sum = 0;
    let worst = 0;
    let frames = 0;
    const loop = (ts: number) => {
      if (t0 < 0) { t0 = ts; last = ts; rafRef.current = requestAnimationFrame(loop); return; }
      const dt = ts - last;
      last = ts;
      frames++;
      sum += dt;
      if (dt > worst) worst = dt;
      const t = ts - t0;
      if (t >= DURATION) {
        driverRef.current?.frame(ZERO, ZERO);
        setResults((r) => ({ ...r, [runMode]: { avg: (frames * 1000) / sum, low: 1000 / worst } }));
        setRunning(false);
        return;
      }
      const w = workload(t);
      driver.frame(w.pan, w.drag);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const fmt = (r?: Result) => (r ? `${Math.round(r.avg)} fps avg (low ${Math.round(r.low)})` : null);
  const n = fmt(results.naive);
  const o = fmt(results.opt);
  let line = 'Press Run to measure this renderer on your device.';
  if (n && o) line = `Naive: ${n} · Optimised: ${o} on this device`;
  else if (n) line = `Naive: ${n} on this device. Run Optimised to compare.`;
  else if (o) line = `Optimised: ${o} on this device. Run Naive to compare.`;

  return (
    <div className="f2">
      <div className="f2-bar">
        <fieldset className="f2-seg" disabled={running}>
          <legend>Renderer</legend>
          <label>
            <input type="radio" name="f2-mode" value="naive" checked={mode === 'naive'} onChange={() => setMode('naive')} />
            Naive
          </label>
          <label>
            <input type="radio" name="f2-mode" value="opt" checked={mode === 'opt'} onChange={() => setMode('opt')} />
            Optimised
          </label>
        </fieldset>
        <button type="button" className="f2-run" onClick={run} disabled={running}>
          {running ? 'Running' : 'Run'}
        </button>
        <span className="f2-status" aria-hidden="true">
          {N} nodes / {EDGES.length} edges{motion ? '' : ' / motion off: runs only on Run'}
        </span>
      </div>
      <div className="f2-view">
        <i className="f2-tick tl" /><i className="f2-tick tr" /><i className="f2-tick bl" /><i className="f2-tick br" />
        {mode === 'naive' ? <NaiveView key="n" driverRef={driverRef} /> : <OptimisedView key="o" driverRef={driverRef} />}
      </div>
      <div className="f2-read">
        <div className="f2-fps" role="status" aria-live="polite">{running ? 'Running a 3 s drag and pan...' : line}</div>
        <div className="f2-note">Numbers vary by device. The real editor went from under 10 to 40{'–'}56 FPS.</div>
      </div>
    </div>
  );
}
