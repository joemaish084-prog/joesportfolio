import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { agencyFaqs } from "@/data/services";
import { faqContent } from "./servicesContent";

/**
 * The agency FAQ accordion. Answers stay in the DOM while closed (forceMount), so
 * the prerendered HTML carries the same text as the FAQPage JSON-LD. Radix does
 * not hide a force-mounted panel, so the closed ones are hidden here by state.
 */
export function ServicesFaq() {
  return (
    <section aria-labelledby="services-faq-title" className="mt-20 grid gap-8 sm:mt-24 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{faqContent.eyebrow}</p>
        <h2 id="services-faq-title" className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          {faqContent.heading}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {faqContent.intro}{" "}
          <Link to="/agency/contact" className="font-medium text-primary underline underline-offset-4 focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{faqContent.askLabel}</Link>.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {agencyFaqs.map((faq) => (
          <AccordionItem key={faq.q} value={faq.q} className="[&>[role=region][data-state=closed]]:hidden">
            <AccordionTrigger className="min-h-14 gap-4 text-left text-base focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{faq.q}</AccordionTrigger>
            <AccordionContent forceMount className="max-w-prose text-sm leading-relaxed text-muted-foreground sm:text-base">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
