import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "./ScrollReveal";

const skills = [
  "Video Production & Editing",
  "Graphic Design",
  "Social Media Marketing",
  "Content Strategy & Development",
  "Digital Marketing & Analytics",
  "Adobe Premiere Pro",
  "Adobe Creative Suite",
  "Meta Business Suite",
  "Google Ads & SEO",
  "Photography",
  "Podcast Production",
  "AI-Powered Marketing (ChatGPT, Gemini, Midjourney)",
  "Public Relations",
  "Brand Strategy & Storytelling",
];

export function About() {
  return (
    <section id="about" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
                About <span className="text-gradient">Joseph Maina</span> — Digital Marketing Specialist
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-12">
            <article className="space-y-6">
              <ScrollReveal direction="left" delay={0.1}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I never planned to get into digital marketing. I started out studying Journalism and Mass Communication at The Technical University of Kenya — I wanted to tell stories, plain and simple. But somewhere between editing my first podcast episode and helping a friend run a Facebook page for a small Nairobi business, I realized something: the brands that were winning weren't the ones with the biggest budgets. They were the ones that understood their audience and showed up consistently with content that actually mattered.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.2}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  That realization changed everything for me. I started spending nights learning Meta Ads Manager, watching YouTube tutorials on Premiere Pro, and experimenting with Canva designs. My first "client" was a local restaurant in Westlands — they had great food but zero online presence. I shot a 30-second video on my phone, edited it that same night, and posted it on their Instagram. It got 10,000 views in two days. That was the moment I knew this was what I wanted to do.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.3}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Fast forward to today, and I'm a <strong className="text-foreground">Digital Marketing Specialist in Nairobi, Kenya</strong> with over 3 years of hands-on experience. I've worked with brands like iClear Wellife Service and Convey Communications, producing content, managing campaigns, and driving measurable growth. As an <strong className="text-foreground">SEO Expert in Nairobi</strong> and <strong className="text-foreground">Social Media Manager in Kenya</strong>, I don't just post content — I build systems that turn engagement into revenue.
                </p>
              </ScrollReveal>
            </article>

            <ScrollReveal direction="up" delay={0.1}>
              <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 sm:p-8 space-y-4">
                <h3 className="text-xl font-display font-semibold text-gradient">A Challenge That Changed How I Work</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  One of the toughest briefs I ever got was from iClear Wellife. They were launching a new product line and needed to build awareness from basically zero — no existing social media following, no brand recognition in Nairobi, and a tight budget. The challenge? We had 30 days to create a campaign that didn't just get views, but actually drove inquiries and sales.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I decided to go all-in on video. I shot 15 short-form videos myself — product demos, customer testimonials, behind-the-scenes footage — and edited them into platform-specific formats for TikTok, Instagram Reels, and Facebook. I set up their Meta Ads from scratch, targeting specific neighborhoods in Nairobi, Mombasa, and Nakuru. Within the first two weeks, one TikTok video hit 104,000 views. By month-end, we had a 312% increase in profile visits, 18,000+ link clicks, and a fully booked consultation calendar. That campaign taught me that <strong className="text-foreground">relentless consistency beats perfection every single time</strong>.
                </p>
              </div>
            </ScrollReveal>

            <article className="space-y-6">
              <ScrollReveal direction="left" delay={0.1}>
                <h3 className="text-2xl font-display font-semibold">How I Approach Every Campaign</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Before I create a single piece of content, I spend time understanding the brand's voice, the audience's pain points, and the actual business goal. Is it awareness? Leads? Direct sales? Because a TikTok strategy for brand awareness looks completely different from a Meta Ads funnel for ecommerce conversions.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.2}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I'm obsessed with data, but I never let it kill creativity. Every campaign I run starts with a hypothesis: "I think this type of content will resonate because..." Then I test, measure, and iterate. Some of my best-performing videos were shot on my phone in under 20 minutes. Some of my most polished designs barely moved the needle. That's why I always lead with storytelling and back it up with analytics — not the other way around.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.3}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I also believe in meeting the audience where they are. If your customers are on TikTok at 10 PM, that's where we show up. If they're searching Google for "best real estate agent in Kilimani," we make sure you rank. Whether it's <span className="text-primary font-semibold">TikTok marketing in Nairobi</span>, crafting podcast content, or running Meta Ads as a <strong className="text-foreground">Meta Ads Specialist in Kenya</strong>, my strategy is always tailored to the platform and the people on it.
                </p>
              </ScrollReveal>
            </article>

            <ScrollReveal direction="up" delay={0.1}>
              <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 sm:p-8 space-y-4">
                <h3 className="text-xl font-display font-semibold text-gradient">Why I Do What I Do</h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I grew up seeing small Kenyan businesses with incredible products and services struggle simply because no one knew they existed. That frustration stuck with me. Today, I get out of bed knowing that the work I do — a well-timed Instagram post, a carefully targeted Google Ad, a viral TikTok video — can be the difference between a business surviving and thriving.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I'm currently a <span className="text-primary font-semibold">digital marketer available for hire in Nairobi (2026)</span> — covering Westlands, CBD, Kilimani and Karen, plus remote clients in Mombasa and Kisumu. I work with startups, SMEs, ecommerce, real estate and hospitality brands as a <strong className="text-foreground">digital marketing consultant Nairobi</strong> focused on performance marketing Kenya 2026, AI digital marketing Nairobi workflows and full funnel marketing Kenya. Open to freelance projects and full-time opportunities — let's build something impactful together.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <div className="space-y-6">
                <h3 className="text-2xl font-display font-semibold">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <ScrollReveal key={skill} direction="scale" delay={0.05 * i} duration={0.3}>
                      <Badge variant="secondary" className="text-sm px-4 py-2 hover:bg-primary/20 transition-colors">
                        {skill}
                      </Badge>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <div className="space-y-6">
                <h3 className="text-2xl font-display font-semibold">Education</h3>
                <div className="space-y-4">
                  <div className="border-l-2 border-primary pl-6 space-y-1">
                    <h4 className="font-semibold text-lg">The Technical University of Kenya</h4>
                    <p className="text-primary">
                      Diploma in Journalism and Mass Communication — Broadcast Option
                    </p>
                    <p className="text-sm text-muted-foreground">Dec '23</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="scale" delay={0.2}>
              <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-8 text-center space-y-4">
                <p className="text-lg font-medium">
                  Joseph Maina · Digital Marketing Specialist Nairobi Kenya
                </p>
                <p className="text-base text-muted-foreground">
                  Based in <span className="text-primary font-semibold">Nairobi, Kenya</span> — open to freelance & full-time roles
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                  <a href="mailto:joemaish084@gmail.com" className="hover:text-primary transition-colors">
                    joemaish084@gmail.com
                  </a>
                  <span>•</span>
                  <a href="tel:+254704700160" className="hover:text-primary transition-colors">
                    +254 704 700 160
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
