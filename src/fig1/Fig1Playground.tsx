import '@xyflow/react/dist/base.css';
import './fig1.css';
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import {
  Panel,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type EdgeTypes,
  type FinalConnectionState,
  type NodeTypes,
} from '@xyflow/react';
import { useSettings } from '../store/settings';
import {
  CONTROLS,
  HINT_KEY,
  PORT_LABEL,
  FIT,
  initialEdges,
  initialNodes,
  portOf,
  storageGet,
  storageSet,
  useFig1,
  type Fig1Node,
} from './defs';
import { ControlNode, PageNode, SeedNode } from './nodes';
import { WireEdge } from './WireEdge';
import StaticGraph from './StaticGraph';

/*
 * FIG. 1 "Configure this page".
 * Desktop: fixed 440 px tall canvas. Below 640 px container width: static SVG + form (auto height, ~560 px at 320 px).
 */
const NARROW = 640;

const nodeTypes: NodeTypes = { control: ControlNode, page: PageNode, seed: SeedNode };
const edgeTypes: EdgeTypes = { wire: WireEdge };
const defaultEdgeOptions = { type: 'wire' };
const ZOOM_KEYS = ['Meta', 'Control'];
const DELETE_KEYS = ['Backspace', 'Delete'];
const nameOf = (id: string) => CONTROLS.find((c) => c.kind === id)?.name ?? 'Seed';

function useMedia(query: string) {
  const [match, setMatch] = useState(() => typeof matchMedia !== 'undefined' && matchMedia(query).matches);
  useEffect(() => {
    if (typeof matchMedia === 'undefined') return;
    const mq = matchMedia(query);
    const on = () => setMatch(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

/* ---------- small panels, each subscribed to its own slice ---------- */

function LiveRegion() {
  const message = useFig1((s) => s.message);
  return (
    <div className="fig1-sr" aria-live="polite" aria-atomic="true">
      {message}
    </div>
  );
}

function Toast() {
  const toast = useFig1((s) => s.toast);
  if (!toast) return null;
  return (
    <Panel position="bottom-center" className="fig1-toast" aria-hidden="true">
      {toast}
    </Panel>
  );
}

function ZoomControls() {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const duration = () => (useSettings.getState().motion ? 200 : 0);
  return (
    <Panel position="bottom-left" className="fig1-zoom">
      <button type="button" className="fig1-zoom__btn" onClick={() => zoomIn({ duration: duration() })} aria-label="Zoom in">
        +
      </button>
      <button type="button" className="fig1-zoom__btn" onClick={() => zoomOut({ duration: duration() })} aria-label="Zoom out">
        −
      </button>
      <button
        type="button"
        className="fig1-zoom__btn fig1-zoom__btn--wide"
        onClick={() => fitView({ ...FIT, duration: duration() * 1.5 })}
        aria-label="Fit drawing to view"
      >
        Fit
      </button>
    </Panel>
  );
}

/* ---------- the canvas (desktop / tablet) ---------- */

function Canvas({ width, coarse }: { width: number; coarse: boolean }) {
  const { getEdges, fitView } = useReactFlow();
  const [intro, setIntro] = useState(() => useSettings.getState().motion);
  const [hint, setHint] = useState(false);
  const dismissed = useRef(storageGet(HINT_KEY) === '1');
  const introAtMount = useRef(intro);

  // Edges draw in once, then the hint chip appears (unless already dismissed this session).
  useEffect(() => {
    const withIntro = introAtMount.current;
    const t1 = withIntro ? setTimeout(() => setIntro(false), 1400) : undefined;
    const t2 = setTimeout(() => !dismissed.current && setHint(true), withIntro ? 1100 : 250);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    setHint(false);
    storageSet(HINT_KEY, '1');
  }, []);

  // Re-fit when the container width changes (height is fixed).
  useEffect(() => {
    const raf = requestAnimationFrame(() => void fitView(FIT));
    return () => cancelAnimationFrame(raf);
  }, [width, fitView]);

  const isValidConnection = useCallback(
    (c: Edge | Connection) => {
      const a = portOf(c.sourceHandle);
      if (!a || a !== portOf(c.targetHandle) || c.source === c.target) return false;
      return !getEdges().some((e) => e.target === c.target && e.targetHandle === c.targetHandle);
    },
    [getEdges],
  );

  const onConnectEnd = useCallback((_: MouseEvent | TouchEvent, state: FinalConnectionState) => {
    if (state.isValid !== false || !state.fromHandle || !state.toHandle) return;
    const from = portOf(state.fromHandle.id);
    const to = portOf(state.toHandle.id);
    let msg = 'ONE WIRE PER INPUT';
    if (from && to && from !== to) msg = `${PORT_LABEL[from]} → ${PORT_LABEL[from]} only`;
    else if (state.fromHandle.type === state.toHandle.type) msg = 'OUTPUT → INPUT only';
    const ui = useFig1.getState();
    ui.showToast(msg);
    ui.announce(`Not connected: ${msg.replace('→', 'to')}`);
  }, []);

  const onConnect = useCallback((c: Connection) => {
    const target = c.target === 'page' ? 'Page' : 'Accent';
    useFig1.getState().announce(`${nameOf(c.source)} wired to ${target}`);
  }, []);

  const onEdgesDelete = useCallback((edges: Edge[]) => {
    for (const e of edges) {
      const msg =
        e.target === 'page'
          ? `${nameOf(e.source)} unwired. The page keeps its last value.`
          : `${nameOf(e.source)} unwired from Accent`;
      useFig1.getState().announce(msg);
    }
  }, []);

  return (
    <div
      className={`fig1-canvas${intro ? ' fig1--intro' : ''}`}
      onPointerDownCapture={dismiss}
      onKeyDownCapture={dismiss}
    >
      <ReactFlow<Fig1Node, Edge>
        defaultNodes={initialNodes()}
        defaultEdges={initialEdges()}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        isValidConnection={isValidConnection}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onEdgesDelete={onEdgesDelete}
        fitView
        fitViewOptions={FIT}
        minZoom={0.4}
        maxZoom={1.6}
        zoomOnScroll={false}
        zoomOnPinch={!coarse}
        zoomOnDoubleClick={false}
        panOnScroll={false}
        preventScrolling={false}
        zoomActivationKeyCode={ZOOM_KEYS}
        deleteKeyCode={DELETE_KEYS}
        nodeDragThreshold={5}
        nodesDraggable={!coarse}
        panOnDrag={!coarse}
        selectionOnDrag={false}
        connectionRadius={coarse ? 28 : 18}
        connectionLineStyle={{ stroke: 'var(--accent)', strokeWidth: 1, strokeDasharray: '4 3' }}
        aria-label="Node editor canvas"
      >
        <ZoomControls />
        <Toast />
        {hint && (
          <Panel position="top-left" className="fig1-hint" aria-hidden="true">
            Drag a wire · turn a knob
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
}

/* ---------- entry ---------- */

export default function Fig1Playground() {
  const ref = useRef<HTMLElement>(null);
  const [width, setWidth] = useState(0);
  const coarse = useMedia('(pointer: coarse)');
  const descId = useId();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    const ro = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const narrow = width > 0 && width < NARROW;

  return (
    <section
      ref={ref}
      className={`fig1${narrow ? ' fig1--narrow' : ''}${coarse ? ' fig1--coarse' : ''}`}
      aria-label="Configure this page"
      aria-describedby={descId}
    >
      <p id={descId} className="fig1-sr">
        Interactive node graph. Accent, Theme, Motion and Density control nodes are wired into a Page node and restyle
        this site. Deleting a wire disables that control and keeps the last value; its Unwired button rewires it. Reset
        restores the defaults.
      </p>
      {width === 0 ? null : narrow ? (
        <StaticGraph />
      ) : (
        <ReactFlowProvider>
          <Canvas width={width} coarse={coarse} />
        </ReactFlowProvider>
      )}
      <LiveRegion />
    </section>
  );
}
