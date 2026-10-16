import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PrivacyContext, readStoredPrivacy, storePrivacy, useKes, usePrivacy } from "../lib/privacy";

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [hidden, setHiddenState] = useState(readStoredPrivacy);
  const setHidden = useCallback((next: boolean) => {
    setHiddenState(next);
    storePrivacy(next);
  }, []);
  const toggle = useCallback(() => setHidden(!hidden), [hidden, setHidden]);

  // Ctrl/⌘ + Shift + H flips it from anywhere in the hub.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "h") {
        e.preventDefault();
        toggle();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [toggle]);

  const value = useMemo(() => ({ hidden, setHidden, toggle }), [hidden, setHidden, toggle]);
  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

/** Shows real amounts inside while the page is being printed (e.g. an invoice), whatever the switch says. */
export function RevealWhilePrinting({ children }: { children: ReactNode }) {
  const outer = usePrivacy();
  const [printing, setPrinting] = useState(false);

  useEffect(() => {
    // flushSync so the real numbers are on the page before the print snapshot.
    const before = () => flushSync(() => setPrinting(true));
    const after = () => setPrinting(false);
    window.addEventListener("beforeprint", before);
    window.addEventListener("afterprint", after);
    return () => {
      window.removeEventListener("beforeprint", before);
      window.removeEventListener("afterprint", after);
    };
  }, []);

  const value = useMemo(() => ({ ...outer, hidden: outer.hidden && !printing }), [outer, printing]);
  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>;
}

/** A KES amount that masks itself when amounts are hidden. */
export function Money({ value, className }: { value: number | null | undefined; className?: string }) {
  const kes = useKes();
  return <span className={cn("hub-tabular whitespace-nowrap", className)}>{kes(value)}</span>;
}

/** Blurs a chart (or anything) while amounts are hidden. */
export function PrivateBlur({
  children,
  className,
  quiet,
}: {
  children: ReactNode;
  className?: string;
  /** Blur only, no "show" button (for small sparklines). */
  quiet?: boolean;
}) {
  const { hidden, setHidden } = usePrivacy();
  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden={hidden}
        className={cn("transition-[filter] duration-200", hidden && "pointer-events-none select-none blur-md")}
      >
        {children}
      </div>
      {hidden && !quiet && (
        <button
          type="button"
          onClick={() => setHidden(false)}
          className="absolute inset-0 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <EyeOff className="h-4 w-4" /> Amounts hidden · show
        </button>
      )}
    </div>
  );
}

/** Eye button for page headers. */
export function PrivacyToggle({ className }: { className?: string }) {
  const { hidden, toggle } = usePrivacy();
  const Icon = hidden ? EyeOff : Eye;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          className={cn("rounded-full", hidden && "bg-tint text-on-tint hover:bg-tint/80", className)}
          onClick={toggle}
          aria-pressed={hidden}
        >
          <Icon className="mr-1.5 h-4 w-4" />
          {hidden ? "Show amounts" : "Hide amounts"}
        </Button>
      </TooltipTrigger>
      <TooltipContent className="rounded-lg">Ctrl + Shift + H</TooltipContent>
    </Tooltip>
  );
}
