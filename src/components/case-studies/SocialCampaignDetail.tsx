import { BarChart3, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { socialPlatforms, socialStats } from "@/data/caseStudies";

/** Full breakdown of the 2025 social media campaign. Expects a dark case-study background. */
export function SocialCampaignDetail() {
  return (
    <div>
      <ScrollReveal direction="scale">
        <div
          className="corner-brackets rounded-xl p-6 sm:p-8 mb-8 border"
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

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 mb-10">
        {socialStats.map((stat, i) => (
          <ScrollReveal
            key={stat.label}
            direction="up"
            delay={i * 0.1}
            // odd count in a 2-column phone grid: let the last tile fill the row
            className={i === socialStats.length - 1 && socialStats.length % 2 === 1 ? "col-span-2 sm:col-span-1" : ""}
          >
            <div
              className="corner-brackets rounded-xl p-5 text-center border transition-all duration-300 hover:-translate-y-1"
              style={{ background: "hsl(var(--case-study-card))", borderColor: "hsl(var(--case-study-card-border))" }}
            >
              <p className="text-3xl sm:text-4xl font-display font-bold text-gradient">
                <strong>{stat.value}</strong>
              </p>
              <p className="text-xs sm:text-sm mt-2 font-medium" style={{ color: "hsl(var(--case-study-muted))" }}>
                {stat.label}
              </p>
            </div>
          </ScrollReveal>
        ))}
      </div>

      <h3 className="mb-6 text-xl sm:text-2xl font-display font-bold" style={{ color: "hsl(var(--case-study-text))" }}>
        Platform breakdown
      </h3>
      <div className="grid md:grid-cols-3 gap-6">
        {socialPlatforms.map((platform, i) => (
          <ScrollReveal key={platform.name} direction="up" delay={i * 0.15}>
            <article
              className="corner-brackets rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-2 hover:shadow-lg flex flex-col h-full"
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
                  {platform.metrics.map((m) => (
                    <li key={m.text} className="flex items-start gap-2 text-sm" style={{ color: "hsl(var(--case-study-text) / 0.8)" }}>
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

      <ScrollReveal direction="left">
        <div
          className="corner-brackets rounded-xl p-6 sm:p-8 mt-8 border-l-4"
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
    </div>
  );
}
