import { NAV } from '../content/site';
import { Clock } from './Clock';
import { SettingsTray } from './SettingsTray';

export function Header() {
  return (
    <header className="site-header">
      <div className="site-header__inner page">
        <a href="#top" className="mark">
          <span className="mark__glyph" aria-hidden="true">
            NI
          </span>
          <span className="mark__name">Nawfal Imran</span>
        </a>
        <nav className="site-nav" aria-label="Sections">
          <ul>
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href}>{n.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="site-header__tools">
          <Clock className="mono-label" />
          <SettingsTray />
        </div>
      </div>
    </header>
  );
}
