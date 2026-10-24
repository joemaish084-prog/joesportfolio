import { ArrowRight, BadgeCheck, Info } from "lucide-react";
import { CtaLink } from "./CtaLink";
import type { ProofContent } from "./servicesContent";

/**
 * Honest proof. A verified result shows its figures and period; anything
 * unverified shows only the plain fallback line, never a made-up number.
 */
export function ProofPanel({ proof }: { proof: ProofContent }) {
  const verified = proof.status === "verified" && proof.figures?.length;
  return (
    <aside aria-label={proof.heading} className="rounded-2xl border border-border/70 bg-muted/40 p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {verified ? <BadgeCheck className="h-4 w-4 text-[#22C55E]" aria-hidden /> : <Info className="h-4 w-4 text-primary" aria-hidden />}
        {proof.heading}
      </p>

      {verified ? (
        <>
          <dl className="mt-4 grid grid-cols-3 gap-3">
            {proof.figures!.map((f) => (
              <div key={f.label}>
                <dd className="font-display text-xl font-bold leading-none tracking-tight text-foreground sm:text-2xl">{f.value}</dd>
                <dt className="mt-1.5 text-xs text-muted-foreground">{f.label}</dt>
              </div>
            ))}
          </dl>
          {proof.period && <p className="mt-4 text-sm text-foreground/80">{proof.period}</p>}
          {proof.note && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{proof.note}</p>}
        </>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-foreground/80">{proof.note}</p>
      )}

      <CtaLink to={proof.link.to} className="group mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        {proof.link.label}
        <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
      </CtaLink>
    </aside>
  );
}
