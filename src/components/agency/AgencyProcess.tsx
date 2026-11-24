import { CalendarDays, ClipboardList, PenLine, Rocket, BarChart3 } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";
import { onboardingSteps } from "@/data/services";

const stepIcons = [CalendarDays, ClipboardList, PenLine, Rocket, BarChart3];
const steps = onboardingSteps.map((s, i) => ({ ...s, icon: stepIcons[i] }));

export function AgencyProcess({ id = "how" }: { id?: string }) {
  return (
    <section id={id} className="container mx-auto px-4 py-20 scroll-mt-20">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center space-y-3">
          <SectionLabel>HOW IT WORKS</SectionLabel>
          <h2 className="text-3xl md:text-4xl font-display font-bold">Working Together Is Simple</h2>
          <p className="text-muted-foreground">From the first call to monthly reporting, in five steps.</p>
        </div>
        <div className="relative">
          <div aria-hidden className="absolute bottom-6 left-6 top-6 w-px bg-gradient-to-b from-primary to-orange-light lg:bottom-auto lg:left-[10%] lg:right-[10%] lg:h-px lg:w-auto lg:bg-gradient-to-r" />
        <ol className="relative grid gap-8 lg:grid-cols-5 lg:gap-6">
          {steps.map((s, i) => (
            <li
              key={s.title}
              className="relative flex gap-5 lg:flex-col lg:items-center lg:text-center lg:gap-0"
            >
              <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-primary/30 shadow-[0_0_0_6px_hsl(var(--background))] lg:mb-5">
                <s.icon className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <div className="pt-1 lg:pt-0">
                <p className="mono-accent text-xs text-muted-foreground">Step {i + 1}</p>
                <h3 className="mt-1 font-display text-lg font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground lg:mx-auto lg:max-w-[14rem]">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
        </div>
      </div>
    </section>
  );
}
