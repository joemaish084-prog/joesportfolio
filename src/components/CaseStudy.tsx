import { TrendingUp, Video, MousePointerClick, BarChart3, Zap, Target, Layers } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
      "4M total video views",
      "16K profile views",
      "230K total likes",
      "2.1K comments",
      "5.4K shares",
    ],
    topVideo: "103.9K views, 321+ hours total play time, 10.67s avg watch time, 9.1% full-video completion rate",
    insight: "Best platform for viral reach and watch time. Video content averaged 6–8% engagement rate.",
  },
  {
    name: "Instagram",
    subtitle: "Lead Generation Powerhouse",
    accentVar: "--instagram",
    metrics: [
      "2.5M total video views",
      "322.9% views growth",
      "173.4% link clicks growth",
      "18.6K link clicks",
      "32.1K profile visits (↑78.4%)",
      "16.2K content interactions (↑100%)",
      "4.1K new followers",
    ],
    topVideo: "92,631 views reaching 31,988 users — 375 likes, 188 saves, 96 shares, 62 comments",
    insight: "Strongest platform for high-intent traffic and lead generation.",
  },
  {
    name: "Facebook",
    subtitle: "Steady Supplemental Channel",
    accentVar: "--facebook",
    metrics: [
      "15.8K link clicks (↑2.3%)",
      "6.1K content interactions (↑9.3%)",
      "16.9K page visits",
      "816 new followers (↑6%)",
    ],
    topVideo: null,
    insight: "Reliable channel for consistent audience touchpoints and link sharing.",
  },
];

const recommendations = [
  {
    icon: Video,
    title: "Double Down on Video Content",
    description: "Prioritise installation and educational videos, maintaining 10+ second average watch time for optimal algorithm performance.",
  },
  {
    icon: MousePointerClick,
    title: "Prioritise Instagram for Conversions",
    description: "Highest link click-through and intent signals. Target 50% further view growth with continued investment.",
  },
  {
    icon: Layers,
    title: "Optimise Platform Mix",
    description: "Instagram (#1 for conversions) → TikTok (#2 for awareness) → Facebook (supplemental traffic).",
  },
];

export function CaseStudy() {
  return (
    <section
      id="case-study"
      className="py-20 sm:py-32"
      style={{ background: "hsl(var(--case-study-bg))" }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4"
            style={{ color: "hsl(var(--case-study-text))" }}
          >
            Case Study: 2025 Annual Social Media{" "}
            <span className="text-gradient">Marketing Campaign</span>
          </h2>
          <p
            className="text-lg max-w-3xl mx-auto"
            style={{ color: "hsl(var(--case-study-muted))" }}
          >
            A full-year digital marketing campaign across TikTok, Instagram, and Facebook — driving
            brand awareness, engagement, and lead generation through video-first content strategy.
          </p>
        </div>

        {/* Overview */}
        <div
          className="rounded-xl p-6 sm:p-8 mb-12 border"
          style={{
            background: "hsl(var(--case-study-card))",
            borderColor: "hsl(var(--case-study-card-border))",
          }}
        >
          <p
            className="text-base sm:text-lg leading-relaxed italic"
            style={{ color: "hsl(var(--case-study-text) / 0.85)" }}
          >
            "In 2025, I planned and executed a comprehensive social media marketing strategy across
            three platforms, producing 336 pieces of content (142 videos + 194 static posts). The
            campaign prioritised video content, which consistently outperformed static posts across
            all platforms in views, engagement, and conversion metrics."
          </p>
        </div>

        {/* Key Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-16">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-xl p-5 text-center border transition-all duration-300 hover:-translate-y-1"
              style={{
                background: "hsl(var(--case-study-card))",
                borderColor: "hsl(var(--case-study-card-border))",
              }}
            >
              <p className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-gradient">
                {stat.value}
              </p>
              <p
                className="text-xs sm:text-sm mt-2 font-medium"
                style={{ color: "hsl(var(--case-study-muted))" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <Separator className="mb-16 opacity-20" />

        {/* Platform Breakdown */}
        <h3
          className="text-2xl sm:text-3xl font-display font-bold text-center mb-10"
          style={{ color: "hsl(var(--case-study-text))" }}
        >
          Platform Breakdown
        </h3>
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {platforms.map((platform, i) => (
            <div
              key={i}
              className="rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col"
              style={{
                background: "hsl(var(--case-study-card))",
                borderColor: "hsl(var(--case-study-card-border))",
                borderTopWidth: "3px",
                borderTopColor: `hsl(var(${platform.accentVar}))`,
              }}
            >
              <div className="p-6 flex-1 flex flex-col">
                <h4
                  className="text-xl font-display font-bold mb-1"
                  style={{ color: `hsl(var(${platform.accentVar}))` }}
                >
                  {platform.name}
                </h4>
                <p
                  className="text-sm font-medium mb-5"
                  style={{ color: "hsl(var(--case-study-muted))" }}
                >
                  {platform.subtitle}
                </p>

                <ul className="space-y-2 mb-5 flex-1">
                  {platform.metrics.map((m, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm"
                      style={{ color: "hsl(var(--case-study-text) / 0.8)" }}
                    >
                      <BarChart3 className="h-3.5 w-3.5 mt-0.5 flex-shrink-0 text-primary" />
                      {m}
                    </li>
                  ))}
                </ul>

                {platform.topVideo && (
                  <div
                    className="rounded-lg p-3 mb-4 text-xs"
                    style={{
                      background: `hsl(var(${platform.accentVar}) / 0.1)`,
                      color: "hsl(var(--case-study-text) / 0.7)",
                    }}
                  >
                    <span className="font-semibold" style={{ color: `hsl(var(${platform.accentVar}))` }}>
                      Top Video:
                    </span>{" "}
                    {platform.topVideo}
                  </div>
                )}

                <div
                  className="rounded-lg p-3 text-sm italic border"
                  style={{
                    borderColor: `hsl(var(${platform.accentVar}) / 0.2)`,
                    color: "hsl(var(--case-study-text) / 0.75)",
                  }}
                >
                  "{platform.insight}"
                </div>
              </div>
            </div>
          ))}
        </div>

        <Separator className="mb-16 opacity-20" />

        {/* Content Strategy Insight */}
        <div
          className="rounded-xl p-6 sm:p-8 mb-16 border-l-4"
          style={{
            background: "hsl(var(--case-study-card))",
            borderLeftColor: "hsl(var(--primary))",
          }}
        >
          <Zap className="h-6 w-6 text-primary mb-3" />
          <p
            className="text-base sm:text-lg leading-relaxed font-medium"
            style={{ color: "hsl(var(--case-study-text) / 0.9)" }}
          >
            "Installation and engagement videos dominated performance across all platforms. Video
            content consistently outperformed static posts in views, engagement, and conversion
            intent — making a video-first strategy the clear driver of campaign success."
          </p>
        </div>

        {/* Strategic Recommendations */}
        <h3
          className="text-2xl sm:text-3xl font-display font-bold text-center mb-10"
          style={{ color: "hsl(var(--case-study-text))" }}
        >
          Strategic Recommendations
        </h3>
        <div className="space-y-4">
          {recommendations.map((rec, i) => {
            const Icon = rec.icon;
            return (
              <div
                key={i}
                className="flex items-start gap-5 rounded-xl p-6 border transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  background: "hsl(var(--case-study-card))",
                  borderColor: "hsl(var(--case-study-card-border))",
                }}
              >
                <div className="rounded-lg p-3 bg-gradient-orange flex-shrink-0">
                  <Icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h4
                    className="text-lg font-display font-semibold mb-1"
                    style={{ color: "hsl(var(--case-study-text))" }}
                  >
                    {rec.title}
                  </h4>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "hsl(var(--case-study-muted))" }}
                  >
                    {rec.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
