/* Dark mode: one theme for the whole app, controlled by a "dark" class on <html>.
   All colors come from the design tokens in index.css, so this module only has to
   flip the class and remember the choice (localStorage, falls back to the system
   preference). Safe to import anywhere; applies immediately on load. */

import { useEffect, useState } from "react";

const KEY = "cegnal-theme";

export function getTheme() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function apply(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = theme === "dark" ? "#0c1116" : "#101820";
}

export function setTheme(theme) {
  localStorage.setItem(KEY, theme);
  apply(theme);
}

export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

// Restore the saved preference (or the OS preference) on first load.
(function init() {
  if (typeof window === "undefined") return;
  const saved = localStorage.getItem(KEY);
  if (saved === "dark" || saved === "light") {
    apply(saved);
  } else if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
    apply("dark");
  }
})();

export { apply as applyTheme };

/* React hook: re-renders when the dark class on <html> changes,
   so components that don't use token classes can adapt to the theme. */
export function useTheme() {
  const [theme, setThemeState] = useState(getTheme());
  useEffect(() => {
    const observer = new MutationObserver(() => setThemeState(getTheme()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return theme;
}
