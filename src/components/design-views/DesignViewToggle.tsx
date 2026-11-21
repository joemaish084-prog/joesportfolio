import { cn } from "@/lib/utils";
import { DESIGN_VIEWS, type DesignView } from "./views";

interface DesignViewToggleProps {
  value: DesignView;
  onChange: (view: DesignView) => void;
  className?: string;
}

export function DesignViewToggle({ value, onChange, className }: DesignViewToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose how to view the designs"
      className={cn("inline-flex shrink-0 rounded-full border border-border bg-card/70 p-1", className)}
    >
      {DESIGN_VIEWS.map(({ id, label, icon: Icon }) => {
        const active = id === value;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => onChange(id)}
            className={cn(
              "inline-flex min-h-9 min-w-9 items-center justify-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
