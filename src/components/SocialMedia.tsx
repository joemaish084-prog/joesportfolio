import { TrendingUp, Users, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "./ScrollReveal";

const caseStudies = [
  {
    company: "iClear Wellife Service",
    role: "Assistant Marketing Supervisor",
    period: "Aug '24 - Present",
    intro: "When I joined iClear Wellife, their social media presence was practically nonexistent. The brand had solid products — water purification and wellness solutions — but nobody online knew they existed. My job was to change that.",
    metrics: [
      { label: "Engagement Increase", value: "80%", icon: TrendingUp },
      { label: "Brand Visibility Growth", value: "25%", icon: Target },
      { label: "Campaigns Executed", value: "12+", icon: Users },
    ],
    story: [
      "I took over their social media accounts and immediately realized we were starting from zero — no content library, no brand voice online, no engaged audience. So I rolled up my sleeves and built everything from scratch.",
      "I developed a content strategy focused on educational and product-demo videos. I personally shot and edited over 40 videos in my first three months — everything from installation tutorials to customer testimonials. The engagement numbers started climbing within weeks.",
      "I planned and executed 12+ promotional campaigns across Meta, TikTok, and Google. My best-performing Meta Ads campaign targeted Nairobi homeowners and delivered a 4:1 return on ad spend. I remember refreshing the dashboard at midnight and watching the conversions roll in — that never gets old.",
      "By month six, our average post engagement had jumped 80%, and brand visibility (measured through reach and impressions) was up 25% month-over-month. We went from silence to having a real voice in the Kenyan wellness space.",
    ],
  },
  {
    company: "Convey Communications",
    role: "Creative Digital Officer",
    period: "Feb '24 - May '25",
    intro: "Convey Communications was a different beast — a PR and communications agency serving corporate clients who needed their brand stories told beautifully and consistently. My challenge was balancing creativity with the strict brand guidelines of multiple high-profile accounts.",
    metrics: [
      { label: "Client Engagement", value: "15%", icon: TrendingUp },
      { label: "Multimedia Assets Created", value: "30+", icon: Target },
    ],
    story: [
      "I walked into a team that was drowning in content requests. Clients wanted social media graphics, event coverage, press release visuals, and presentation decks — yesterday. I had to work fast without sacrificing quality.",
      "I personally designed over 30 multimedia assets each month — social media graphics, branded video overlays, animated quote cards, and email headers. I built reusable Canva and Premiere Pro templates that cut our production time in half. The team still uses some of those templates today.",
      "One of my proudest moments was a campaign for a client's product launch in Karen. I shot the event, edited a highlight reel that same evening, and had it live on Instagram by 9 PM. The client called me the next morning to say they'd gotten 15 direct inquiries from that single post.",
      "Across all client accounts, I helped drive a 15% lift in average engagement rate. But more importantly, I learned how to make creativity repeatable — how to produce high-quality work on tight deadlines, every single time.",
    ],
  },
];

export function SocialMedia() {
  return (
    <section id="social-media" className="py-20 sm:py-32 bg-muted/30" aria-label="Social media marketing case studies">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
            Social Media <span className="text-gradient">Case Studies</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real projects, real challenges, real results — here's what happened when I got my hands on these brands.
          </p>
        </div>

        <div className="space-y-8">
          {caseStudies.map((study, index) => (
            <article key={index}>
              <ScrollReveal direction="up" delay={index * 0.15}>
                <Card className="border-2 hover:border-primary/30 transition-all">
                  <CardHeader className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <CardTitle className="text-2xl font-display">
                        <h3 className="text-2xl font-display font-semibold">{study.company}</h3>
                      </CardTitle>
                      <span className="text-sm text-muted-foreground">{study.period}</span>
                    </div>
                    <p className="text-primary font-medium">{study.role}</p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-base text-muted-foreground leading-relaxed italic border-l-2 border-primary/30 pl-4">
                      {study.intro}
                    </p>

                    <div className="grid sm:grid-cols-3 gap-4">
                      {study.metrics.map((metric, idx) => {
                        const Icon = metric.icon;
                        return (
                          <div
                            key={idx}
                            className="bg-primary/5 rounded-lg p-4 space-y-2 border border-primary/10"
                          >
                            <Icon className="h-5 w-5 text-primary" />
                            <p className="text-2xl sm:text-3xl font-display font-bold text-primary">
                              <strong>{metric.value}</strong>
                            </p>
                            <p className="text-sm text-muted-foreground">{metric.label}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">What I Did:</h4>
                      <ul className="space-y-3">
                        {study.story.map((paragraph, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                            <span className="leading-relaxed">{paragraph}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
