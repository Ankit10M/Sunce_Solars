import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
 
// Reads/writes to localStorage so theme persists across page refreshes.
// Apply <html data-theme="dark"> or <html data-theme="light"> to the root.
 
export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
 
  useEffect(() => {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [isDark]);
 
  return (
    <button
      onClick={() => setIsDark((prev) => !prev)}
      className="btn btn-ghost btn-circle"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark
        ? <Sun  className="w-5 h-5 text-yellow-400" />
        : <Moon className="w-5 h-5 text-slate-600"  />
      }
    </button>
  );
}