import { Check, Receipt } from "lucide-react";
import { retainerPackages, packageFeeNote, priceLabel } from "@/data/services";
import { localizePrice, pick, useMarket } from "@/lib/market";
import { CtaLink } from "./CtaLink";
import { pricingContent } from "./servicesContent";

/**
 * Compact monthly retainers for /agency/services. Full comparison stays on /agency/pricing.
 * Cards stack on phones and sit in three columns from md up. Prices and features come from src/data/services.ts.
 * The "how I work" line under the cards replaces the old "Simple starting points" block, which repeated these prices.
 */
export function PackagesSummary() {
  const market = useMarket();
  return (
    <section aria-labelledby="packages-title" className="mt-20 sm:mt-24">
      <div className="max-w-2xl">
        <h2 id="packages-title" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Monthly retainers</h2>
        <p className="mt-3 flex items-start gap-2.5 text-sm text-muted-foreground sm:text-base">
          <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>{packageFeeNote}</span>
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3 md:items-stretch md:gap-4">
        {retainerPackages.map((p) => {
          const price = localizePrice(priceLabel(p.price), market);
          // Split "From KES 40,000/month" so the amount leads and the qualifier sits above it.
          const [, from, amount, per] = price.match(/^(from\s+)?(.*?)(\/\w+)?$/i) ?? ["", "", price, ""];
          return (
            <article
              key={p.name}
              className={`relative flex flex-col rounded-2xl border p-6 sm:p-7 ${p.highlight ? "border-primary/50 bg-primary/[0.04] shadow-elegant" : "border-border/70 bg-card/40"}`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wide text-primary-foreground">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-lg font-bold tracking-wide">{p.name}</h3>
              <p className="text-sm text-muted-foreground">{p.label}</p>

              <p className="mt-5 font-display leading-tight">
                {from && <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">From</span>}
                <span className="text-3xl font-bold tabular-nums text-gradient">{amount}</span>
                {per && <span className="ml-0.5 text-base text-muted-foreground">{per}</span>}
              </p>

              <p className="mt-3 rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">{pick(market, p.note, p.intlNote)}</p>

              <ul className="mt-5 mb-6 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <CtaLink
                to={`/agency/contact?service=${p.name.toLowerCase()}#brief`}
                className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${p.highlight ? "bg-primary text-primary-foreground hover:brightness-110" : "border border-border hover:border-primary/50 hover:text-primary"}`}
              >
                Get a custom quote
              </CtaLink>
            </article>
          );
        })}
      </div>

      <ul aria-label="How I work" className="mt-8 grid gap-x-6 gap-y-3 border-t border-border/60 pt-6 text-sm text-foreground/90 sm:grid-cols-2 lg:grid-cols-4">
        {pricingContent.assurances.map((item) => (
          <li key={item} className="flex items-start gap-2 leading-snug">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {item}
          </li>
        ))}
      </ul>

      <CtaLink to="/agency/pricing" className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        Compare all three packages
      </CtaLink>
    </section>
  );
}
