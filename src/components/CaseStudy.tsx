import { BarChart3, Zap, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./ScrollReveal";
import { CollapsibleSection } from "./CollapsibleSection";

const stats = [
  { value: "704K", label: "Instagram Reach" },
  { value: "336", label: "Pieces of Content Published" },
  { value: "104K", label: "Top Single Video Views (TikTok)" },
  { value: "4M", label: "Total TikTok Video Views" },
  { value: "2.5M", label: "Total Instagram Video Views" },
];

const platforms = [
  {
    name: "TikTok",
    subtitle: "Brand Awareness Champion",
    accentVar: "--tiktok",
    metrics: [
      { text: "4M total video views", bold: true },
      { text: "16K profile views", bold: false },
      { text: "230K total likes", bold: true },
      { text: "2.1K comments", bold: false },
      { text: "5.4K shares", bold: false },
    ],
    topVideo: "103.9K views, 321+ hours total play time, 10.67s avg watch time, 9.1% full-video completion rate",
    insight: "Best platform for viral reach and watch time. Video content averaged 6–8% engagement rate.",
  },
  {
    name: "Instagram",
    subtitle: "Lead Generation Powerhouse",
    accentVar: "--instagram",
    metrics: [
      { text: "2.5M total video views", bold: true },
      { text: "322.9% views growth", bold: true },
      { text: "173.4% link clicks growth", bold: true },
      { text: "18.6K link clicks", bold: false },
      { text: "32.1K profile visits (↑78.4%)", bold: false },
      { text: "16.2K content interactions (↑100%)", bold: false },
      { text: "4.1K new followers", bold: false },
    ],
    topVideo: "92,631 views reaching 31,988 users — 375 likes, 188 saves, 96 shares, 62 comments",
    insight: "Strongest platform for high-intent traffic and lead generation.",
  },
  {
    name: "Facebook",
    subtitle: "Steady Supplemental Channel",
    accentVar: "--facebook",
    metrics: [
      { text: "4.8M total views", bold: true },
      { text: "15.8K link clicks (↑2.3%)", bold: false },
      { text: "16.9K page visits", bold: false },
      { text: "6.1K content interactions (↑9.3%)", bold: false },
      { text: "816 new followers (↑6%)", bold: false },
    ],
    topVideo: null,
    insight: "Reliable channel for consistent audience touchpoints and link sharing.",
  },
];


export function CaseStudy() {
  return (
    <section
      id="case-study"
      className="py-20 sm:py-32"
      style={{ background: "hsl(var(--case-study-bg))" }}
      aria-label="Digital marketing case study showcasing results from 2025 campaigns in Nairobi, Kenya"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-16 space-y-4">
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4"
              style={{ color: "hsl(var(--case-study-text))" }}
            >
              Case <span className="text-gradient">Study</span>: Digital Marketing Results 2025
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: "hsl(var(--case-study-muted))" }}>
              As a <strong>Digital Marketing Specialist in Nairobi, Kenya</strong>, I planned and executed a full-year campaign
              across TikTok, Instagram, and Facebook — driving brand awareness, engagement, and lead
              generation through a video-first SEO strategy. This case study showcases results from{" "}
              <strong>TikTok marketing in Nairobi</strong>, Meta Ads management, and content strategy across Kenya.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="scale" delay={0.1}>
          <div
            className="rounded-xl p-6 sm:p-8 mb-12 border"
            style={{ background: "hsl(var(--case-study-card))", borderColor: "hsl(var(--case-study-card-border))" }}
          >
            <p className="text-base sm:text-lg leading-relaxed italic" style={{ color: "hsl(var(--case-study-text) / 0.85)" }}>
              "In 2025, I planned and executed a comprehensive social media marketing strategy across
              three platforms, producing <strong>336 pieces of content</strong> (142 videos + 194 static posts). The
              campaign prioritised video content, which consistently outperformed static posts across
              all platforms in views, engagement, and conversion metrics."
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-16">
          {stats.map((stat, i) => (
            <ScrollReveal key={i} direction="up" delay={i * 0.1}>
              <div
                className="rounded-xl p-5 text-center border transition-all duration-300 hover:-translate-y-1"
                style={{ background: "hsl(var(--case-study-card))", borderColor: "hsl(var(--case-study-card-border))" }}
              >
                <p className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gradient">
                  <strong>{stat.value}</strong>
                </p>
                <p className="text-xs sm:text-sm mt-2 font-medium" style={{ color: "hsl(var(--case-study-muted))" }}>
                  {stat.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <Separator className="mb-16 opacity-20" />

        <CollapsibleSection
          id="platform-breakdown"
          title={<span style={{ color: "hsl(var(--case-study-text))" }}>Platform Breakdown</span>}
          defaultOpen
          className="mb-16"
        >
          <div className="grid md:grid-cols-3 gap-6">
            {platforms.map((platform, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 0.15}>
                <article
                  className="rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-2 hover:shadow-lg flex flex-col"
                  style={{
                    background: "hsl(var(--case-study-card))",
                    borderColor: "hsl(var(--case-study-card-border))",
                    borderTopWidth: "3px",
                    borderTopColor: `hsl(var(${platform.accentVar}))`,
                  }}
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <h4 className="text-xl font-display font-bold mb-1" style={{ color: `hsl(var(${platform.accentVar}))` }}>
                      {platform.name}
                    </h4>
                    <p className="text-sm font-medium mb-5" style={{ color: "hsl(var(--case-study-muted))" }}>
                      {platform.subtitle}
                    </p>
                    <ul className="space-y-2 mb-5 flex-1">
                      {platform.metrics.map((m, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm" style={{ color: "hsl(var(--case-study-text) / 0.8)" }}>
                          <BarChart3 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                          {m.bold ? <strong>{m.text}</strong> : m.text}
                        </li>
                      ))}
                    </ul>
                    {platform.topVideo && (
                      <div className="rounded-lg p-3 mb-4 text-xs" style={{ background: `hsl(var(${platform.accentVar}) / 0.1)`, color: "hsl(var(--case-study-text) / 0.7)" }}>
                        <span className="font-semibold" style={{ color: `hsl(var(${platform.accentVar}))` }}>Top Video:</span>{" "}
                        {platform.topVideo}
                      </div>
                    )}
                    <div className="rounded-lg p-3 text-sm italic border" style={{ borderColor: `hsl(var(${platform.accentVar}) / 0.2)`, color: "hsl(var(--case-study-text) / 0.75)" }}>
                      "{platform.insight}"
                    </div>
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        </CollapsibleSection>

        <Separator className="mb-16 opacity-20" />

        <ScrollReveal direction="left">
          <div
            className="rounded-xl p-6 sm:p-8 mb-12 border-l-4"
            style={{ background: "hsl(var(--case-study-card))", borderLeftColor: "hsl(var(--primary))" }}
          >
            <Zap className="h-6 w-6 text-primary mb-3" />
            <p className="text-base sm:text-lg leading-relaxed font-medium" style={{ color: "hsl(var(--case-study-text) / 0.9)" }}>
              "Installation and engagement videos dominated performance across all platforms. Video
              content consistently outperformed static posts in views, engagement, and conversion
              intent — making a <strong>video-first strategy the clear driver of campaign success</strong>."
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal direction="up">
          <div className="text-center">
            <Button variant="gradient" size="lg" asChild>
              <a href="#contact" className="gap-2">
                Impressed? Let's Work Together
                <ArrowRight className="h-5 w-5" />
              </a>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
