import { motion } from "framer-motion";
import { Award, BadgeCheck, Trophy, GraduationCap } from "lucide-react";

const certs = [
  { icon: BadgeCheck, title: "Google Ads Certified", issuer: "Google Skillshop", year: "2024" },
  { icon: Award, title: "Meta Blueprint", issuer: "Meta", year: "2024" },
  { icon: GraduationCap, title: "HubSpot Inbound Marketing", issuer: "HubSpot Academy", year: "2023" },
  { icon: Trophy, title: "Google Analytics (GA4)", issuer: "Google Skillshop", year: "2024" },
];

export function Certifications() {
  return (
    <section id="certifications" className="py-20 sm:py-28" aria-label="Certifications & Achievements">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
            Certifications & <span className="text-gradient">Achievements</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Continuously certified across the platforms that drive measurable growth.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {certs.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-5 text-center hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 mx-auto rounded-full bg-gradient-orange flex items-center justify-center mb-3 shadow-[var(--shadow-orange-glow)]">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold leading-tight">{c.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.issuer}</p>
                <p className="text-xs text-primary font-medium mt-0.5">{c.year}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Certifications;
