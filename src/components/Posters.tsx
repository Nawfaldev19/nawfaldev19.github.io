/**
 * Static SVG posters shown while a figure loads (and if it fails to).
 * Classes d-* are styled in global.css so the drawings follow the theme and accent.
 */

function NodeBox({ x, y, w, h, code, title }: { x: number; y: number; w: number; h: number; code: string; title: string }) {
  return (
    <g>
      <rect className="d-node" x={x} y={y} width={w} height={h} />
      <line className="d-line d-faint" x1={x} y1={y + 18} x2={x + w} y2={y + 18} />
      <text className="d-text d-muted" x={x + 8} y={y + 13}>
        {code}
      </text>
      <text className="d-text" x={x + 46} y={y + 13}>
        {title}
      </text>
    </g>
  );
}

function Handle({ x, y, filled = true }: { x: number; y: number; filled?: boolean }) {
  return <circle className={filled ? 'd-handle d-handle--on' : 'd-handle'} cx={x} cy={y} r={4} />;
}

/** FIG. 1: four control nodes wired to a page node. */
export function Fig1Poster() {
  const controls = [
    { code: 'N.01', title: 'THEME', value: 'paper' },
    { code: 'N.02', title: 'ACCENT', value: '' },
    { code: 'N.03', title: 'MOTION', value: 'on' },
    { code: 'N.04', title: 'DENSITY', value: '' },
  ];
  const ports = [104, 144, 184, 224];
  return (
    <svg className="poster" viewBox="0 0 640 330" role="img" aria-label="Loading FIG. 1: four control nodes (theme, accent, motion, density) wired to a page node.">
      {controls.map((c, i) => {
        const y = 16 + i * 78;
        const outY = y + 38;
        return (
          <g key={c.code}>
            <NodeBox x={24} y={y} w={168} h={58} code={c.code} title={c.title} />
            {c.value && (
              <text className="d-text" x={32} y={y + 42}>
                {c.value}
              </text>
            )}
            {c.title === 'ACCENT' &&
              [0, 1, 2, 3, 4].map((k) => (
                <rect key={k} className={k === 0 ? 'd-swatch d-swatch--on' : 'd-swatch'} x={32 + k * 22} y={y + 30} width={14} height={14} />
              ))}
            {c.title === 'DENSITY' && (
              <g>
                <line className="d-line" x1={32} y1={y + 38} x2={150} y2={y + 38} />
                <rect className="d-node d-accent-stroke" x={86} y={y + 32} width={8} height={12} />
              </g>
            )}
            <path className="d-line d-edge" d={`M192 ${outY} H 300 V ${ports[i]} H 420`} />
            <Handle x={192} y={outY} />
            <Handle x={420} y={ports[i]} />
          </g>
        );
      })}
      <NodeBox x={420} y={60} w={196} h={210} code="N.05" title="PAGE" />
      <g className="d-faint-group">
        <rect className="d-line" x={436} y={92} width={164} height={162} />
        <line className="d-line d-accent-stroke" x1={448} y1={112} x2={540} y2={112} />
        <line className="d-line" x1={448} y1={126} x2={580} y2={126} />
        <line className="d-line" x1={448} y1={136} x2={560} y2={136} />
        <rect className="d-line" x={448} y={152} width={140} height={86} />
        <path className="d-line d-faint" d="M448 152 L588 238 M588 152 L448 238" />
      </g>
    </svg>
  );
}

/** FIG. 2: the same graph drawn by two renderers. */
export function Fig2Poster() {
  const panel = (x: number, label: string, fps: string, dense: boolean) => (
    <g>
      <rect className="d-node" x={x} y={20} width={280} height={250} />
      <text className="d-text d-muted" x={x + 10} y={38}>
        {label}
      </text>
      <text className="d-text d-accent-fill" x={x + 270} y={38} textAnchor="end">
        {fps}
      </text>
      <line className="d-line d-faint" x1={x} y1={48} x2={x + 280} y2={48} />
      {Array.from({ length: 12 }, (_, i) => {
        const cx = x + 30 + (i % 4) * 72;
        const cy = 80 + Math.floor(i / 4) * 70;
        return (
          <g key={i}>
            <rect className={dense ? 'd-node d-accent-stroke' : 'd-node'} x={cx - 18} y={cy - 10} width={36} height={20} />
            {i % 4 !== 3 && <line className="d-line d-faint" x1={cx + 18} y1={cy} x2={cx + 54} y2={cy} />}
          </g>
        );
      })}
    </g>
  );
  return (
    <svg className="poster" viewBox="0 0 640 290" role="img" aria-label="Loading FIG. 2: the same graph drawn by a naive renderer and an optimised one.">
      {panel(20, 'RE-RENDER ALL', '< 10 FPS', true)}
      {panel(340, 'PER-NODE STATE', '40–56 FPS', false)}
    </svg>
  );
}

/** FIG. 3: three generations of the seat map. */
export function Fig3Poster() {
  return (
    <svg className="poster" viewBox="0 0 640 260" role="img" aria-label="Loading FIG. 3: the seat map drawn as DOM elements, as SVG, and on a canvas with level of detail.">
      <SeatThumbGroup x={20} y={20} kind="dom" label="GEN 1 · DOM" />
      <SeatThumbGroup x={230} y={20} kind="svg" label="GEN 2 · SVG" />
      <SeatThumbGroup x={440} y={20} kind="canvas" label="GEN 3 · CANVAS" />
    </svg>
  );
}

/** One seat-map thumbnail. dom = square cells, svg = round seats, canvas = sections as blocks plus one zoomed-in section. */
export function SeatThumbGroup({ x, y, kind, label }: { x: number; y: number; kind: 'dom' | 'svg' | 'canvas'; label: string }) {
  const seats = [];
  if (kind !== 'canvas') {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 10; c++) {
        const sx = x + 22 + c * 15;
        const sy = y + 50 + r * 17 + (kind === 'svg' ? Math.abs(c - 4.5) * 1.6 : 0);
        seats.push(
          kind === 'dom' ? (
            <rect key={`${r}-${c}`} className="d-node" x={sx} y={sy} width={10} height={10} />
          ) : (
            <circle key={`${r}-${c}`} className="d-node" cx={sx + 5} cy={sy + 5} r={4.5} />
          ),
        );
      }
    }
  }
  return (
    <g>
      <rect className="d-node" x={x} y={y} width={180} height={220} />
      <text className="d-text d-muted" x={x + 10} y={y + 18}>
        {label}
      </text>
      <line className="d-line d-faint" x1={x} y1={y + 28} x2={x + 180} y2={y + 28} />
      {seats}
      {kind === 'canvas' && (
        <g>
          <rect className="d-node d-accent-stroke" x={x + 22} y={y + 50} width={62} height={56} />
          <rect className="d-node" x={x + 96} y={y + 50} width={62} height={56} />
          <rect className="d-node" x={x + 22} y={y + 116} width={136} height={30} />
          {Array.from({ length: 24 }, (_, i) => (
            <circle key={i} className="d-node d-accent-stroke" cx={x + 30 + (i % 8) * 17} cy={y + 168 + Math.floor(i / 8) * 15} r={4.5} />
          ))}
          <path className="d-line d-faint" d={`M${x + 22} ${y + 106} L${x + 22} ${y + 158} M${x + 84} ${y + 106} L${x + 158} ${y + 158}`} />
        </g>
      )}
    </g>
  );
}
