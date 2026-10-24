import { ArrowRight, Check, Receipt } from "lucide-react";
import { CtaLink } from "./CtaLink";
import { pricingContent } from "./servicesContent";

/** Pricing stays visible but secondary: starting points and the fee-versus-ad-spend distinction. */
export function PricingNotes() {
  return (
    <section aria-labelledby="pricing-notes-title" className="mt-20 sm:mt-24">
      <div className="grid gap-8 rounded-3xl border border-border/70 bg-card/40 p-6 sm:p-10 lg:grid-cols-[1.2fr_1fr] lg:gap-12">
        <div>
          <h2 id="pricing-notes-title" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{pricingContent.heading}</h2>
          <p className="mt-4 flex items-start gap-2.5 rounded-xl border border-primary/30 bg-primary/10 p-4 text-sm font-medium leading-snug text-foreground">
            <Receipt className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {pricingContent.feeStatement}
          </p>
          <dl className="mt-5 divide-y divide-border/60 border-y border-border/60">
            {pricingContent.rows.map((row) => (
              <div key={row.label} className="flex flex-col gap-1 py-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
                <dt className="text-sm text-muted-foreground sm:text-base">{row.label}</dt>
                <dd className="font-display text-base font-semibold tabular-nums text-foreground sm:text-lg">{row.price}</dd>
              </div>
            ))}
          </dl>
          <CtaLink to={pricingContent.link.to} className="group mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {pricingContent.link.label}
            <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
          </CtaLink>
        </div>

        <ul aria-label="How I work" className="space-y-4 self-center">
          {pricingContent.assurances.map((item) => (
            <li key={item} className="flex items-start gap-3 text-base leading-snug text-foreground/90">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
                <Check className="h-3.5 w-3.5 text-primary" aria-hidden />
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
