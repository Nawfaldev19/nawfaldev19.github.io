import { useEffect, useState } from 'react';

const fmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Karachi',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const now = () => fmt.format(new Date());

/** "Lahore · 14:05 PKT". Minute precision, updated every 30 s, paused while the tab is hidden. */
export function Clock({ className = '' }: { className?: string }) {
  const [time, setTime] = useState(now);

  useEffect(() => {
    let id: number | undefined;
    const stop = () => {
      if (id !== undefined) window.clearInterval(id);
      id = undefined;
    };
    const start = () => {
      stop();
      setTime(now());
      id = window.setInterval(() => setTime(now()), 30_000);
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <span className={`clock ${className}`} aria-live="off">
      <span className="visually-hidden">Local time in </span>
      Lahore<span aria-hidden="true"> · </span>
      <time className="clock__time">{time}</time> PKT
    </span>
  );
}
