/**
 * A neutral, synthetic workflow redrawn for the NDA case study. Not the client's UI or content.
 * Two layouts: wide for desktop, tall for phones (CSS shows one).
 */
interface N {
  code: string;
  kind: string;
  label: string;
}
const NODES: N[] = [
  { code: 'N.01', kind: 'TRIGGER', label: 'Form submitted' },
  { code: 'N.02', kind: 'STEP', label: 'Collect details' },
  { code: 'N.03', kind: 'RULE', label: 'Check rule' },
  { code: 'N.04', kind: 'STEP', label: 'Assign review' },
  { code: 'N.05', kind: 'OUTPUT', label: 'Notify team' },
  { code: 'N.06', kind: 'STEP', label: 'Request changes' },
];

type Layout = {
  viewBox: string;
  w: number;
  h: number;
  pos: [number, number][];
  edges: { d: string; label?: string; lx?: number; ly?: number }[];
};

const WIDE: Layout = {
  viewBox: '0 0 610 220',
  w: 120,
  h: 56,
  pos: [
    [20, 30],
    [170, 30],
    [320, 30],
    [470, 30],
    [470, 144],
    [320, 144],
  ],
  edges: [
    { d: 'M140 58 H166' },
    { d: 'M290 58 H316' },
    { d: 'M440 58 H466', label: 'yes', lx: 444, ly: 50 },
    { d: 'M530 86 V140' },
    { d: 'M380 86 V140', label: 'no', lx: 386, ly: 118 },
    { d: 'M320 172 H230 V90' },
  ],
};

const TALL: Layout = {
  viewBox: '0 0 320 412',
  w: 140,
  h: 52,
  pos: [
    [20, 20],
    [20, 100],
    [20, 180],
    [20, 260],
    [20, 340],
    [176, 180],
  ],
  edges: [
    { d: 'M90 72 V96' },
    { d: 'M90 152 V176' },
    { d: 'M90 232 V256', label: 'yes', lx: 96, ly: 248 },
    { d: 'M90 312 V336' },
    { d: 'M160 206 H172', label: 'no', lx: 160, ly: 222 },
    { d: 'M246 180 V126 H164' },
  ],
};

function Drawing({ layout, id, className }: { layout: Layout; id: string; className: string }) {
  const { w, h } = layout;
  return (
    <svg className={`workflow ${className}`} viewBox={layout.viewBox} aria-hidden="true">
      <defs>
        <marker id={id} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="8" markerHeight="8" orient="auto-start-reverse">
          <path className="d-arrow" d="M0 0 L8 4 L0 8 Z" />
        </marker>
      </defs>
      {layout.edges.map((e, i) => (
        <g key={i}>
          <path className="d-line" d={e.d} markerEnd={`url(#${id})`} />
          {e.label && (
            <text className="d-text d-muted d-small" x={e.lx} y={e.ly}>
              {e.label}
            </text>
          )}
        </g>
      ))}
      {NODES.map((n, i) => {
        const [x, y] = layout.pos[i];
        return (
          <g key={n.code}>
            <rect className={n.kind === 'RULE' ? 'd-node d-accent-stroke' : 'd-node'} x={x} y={y} width={w} height={h} />
            <line className="d-line d-faint" x1={x} y1={y + 18} x2={x + w} y2={y + 18} />
            <text className="d-text d-muted d-small" x={x + 8} y={y + 13}>
              {n.code} {n.kind}
            </text>
            <text className="d-text" x={x + 8} y={y + 38}>
              {n.label}
            </text>
            <circle className="d-handle d-handle--on" cx={x} cy={y + h / 2} r={3.5} />
            <circle className="d-handle d-handle--on" cx={x + w} cy={y + h / 2} r={3.5} />
          </g>
        );
      })}
    </svg>
  );
}

export function WorkflowDiagram() {
  return (
    <div
      className="workflow-wrap"
      role="img"
      aria-label="Synthetic workflow: form submitted, collect details, check rule; if yes, assign review then notify team; if no, request changes and return to collect details."
    >
      <Drawing layout={WIDE} id="wf-arrow-wide" className="workflow--wide" />
      <Drawing layout={TALL} id="wf-arrow-tall" className="workflow--tall" />
    </div>
  );
}
