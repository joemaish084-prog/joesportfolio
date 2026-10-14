import { SectionLabel } from "@/components/SectionLabel";
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
      "The right marketer depends on your goals. I bring 3+ years of experience running paid ads, SEO and content campaigns for Kenyan brands. My case studies show the work, the results and how they were measured, so you can decide whether we're a good fit.",
  },
  {
    question: "Where can I find a digital marketer in Nairobi available for hire?",
    answer:
      "I'm based in Nairobi and available for select freelance and consulting projects, including monthly retainers. I handle strategy, creative, campaign management and reporting. Get in touch with your goals and timeline to check availability.",
  },
  {
    question: "What digital marketing services do you offer?",
    answer:
      "I offer Meta, Google and TikTok Ads management, SEO, social media management, content strategy, video production, graphic design and brand strategy. I also provide marketing audits and consultations. The mix depends on your audience, goals and budget.",
  },
  {
    question: "How long does SEO take to show results?",
    answer:
      "SEO takes time, and the timeline depends on your website, competition and starting point. Targeted fixes can produce early improvements, while sustained growth needs ongoing work. I'll explain what to expect after reviewing your site.",
  },
  {
    question: "How much does digital marketing cost in Kenya?",
    answer:
      "Meta Ads and social media management start at KES 40,000/month; Google Ads and SEO start at KES 45,000/month. Multi-platform retainers start at KES 70,000/month. Advertising spend is separate from management fees. Book a free call for a quote based on your scope.",
  },
  {
    question: "Who is the best Meta Ads manager in Kenya?",
    answer:
      "Look for someone who can explain their campaign structure, tracking and results. I manage Facebook and Instagram campaigns from audience research and creative testing through to optimization and reporting. You can see recent examples in my case studies.",
  },
  {
    question: "Why hire a Digital Marketing Specialist in Kenya?",
    answer:
      "Local experience helps with understanding how your customers search, shop and communicate, including the role of WhatsApp and M-Pesa. I use that knowledge to plan campaigns around your audience and business goals.",
  },
  {
    question: "How do I get in touch with you?",
    answer:
      "You can reach me directly through the contact section below, via email, or connect with me on LinkedIn. I respond within 24 hours.",
  },
  {
    question: "Do you offer digital marketing for restaurants and hospitality businesses in Nairobi?",
    answer:
      "Yes. I help restaurants, hotels and hospitality brands in Nairobi grow their online presence through Instagram marketing, Google Ads and local SEO. Many Nairobi restaurants see 30%+ more reservations through targeted digital campaigns.",
  },
  {
    question: "Can you help e-commerce brands in Kenya with digital marketing?",
    answer:
      "Absolutely. I specialize in e-commerce marketing for Kenyan brands including Meta Ads for product sales, Google Shopping campaigns, TikTok Shop marketing and SEO for online stores.",
  },
  {
    question: "Do you offer digital marketing for real estate companies in Nairobi?",
    answer:
      "Yes. Real estate is one of the highest ROI sectors for digital marketing in Kenya. I help real estate agents and developers generate qualified leads through Facebook Ads, Google Ads and content marketing.",
  },
  {
    question: "Can you help startups in Kenya with their digital marketing?",
    answer:
      "Yes. I work with early-stage startups and SMEs across Kenya to build their digital presence from scratch — brand strategy, social media, SEO and paid ads all in one package.",
  },
  {
    question: "What makes you different from a digital marketing agency in Nairobi?",
    answer:
      "Unlike large agencies where your account is managed by juniors, you work directly with me — a senior specialist with 3+ years of proven results. Faster decisions, personal attention and better ROI.",
  },
  {
    question: "Do you offer affordable digital marketing packages for small businesses in Kenya?",
    answer:
      "Yes. Monthly retainers start at KES 40,000, with the scope agreed around your business needs. Advertising spend is separate from management fees. Book a free discovery call to find the right fit for your budget.",
  },
  {
    question: "Can you manage YouTube marketing and video campaigns in Kenya?",
    answer:
      "Yes. I handle YouTube Ads, video content strategy and YouTube SEO for brands in Kenya looking to build an audience through video content.",
  },
];

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
