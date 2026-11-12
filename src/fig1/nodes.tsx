import { memo, useCallback, useState, type CSSProperties, type ReactNode } from 'react';
import { Handle, Position, useNodeConnections, useReactFlow, type NodeProps } from '@xyflow/react';
import { ACCENTS, useSettings, type AccentKey } from '../store/settings';
import {
  CONTROL_BY_KIND,
  DENSITY_LABEL,
  PAGE_CODE,
  PAGE_INPUT_TOP,
  PORT_LABEL,
  SEED_CODE,
  FIT,
  inId,
  initialEdges,
  initialNodes,
  outId,
  useFig1,
  wireFor,
  type ControlNodeT,
  type PageNodeT,
  type PortType,
} from './defs';
import { CONTROL_COMPONENT, CopyButton, applySetting } from './controls';

/* ---------- shared pieces ---------- */

function Ticks() {
  return <span className="fig1-ticks" aria-hidden="true" />;
}

function Port({
  type,
  port,
  wired,
  style,
}: {
  type: 'source' | 'target';
  port: PortType;
  wired: boolean;
  style?: CSSProperties;
}) {
  return (
    <Handle
      type={type}
      id={type === 'source' ? outId(port) : inId(port)}
      position={type === 'source' ? Position.Right : Position.Left}
      className={`fig1-port fig1-port--${port}${wired ? ' is-wired' : ''}`}
      style={style}
      title={`${PORT_LABEL[port]} ${type === 'source' ? 'output' : 'input'}`}
    />
  );
}

function Strip({ code, title, children }: { code: string; title: string; children?: ReactNode }) {
  return (
    <div className="fig1-strip">
      <span className="fig1-strip__code">{code}</span>
      <span className="fig1-strip__title">{title}</span>
      <span className="fig1-strip__tag">{children}</span>
    </div>
  );
}

/* ---------- control nodes (Accent, Theme, Motion, Density) ---------- */

export const ControlNode = memo(function ControlNode({ data }: NodeProps<ControlNodeT>) {
  const def = CONTROL_BY_KIND[data.kind];
  const out = useNodeConnections({ handleType: 'source' });
  const wired = out.some((c) => c.target === 'page');
  const seedIn = useNodeConnections({ handleType: 'target' });
  const { setEdges } = useReactFlow();
  const Control = CONTROL_COMPONENT[data.kind];

  const rewire = useCallback(() => {
    setEdges((eds) =>
      eds.some((e) => e.target === 'page' && e.targetHandle === inId(def.port)) ? eds : [...eds, wireFor(def.kind)],
    );
    useFig1.getState().announce(`${def.name} wired to Page`);
  }, [setEdges, def]);

  return (
    <div className={`fig1-node fig1-node--control${wired ? '' : ' is-unwired'}`}>
      <Ticks />
      <Strip code={def.code} title={def.title}>
        {wired ? (
          <span className="fig1-type">{PORT_LABEL[def.port]}</span>
        ) : (
          <button
            type="button"
            className="fig1-unwired nodrag nopan"
            onClick={rewire}
            aria-label={`${def.name} is unwired. Rewire to Page`}
          >
            unwired
          </button>
        )}
      </Strip>
      <div className="fig1-node__body">
        <Control disabled={!wired} />
      </div>
      {data.kind === 'accent' && (
        <Port type="target" port="seed" wired={seedIn.some((c) => c.source === 'seed')} />
      )}
      <Port type="source" port={def.port} wired={wired} />
      {!wired && <span className="fig1-stub" aria-hidden="true" />}
    </div>
  );
});

/* ---------- Seed node (easter egg, off-sheet) ---------- */

export const SeedNode = memo(function SeedNode() {
  const out = useNodeConnections({ handleType: 'source' });
  const accentOut = useNodeConnections({ id: 'accent', handleType: 'source' });
  const toAccent = out.some((c) => c.target === 'accent');
  const live = toAccent && accentOut.some((c) => c.target === 'page');
  const [seed, setSeed] = useState<number | null>(null);

  const shuffle = () => {
    const keys = Object.keys(ACCENTS) as AccentKey[];
    const current = useSettings.getState().accent;
    const pool = keys.filter((k) => k !== current);
    const n = Math.floor(Math.random() * 0xffff);
    setSeed(n);
    useFig1.getState().bumpSeed();
    applySetting({ accent: pool[n % pool.length] });
  };

  return (
    <div className={`fig1-node fig1-node--seed${toAccent ? '' : ' is-unwired'}`}>
      <Ticks />
      <Strip code={SEED_CODE} title="SEED">
        {toAccent ? <span className="fig1-type">SEED</span> : <span className="fig1-type">unwired</span>}
      </Strip>
      <div className="fig1-node__body fig1-seed">
        <button type="button" className="fig1-btn nodrag nopan" disabled={!live} onClick={shuffle}>
          Shuffle
        </button>
        <span className="fig1-readout" aria-hidden="true">
          {seed === null ? (toAccent && !live ? 'ACCENT UNWIRED' : 'WIRE TO ACCENT') : `#${seed.toString(16).toUpperCase().padStart(4, '0')}`}
        </span>
      </div>
      <Port type="source" port="seed" wired={toAccent} />
      {!toAccent && <span className="fig1-stub" aria-hidden="true" />}
    </div>
  );
});

/* ---------- Page output node ---------- */

const PAGE_INPUTS = Object.keys(PAGE_INPUT_TOP) as Exclude<PortType, 'seed'>[];

export const PageNode = memo(function PageNode(_: NodeProps<PageNodeT>) {
  const inputs = useNodeConnections({ handleType: 'target' });
  const accent = useSettings((s) => s.accent);
  const theme = useSettings((s) => s.theme);
  const motion = useSettings((s) => s.motion);
  const density = useSettings((s) => s.density);
  const { setEdges, setNodes, fitView } = useReactFlow();
  const hex = ACCENTS[accent][theme];

  const reset = () => {
    useSettings.getState().reset();
    setEdges(initialEdges());
    setNodes(initialNodes());
    requestAnimationFrame(() =>
      fitView({ ...FIT, duration: useSettings.getState().motion ? 300 : 0 }),
    );
    useFig1.getState().announce('Page reset: default settings, all controls wired');
  };

  return (
    <div className="fig1-node fig1-node--page">
      <Ticks />
      <Strip code={PAGE_CODE} title="PAGE">
        <span className="fig1-type">OUTPUT</span>
      </Strip>

      {PAGE_INPUTS.map((p) => {
        const wired = inputs.some((c) => c.targetHandle === inId(p));
        return (
          <span key={p}>
            <Port type="target" port={p} wired={wired} style={{ top: PAGE_INPUT_TOP[p] }} />
            <span
              className={`fig1-inlabel${wired ? '' : ' is-off'}`}
              style={{ top: PAGE_INPUT_TOP[p] }}
              aria-hidden="true"
            >
              {PORT_LABEL[p]}
            </span>
          </span>
        );
      })}

      <div className="fig1-page">
        <div className="fig1-mini" aria-hidden="true" style={{ '--mini-accent': hex } as CSSProperties}>
          <div className="fig1-mini__bar">
            <span>S.00</span>
            <span className="fig1-mini__url">nawfaldev19.github.io</span>
          </div>
          <div className="fig1-mini__body">
            <span className="fig1-mini__eyebrow">Senior Full Stack Developer</span>
            <span className="fig1-mini__h">
              Nawfal Imran
              <span className={`fig1-mini__caret${motion ? ' is-on' : ''}`} />
            </span>
            <span className="fig1-mini__rule" />
            <span className="fig1-mini__line" />
            <span className="fig1-mini__line fig1-mini__line--short" />
            <span className="fig1-mini__grid">
              {Array.from({ length: 6 }, (_, i) => (
                <span key={i} className={i === 1 ? 'is-accent' : undefined} />
              ))}
            </span>
          </div>
        </div>

        <dl className="fig1-spec">
          <div>
            <dt>--accent</dt>
            <dd>
              <span className="fig1-spec__chip" style={{ background: hex }} aria-hidden="true" />
              {hex}
            </dd>
          </div>
          <div>
            <dt>theme</dt>
            <dd>{theme}</dd>
          </div>
          <div>
            <dt>motion</dt>
            <dd>{motion ? 'on' : 'off'}</dd>
          </div>
          <div>
            <dt>density</dt>
            <dd>{DENSITY_LABEL[density].toLowerCase()}</dd>
          </div>
        </dl>

        <div className="fig1-actions">
          <button type="button" className="fig1-btn nodrag nopan" onClick={reset}>
            Reset
          </button>
          <CopyButton />
        </div>
      </div>
    </div>
  );
});
