import { useCallback, useEffect, useState } from "react";

export type PortalTheme = "light" | "dark";

const STORAGE_KEY = "portal:theme";

function readTheme(): PortalTheme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark") return value;
  } catch {
    // Storage blocked: use the default.
  }
  return "dark";
}

/**
 * The portal keeps its own light/dark setting (dark by default, like the
 * site). While it's mounted, `portal-active` on <html> switches the design
 * tokens, so portalled dialogs and menus pick them up too; on unmount
 * everything is put back as it was.
 */
export function usePortalTheme() {
  const [theme, setThemeState] = useState<PortalTheme>(readTheme);

  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    const previousScheme = root.style.colorScheme;
    root.classList.add("portal-active");
    return () => {
      root.classList.remove("portal-active", "portal-dark");
      root.classList.toggle("dark", hadDark);
      root.style.colorScheme = previousScheme;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const dark = theme === "dark";
    root.classList.toggle("portal-dark", dark);
    // Tremor and the shared shadcn components style dark mode with `dark:`.
    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";
  }, [theme]);

  const setTheme = useCallback((next: PortalTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not persisted; still applies for this visit.
    }
  }, []);

  return { theme, setTheme };
}
