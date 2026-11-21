import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { ProofItem } from "@/data/services";
import { trackSpotlight } from "@/lib/spotlight";
import { ServiceImage } from "./ServiceImage";

/** One case study: image, client, goal, what was done, result. Empty fields are left out, never filled in. */
export function CaseStudyCard({ study }: { study: ProofItem }) {
  const clientName = study.client ?? "Client not named";
  const rows = [
    { label: "Goal", text: study.goal },
    study.whatWasDone ? { label: "What I did", text: study.whatWasDone } : null,
  ].filter((r): r is { label: string; text: string } => r !== null);

  return (
    <article onMouseMove={trackSpotlight} className="spotlight surface-card flex h-full flex-col overflow-hidden">
      {study.imageSlot && (
        <ServiceImage
          slot={study.imageSlot}
          sizes="(min-width: 1024px) 360px, (min-width: 768px) 33vw, 100vw"
          className="aspect-video w-full"
        />
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="mono-accent text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          {clientName}
          {study.period && <span className="text-muted-foreground"> · {study.period}</span>}
        </h3>

        <dl className="mt-4 space-y-3 text-sm leading-relaxed">
          {rows.map((row) => (
            <div key={row.label}>
              <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">{row.label}</dt>
              <dd className="mt-0.5">{row.text}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-5 border-t border-border/60 pt-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Result</p>
          <p className="mt-1 font-display text-lg font-semibold leading-snug md:max-lg:text-base">{study.result}</p>
        </div>

        <Link
          to={study.readMore}
          className="group mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-sm font-semibold text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Read the full write-up
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </article>
  );
}
