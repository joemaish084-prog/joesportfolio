import { SectionLabel } from "@/components/SectionLabel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "./ScrollReveal";

import { faqs } from "@/data/faqs";

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-20 lg:scroll-mt-24 dot-grid section-divider py-20 sm:py-32 bg-muted/30" aria-label="Frequently Asked Questions">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <ScrollReveal>
          <div className="text-center mb-16 space-y-4">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
              Frequently Asked <span className="text-gradient">Questions</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to know about working with a Digital Marketing Specialist in Nairobi, Kenya
            </p>
          </div>
        </ScrollReveal>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <ScrollReveal key={i} direction={i % 2 === 0 ? "left" : "right"} delay={i * 0.1}>
              <AccordionItem
                value={`faq-${i}`}
                className="border rounded-xl px-6 bg-card data-[state=open]:border-primary/30 transition-all hover:bg-muted/50"
              >
                <AccordionTrigger className="text-left py-5 hover:no-underline">
                  <h3 className="text-base sm:text-lg font-semibold font-display pr-4">
                    {faq.question}
                  </h3>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm sm:text-base leading-relaxed pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </ScrollReveal>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
