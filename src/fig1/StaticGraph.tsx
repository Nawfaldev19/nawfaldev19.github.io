import { memo, useId } from 'react';
import { ACCENTS, useSettings } from '../store/settings';
import { CONTROLS, DENSITY_LABEL, PAGE_CODE, PORT_LABEL, useFig1, type ControlKind, type PortType } from './defs';
import { CONTROL_COMPONENT, CopyButton } from './controls';

/* Compact layout for narrow screens, computed from the same node definitions as the canvas. */
const W = 300;
const BOX_W = 148;
const BOX_H = 34;
const ROW = 44;
const PX = 196;
const PW = W - PX - 1;
const H = CONTROLS.length * ROW + 2;
const inY = (i: number) => 1 + i * ROW + BOX_H / 2;

function PortShape({ port, x, y }: { port: PortType; x: number; y: number }) {
  const cls = 'fig1-svg-port';
  switch (port) {
    case 'color':
      return <circle className={cls} cx={x} cy={y} r={4} />;
    case 'mode':
      return <rect className={cls} x={x - 3.5} y={y - 3.5} width={7} height={7} />;
    case 'bool':
      return <rect className={cls} x={x - 3} y={y - 3} width={6} height={6} transform={`rotate(45 ${x} ${y})`} />;
    default:
      return <rect className={cls} x={x - 1.75} y={y - 5} width={3.5} height={10} />;
  }
}

const StaticDiagram = memo(function StaticDiagram() {
  const s = useSettings();
  const titleId = useId();
  const descId = useId();
  const value: Record<ControlKind, string> = {
    accent: ACCENTS[s.accent].label,
    theme: s.theme === 'paper' ? 'Paper' : 'Blueprint',
    motion: s.motion ? 'On' : 'Off',
    density: DENSITY_LABEL[s.density],
  };
  return (
    <svg
      className="fig1-svg"
      viewBox={`-2 -2 ${W + 4} ${H + 4}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
    >
      <title id={titleId}>Node graph: four controls wired into the Page</title>
      <desc id={descId}>
        {`Accent, Theme, Motion and Density nodes each connect by a typed wire to a Page node. Current values: accent ${value.accent}, theme ${value.theme}, motion ${value.motion}, density ${value.density}.`}
      </desc>
      {CONTROLS.map((c, i) => {
        const y = 1 + i * ROW;
        const cy = inY(i);
        const mid = BOX_W + (PX - BOX_W) / 2;
        return (
          <g key={c.kind}>
            <rect className="fig1-svg-box" x={0} y={y} width={BOX_W} height={BOX_H} />
            <text className="fig1-svg-code" x={6} y={y + 11}>
              {`${c.code} ${c.title}`}
            </text>
            <text className="fig1-svg-type" x={BOX_W - 8} y={y + 11} textAnchor="end">
              {PORT_LABEL[c.port]}
            </text>
            <text className="fig1-svg-val" x={6} y={y + 27}>
              {value[c.kind]}
            </text>
            <path className="fig1-svg-wire" d={`M${BOX_W} ${cy} H${mid} V${cy} H${PX}`} />
            <PortShape port={c.port} x={BOX_W} y={cy} />
            <PortShape port={c.port} x={PX} y={cy} />
          </g>
        );
      })}
      <g>
        <rect className="fig1-svg-box" x={PX} y={1} width={PW} height={H - 2} />
        <text className="fig1-svg-code" x={PX + 10} y={13}>
          {`${PAGE_CODE} PAGE`}
        </text>
        <rect className="fig1-svg-sheet" x={PX + 10} y={20} width={PW - 20} height={H - 32} />
        <text className="fig1-svg-h" x={PX + 16} y={46}>
          Aa
        </text>
        <rect className="fig1-svg-accent" x={PX + 16} y={54} width={36} height={2} />
        <rect className="fig1-svg-line" x={PX + 16} y={64} width={PW - 34} height={2} />
        <rect className="fig1-svg-line" x={PX + 16} y={72} width={(PW - 34) * 0.6} height={2} />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <rect
            key={k}
            className={k === 1 ? 'fig1-svg-accent' : 'fig1-svg-cell'}
            x={PX + 16 + (k % 3) * 22}
            y={88 + Math.floor(k / 3) * 22}
            width={18}
            height={18}
          />
        ))}
      </g>
    </svg>
  );
});

/** Below 640 px: a static diagram plus a plain form bound to the same store. */
export default function StaticGraph() {
  const titleId = useId();
  return (
    <div className="fig1-mobile">
      <StaticDiagram />
      <div className="fig1-form" role="group" aria-labelledby={titleId}>
        <p className="fig1-form__title" id={titleId}>
          Configure this page
        </p>
        {CONTROLS.map((c) => {
          const Control = CONTROL_COMPONENT[c.kind];
          return (
            <div key={c.kind} className="fig1-form__row">
              <span className="fig1-form__code" aria-hidden="true">
                {c.code}
              </span>
              <Control showLegend />
            </div>
          );
        })}
        <div className="fig1-actions">
          <button
            type="button"
            className="fig1-btn"
            onClick={() => {
              useSettings.getState().reset();
              useFig1.getState().announce('Page reset to default settings');
            }}
          >
            Reset
          </button>
          <CopyButton />
        </div>
      </div>
    </div>
  );
}
