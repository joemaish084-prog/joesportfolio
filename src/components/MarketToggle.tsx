import { setMarket, useMarket, type Market } from "@/lib/market";

const OPTIONS: { value: Market; label: string; aria: string }[] = [
  { value: "KE", label: "KES", aria: "Show prices in Kenyan shillings" },
  { value: "INTL", label: "USD", aria: "Show international prices in US dollars" },
];

/** Segmented KES / USD switch. International visitors also see a short billing note. */
export function MarketToggle({ className = "" }: { className?: string }) {
  const market = useMarket();
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div role="group" aria-label="Pricing currency" className="inline-flex rounded-full border border-border bg-card/60 p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            aria-label={o.aria}
            aria-pressed={market === o.value}
            onClick={() => setMarket(o.value)}
            className={`min-w-[4.5rem] rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              market === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {market === "INTL" && (
        <p className="max-w-md text-center text-xs text-muted-foreground">
          International prices in USD, billed by invoice. Ad spend is paid separately, directly to Meta or Google.
        </p>
      )}
    </div>
  );
}
