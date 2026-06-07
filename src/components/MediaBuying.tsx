import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Facebook, Search, Music2, Linkedin, MonitorPlay, TrendingUp, Target, BarChart3, Lightbulb, MapPin, ArrowRight, Sparkles, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./ScrollReveal";

const stats = [
  { value: 500, suffix: "K+", prefix: "KES ", label: "Monthly Ad Budget Managed" },
  { value: 4, suffix: "+", label: "Platforms Managed Simultaneously" },
  { value: 3, suffix: "x+", label: "Average ROAS Delivered" },
  { value: 20, suffix: "+", label: "Campaigns Launched" },
];

function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1600;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{prefix}{n}{suffix}</span>;
}

const platforms = [
  {
    name: "Meta Ads",
    sub: "Facebook & Instagram",
    Icon: Facebook,
    color: "#1877F2",
    desc: "Full-funnel campaigns from awareness to conversion. Audience research, creative strategy, A/B testing and budget optimization.",
    tags: ["Facebook", "Instagram", "Reels", "Stories"],
  },
  {
    name: "Google Ads",
    sub: "Search · Display · YouTube",
    Icon: Search,
    color: "#4285F4",
    desc: "Search, Display, YouTube and Performance Max campaigns. Keyword research, bidding strategy and conversion tracking.",
    tags: ["Search", "Display", "YouTube", "PMax"],
  },
  {
    name: "TikTok Ads",
    sub: "Spark · In-Feed · TopView",
    Icon: Music2,
    color: "#FF0050",
    desc: "Spark Ads, In-Feed Ads and TopView campaigns built for the Kenyan and African market.",
    tags: ["Spark Ads", "In-Feed", "TopView"],
  },
  {
    name: "LinkedIn Ads",
    sub: "B2B Targeting",
    Icon: Linkedin,
    color: "#0A66C2",
    desc: "B2B targeted campaigns for brands reaching professionals, decision makers and corporate clients.",
    tags: ["Sponsored Content", "Lead Gen Forms"],
  },
  {
    name: "Programmatic",
    sub: "Display & Retargeting",
    Icon: MonitorPlay,
    color: "#FF6A00",
    desc: "Display and retargeting campaigns across premium publisher networks to keep your brand top of mind.",
    tags: ["Display", "Retargeting", "Programmatic"],
  },
];

const steps = [
  { n: "01", title: "Audit & Strategy", desc: "Review current spend, identify waste and build a data-driven paid media strategy." },
  { n: "02", title: "Audience & Creative", desc: "Define target audiences, build creatives and set up campaign structure for maximum efficiency." },
  { n: "03", title: "Launch & Monitor", desc: "Launch campaigns with strict budget controls and daily performance monitoring." },
  { n: "04", title: "Optimize & Scale", desc: "Cut underperforming ads, scale winners and continuously improve ROAS week over week." },
  { n: "05", title: "Report & Refine", desc: "Weekly and monthly reports with clear metrics: spend, reach, leads, conversions and ROI." },
];

const differentiators = [
  { Icon: Lightbulb, emoji: "💡", title: "Budget Accountability", desc: "Every shilling tracked. No wasteful spending — I treat your budget like my own." },
  { Icon: BarChart3, emoji: "📊", title: "Data-First Decisions", desc: "No guesswork. Every decision is backed by real campaign data and performance metrics." },
  { Icon: Target, emoji: "🎯", title: "Full-Funnel Thinking", desc: "From cold audience awareness all the way to conversion — I manage the entire customer journey." },
  { Icon: Flag, emoji: "🇰🇪", title: "Kenya Market Knowledge", desc: "Deep understanding of Kenyan consumer behavior, peak periods and what actually converts in the local market." },
];

const tiers = [
  { name: "Growth", budget: "KES 50K – 150K/mo", platforms: "Meta + TikTok", best: "Growing brands & SMEs", blurb: "Perfect for brands ready to scale their social presence.", featured: false },
  { name: "Scale", budget: "KES 150K – 500K/mo", platforms: "Meta + Google + TikTok", best: "Established businesses", blurb: "Multi-platform strategy for serious growth.", featured: false },
  { name: "Enterprise", budget: "KES 500K+/mo", platforms: "All platforms", best: "Large brands & agencies", blurb: "Full media buying management with dedicated reporting and strategy sessions.", featured: true },
];

export function MediaBuying() {
  return (
    <section id="media-buying" className="py-20 sm:py-32 relative overflow-hidden" aria-labelledby="media-buying-heading">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Header */}
        <ScrollReveal>
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <Badge variant="secondary" className="text-sm px-4 py-1.5">💰 Paid Media</Badge>
            <h2 id="media-buying-heading" className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
              Media Buying & <span className="text-gradient">Paid Advertising</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">
              Managing ad budgets of <strong className="text-foreground">KES 500,000+ per month</strong> across Meta, Google, TikTok and more — every shilling accountable. The <strong className="text-foreground">best media buyer in Kenya</strong> for brands that want a <strong className="text-foreground">freelance Meta Ads manager Kenya</strong>, <strong className="text-foreground">Google Ads expert for hire Kenya</strong> or <strong className="text-foreground">TikTok ads specialist for hire Nairobi</strong> — ROI focused, data-driven, full funnel marketing Kenya.
            </p>
          </div>
        </ScrollReveal>

        {/* Stats bar */}
        <ScrollReveal delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-20">
            {stats.map((s) => (
              <div key={s.label} className="bg-card/50 backdrop-blur border border-primary/20 rounded-xl p-5 sm:p-6 text-center hover:border-primary/50 transition-colors">
                <div className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gradient mb-2">
                  <Counter value={s.value} prefix={s.prefix} suffix={s.suffix} />
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Platforms */}
        <div className="mb-20">
          <ScrollReveal>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">Platforms I Buy On</h3>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {platforms.map((p, i) => (
              <ScrollReveal key={p.name} delay={i * 0.05}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="group h-full bg-card/40 border border-border rounded-xl p-6 transition-all duration-300 hover:shadow-elegant"
                  style={{ ['--hover' as never]: p.color }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center transition-colors"
                      style={{ backgroundColor: `${p.color}1a`, color: p.color }}
                    >
                      <p.Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-lg leading-tight">{p.name}</h4>
                      <p className="text-xs text-muted-foreground">{p.sub}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{p.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span key={t} className="text-[11px] px-2 py-1 rounded-md bg-muted/60 text-muted-foreground">{t}</span>
                    ))}
                  </div>
                  <div
                    className="h-0.5 w-0 group-hover:w-full mt-5 transition-all duration-500 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Process */}
        <div className="mb-20">
          <ScrollReveal>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-center mb-12">How I Manage Your Ad Budget</h3>
          </ScrollReveal>
          <div className="relative">
            <div className="hidden lg:block absolute top-6 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
              {steps.map((s, i) => (
                <ScrollReveal key={s.n} delay={i * 0.08}>
                  <div className="text-center lg:text-left relative">
                    <div className="w-12 h-12 mx-auto lg:mx-0 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#FF9E2C] text-white font-bold font-display flex items-center justify-center mb-4 shadow-elegant relative z-10">
                      {s.n}
                    </div>
                    <h4 className="font-semibold mb-2">{s.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>

        {/* Differentiators */}
        <div className="mb-20">
          <ScrollReveal>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">Why Brands Trust Me With Their Budget</h3>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {differentiators.map((d, i) => (
              <ScrollReveal key={d.title} delay={i * 0.06}>
                <div className="h-full bg-card/40 border border-border rounded-xl p-6 hover:border-primary/40 transition-colors">
                  <div className="text-3xl mb-3" aria-hidden>{d.emoji}</div>
                  <h4 className="font-semibold mb-2">{d.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* Budget tiers */}
        <div className="mb-20">
          <ScrollReveal>
            <h3 className="text-2xl sm:text-3xl font-display font-bold text-center mb-10">Ad Budget Tiers I Manage</h3>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((t, i) => (
              <ScrollReveal key={t.name} delay={i * 0.08}>
                <div
                  className={`relative h-full rounded-2xl p-7 border transition-all ${
                    t.featured
                      ? "bg-gradient-to-br from-[#FF6A00]/15 to-[#FF9E2C]/5 border-primary shadow-elegant"
                      : "bg-card/40 border-border hover:border-primary/40"
                  }`}
                >
                  {t.featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-[#FF6A00] to-[#FF9E2C] text-white flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Most Popular
                    </div>
                  )}
                  <h4 className="text-xl font-display font-bold mb-1">{t.name}</h4>
                  <p className="text-2xl font-bold text-gradient mb-4">{t.budget}</p>
                  <div className="space-y-2 text-sm mb-4">
                    <p><span className="text-muted-foreground">Platforms: </span><span className="font-medium">{t.platforms}</span></p>
                    <p><span className="text-muted-foreground">Best for: </span><span className="font-medium">{t.best}</span></p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{t.blurb}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <ScrollReveal>
          <div className="text-center bg-gradient-to-br from-[#FF6A00]/10 to-[#FF9E2C]/5 border border-primary/30 rounded-2xl p-8 sm:p-12 max-w-3xl mx-auto">
            <TrendingUp className="w-10 h-10 mx-auto mb-4 text-primary" />
            <h3 className="text-2xl sm:text-3xl font-display font-bold mb-3">Ready to Make Your Ad Budget Work Harder?</h3>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Let's audit your current spend and find where you're leaving money on the table. Trusted <strong className="text-foreground">Google Ads specialist in Kenya</strong> and <strong className="text-foreground">Meta Ads manager in Nairobi</strong> for results-driven <strong className="text-foreground">digital ad agency Nairobi</strong> work.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-[#FF6A00] to-[#FF9E2C] text-white shadow-elegant btn-hover">
                <a href="#contact">Book Free Audit <ArrowRight className="ml-2 w-4 h-4" /></a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="#case-study">View Case Studies</a>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
