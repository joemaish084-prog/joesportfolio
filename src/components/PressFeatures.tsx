import { ArrowUpRight, Quote } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";
import { SectionLabel } from "@/components/SectionLabel";
import { ShineBorder } from "@/components/ui/shine-border";
import pressDailyNation from "@/assets/press-daily-nation.webp";

const publications = [
  {
    name: "Daily Nation",
    section: "Business",
    date: "9 June 2026",
    articleTitle: "The business of water: Firm rides on growing demand in Kenya",
    credibilityLine: "Quoted as Marketing Lead, iClear",
    url: "https://nation.africa/kenya/business/enterprise/business-riding-on-demand-for-affordable-safe-water-5489720",
    thumbnail: pressDailyNation,
  },
];

export function PressFeatures() {
  return (
    <section
      className="relative overflow-hidden scroll-mt-20 lg:scroll-mt-24 dot-grid section-divider py-20 sm:py-32"
      aria-labelledby="press-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[min(960px,90vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <SectionLabel>AS FEATURED IN</SectionLabel>
            <h2 id="press-heading" className="text-title-1 sm:text-large-title lg:text-6xl lg:leading-[1.05] font-display">
              National <span className="text-gradient">Press Coverage</span>
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-6xl mx-auto space-y-10">
          {publications.map((pub) => (
            <ScrollReveal key={pub.name} direction="up">
              <a
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-3xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                aria-label={`Read article in ${pub.name}: ${pub.articleTitle}`}
              >
                <article className="relative overflow-hidden glass-thick rounded-3xl shadow-elegant grid lg:grid-cols-12 transition-transform duration-500 group-hover:-translate-y-1">
                  {/* Photo: the image is oversized and top-anchored so the headline baked into the screenshot is cropped out */}
                  <div className="relative overflow-hidden aspect-[4/3] sm:aspect-[16/9] lg:aspect-auto lg:col-span-7 lg:min-h-[540px]">
                    <img
                      src={pub.thumbnail}
                      alt={`Joseph Maina pictured in the ${pub.name} feature`}
                      width={1898}
                      height={907}
                      loading="lazy"
                      className="absolute inset-x-0 top-0 h-[160%] w-full object-cover object-[15%_0%] origin-top transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                      <p className="mono-accent text-[11px] sm:text-xs uppercase tracking-[0.2em] text-white/70">
                        Featured in
                      </p>
                      <p className="font-serif text-white leading-none text-5xl sm:text-6xl lg:text-7xl mt-2">
                        {pub.name}
                      </p>
                    </div>
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-center p-7 sm:p-10 lg:p-12">
                    <p className="mono-accent text-xs uppercase tracking-[0.2em] text-primary">
                      {pub.section} · {pub.date}
                    </p>
                    <h3 className="font-serif text-foreground text-[2rem] leading-[1.1] sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08] mt-5">
                      {pub.articleTitle}
                    </h3>

                    <div className="flex items-center gap-3 mt-8 pt-8 border-t border-border">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Quote className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <p className="text-body sm:text-lg font-medium text-foreground">{pub.credibilityLine}</p>
                    </div>

                    <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors group-hover:bg-primary/90">
                      Read the article
                      <ArrowUpRight
                        className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </div>

                  <ShineBorder className="z-10" shineColor="hsl(var(--primary))" borderWidth={1} duration={14} />
                </article>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PressFeatures;
