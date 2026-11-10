import { ArrowRight, BarChart3, Compass, Megaphone, Palette, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/SectionLabel";

const stages = [
  {
    title: "Understand",
    icon: Compass,
    description: "Start with your business, your audience and the problem the campaign needs to solve.",
    output: "A clear brief",
  },
  {
    title: "Plan",
    icon: Target,
    description: "Choose the right channels, shape the offer and agree on the budget and measures of success.",
    output: "A focused strategy",
  },
  {
    title: "Create",
    icon: Palette,
    description: "Turn the strategy into copy, video and design built for the platforms your customers use.",
    output: "Creative to review",
  },
  {
    title: "Launch",
    icon: Megaphone,
    description: "Check tracking, audiences and the enquiry or checkout journey before the campaign goes live.",
    output: "A measured launch",
  },
  {
    title: "Improve",
    icon: BarChart3,
    description: "Read the results, test new creative and put the next round of spend behind what is working.",
    output: "Reporting & next steps",
  },
];

const toolkits = [
  {
    title: "Research & measurement",
    description: "Understand demand and measure what happens after the click.",
    tools: ["Google Analytics", "Google Search Console", "SEMrush"],
  },
  {
    title: "Creative & storytelling",
    description: "Build the videos, visuals and stories that give a campaign its voice.",
    tools: ["Adobe Premiere Pro", "Adobe Creative Suite", "Canva"],
  },
  {
    title: "Campaigns & publishing",
    description: "Reach the right audience and keep content moving across channels.",
    tools: ["Meta Ads Manager", "Google Ads", "Hootsuite", "Mailchimp", "WordPress"],
  },
];

export function SkillsStats() {
  return (
    <section
      id="skills"
      className="scroll-mt-20 lg:scroll-mt-24 dot-grid section-divider py-20 sm:py-32"
      aria-label="Joseph Maina's campaign process, skills and tools"
    >
      <div id="process" className="container mx-auto scroll-mt-28 px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="mb-12 max-w-2xl space-y-4">
          <SectionLabel>HOW I WORK</SectionLabel>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
            From the first brief to <span className="text-gradient">the next insight.</span>
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Good campaigns need a clear process. Here is how I connect strategy, creative and
            measurement, so you know what we are working towards at every stage.
          </p>
        </div>

        <div className="relative">
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-8 top-8 hidden h-px bg-border lg:block" />
          <ol className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stages.map((stage, index) => (
            <li key={stage.title} className="relative flex flex-col rounded-2xl border border-border bg-card p-5 lg:p-4">
              <div className="mb-6 flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <stage.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <span className="font-mono text-xs text-muted-foreground" aria-hidden="true">0{index + 1}</span>
              </div>
              <h3 className="font-display text-xl font-semibold">{stage.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{stage.description}</p>
              <p className="mt-6 border-t border-border pt-4 text-xs font-semibold text-primary">{stage.output}</p>
            </li>
          ))}
          </ol>
        </div>

        <div className="mt-14 sm:mt-20">
          <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
            <h3 className="font-display text-2xl font-semibold">The tools behind the work</h3>
            <p className="text-sm text-muted-foreground">Chosen to fit the brief.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {toolkits.map((toolkit) => (
              <div key={toolkit.title} className="rounded-2xl border border-border bg-card/60 p-6">
                <h4 className="font-display text-lg font-semibold">{toolkit.title}</h4>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{toolkit.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${toolkit.title} tools`}>
                  {toolkit.tools.map((tool) => (
                    <li key={tool} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium">{tool}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-primary/20 bg-primary/5 p-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-display text-lg font-semibold">Have a brief in mind?</p>
            <p className="mt-1 text-sm text-muted-foreground">Let's work out the right first step for your business.</p>
          </div>
          <Button asChild className="min-h-11 rounded-full">
            <Link to="/agency/contact">Let's talk <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
