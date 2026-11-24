import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { designs } from "@/data/designs";

/* ------------------------------------------------------------------ */
/* Creative showcase: browsable previews of shipped work.             */
/* ------------------------------------------------------------------ */

const ROW_A = [
  ["Fuel Your Grind", "fuel"], ["Download PowWater Today", "powwater-app"],
  ["TECNO x iClear Collaboration", "tecno-1"], ["School Admission 2026", "school-admission"],
  ["Free Filter Campaign", "free-filter-campaign"], ["Weekend Basket Bonanza", "weekend"],
  ["iClear Engineered for Home", "iclear-engineered"], ["MKUSH Music Album Cover", "mkush"],
];
const ROW_B = [
  ["TECNO Product Campaign", "tecno-2"], ["We Handle The Heavy Lifting", "heavy-lifting"],
  ["Fresh Living", "iclear-fresh-living"], ["Innovative Learning", "school-innovative"],
  ["Standard Water Purifier", "standard"], ["iClear Nakuru Location", "iclear-nakuru"],
  ["TECNO Mobile Promotion", "tecno-3"], ["iClear Brand Campaign", "water-journey"],
];

const previews = import.meta.glob<string>("/src/assets/showcase/*.webp", { eager: true, import: "default" });

function ShowcaseTile({ title, image, description, preview }: { title: string; image: string; description: string; preview: string }) {
  const small = previews[`/src/assets/showcase/${preview}-240.webp`];
  const large = previews[`/src/assets/showcase/${preview}-480.webp`];
  return (
    <figure className="h-full overflow-hidden rounded-2xl border border-border/60 bg-card">
      <img
        src={small ?? image}
        srcSet={small && large ? `${small} 240w, ${large} 480w` : undefined}
        sizes="(min-width: 640px) 224px, 176px"
        alt=""
        width={240}
        height={300}
        loading="lazy"
        decoding="async"
        {...{ fetchpriority: "low" }}
        className="aspect-[4/5] w-full object-cover"
      />
      <figcaption className="p-3">
        <p className="text-sm font-semibold leading-tight">{title}</p>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{description}</p>
      </figcaption>
    </figure>
  );
}

export function CreativeShowcase() {
  return (
    <section id="agency-creative" className="container mx-auto max-w-6xl px-4 py-14 sm:py-20">
      <div
        className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-4"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Creative that ships</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-display font-bold">
            Ads and content I've made for <span className="text-gradient">real brands</span>
          </h2>
        </div>
        <Link to="/work/design" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary hover:underline">
          See the full portfolio <ArrowRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
      <div role="region" aria-label="Campaign creative gallery" tabIndex={0}
        className="overflow-x-auto overscroll-x-contain rounded-lg pb-3">
        <ul className="grid w-max grid-flow-col grid-rows-2 gap-3">
          {[...ROW_A, ...ROW_B].map(([title, preview]) => {
            const design = designs.find((item) => item.title === title);
            return design && <li key={title} className="w-44 sm:w-56"><ShowcaseTile {...design} preview={preview} /></li>;
          })}
        </ul>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Shared image header with a hover zoom, used on service + case cards. */
/* ------------------------------------------------------------------ */
