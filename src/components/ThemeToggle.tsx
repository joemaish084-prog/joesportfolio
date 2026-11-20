import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Button type="button" aria-label="Toggle theme" variant="ghost" size="icon" className="h-10 w-10 shrink-0" disabled />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      type="button"
      aria-label="Toggle theme"
      title={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="h-10 w-10 shrink-0 hover:bg-primary/10 transition-colors"
    >
      {resolvedTheme === "dark" ? (
        <Sun className="h-5 w-5 text-primary" aria-hidden />
      ) : (
        <Moon className="h-5 w-5 text-primary" aria-hidden />
      )}
    </Button>
  );
}
