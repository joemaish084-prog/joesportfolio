import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Check, Calendar, Mail, Phone, Sparkles, Megaphone, BarChart3, Video, Palette } from "lucide-react";
import { useEffect } from "react";

const services = [
  { icon: Megaphone, title: "Meta & Google Ads Management", desc: "Performance-driven paid campaigns built around ROAS, not vanity metrics." },
  { icon: BarChart3, title: "Full-Funnel Strategy", desc: "Awareness → consideration → conversion. Mapped to your business goals." },
  { icon: Video, title: "Video Production & Reels", desc: "Short-form content engineered for stopping the scroll on TikTok, IG & YouTube." },
  { icon: Palette, title: "Brand & Creative Direction", desc: "Design systems, social templates, and campaign creative that converts." },
];

const tiers = [
  {
    name: "Starter",
    price: "KES 45,000",
    period: "/ month",
    tagline: "For small businesses getting serious about growth.",
    features: [
      "2 platforms managed (IG + TikTok or FB + IG)",
      "12 posts + 8 reels / month",
      "Basic Meta Ads (up to KES 50K ad spend)",
      "Monthly performance report",
    ],
  },
  {
    name: "Growth",
    price: "KES 95,000",
    period: "/ month",
    tagline: "Most popular — for brands ready to scale.",
    highlight: true,
    features: [
      "3 platforms fully managed",
      "20 posts + 16 reels / month",
      "Meta + Google Ads (up to KES 200K ad spend)",
      "Bi-weekly strategy calls",
      "Custom creative direction",
    ],
  },
  {
    name: "Scale",
    price: "Custom",
    period: "",
    tagline: "For established brands & agencies.",
    features: [
      "Unlimited platforms",
      "Dedicated content production",
      "Full-funnel paid media (KES 500K+ spend)",
      "Weekly reporting & strategy",
      "Priority WhatsApp support",
    ],
  },
];

const Agency = () => {
  useEffect(() => {
    document.title = "Work With Me — Agency Services | Joseph Maina";
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to portfolio
          </Link>
          <Button asChild size="sm">
            <a href="#book">Book a call</a>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 md:py-24">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <Sparkles className="h-3 w-3" /> Agency Services
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-bold tracking-tight">
            Grow your brand with <span className="text-gradient">data-driven</span> digital marketing.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Full-service social media management, paid ads, and creative production for Kenyan brands ready to scale.
          </p>
        </section>

        {/* Services */}
        <section className="mt-24">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">What I do for clients</h2>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {services.map((s) => (
              <Card key={s.title} className="p-6 border-border/60 hover:border-primary/40 transition-colors">
                <s.icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-display text-xl font-semibold mb-2">{s.title}</h3>
                <p className="text-muted-foreground text-sm">{s.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="mt-24">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-3">Simple, transparent pricing</h2>
          <p className="text-center text-muted-foreground mb-12">Retainers built around outcomes, not deliverables.</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((t) => (
              <Card
                key={t.name}
                className={`p-8 flex flex-col ${t.highlight ? "border-primary shadow-elegant scale-[1.02]" : "border-border/60"}`}
              >
                {t.highlight && (
                  <div className="inline-block px-2 py-1 rounded bg-gradient-orange text-white text-xs font-medium mb-3 w-fit">
                    Most Popular
                  </div>
                )}
                <h3 className="font-display text-2xl font-bold">{t.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{t.tagline}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold">{t.price}</span>
                  <span className="text-muted-foreground text-sm">{t.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={t.highlight ? "default" : "outline"} asChild>
                  <a href="#book">Get started</a>
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Booking */}
        <section id="book" className="mt-24 max-w-2xl mx-auto">
          <Card className="p-8 md:p-12 text-center border-primary/30">
            <Calendar className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Book a discovery call</h2>
            <p className="text-muted-foreground mb-8">
              Free 30-minute call to understand your brand, goals, and whether we're a good fit.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <a href="https://wa.me/254700000000" target="_blank" rel="noopener noreferrer">
                  <Phone className="mr-2 h-5 w-5" /> WhatsApp Me
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="mailto:hello@josephmaina.co.ke">
                  <Mail className="mr-2 h-5 w-5" /> Email Me
                </a>
              </Button>
            </div>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Joseph Maina · <Link to="/" className="hover:text-foreground">Back to portfolio</Link>
      </footer>
    </div>
  );
};

export default Agency;
