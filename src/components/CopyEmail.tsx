import { useEffect, useRef, useState } from 'react';
import { emailAddress } from '../content/site';

type State = 'idle' | 'copied' | 'failed';

/** Copies the address (built in JS) and confirms through a polite live region. Falls back to a mailto link. */
export function CopyEmail({ variant = 'primary' }: { variant?: 'primary' | 'plain' }) {
  const [state, setState] = useState<State>('idle');
  const timer = useRef<number | undefined>(undefined);
  const address = emailAddress();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(address);
      setState('copied');
      timer.current = window.setTimeout(() => setState('idle'), 3000);
    } catch {
      setState('failed');
    }
  }

  return (
    <span className="copy-email">
      <button type="button" className={`btn btn--${variant} copy-email__btn`} onClick={copy}>
        <span aria-hidden="true" className="btn__glyph">
          {state === 'copied' ? '✓' : '@'}
        </span>
        {state === 'copied' ? 'Copied' : 'Copy email'}
      </button>
      <span className="copy-email__note" role="status" aria-live="polite">
        {state === 'copied' && <>Copied {address}</>}
        {state === 'failed' && (
          <>
            Clipboard blocked. Write to <a href={`mailto:${address}`}>{address}</a>
          </>
        )}
      </span>
    </span>
  );
}
