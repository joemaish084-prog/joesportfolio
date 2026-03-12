import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Progress } from "@/components/ui/progress";

/* ── Stats ── */
const stats = [
  { value: 20, suffix: "+", label: "Campaigns Managed" },
  { value: 50, suffix: "+", label: "Keywords Ranked" },
  { value: 3, suffix: "+", label: "Years Experience" },
  { value: 15, suffix: "+", label: "Clients Served" },
];

/* ── Skills ── */
const skills = [
  { name: "SEO Optimization", pct: 90 },
  { name: "Content Strategy", pct: 85 },
  { name: "Social Media Marketing", pct: 88 },
  { name: "Google Analytics", pct: 85 },
  { name: "Email Marketing", pct: 80 },
  { name: "Campaign Management", pct: 87 },
];

/* ── Tools ── */
const tools = [
  "Google Analytics",
  "Google Search Console",
  "SEMrush",
  "Hootsuite",
  "Canva",
  "Mailchimp",
  "Meta Ads Manager",
  "WordPress",
];

/* ── Animated counter hook ── */
function useCounter(end: number, inView: boolean, duration = 2000) {
  const [count, setCount] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || started.current) return;
    started.current = true;
    const step = Math.ceil(duration / end);
    let current = 0;
    const id = setInterval(() => {
      current += 1;
      setCount(current);
      if (current >= end) clearInterval(id);
    }, step);
    return () => clearInterval(id);
  }, [inView, end, duration]);

  return count;
}

function StatCard({ value, suffix, label, inView }: { value: number; suffix: string; label: string; inView: boolean }) {
  const count = useCounter(value, inView);
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center transition-all duration-300 hover:-translate-y-1">
      <p className="text-4xl sm:text-5xl font-display font-bold text-gradient">
        {count}{suffix}
      </p>
      <p className="mt-2 text-sm font-medium text-muted-foreground">{label}</p>
    </div>
  );
}

export function SkillsStats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      id="skills-stats"
      ref={ref}
      className="py-20 sm:py-32"
      aria-label="Skills and statistics for Joseph Maina, Digital Marketing Specialist Nairobi"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
            Skills & <span className="text-gradient">Stats</span>
          </h2>
          <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto">
            Top Digital Marketing Specialist in Nairobi, Kenya — Available for Full-Time Opportunities
          </p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Joseph Maina is a results-driven Digital Marketing Specialist based in Nairobi, Kenya
            with hands-on experience in SEO, content strategy, social media marketing and
            data-driven digital campaigns.
          </p>
        </div>

        {/* Stats Counter */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-16">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <StatCard {...s} inView={inView} />
            </motion.div>
          ))}
        </div>

        {/* Skills Progress Bars */}
        <h3 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">
          Core <span className="text-gradient">Skills</span>
        </h3>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6 mb-16 max-w-4xl mx-auto">
          {skills.map((skill, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
              className="space-y-2"
            >
              <div className="flex justify-between text-sm font-medium">
                <span className="text-foreground">{skill.name}</span>
                <span className="text-primary">{inView ? skill.pct : 0}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: 0 }}
                  animate={inView ? { width: `${skill.pct}%` } : { width: 0 }}
                  transition={{ duration: 1.2, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tools Grid */}
        <h3 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">
          Tools I <span className="text-gradient">Use</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {tools.map((tool, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.3, delay: 0.6 + i * 0.05 }}
              className="rounded-xl border border-border bg-card p-4 text-center text-sm font-medium text-foreground hover:border-primary/30 transition-all duration-300 hover:-translate-y-1"
            >
              {tool}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
