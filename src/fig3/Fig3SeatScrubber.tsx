import { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import type { PointerEvent as RPointerEvent } from 'react';
import { WORLD_H, WORLD_W, SECTIONS, STAGE, buildSeats } from './seats';
import type { Active, PanApi, Seat } from './seats';
import './fig3.css';

// Konva only loads when this figure mounts.
const SeatCanvas = lazy(() => import('./SeatCanvas'));

const PAN_FRAMES = 60;
/** Same scripted path for every renderer, in world units: a Lissajous-ish sweep. */
const panAt = (f: number) => {
  const t = f / PAN_FRAMES;
  return { x: 90 * Math.sin(t * Math.PI * 2), y: 40 * Math.sin(t * Math.PI * 4) };
};

const MODES = ['DOM', 'SVG', 'Canvas'] as const;
const COUNTS = [500, 2000, 5760];
const VIEW_H = 236;
const ASPECT = WORLD_H / WORLD_W;
const LOD_AT = 2;
const ZOOM_MAX = 5.1;

type MeasureFn = (ms: number, els: string) => void;

/** Time from first render of a configuration to the end of commit (+ forced style/layout). */
function useRenderTimer(key: string, ref: React.RefObject<HTMLElement | SVGSVGElement | null>, onMeasure: MeasureFn) {
  const lastKey = useRef('');
  const t0 = useRef(0);
  if (lastKey.current !== key) { lastKey.current = key; t0.current = performance.now(); }
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.getBoundingClientRect(); // force style + layout so the number includes more than React's commit
    const ms = performance.now() - t0.current;
    const els = 1 + el.querySelectorAll('*').length;
    onMeasure(ms, els.toLocaleString('en-US'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

interface ViewProps { seats: Seat[]; w: number; h: number; active: Active; onActive: (a: Active) => void; onMeasure: MeasureFn; panRef: React.MutableRefObject<PanApi | null> }

function seatFromEvent(e: RPointerEvent): number {
  const t = e.target as HTMLElement | SVGElement;
  const v = t.dataset?.i;
  return v === undefined ? -1 : Number(v);
}

function DomView({ seats, w, h, active, onActive, onMeasure, panRef }: ViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  useLayoutEffect(() => {
    panRef.current = { apply: (x, y) => flushSync(() => setPan({ x, y })), reset: () => setPan({ x: 0, y: 0 }) };
    return () => { panRef.current = null; };
  }, [panRef]);
  useRenderTimer(`dom|${seats.length}|${w}`, ref, onMeasure);
  // not memoised on purpose: a pan re-renders every seat's position, like a naive editor would
  const els = seats.map((s) => (
    <div key={s.i} className="f3-dseat" data-i={s.i}
      style={{ left: `${((s.x + pan.x) / WORLD_W) * 100}%`, top: `${((s.y + pan.y) / WORLD_H) * 100}%`, width: `${((s.r * 2) / WORLD_W) * 100}%`, height: `${((s.r * 2) / WORLD_H) * 100}%` }} />
  ));
  const a = active?.kind === 'seat' ? seats[active.i] : null;
  const move = (e: RPointerEvent) => { const i = seatFromEvent(e); if (i >= 0) onActive({ kind: 'seat', i }); };
  return (
    <div ref={ref} className="f3-frame" style={{ width: w, height: h }} onPointerMove={move} onPointerDown={move} onPointerLeave={() => onActive(null)}>
      <i className="f3-tick tl" /><i className="f3-tick tr" /><i className="f3-tick bl" /><i className="f3-tick br" />
      <div className="f3-dstage" style={{ left: `${(STAGE.x / WORLD_W) * 100}%`, top: `${(STAGE.y / WORLD_H) * 100}%`, width: `${(STAGE.w / WORLD_W) * 100}%`, height: `${(STAGE.h / WORLD_H) * 100}%` }}>STAGE</div>
      {els}
      {a && <div className="f3-dact" style={{ left: `${((a.x + pan.x) / WORLD_W) * 100}%`, top: `${((a.y + pan.y) / WORLD_H) * 100}%`, width: `${(Math.max(a.r * 2.8, 12) / WORLD_W) * 100}%`, height: `${(Math.max(a.r * 2.8, 12) / WORLD_H) * 100}%` }} />}
    </div>
  );
}

function SvgView({ seats, w, h, active, onActive, onMeasure, panRef }: ViewProps) {
  const ref = useRef<SVGSVGElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  useLayoutEffect(() => {
    panRef.current = { apply: (x, y) => flushSync(() => setPan({ x, y })), reset: () => setPan({ x: 0, y: 0 }) };
    return () => { panRef.current = null; };
  }, [panRef]);
  useRenderTimer(`svg|${seats.length}|${w}`, ref, onMeasure);
  // not memoised on purpose: a pan re-renders every seat's position
  const els = seats.map((s) => <circle key={s.i} className="f3-sseat" data-i={s.i} cx={s.x + pan.x} cy={s.y + pan.y} r={s.r} />);
  const a = active?.kind === 'seat' ? seats[active.i] : null;
  const move = (e: RPointerEvent) => { const i = seatFromEvent(e); if (i >= 0) onActive({ kind: 'seat', i }); };
  return (
    <svg ref={ref} className="f3-frame" width={w} height={h} viewBox={`0 0 ${WORLD_W} ${WORLD_H}`} role="img" aria-label="Seat map drawn as SVG circles"
      onPointerMove={move} onPointerDown={move} onPointerLeave={() => onActive(null)}>
      <rect className="f3-sstage" x={STAGE.x} y={STAGE.y} width={STAGE.w} height={STAGE.h} />
      <text className="f3-stext" x={STAGE.x + STAGE.w / 2} y={STAGE.y + STAGE.h / 2 + 4} textAnchor="middle" style={{ fontSize: 11 }}>STAGE</text>
      {els}
      {a && <circle className="f3-sact" cx={a.x + pan.x} cy={a.y + pan.y} r={Math.max(a.r * 1.7, 6)} />}
    </svg>
  );
}

export default function Fig3SeatScrubber() {
  const [mode, setMode] = useState(0);
  const [count, setCount] = useState(2000);
  const [zoom, setZoom] = useState(1);
  const [active, setActive] = useState<Active>(null);
  const [stat, setStat] = useState<{ ms: number; els: string } | null>(null);
  const [cw, setCw] = useState(320);
  const [results, setResults] = useState<Record<number, { avg: number; worst: number }>>({});
  const [running, setRunning] = useState(false);
  const panRef = useRef<PanApi | null>(null);
  const cancelRef = useRef(false);

  // preload the canvas chunk so a lazy download never counts as render time
  useEffect(() => { void import('./SeatCanvas'); }, []);
  useEffect(() => () => { cancelRef.current = true; }, []);
  const viewRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setCw(el.clientWidth || 320));
    ro.observe(el);
    setCw(el.clientWidth || 320);
    return () => ro.disconnect();
  }, []);

  const seats = useMemo(() => buildSeats(count), [count]);
  const w = Math.max(160, Math.floor(Math.min(cw, VIEW_H / ASPECT)));
  const h = Math.round(w * ASPECT);
  const lod = zoom >= LOD_AT;
  const onMeasure: MeasureFn = (ms, els) => setStat({ ms, els });

  const stopPan = () => { cancelRef.current = true; };
  const pickMode = (m: number) => { stopPan(); setMode(m); setActive(null); };
  const pickCount = (c: number) => { stopPan(); setCount(c); setResults({}); setActive(null); };

  const runPan = useCallback(() => {
    const api = panRef.current;
    if (!api || running) return;
    const m = mode;
    cancelRef.current = false;
    setRunning(true);
    setActive(null);
    const times: number[] = [];
    let frame = 0;
    let prev = 0;
    const finish = (ok: boolean) => {
      panRef.current?.reset();
      setRunning(false);
      if (ok && times.length) {
        const avg = times.reduce((a, b) => a + b, 0) / times.length;
        setResults((r) => ({ ...r, [m]: { avg, worst: Math.max(...times) } }));
      }
    };
    const step = (now: number) => {
      if (cancelRef.current || !panRef.current) { finish(false); return; }
      if (prev && frame > 2) times.push(now - prev); // frame-to-frame time; first 2 frames are warm-up (same for every renderer)
      prev = now;
      if (frame > PAN_FRAMES) { finish(true); return; }
      const p = panAt(frame++);
      panRef.current.apply(p.x, p.y);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [mode, running]);
  const zoomBy = (f: number) => { setZoom((z) => Math.min(ZOOM_MAX, Math.max(1, +(z * f).toFixed(3)))); setActive(null); };

  let info = 'Hover or tap a seat';
  let idle = true;
  if (active?.kind === 'seat') { const s = seats[active.i]; info = `Sec ${SECTIONS[s.sec].name} · Row ${s.row} · Seat ${s.num}`; idle = false; }
  else if (active?.kind === 'sec') { info = `Sec ${SECTIONS[active.s].name} · zoom in for seats`; idle = false; }

  const fmtMs = (ms: number) => (ms < 10 ? ms.toFixed(1) : Math.round(ms).toString());

  return (
    <div className="f3">
      <div className="f3-row">
        <span className="f3-lab" id="f3-r">Renderer</span>
        <div className="f3-seg" role="group" aria-labelledby="f3-r">
          {MODES.map((m, i) => <button key={m} type="button" aria-pressed={mode === i} onClick={() => pickMode(i)}>{m}</button>)}
        </div>
        <input className="f3-range" type="range" min={0} max={2} step={1} value={mode} aria-label="Renderer scrubber: DOM, SVG, Canvas" aria-valuetext={MODES[mode]} onChange={(e) => pickMode(Number(e.target.value))} />
      </div>
      <div className="f3-row">
        <span className="f3-lab" id="f3-n">Seats</span>
        <div className="f3-seg" role="group" aria-labelledby="f3-n">
          {COUNTS.map((c) => <button key={c} type="button" aria-pressed={count === c} onClick={() => pickCount(c)}>{c.toLocaleString('en-US')}</button>)}
        </div>
        <span className="f3-lab">Zoom</span>
        <button type="button" className="f3-btn" aria-label="Zoom out" disabled={mode !== 2 || zoom <= 1} onClick={() => zoomBy(1 / 1.5)}>{'−'}</button>
        <button type="button" className="f3-btn" aria-label="Zoom in" disabled={mode !== 2 || zoom >= ZOOM_MAX} onClick={() => zoomBy(1.5)}>+</button>
        <span className="f3-lod" aria-live="polite">{mode === 2 ? (lod ? 'LOD: seats' : 'LOD: blocks') : 'LOD: n/a'}</span>
      </div>
      <div className="f3-view" ref={viewRef}>
        {mode === 0 && <DomView key="dom" seats={seats} w={w} h={h} active={active} onActive={setActive} onMeasure={onMeasure} panRef={panRef} />}
        {mode === 1 && <SvgView key="svg" seats={seats} w={w} h={h} active={active} onActive={setActive} onMeasure={onMeasure} panRef={panRef} />}
        {mode === 2 && (
          <Suspense fallback={<div className="f3-wait f3-frame" style={{ width: w, height: h }}>loading canvas renderer</div>}>
            <div className="f3-frame" style={{ width: w, height: h }}>
              <i className="f3-tick tl" /><i className="f3-tick tr" /><i className="f3-tick bl" /><i className="f3-tick br" />
              <SeatCanvas seats={seats} w={w} h={h} zoom={zoom} lod={lod} active={active} onActive={setActive} onMeasure={onMeasure} panRef={panRef} />
            </div>
          </Suspense>
        )}
      </div>
      <div className="f3-read">
        <div className="f3-row f3-top">
  <div className={idle ? 'f3-info idle' : 'f3-info'} role="status" aria-live="polite">{info}</div>
          <button type="button" className="f3-btn f3-pan" disabled={running} onClick={runPan}>{running ? 'Panning...' : 'Pan test'}</button>
        </div>
        <span className="f3-stats" role="status" aria-live="polite">
            {results[mode] ? `Pan test, ${MODES[mode]}: ${fmtMs(results[mode].avg)} ms/frame avg (worst ${fmtMs(results[mode].worst)} ms) ≈ ${Math.round(1000 / results[mode].avg)} fps` : `Pan test, ${MODES[mode]}: ${PAN_FRAMES} scripted frames, press to run`}
          </span>
        <div className="f3-stats f3-sec">
          {(['DOM', 'SVG', 'Canvas'] as const).map((n, i) => `${n} ${results[i] ? `${fmtMs(results[i].avg)} ms` : '…'}`).join(' · ')}
          {' /frame'}
          {stat ? ` · first mount: ${fmtMs(stat.ms)} ms${mode === 2 ? ', includes creating the canvas' : ''} · ${stat.els} elements` : ''}
        </div>
      </div>
    </div>
  );
}
