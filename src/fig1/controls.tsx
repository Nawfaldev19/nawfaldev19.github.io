import { memo, useEffect, useId, useRef, useState, type ComponentType, type ReactNode } from 'react';
import { ACCENTS, useSettings, type AccentKey, type Settings } from '../store/settings';
import { DENSITY_LABEL, copyText, cssVarsText, useFig1, type ControlKind } from './defs';

/** Every control writes the shared store (which restyles the real page) and announces politely. */
export function applySetting(patch: Partial<Settings>) {
  useSettings.getState().set(patch);
  const say = useFig1.getState().announce;
  if (patch.accent) say(`Accent set to ${ACCENTS[patch.accent].label}`);
  if (patch.theme) say(`Theme set to ${patch.theme}`);
  if (patch.motion !== undefined) say(`Motion ${patch.motion ? 'on' : 'off'}`);
  if (patch.density !== undefined) say(`Density set to ${DENSITY_LABEL[patch.density].toLowerCase()}`);
}

interface CtlProps {
  disabled?: boolean;
  /** Show the visible legend (mobile form); nodes already carry a title strip. */
  showLegend?: boolean;
}

const ACCENT_KEYS = Object.keys(ACCENTS) as AccentKey[];

export const AccentControl = memo(function AccentControl({ disabled, showLegend }: CtlProps) {
  const accent = useSettings((s) => s.accent);
  const theme = useSettings((s) => s.theme);
  const name = useId();
  return (
    <fieldset className="fig1-field" disabled={disabled}>
      <legend className={showLegend ? 'fig1-legend' : 'fig1-sr'}>Accent</legend>
      <div className="fig1-swatches" role="presentation">
        {ACCENT_KEYS.map((k) => (
          <label key={k} className="fig1-swatch nodrag nopan" title={ACCENTS[k].label}>
            <input
              type="radio"
              className="fig1-sr"
              name={name}
              value={k}
              checked={accent === k}
              onChange={() => applySetting({ accent: k })}
            />
            <span className="fig1-swatch__chip" style={{ background: ACCENTS[k][theme] }} aria-hidden="true" />
            <span className="fig1-sr">{ACCENTS[k].label}</span>
          </label>
        ))}
      </div>
      <p className="fig1-readout" aria-hidden="true">
        {ACCENTS[accent].label}
        <span>{ACCENTS[accent][theme]}</span>
      </p>
    </fieldset>
  );
});

function Segmented<T extends string | number>({
  legend,
  options,
  value,
  onPick,
  disabled,
  showLegend,
}: CtlProps & {
  legend: string;
  options: { value: T; label: string; glyph?: ReactNode }[];
  value: T;
  onPick: (v: T) => void;
}) {
  const name = useId();
  return (
    <fieldset className="fig1-field" disabled={disabled}>
      <legend className={showLegend ? 'fig1-legend' : 'fig1-sr'}>{legend}</legend>
      <div className="fig1-seg">
        {options.map((o) => (
          <label key={String(o.value)} className="fig1-seg__opt nodrag nopan">
            <input
              type="radio"
              className="fig1-sr"
              name={name}
              value={String(o.value)}
              checked={value === o.value}
              onChange={() => onPick(o.value)}
            />
            <span className="fig1-seg__face">
              {o.glyph}
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export const ThemeControl = memo(function ThemeControl(props: CtlProps) {
  const theme = useSettings((s) => s.theme);
  return (
    <Segmented
      {...props}
      legend="Theme"
      value={theme}
      onPick={(t) => applySetting({ theme: t })}
      options={[
        { value: 'paper', label: 'Paper' },
        { value: 'blueprint', label: 'Blueprint' },
      ]}
    />
  );
});

export const DensityControl = memo(function DensityControl(props: CtlProps) {
  const density = useSettings((s) => s.density);
  return (
    <Segmented
      {...props}
      legend="Density"
      value={density}
      onPick={(d) => applySetting({ density: d })}
      options={([0, 1, 2] as const).map((d) => ({
        value: d,
        label: DENSITY_LABEL[d],
        glyph: <span className={`fig1-bars fig1-bars--${d}`} aria-hidden="true" />,
      }))}
    />
  );
});

export const MotionControl = memo(function MotionControl({ disabled, showLegend }: CtlProps) {
  const motion = useSettings((s) => s.motion);
  const id = useId();
  return (
    <div className="fig1-field">
      <span id={id} className={showLegend ? 'fig1-legend' : 'fig1-sr'}>
        Motion
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={motion}
        aria-labelledby={id}
        disabled={disabled}
        className="fig1-switch nodrag nopan"
        onClick={() => applySetting({ motion: !motion })}
      >
        <span className="fig1-switch__track" aria-hidden="true">
          <span className="fig1-switch__knob" />
        </span>
        <span className="fig1-switch__text" aria-hidden="true">
          {motion ? 'ON' : 'OFF'}
        </span>
      </button>
    </div>
  );
});

export const CONTROL_COMPONENT: Record<ControlKind, ComponentType<CtlProps>> = {
  accent: AccentControl,
  theme: ThemeControl,
  motion: MotionControl,
  density: DensityControl,
};

/** Copies `--accent: ...; data-theme=...` with a short "Copied" confirmation. */
export function CopyButton() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    const ok = await copyText(cssVarsText(useSettings.getState()));
    useFig1.getState().announce(ok ? 'CSS variables copied' : 'Copy failed');
    if (!ok) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button type="button" className={`fig1-btn nodrag nopan${copied ? ' is-done' : ''}`} onClick={copy} aria-label="Copy CSS variables">
      {copied ? 'Copied' : 'Copy CSS vars'}
    </button>
  );
}
