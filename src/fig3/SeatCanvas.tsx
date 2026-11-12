import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Circle, Layer, Rect, Shape, Stage, Text } from 'react-konva';
import type Konva from 'konva';
import { useSettings } from '../store/settings';
import { CX, CY, R_IN, R_OUT, SECTIONS, STAGE, WORLD_W, nearestSeat, sectionAt } from './seats';
import type { Active, PanApi, Seat } from './seats';

interface Props {
  seats: Seat[];
  w: number;
  h: number;
  zoom: number;
  lod: boolean;
  active: Active;
  onActive: (a: Active) => void;
  onMeasure: (ms: number, els: string) => void;
  panRef: React.MutableRefObject<PanApi | null>;
}

function readTokens() {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  return { seat: v('--ink-muted'), line: v('--line'), accent: v('--accent'), muted: v('--ink-muted'), font: v('--font-mono') || 'monospace' };
}

const rad = (deg: number) => (deg * Math.PI) / 180;

export default function SeatCanvas({ seats, w, h, zoom, lod, active, onActive, onMeasure, panRef }: Props) {
  const theme = useSettings((s) => s.theme);
  const accent = useSettings((s) => s.accent);
  const [tok, setTok] = useState(readTokens);
  useEffect(() => { setTok(readTokens()); }, [theme, accent]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);
  const base = w / WORLD_W;

  // honest timer: starts when this component renders for a new configuration, stops after commit + first synchronous draw
  const key = `${seats.length}|${lod}|${zoom}|${w}`;
  const lastKey = useRef('');
  const t0 = useRef(0);
  if (lastKey.current !== key) { lastKey.current = key; t0.current = performance.now(); }

  // zoom about the view centre; keep the pan when only the zoom changes
  const prevScale = useRef(0);
  useLayoutEffect(() => {
    const st = stageRef.current;
    if (!st) return;
    const next = base * zoom;
    const old = prevScale.current || next;
    const pos = st.position();
    const wcx = (w / 2 - pos.x) / old;
    const wcy = (h / 2 - pos.y) / old;
    st.scale({ x: next, y: next });
    st.position(zoom === 1 ? { x: 0, y: 0 } : { x: w / 2 - wcx * next, y: h / 2 - wcy * next });
    prevScale.current = next;
  }, [base, zoom, w, h]);

  useLayoutEffect(() => {
    layerRef.current?.draw();
    const ms = performance.now() - t0.current;
    const n = wrapRef.current?.querySelectorAll('canvas').length ?? 1;
    onMeasure(ms, `${n} <canvas>`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // scripted pan: move the stage and redraw through Konva (LOD stays as it is)
  useLayoutEffect(() => {
    let home: { x: number; y: number } | null = null;
    panRef.current = {
      apply: (x, y) => {
        const st = stageRef.current;
        if (!st) return;
        if (!home) home = st.position();
        const k = st.scaleX();
        st.position({ x: home.x + x * k, y: home.y + y * k });
        layerRef.current?.draw();
      },
      reset: () => {
        if (home) { stageRef.current?.position(home); layerRef.current?.draw(); }
        home = null;
      },
    };
    return () => { panRef.current = null; };
  }, [panRef]);

  const pick = (commit: boolean) => {
    const st = stageRef.current;
    const p = st?.getPointerPosition();
    if (!st || !p) return;
    const sc = st.scaleX();
    const pos = st.position();
    const wx = (p.x - pos.x) / sc;
    const wy = (p.y - pos.y) / sc;
    if (lod) {
      const i = nearestSeat(seats, wx, wy, 8 / sc);
      if (i >= 0) onActive({ kind: 'seat', i });
      else if (commit) onActive(null);
    } else {
      const s = sectionAt(wx, wy);
      if (s >= 0) onActive({ kind: 'sec', s });
      else if (commit) onActive(null);
    }
  };

  const seatShape = useMemo(
    () => (ctx: Konva.Context, shape: Konva.Shape) => {
      ctx.beginPath();
      for (const s of seats) { ctx.moveTo(s.x + s.r, s.y); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2, false); }
      ctx.fillShape(shape);
    },
    [seats],
  );

  const sc = base * zoom;
  const act = active?.kind === 'seat' ? seats[active.i] : null;

  return (
    <div ref={wrapRef} style={{ width: w, height: h, touchAction: zoom > 1 ? 'none' : 'pan-y' }}>
      <Stage ref={stageRef} width={w} height={h} draggable={zoom > 1} onMouseMove={() => pick(false)} onClick={() => pick(true)} onTap={() => pick(true)} onMouseLeave={() => onActive(null)}>
        <Layer ref={layerRef}>
          <Rect x={STAGE.x} y={STAGE.y} width={STAGE.w} height={STAGE.h} stroke={tok.line} strokeWidth={1 / sc} />
          <Text x={STAGE.x} y={STAGE.y} width={STAGE.w} height={STAGE.h} text="STAGE" align="center" verticalAlign="middle" fontSize={11} letterSpacing={2} fontFamily={tok.font} fill={tok.muted} listening={false} />
          {lod ? (
            <Shape sceneFunc={seatShape} fill={tok.seat} opacity={0.7} listening={false} />
          ) : (
            SECTIONS.map((s, si) => (
              <Shape
                key={s.name}
                listening={false}
                sceneFunc={(ctx, shape) => {
                  const p0 = Math.PI / 2 - rad(s.a0);
                  const p1 = Math.PI / 2 - rad(s.a1);
                  ctx.beginPath();
                  ctx.arc(CX, CY, R_OUT, p0, p1, true);
                  ctx.arc(CX, CY, R_IN, p1, p0, false);
                  ctx.closePath();
                  ctx.fillStrokeShape(shape);
                }}
                fill={active?.kind === 'sec' && active.s === si ? tok.accent : tok.seat}
                opacity={active?.kind === 'sec' && active.s === si ? 0.55 : 0.3}
                stroke={tok.line}
                strokeWidth={1 / sc}
              />
            ))
          )}
          {act && <Circle x={act.x} y={act.y} radius={Math.max(act.r * 1.7, 5 / sc)} fill={tok.accent} listening={false} />}
        </Layer>
      </Stage>
    </div>
  );
}
