import { motion } from "framer-motion";
import { Newspaper, ExternalLink } from "lucide-react";

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
          className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10"
        >
          <div className="flex items-center gap-2 text-muted-foreground shrink-0">
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
                className="group flex items-center gap-2 px-5 py-2.5 rounded-full border border-border bg-card/50 hover:border-primary/40 hover:bg-card transition-all duration-300"
                aria-label={`Read article in ${pub.name}: ${pub.articleTitle}`}
              >
                <span className="text-base sm:text-lg font-display font-bold tracking-tight text-foreground/90 group-hover:text-foreground transition-colors">
                  {pub.name}
                </span>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
              </motion.a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default PressFeatures;
