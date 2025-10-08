import { useTheme } from '../hooks/useTheme.jsx';

const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M12 4V2M12 22v-2M4 12H2m20 0h-2M5.64 5.64 4.22 4.22m15.56 15.56-1.42-1.42M18.36 5.64l1.42-1.42M5.64 18.36 4.22 19.78" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const NavBar = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <span className="navbar__logo">S</span>
        <span className="navbar__title">SmartSlot</span>
      </div>
      <div className="navbar__actions">
        <a className="navbar__link" href="#docs" onClick={(e) => e.preventDefault()}>
          Docs
        </a>
        <a className="navbar__link" href="#scenarios" onClick={(e) => e.preventDefault()}>
          Scenarios
        </a>
        <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          <span className="theme-toggle__icon">{isDark ? <SunIcon /> : <MoonIcon />}</span>
          <span className="theme-toggle__text">{isDark ? 'Light' : 'Dark'}</span>
        </button>
      </div>
    </nav>
  );
};

export default NavBar;
