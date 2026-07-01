import { motion } from "framer-motion";
import { Newspaper, ExternalLink } from "lucide-react";
import dailyNationFeature from "@/assets/daily-nation-feature.png.asset.json";

const publications = [
  {
    name: "Daily Nation",
    articleTitle: "The business of water: Firm rides on growing demand in Kenya",
    url: "https://nation.africa/kenya/business/enterprise/business-riding-on-demand-for-affordable-safe-water-5489720",
  },
];

export function PressFeatures() {
  return (
    <section className="py-10 sm:py-14 border-y border-border/40 bg-muted/30" aria-label="Press and media features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Newspaper className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="text-sm font-semibold uppercase tracking-widest">
              As Featured In
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            {publications.map((pub) => (
              <motion.a
                key={pub.name}
                href={pub.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="group block max-w-3xl w-full rounded-xl border border-border bg-card/50 hover:border-primary/40 hover:bg-card transition-all duration-300 overflow-hidden"
                aria-label={`Read article in ${pub.name}: ${pub.articleTitle}`}
              >
                <div className="relative">
                  <img
                    src={dailyNationFeature.url}
                    alt={`${pub.name} article: ${pub.articleTitle}`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                    width={1200}
                    height={675}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex items-end justify-between gap-4">
                    <div>
                      <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider bg-primary text-white mb-2">
                        {pub.name}
                      </span>
                      <h3 className="text-white font-display font-bold text-base sm:text-lg leading-snug">
                        {pub.articleTitle}
                      </h3>
                    </div>
                    <ExternalLink className="h-5 w-5 text-white/80 group-hover:text-white shrink-0 transition-colors" aria-hidden="true" />
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PressFeatures;
