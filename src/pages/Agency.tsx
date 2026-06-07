import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import emailjs from "@emailjs/browser";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Calendar, Phone, MessageCircle, Loader2, Check, Target, ShieldCheck, MapPin, Zap,
  CalendarDays, ClipboardList, PenLine, Rocket, BarChart3, CreditCard, Building2, Receipt, Star,
  Smartphone, Video, Search, TrendingUp, Lightbulb, Send, ArrowRight, Sparkles,
} from "lucide-react";

const EMAILJS_SERVICE_ID = "service_ae81bbn";
const EMAILJS_TEMPLATE_ID = "template_rnofd4m";
const EMAILJS_PUBLIC_KEY = "2H5maWozuCEEd6vtl";

const CALENDLY_URL = "https://calendly.com/joemaish084/30min";
const WHATSAPP_NUMBER = "254704700160";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi Joseph! I visited josephmaina.co.ke/agency and I'd like to discuss working together."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const stats = [
  { value: 500, prefix: "KES ", suffix: "K+", label: "Ad budgets managed" },
  { value: 20, prefix: "", suffix: "+", label: "Campaigns launched" },
  { value: 3, prefix: "", suffix: "+", label: "Years experience" },
];

const whyCards = [
  { icon: Target, title: "Results You Can Measure", desc: "Every campaign tracked with clear KPIs — reach, leads, conversions and ROI. No vanity metrics." },
  { icon: ShieldCheck, title: "Your Budget Is Sacred", desc: "I treat every shilling like my own. Zero wasteful spending, maximum return on every campaign." },
  { icon: MapPin, title: "Kenya Market Expert", desc: "Deep understanding of Kenyan consumer behavior, peak seasons and what actually converts locally." },
  { icon: Zap, title: "Fast & Transparent", desc: "Weekly updates, monthly reports and always available on WhatsApp. No chasing, no guessing." },
];

const services = [
  { icon: Smartphone, name: "Social Media Management", price: "From KES 15,000/mo", features: ["2 platforms managed", "12 posts per month", "Community management", "Monthly performance report"], cta: "Get Started" },
  { icon: BarChart3, name: "Meta Ads Management", price: "From KES 20,000/mo", features: ["Facebook & Instagram ads", "Audience research", "Ad creative strategy", "Weekly optimization", "Bi-weekly reports"], cta: "Get Started" },
  { icon: Video, name: "TikTok Ads Management", price: "From KES 15,000/mo", features: ["TikTok campaign setup", "Creative direction", "Audience targeting", "Weekly optimization", "Performance reports"], cta: "Get Started" },
  { icon: Search, name: "Google Ads Management", price: "From KES 20,000/mo", features: ["Search & Display campaigns", "Keyword research", "Bid management", "Conversion tracking", "Monthly reports"], cta: "Get Started" },
  { icon: TrendingUp, name: "Media Buying", price: "From KES 50,000/mo", features: ["Multi-platform ad buying", "KES 500K+ budgets managed", "Full funnel strategy", "Weekly reporting", "ROAS optimization"], cta: "Let's Talk" },
  { icon: Target, name: "Full Digital Package", price: "From KES 65,000/mo", badge: "Most Popular", features: ["Everything in all packages", "Brand strategy", "Content creation", "SEO optimization", "Priority support"], cta: "Get Started", highlight: true },
  { icon: Lightbulb, name: "Strategy Consultation", price: "KES 3,500 per session", features: ["60-minute strategy call", "Digital audit of your brand", "Custom recommendations", "Action plan document", "1 week email support"], cta: "Book Session" },
];

const steps = [
  { icon: CalendarDays, title: "Discovery Call", desc: "Free 30-minute call to understand your brand, goals and budget." },
  { icon: ClipboardList, title: "Custom Proposal", desc: "I send a tailored proposal within 24 hours — services, pricing and timeline." },
  { icon: PenLine, title: "Agreement & Deposit", desc: "We agree on terms. 50% deposit paid via M-Pesa to kick things off." },
  { icon: Rocket, title: "We Launch", desc: "Campaigns go live. You get access to your client portal for real-time updates." },
  { icon: BarChart3, title: "Report & Grow", desc: "Weekly updates and monthly reports. We optimize, scale and keep growing." },
];

const caseStudies = [
  { name: "Convey Communications", challenge: "Low organic reach and stagnant lead flow across digital channels.", results: "10x increase in qualified leads, 300%+ engagement growth across IG & TikTok in 6 months.", services: ["Meta Ads", "TikTok Strategy", "Content Production"] },
  { name: "iClear Kenya", challenge: "Limited brand awareness in a saturated FMCG market.", results: "KES 1.2M+ ad spend managed at 4.2x ROAS, +180% follower growth.", services: ["Google Ads", "Social Media Management", "Creative Direction"] },
  { name: "Nyeri County Campaign", challenge: "Reaching a hyper-local audience with limited budget.", results: "500K+ video views, 22 community events filled to capacity.", services: ["Video Production", "Meta Ads", "Local SEO"] },
];

const payments = [
  { icon: CreditCard, title: "M-Pesa", desc: "Pay instantly via M-Pesa STK push. Paybill or Till number provided on invoice." },
  { icon: Building2, title: "Bank Transfer", desc: "Direct bank transfer for larger retainers. Details on invoice." },
  { icon: Receipt, title: "Invoice & Receipt", desc: "Professional invoice sent within 1 hour of booking confirmation. Receipt on payment." },
];

const faqs = [
  { q: "Do you require long-term contracts?", a: "No lock-in contracts. I work on monthly retainers with 30-day notice to end services. I believe in earning your business every month." },
  { q: "How quickly can we get started?", a: "After the discovery call and proposal acceptance — we can launch within 3-5 business days." },
  { q: "Do I provide the ad budget separately?", a: "Yes. My fee covers management only. Ad spend goes directly to Meta/Google/TikTok. This keeps everything transparent." },
  { q: "What reports will I receive?", a: "Weekly performance updates via WhatsApp and detailed monthly reports delivered to your email and client portal." },
  { q: "Can I see my campaign performance anytime?", a: "Yes — your client portal gives you 24/7 access to your campaign status, reports and files." },
  { q: "What makes you different from an agency?", a: "Direct access to the person doing the work — not an account manager passing messages. Faster decisions, personal attention, better results." },
];

function CountUp({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.floor(p * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{prefix}{n}{suffix}</span>;
}

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Agency = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", brand: "", service: "", budget: "", goals: "" });
  const [sending, setSending] = useState(false);


  const submitBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.brand.trim() || !form.service || !form.budget || !form.goals.trim()) {
      toast({ title: "Please complete all fields", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: form.name,
        from_email: "agency-brief@josephmaina.co.ke",
        message: `New Agency Brief\n\nName: ${form.name}\nBrand: ${form.brand}\nService: ${form.service}\nBudget: ${form.budget}\n\nGoals:\n${form.goals}`,
        to_name: "Joseph Maina",
      }, EMAILJS_PUBLIC_KEY);
      toast({ title: "Brief sent", description: "I'll reply within 24 hours." });
      setForm({ name: "", brand: "", service: "", budget: "", goals: "" });
    } catch (err) {
      console.error(err);
      toast({ title: "Couldn't send", description: "Please WhatsApp me directly.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Digital Marketing Services Nairobi | Joseph Maina Agency</title>
        <meta name="description" content="Professional digital marketing services in Nairobi, Kenya. Meta Ads, Google Ads, TikTok Ads, SEO & Media Buying from KES 15,000/mo. Book a free discovery call today." />
        <link rel="canonical" href="https://www.josephmaina.co.ke/agency" />
        <meta property="og:title" content="Joseph Maina | Digital Marketing Agency Nairobi" />
        <meta property="og:url" content="https://www.josephmaina.co.ke/agency" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://www.josephmaina.co.ke/agency#localbusiness",
          name: "Joseph Maina — Digital Marketing Agency",
          image: "https://www.josephmaina.co.ke/og-image.jpg",
          url: "https://www.josephmaina.co.ke/agency",
          telephone: "+254704700160",
          priceRange: "KES",
          address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
          areaServed: "Kenya",
          sameAs: [
            "https://www.linkedin.com/in/joseph-isaac-m-33a9a611b/",
            "https://www.instagram.com/m_k_ush_/",
          ],
        })}</script>
      </Helmet>
      {/* Navbar */}
      <header className="border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Portfolio
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <button onClick={() => scrollTo("services")} className="text-muted-foreground hover:text-foreground">Services</button>
            <button onClick={() => scrollTo("how")} className="text-muted-foreground hover:text-foreground">Process</button>
            <button onClick={() => scrollTo("results")} className="text-muted-foreground hover:text-foreground">Results</button>
            <span className="text-primary font-semibold">Work With Me</span>
          </nav>
          <Button size="sm" onClick={() => scrollTo("booking")}>Book Call</Button>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="container mx-auto px-4 pt-16 md:pt-24 pb-12 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-4 w-4" aria-hidden /> Digital Marketing Agency
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight max-w-4xl mx-auto">
              Grow Your Brand With <span className="text-gradient">Data-Driven</span> Marketing
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              From Meta Ads to full digital strategy — I help Kenyan brands get real results online. No fluff, just growth.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                  <Calendar className="mr-2 h-5 w-5" /> Book Free Discovery Call
                </a>
              </Button>
              <Button size="lg" variant="outline" onClick={() => scrollTo("services")}>View Pricing</Button>
            </div>
          </motion.div>

          {/* Trust bar */}
          <div className="mt-16">
            <p className="text-sm uppercase tracking-wider text-muted-foreground mb-6">Trusted by brands across Nairobi, Kenya</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {stats.map((s) => (
                <div key={s.label} className="p-6 rounded-xl border border-border/60 bg-card">
                  <div className="text-3xl md:text-4xl font-bold text-gradient">
                    <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* WHY */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            Why Brands Choose <span className="text-gradient">Joseph Maina</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {whyCards.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="p-6 h-full hover:border-primary/40 transition-colors">
                  <div className="text-3xl mb-3">{c.emoji}</div>
                  <h3 className="font-display text-lg font-semibold mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SERVICES */}
        <section id="services" className="container mx-auto px-4 py-20 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Services & Pricing</h2>
            <p className="text-muted-foreground">Transparent pricing — no hidden fees, no surprises</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((s) => (
              <Card key={s.name} className={`p-6 flex flex-col relative ${s.highlight ? "border-primary shadow-elegant" : "border-border/60"}`}>
                {s.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-orange text-white text-xs font-medium whitespace-nowrap">
                    {s.badge}
                  </div>
                )}
                <div className="text-3xl mb-3">{s.emoji}</div>
                <h3 className="font-display text-xl font-semibold">{s.name}</h3>
                <div className="text-2xl font-bold text-gradient mt-2 mb-4">{s.price}</div>
                <ul className="space-y-2 mb-6 flex-1">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button variant={s.highlight ? "default" : "outline"} onClick={() => scrollTo("booking")}>{s.cta}</Button>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">Need something custom? Every brand is different.</p>
            <Button size="lg" asChild>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" /> Let's Build Your Package
              </a>
            </Button>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="container mx-auto px-4 py-20 scroll-mt-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">Working Together Is Simple</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {steps.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative">
                <Card className="p-5 h-full text-center border-border/60">
                  <div className="w-10 h-10 rounded-full bg-gradient-orange text-white font-bold flex items-center justify-center mx-auto mb-3">{i + 1}</div>
                  <div className="text-2xl mb-2">{s.emoji}</div>
                  <h3 className="font-display font-semibold mb-2">{s.title}</h3>
                  <p className="text-xs text-muted-foreground">{s.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* RESULTS */}
        <section id="results" className="container mx-auto px-4 py-20 scroll-mt-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">Real Results for Real Brands</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {caseStudies.map((c) => (
              <Card key={c.name} className="p-6 flex flex-col">
                <h3 className="font-display text-xl font-bold mb-3">{c.name}</h3>
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Challenge</div>
                  <p className="text-sm">{c.challenge}</p>
                </div>
                <div className="mb-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Results</div>
                  <p className="text-sm font-medium text-gradient">{c.results}</p>
                </div>
                <div className="mt-auto">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Services</div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.services.map((sv) => (
                      <span key={sv} className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">{sv}</span>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/#case-study">See All Case Studies</Link>
            </Button>
          </div>
        </section>

        {/* BOOKING */}
        <section id="booking" className="container mx-auto px-4 py-20 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">Ready to Grow Your Brand?</h2>
            <p className="text-muted-foreground">Book a free 30-minute discovery call — no commitment, just a conversation.</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {/* Calendly */}
            <Card className="p-6 border-primary/30">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-5 w-5 text-primary" />
                <h3 className="font-display text-xl font-semibold">Book Discovery Call</h3>
              </div>
              <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30" style={{ minHeight: 480 }}>
                <iframe
                  src={CALENDLY_URL}
                  title="Book a discovery call with Joseph Maina"
                  className="w-full"
                  style={{ minHeight: 480, border: 0 }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Widget not loading? <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline">Open Calendly in a new tab</a>
              </p>
            </Card>

            {/* WhatsApp + Brief */}
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <MessageCircle className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold">Chat on WhatsApp</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Prefer WhatsApp? Let's talk there.</p>
                <Button asChild className="w-full">
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                    <Phone className="mr-2 h-4 w-4" /> Message me on WhatsApp
                  </a>
                </Button>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="font-display text-xl font-semibold">Schedule a Call</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">Book a free 30-minute discovery call at a time that works for you.</p>
                <Button asChild className="w-full">
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                    <Calendar className="mr-2 h-4 w-4" /> Book on Calendly
                  </a>
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="font-display text-xl font-semibold mb-4">Send Brief Directly</h3>
                <form onSubmit={submitBrief} className="space-y-3">
                  <div>
                    <Label htmlFor="b-name">Name</Label>
                    <Input id="b-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="b-brand">Brand name</Label>
                    <Input id="b-brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                  </div>
                  <div>
                    <Label>Service interested in</Label>
                    <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })}>
                      <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                      <SelectContent>
                        {services.map((s) => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Monthly budget</Label>
                    <Select value={form.budget} onValueChange={(v) => setForm({ ...form, budget: v })}>
                      <SelectTrigger><SelectValue placeholder="Select budget" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="<KES 20,000">Below KES 20,000</SelectItem>
                        <SelectItem value="KES 20,000 - 50,000">KES 20,000 – 50,000</SelectItem>
                        <SelectItem value="KES 50,000 - 100,000">KES 50,000 – 100,000</SelectItem>
                        <SelectItem value="KES 100,000+">KES 100,000+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="b-goals">Brief description of goals</Label>
                    <Textarea id="b-goals" rows={3} value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full" disabled={sending}>
                    {sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : "Send Brief"}
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </section>

        {/* PAYMENTS */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">Simple, Transparent Payments</h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {payments.map((p) => (
              <Card key={p.title} className="p-6 text-center">
                <div className="text-3xl mb-3">{p.emoji}</div>
                <h3 className="font-display text-lg font-semibold mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8 max-w-2xl mx-auto">
            <strong className="text-foreground">Note:</strong> 50% deposit required to begin work. Balance due on agreed milestone dates.
          </p>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">Common Questions</h2>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`f${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* FOOTER CTA */}
        <section className="container mx-auto px-4 pb-20">
          <Card className="max-w-3xl mx-auto p-8 md:p-12 text-center border-primary/40 bg-gradient-to-br from-primary/5 to-transparent">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Star className="h-3 w-3 fill-primary" /> Limited Availability
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-3">2 Client Slots Available This Month</h2>
            <p className="text-muted-foreground mb-6">I take on a limited number of clients to ensure quality and attention to detail.</p>
            <Button size="lg" onClick={() => scrollTo("booking")}>Secure Your Slot</Button>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground space-x-2">
        <span>© {new Date().getFullYear()} Joseph Maina</span>
        <span>·</span>
        <Link to="/" className="hover:text-foreground">Portfolio</Link>
        <span>·</span>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </footer>
    </div>
  );
};

export default Agency;
