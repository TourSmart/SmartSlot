import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

const getSystemPref = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

const readInitialTheme = () => {
  try {
    const stored = localStorage.getItem('smartslot_theme');
    return stored || getSystemPref();
  } catch {
    return getSystemPref();
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('smartslot_theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      const stored = localStorage.getItem('smartslot_theme');
      if (!stored) setTheme(e.matches ? 'dark' : 'light');
    };
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  const value = useMemo(
    () => ({ theme, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);

export default ThemeProvider;
