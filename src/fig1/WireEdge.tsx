import { memo, useEffect, useRef } from 'react';
import { getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { useSettings } from '../store/settings';
import { KIND_BY_PORT, portOf, useFig1 } from './defs';

const PULSE_MS = 600;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/**
 * Orthogonal ink wire. When the value it carries changes, a dot travels source -> target in ~600 ms.
 * The dot is moved imperatively (no React re-render per frame) and is skipped when motion is off.
 */
export const WireEdge = memo(function WireEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, sourceHandleId, interactionWidth } =
    props;
  // Near-level wires are drawn dead straight (avoids a 1 px step from border offsets).
  const level = Math.abs(sourceY - targetY) < 4 && targetX > sourceX;
  const [stepD] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 0,
    offset: 18,
  });
  const d = level ? `M ${sourceX},${sourceY} L ${targetX},${sourceY}` : stepD;

  const port = portOf(sourceHandleId);
  const kind = port ? KIND_BY_PORT[port] : undefined;
  const value = useSettings((s) => (kind ? s[kind] : null));
  const seedTick = useFig1((s) => (port === 'seed' ? s.seedTick : 0));

  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot || !useSettings.getState().motion) return;
    let raf = 0;
    const len = path.getTotalLength();
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / PULSE_MS);
      const p = path.getPointAtLength(len * ease(t));
      dot.setAttribute('cx', String(p.x));
      dot.setAttribute('cy', String(p.y));
      const on = t < 1 && useSettings.getState().motion; // stops mid-flight if motion is switched off
      dot.style.opacity = on ? '1' : '0';
      if (on) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      dot.style.opacity = '0';
    };
  }, [value, seedTick]);

  return (
    <>
      <path d={d} pathLength={1} className="react-flow__edge-path fig1-wire" />
      {/* Measured for the pulse; no pathLength here so getPointAtLength uses real units. */}
      <path ref={pathRef} d={d} className="react-flow__edge-interaction" fill="none" strokeOpacity={0} strokeWidth={interactionWidth ?? 20} />
      <circle ref={dotRef} r={3.5} cx={sourceX} cy={sourceY} className="fig1-pulse" style={{ opacity: 0 }} />
    </>
  );
});
