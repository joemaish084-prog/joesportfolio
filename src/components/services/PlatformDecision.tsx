import { ArrowRight, Calendar, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CtaLink } from "./CtaLink";
import { decisionHeading, decisionOptions } from "./servicesContent";

/** Keyboard-accessible tabs (arrow keys move between options) that help a visitor pick a starting channel. */
export function PlatformDecision() {
  return (
    <section aria-labelledby="platform-decision-title" className="mt-20 sm:mt-24">
      <h2 id="platform-decision-title" className="max-w-2xl font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {decisionHeading}
      </h2>

      <Tabs defaultValue="google" className="mt-7">
        <TabsList aria-label="Choose a platform" className="grid h-auto w-full max-w-xl grid-cols-3 gap-1 rounded-full border border-border/70 bg-card/60 p-1">
          {decisionOptions.map((option) => (
            <TabsTrigger
              key={option.value}
              value={option.value}
              className="min-h-11 rounded-full px-2 text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none sm:px-4"
            >
              {option.tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {decisionOptions.map((option) => (
          // forceMount keeps every option in the prerendered HTML for crawlers; inactive panels get `hidden`.
          <TabsContent key={option.value} value={option.value} forceMount className="mt-5 rounded-2xl border border-border/70 bg-card/50 p-6 data-[state=inactive]:hidden sm:p-8">
            <div className="grid gap-8 md:grid-cols-[1.3fr_1fr] md:items-start">
              <div>
                <h3 className="font-display text-xl font-semibold tracking-tight sm:text-2xl">{option.heading}</h3>
                <p className="mt-3 max-w-prose text-base leading-relaxed text-muted-foreground">{option.copy}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <CtaLink
                    to={option.cta.to}
                    external={option.cta.external}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    {option.cta.external ? <Calendar className="h-4 w-4" aria-hidden /> : null}
                    {option.cta.label}
                    {option.cta.external ? null : <ArrowRight className="h-4 w-4" aria-hidden />}
                  </CtaLink>
                  {option.read && (
                    <CtaLink to={option.read.to} className="inline-flex min-h-11 items-center text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                      {option.read.label}
                    </CtaLink>
                  )}
                </div>
              </div>

              {option.signals && (
                <ul aria-label="Signs this fits" className="space-y-3 rounded-xl border border-border/60 bg-background/50 p-5">
                  {option.signals.map((signal) => (
                    <li key={signal} className="flex items-start gap-2.5 text-sm leading-snug text-foreground/90">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      {signal}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  );
}
