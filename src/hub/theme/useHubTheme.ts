import { useCallback, useEffect, useState } from "react";

export type HubTheme = "light" | "dark" | "system";

const STORAGE_KEY = "hub:theme";

function readTheme(): HubTheme {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === "light" || value === "dark" || value === "system") return value;
  } catch {
    // Storage blocked: fall back to the system setting.
  }
  return "system";
}

function prefersDark() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

/**
 * The hub keeps its own light/dark setting, independent of the public site's.
 * While the hub is mounted, `hub-active` on <html> switches the design tokens
 * (so portalled dialogs and menus pick them up too); on unmount everything is
 * put back exactly as it was.
 */
export function useHubTheme() {
  const [theme, setThemeState] = useState<HubTheme>(readTheme);
  const [systemDark, setSystemDark] = useState(prefersDark);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setSystemDark(media.matches);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  const isDark = theme === "dark" || (theme === "system" && systemDark);

  useEffect(() => {
    const root = document.documentElement;
    const previousColorScheme = root.style.colorScheme;
    // Shared components style dark mode with `dark:` variants keyed to the public
    // site's .dark class, so the hub drives that class while it's open.
    const hadDark = root.classList.contains("dark");
    root.classList.add("hub-active");
    return () => {
      root.classList.remove("hub-active", "hub-dark");
      root.classList.toggle("dark", hadDark);
      root.style.colorScheme = previousColorScheme;
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("hub-dark", isDark);
    root.classList.toggle("dark", isDark);
    root.style.colorScheme = isDark ? "dark" : "light";
  }, [isDark]);

  const setTheme = useCallback((next: HubTheme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Not persisted; still applies for this visit.
    }
  }, []);

  return { theme, isDark, setTheme };
}
