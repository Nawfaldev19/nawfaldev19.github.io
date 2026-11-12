/**
 * One small synthetic component tree, redrawn per story beat:
 * 0 slow, 1 every node re-renders, 2 only the changed node re-renders, 3 fast.
 */
const NODES: { x: number; y: number; parent?: number }[] = [
  { x: 165, y: 34 },
  { x: 57, y: 96, parent: 0 },
  { x: 165, y: 96, parent: 0 },
  { x: 273, y: 96, parent: 0 },
  { x: 30, y: 158, parent: 1 },
  { x: 84, y: 158, parent: 1 },
  { x: 138, y: 158, parent: 2 },
  { x: 192, y: 158, parent: 2 },
  { x: 246, y: 158, parent: 3 },
  { x: 300, y: 158, parent: 3 },
];
const CHANGED = 7;
const W = 44;
const H = 22;

const READOUT = [
  { fps: '< 10 FPS', note: 'frame budget missed', level: 9 },
  { fps: '< 10 FPS', note: '1 change → 10 renders', level: 9 },
  { fps: '40–56 FPS', note: '1 change → 1 render', level: 48 },
  { fps: '40–56 FPS', note: 'same diagram, smooth', level: 48 },
];

export function BeatDiagram({ beat, className = '' }: { beat: number; className?: string }) {
  const r = READOUT[beat] ?? READOUT[0];
  const nodeClass = (i: number) => {
    if (beat === 1) return i === CHANGED ? 'bd-node is-changed' : 'bd-node is-rendering';
    if (beat === 2) return i === CHANGED ? 'bd-node is-changed' : 'bd-node is-skipped';
    return 'bd-node';
  };
  return (
    <svg
      className={`beat-diagram ${className}`}
      viewBox="0 0 330 250"
      role="img"
      aria-label={`Beat ${beat + 1} of 4: ${r.note}, ${r.fps}. Synthetic drawing.`}
    >
      {NODES.map((n, i) =>
        n.parent === undefined ? null : (
          <path
            key={`e${i}`}
            className="d-line d-faint"
            d={`M${NODES[n.parent].x} ${NODES[n.parent].y + H / 2} V ${n.y - 18} H ${n.x} V ${n.y - H / 2}`}
          />
        ),
      )}
      {NODES.map((n, i) => (
        <rect key={i} className={nodeClass(i)} x={n.x - W / 2} y={n.y - H / 2} width={W} height={H} />
      ))}
      <text className="d-text d-muted" x={16} y={204}>
        {r.note}
      </text>
      <text className="d-text d-accent-fill" x={314} y={204} textAnchor="end">
        {r.fps}
      </text>
      <rect className="d-line" x={16} y={214} width={298} height={10} />
      <rect
        className="bd-meter"
        x={16}
        y={214}
        width={298}
        height={10}
        style={{ transform: `scaleX(${r.level / 60})` }}
      />
      <text className="d-text d-muted d-small" x={16} y={240}>
        0
      </text>
      <text className="d-text d-muted d-small" x={314} y={240} textAnchor="end">
        60 FPS
      </text>
    </svg>
  );
}
