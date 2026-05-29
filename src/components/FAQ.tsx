import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollReveal } from "./ScrollReveal";

const faqs = [
  {
    question: "Who is the best digital marketer in Nairobi?",
    answer:
      "If you're searching for the best digital marketer in Nairobi or a top social media manager Nairobi brands trust, Joseph Maina is a results-driven Digital Marketing Specialist Nairobi Kenya with 3+ years running paid media, SEO and content across Meta, Google and TikTok. From Westlands and Kilimani to CBD, Karen and beyond — including clients in Mombasa and Kisumu — I deliver ROI-focused, data-driven marketing in Kenya.",
  },
  {
    question: "Where can I find a digital marketer in Nairobi available for hire?",
    answer:
      "Right here. I'm a freelance Meta Ads manager Kenya, Google Ads expert for hire Kenya and TikTok ads specialist for hire Nairobi — available for project-based, retainer or full-time engagements. Hire a digital marketing specialist Nairobi who handles strategy, creative, media buying and reporting end-to-end.",
  },
  {
    question: "What digital marketing services do you offer?",
    answer:
      "Full-funnel marketing Kenya: SEO, content strategy, social media management, Meta Ads for ecommerce Kenya, Google Ads for real estate Nairobi, TikTok marketing for fashion brands Kenya, plus AI digital marketing Nairobi workflows. Whether you're a startup, SME or established brand in hospitality, retail or services, I tailor every campaign to your goals.",
  },
  {
    question: "How long does SEO take to show results?",
    answer:
      "SEO typically takes 2–3 months to show significant results. My clients in Nairobi have seen measurable improvements in traffic and rankings within the first 30 days through targeted keyword strategies and on-page optimization rooted in data-driven marketing Kenya.",
  },
  {
    question: "How much does digital marketing cost in Kenya?",
    answer:
      "Digital marketing cost in Kenya depends on scope. Social-only packages start lower, while full performance marketing Kenya 2026 retainers (Meta + Google + TikTok with creative and reporting) scale with your ad budget. I manage KES 500,000+/month in ad spend and offer transparent pricing — contact me for a free consultation and custom quote.",
  },
  {
    question: "Who is the best Meta Ads manager in Kenya?",
    answer:
      "As a Meta Ads Specialist in Kenya and one of the best media buyers in Kenya for SMEs and ecommerce, I run full-funnel Facebook and Instagram campaigns — from audience research and creative testing to budget scaling and ROAS reporting. Ideal for ecommerce, real estate, hospitality and fashion brands across Nairobi, Mombasa and Kisumu.",
  },
  {
    question: "Why hire a Digital Marketing Specialist in Kenya?",
    answer:
      "A local digital marketing consultant Nairobi understands the Kenyan consumer, the platforms that convert here, and the pricing realities of the market. You get a ROI focused digital marketer Nairobi who speaks the language of your audience — not a generic overseas agency.",
  },
  {
    question: "Are you available for full-time opportunities?",
    answer:
      "Yes — I'm a digital marketer available for hire Nairobi for freelance, contract and full-time roles. If you're hiring a performance marketing Kenya 2026 specialist, let's talk.",
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
