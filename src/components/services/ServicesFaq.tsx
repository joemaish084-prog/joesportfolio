import { Link } from "react-router-dom";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { agencyFaqs } from "@/data/services";
import { faqContent } from "./servicesContent";

/**
 * The agency FAQ accordion. Answers stay in the DOM while closed (forceMount), so
 * the prerendered HTML carries the same text as the FAQPage JSON-LD.
 */
export function ServicesFaq() {
  return (
    <section aria-labelledby="services-faq-title" className="mt-20 grid gap-8 sm:mt-24 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{faqContent.eyebrow}</p>
        <h2 id="services-faq-title" className="mt-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {faqContent.heading}
        </h2>
        <p className="mt-3 text-muted-foreground">
          {faqContent.intro}{" "}
          <Link to="/agency/contact" className="text-primary hover:underline">{faqContent.askLabel}</Link>.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {agencyFaqs.map((faq) => (
          <AccordionItem key={faq.q} value={faq.q}>
            <AccordionTrigger className="text-left">{faq.q}</AccordionTrigger>
            <AccordionContent forceMount className="text-muted-foreground">{faq.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
