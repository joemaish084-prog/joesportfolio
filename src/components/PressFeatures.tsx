import { ExternalLink, Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "./ScrollReveal";
import { SectionLabel } from "@/components/SectionLabel";
import pressDailyNation from "@/assets/press-daily-nation.webp";

const publications = [
  {
    name: "Daily Nation",
    articleTitle: "The business of water: Firm rides on growing demand in Kenya",
    credibilityLine: "Quoted as Marketing Lead, iClear",
    url: "https://nation.africa/kenya/business/enterprise/business-riding-on-demand-for-affordable-safe-water-5489720",
    thumbnail: pressDailyNation,
  },
];

export function PressFeatures() {
  return (
    <section className="scroll-mt-20 lg:scroll-mt-24 dot-grid section-divider py-20 sm:py-32" aria-label="Press and media features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16 space-y-4">
            <SectionLabel>AS FEATURED IN</SectionLabel>
            <h2 className="text-title-1 sm:text-large-title font-display">
              National Press Coverage
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-xl mx-auto">
          {publications.map((pub) => (
            <ScrollReveal key={pub.name} direction="up">
              <a
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
                aria-label={`Read article in ${pub.name}: ${pub.articleTitle}`}
              >
                <Card className="glass hover:border-primary/40 hover-lift overflow-hidden">
                  <div className="p-5 flex gap-4 items-start">
                    <img
                      src={pub.thumbnail}
                      alt={`${pub.name} press feature — Joseph Maina`}
                      width={96}
                      height={96}
                      loading="lazy"
                      className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover shrink-0"
                    />
                    <CardContent className="p-0 flex-1 space-y-2">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                        <Newspaper className="h-3.5 w-3.5" aria-hidden="true" />
                        {pub.name}
                      </span>
                      <h3 className="font-display font-semibold text-foreground leading-snug">
                        {pub.articleTitle}
                      </h3>
                      <p className="text-sm text-muted-foreground">{pub.credibilityLine}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                        Read the article
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </CardContent>
                  </div>
                </Card>
              </a>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default PressFeatures;
