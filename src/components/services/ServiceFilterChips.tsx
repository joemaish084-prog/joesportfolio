import type { ServiceCategory } from "@/data/services";

type FilterKey = ServiceCategory | "all";

interface ServiceFilterChipsProps {
  categories: { key: FilterKey; label: string }[];
  value: FilterKey;
  onChange: (key: FilterKey) => void;
}

/**
 * Filter row for the services grid. Plain buttons with `aria-pressed`, so
 * Tab and Enter/Space work with no extra key handling. On phones the row
 * scrolls sideways instead of wrapping.
 */
export function ServiceFilterChips({ categories, value, onChange }: ServiceFilterChipsProps) {
  return (
    <div role="group" aria-label="Filter services" className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
      {categories.map((c) => {
        const active = c.key === value;
        return (
          <button
            key={c.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(c.key)}
            className={[
              "min-h-11 shrink-0 rounded-full border px-5 text-sm font-semibold transition-colors",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-transparent text-foreground/80 hover:border-primary/50 hover:text-foreground",
            ].join(" ")}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
