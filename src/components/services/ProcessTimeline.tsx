import { motion } from "framer-motion";
import { processHeading, processSteps } from "./servicesContent";

/** Five steps: a horizontal timeline from lg up, a vertical one below. */
export function ProcessTimeline() {
  return (
    <section aria-labelledby="process-title" className="mt-20 sm:mt-24">
      <h2 id="process-title" className="max-w-2xl font-display text-2xl font-bold tracking-tight sm:text-3xl">{processHeading}</h2>

      <ol className="mt-10 grid gap-0 lg:grid-cols-5 lg:gap-6">
        {processSteps.map((step, i) => {
          const Icon = step.icon;
          const last = i === processSteps.length - 1;
          return (
            <motion.li
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className="relative pb-8 pl-16 last:pb-0 lg:pb-0 lg:pl-0 lg:pt-16"
            >
              {/* Connector: vertical on small screens, horizontal on lg */}
              {!last && <span aria-hidden className="absolute left-[1.3rem] top-12 h-[calc(100%-2.5rem)] w-px bg-border lg:left-12 lg:right-[-1.5rem] lg:top-[1.3rem] lg:h-px lg:w-auto" />}
              <span className="absolute left-0 top-0 flex h-11 w-11 items-center justify-center rounded-full border border-primary/40 bg-background text-primary lg:left-0">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="font-mono text-xs font-semibold tracking-[0.18em] text-primary">{step.n}</p>
              <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
