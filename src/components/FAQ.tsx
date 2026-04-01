import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "./ScrollReveal";

const faqs = [
  {
    question: "What does a Digital Marketing Specialist do?",
    answer:
      "A Digital Marketing Specialist like Joseph Maina helps businesses grow their online presence through SEO, content strategy, social media marketing and data-driven campaigns. Based in Nairobi, Kenya, I help brands reach the right audience and convert them into customers.",
  },
  {
    question: "What digital marketing services do you offer?",
    answer:
      "I offer a full range of digital marketing services including SEO optimization, content strategy, social media management, Google Analytics reporting and digital campaign management — all tailored for businesses in Kenya and beyond.",
  },
  {
    question: "How long does SEO take to show results?",
    answer:
      "SEO typically takes 2–3 months to show significant results. However my clients in Nairobi have seen measurable improvements in traffic and rankings within the first 30 days through targeted keyword strategies and on-page optimization.",
  },
  {
    question: "How much does digital marketing cost in Nairobi?",
    answer:
      "Digital marketing costs in Nairobi vary depending on the scope of work. I offer flexible packages tailored to your business size and goals. Contact me directly for a free consultation and custom quote.",
  },
  {
    question: "Why hire a Digital Marketing Specialist in Kenya?",
    answer:
      "Hiring a local Digital Marketing Specialist in Kenya means working with someone who understands the local market, consumer behavior and platforms most effective for Kenyan audiences — giving your brand a genuine competitive advantage.",
  },
  {
    question: "Are you available for full-time opportunities?",
    answer:
      "Yes! I am actively looking for full-time Digital Marketing roles in Nairobi and remotely. If you're looking for a results-driven Digital Marketing Specialist, I'd love to hear from you. Check out my case studies or get in touch directly.",
  },
  {
    question: "How do I get in touch with you?",
    answer:
      "You can reach me directly through the contact section below, via email, or connect with me on LinkedIn. I respond within 24 hours.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 sm:py-32 bg-muted/30" aria-label="Frequently Asked Questions">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <ScrollReveal>
          <div className="text-center mb-16 space-y-4">
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
