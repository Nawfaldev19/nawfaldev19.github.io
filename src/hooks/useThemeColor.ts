import { useEffect } from 'react';
import { useSettings } from '../store/settings';

/** Keeps <meta name="theme-color"> in step with the theme (the head script sets it on first paint). */
export function useThemeColor() {
  const theme = useSettings((s) => s.theme);
  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'blueprint' ? '#0f2233' : '#f4efe6');
  }, [theme]);
}
