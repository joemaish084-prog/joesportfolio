import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler";
import { cn } from "@/lib/utils";

const buttonClass = cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-10 w-10 shrink-0 hover:bg-primary/10 transition-colors");

/** Light/dark switch. The new theme sweeps across the page in a circle from the button. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <button type="button" aria-label="Toggle theme" className={buttonClass} disabled />;
  }

  const theme = resolvedTheme === "light" ? "light" : "dark";
  return (
    <AnimatedThemeToggler
      theme={theme}
      onThemeChange={setTheme}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={buttonClass}
      iconClassName="h-5 w-5 text-primary"
    />
  );
}
