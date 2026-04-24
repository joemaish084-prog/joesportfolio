import { useState, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CollapsibleSectionProps {
  title: ReactNode;
  subtitle?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  /** Aligns header content (title block) — defaults to center */
  align?: "center" | "left";
  /** Optional id for the toggle button (a11y) */
  id?: string;
  className?: string;
}

export function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = true,
  children,
  align = "center",
  id,
  className,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = id ? `${id}-panel` : undefined;

  return (
    <div className={className}>
      <div
        className={cn(
          "mb-8 flex flex-col gap-2",
          align === "center" ? "items-center text-center" : "items-start text-left"
        )}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className={cn(
            "group inline-flex items-center gap-3 rounded-lg px-2 py-1 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
            align === "center" ? "justify-center" : "justify-start"
          )}
        >
          <span className="font-display text-2xl sm:text-3xl font-bold">{title}</span>
          <ChevronDown
            className={cn(
              "h-6 w-6 text-primary transition-transform duration-400",
              open ? "rotate-0" : "-rotate-180"
            )}
            style={{ transitionDuration: "400ms" }}
            aria-hidden="true"
          />
        </button>
        {subtitle && (
          <p className="text-muted-foreground text-sm sm:text-base">{subtitle}</p>
        )}
      </div>

      <div
        id={panelId}
        className={cn(
          "grid transition-all ease-in-out",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        )}
        style={{ transitionDuration: "400ms" }}
      >
        <div className="overflow-hidden">
          {children}
          <div className="mt-6 flex justify-center sm:hidden">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-primary hover:underline"
            >
              Show Less
            </button>
          </div>
        </div>
      </div>

      {!open && (
        <div className="mt-2 flex justify-center sm:hidden">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-sm font-medium text-primary hover:underline"
          >
            Show More
          </button>
        </div>
      )}
    </div>
  );
}
