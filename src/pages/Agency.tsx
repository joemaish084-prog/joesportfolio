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
import { supabase } from "@/integrations/supabase/client";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Stepper } from "@/components/ui/stepper";
import { useRef } from "react";
import { Helmet } from "react-helmet-async";
import {
  ArrowLeft, Calendar, Phone, MessageCircle, Loader2, Check, Target, ShieldCheck, MapPin, Zap,
  CalendarDays, ClipboardList, PenLine, Rocket, BarChart3, CreditCard, Building2, Receipt, Star,
  Video, Search, Lightbulb, Send, ArrowRight, Share2, FileText, Palette, MessageSquare, Menu, X,
} from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";
import { BrandsLogoMarquee } from "@/components/BrandsLogoMarquee";
import { trackConversion } from "@/lib/analytics";

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

const singlePlatform = [
  {
    icon: Target,
    name: "Meta Ads Management",
    price: "From KES 40,000/month",
    features: ["Campaign strategy and setup", "Audience research", "Creative direction", "Weekly optimization", "Monthly reporting"],
  },
  {
    icon: Search,
    name: "Google Ads Management",
    price: "From KES 45,000/month",
    features: ["Search, Display and YouTube campaigns", "Keyword research and strategy", "Bid management", "Conversion tracking", "Monthly reporting"],
  },
  {
    icon: Video,
    name: "TikTok Ads Management",
    price: "From KES 40,000/month",
    features: ["Campaign strategy", "Creative direction", "Audience targeting", "Weekly optimization", "Performance reporting"],
  },
];

const retainerPackages = [
  {
    name: "STARTER",
    label: "For small businesses",
    price: "From KES 40,000/month",
    note: "Ad spend under KES 50,000/month",
    features: ["1 platform managed", "Campaign setup and strategy", "Audience research", "Monthly reporting", "Email support"],
  },
  {
    name: "GROWTH",
    label: "Most popular",
    highlight: true,
    price: "From KES 70,000/month",
    note: "Ad spend KES 50,000 - 200,000/month",
    features: ["2 platforms managed", "Full campaign management", "Creative direction", "Weekly optimization", "Bi-weekly reporting", "WhatsApp support"],
  },
  {
    name: "SCALE",
    label: "For established brands",
    price: "From KES 120,000/month",
    note: "Ad spend KES 200,000+/month",
    features: ["All platforms managed", "Full performance marketing", "Dedicated strategy sessions", "Daily monitoring", "Weekly reporting", "Priority WhatsApp support", "Quarterly strategy review"],
  },
];

const supportingServices = [
  { icon: Share2, name: "Social Media Management", price: "from KES 40,000/mo", desc: "Content, scheduling and community management." },
  { icon: Search, name: "SEO Optimization", price: "from KES 45,000/mo", desc: "On-page, technical and local SEO." },
  { icon: FileText, name: "Content Strategy", price: "from KES 45,000/mo", desc: "Editorial calendars and content plans." },
  { icon: Video, name: "Video Production", price: "from KES 40,000/project", desc: "Short-form ads and brand videos." },
  { icon: Lightbulb, name: "Brand Strategy", price: "from KES 60,000", desc: "Positioning, messaging and identity." },
  { icon: Palette, name: "Graphic Design", price: "from KES 40,000/mo", desc: "Social graphics, ads and collateral." },
  { icon: ClipboardList, name: "Digital Marketing Audit", price: "KES 40,000", desc: "Full-channel performance review." },
  { icon: MessageSquare, name: "Strategy Consultation", price: "KES 40,000/session", desc: "One-on-one advisory session." },
];

const serviceOptions = [
  "Meta Ads Management",
  "Google Ads Management",
  "TikTok Ads Management",
  "Starter Retainer",
  "Growth Retainer",
  "Scale Retainer",
  "Social Media Management",
  "SEO Optimization",
  "Content Strategy",
  "Video Production",
  "Brand Strategy",
  "Graphic Design",
  "Digital Marketing Audit",
  "Strategy Consultation",
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

function HeroProofPanel({ mouseX, mouseY }: { mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const rotateX = useSpring(useTransform(mouseY, (v) => v * -5), { damping: 25, stiffness: 150 });
  const rotateY = useSpring(useTransform(mouseX, (v) => v * 5), { damping: 25, stiffness: 150 });

  return (
    <div className="relative mx-auto w-full max-w-sm" style={{ perspective: 1200 }}>
      <div
        aria-hidden
        className="absolute -top-10 -right-6 font-serif italic text-[10rem] leading-none text-primary/10 select-none pointer-events-none"
      >
        &rdquo;
      </div>

      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="relative z-10 rounded-2xl border border-border/60 bg-card/70 backdrop-blur-2xl p-8 sm:p-10 shadow-2xl"
      >
        <div className="relative flex items-center gap-2 mb-7">
          <span className="h-px w-6 bg-primary" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Trusted by brands across Kenya</span>
        </div>

        <div className="relative space-y-5">
          {stats.map((s, i) => (
            <div key={s.label} className={i > 0 ? "pt-5 border-t border-border/60" : ""}>
              <p className="text-4xl font-display font-bold text-foreground tracking-tight">
                <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

const scrollTo = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const Agency = () => {
  const { toast } = useToast();
  const [form, setForm] = useState<{ name: string; email: string; phone: string; brand: string; service: string; budget: string; goals: string; source: string | null }>({ name: "", email: "", phone: "", brand: "", service: "", budget: "", goals: "", source: null });
  const [sending, setSending] = useState(false);
  const [howStep, setHowStep] = useState(0);
  const [briefStep, setBriefStep] = useState(0);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const heroMouseX = useMotionValue(0);
  const heroMouseY = useMotionValue(0);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    heroMouseX.set((e.clientX - (rect.left + rect.width / 2)) / rect.width);
    heroMouseY.set((e.clientY - (rect.top + rect.height / 2)) / rect.height);
    heroRef.current.style.setProperty("--spot-x", `${((e.clientX - rect.left) / rect.width) * 100}%`);
    heroRef.current.style.setProperty("--spot-y", `${((e.clientY - rect.top) / rect.height) * 100}%`);
  };

  const handleHeroMouseLeave = () => {
    heroMouseX.set(0);
    heroMouseY.set(0);
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("source") || params.get("utm_source");
    if (source) setForm((f) => ({ ...f, source }));
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileNavOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileNavOpen]);

  const scrollToAndClose = (id: string) => {
    setMobileNavOpen(false);
    window.setTimeout(() => scrollTo(id), 250);
  };

  const submitBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.brand.trim() || !form.service || !form.budget || !form.goals.trim()) {
      toast({ title: "Please complete all fields", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("agency_leads").insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        business_name: form.brand,
        service_interest: form.service,
        budget_range: form.budget,
        goals: form.goals,
        source: form.source,
      });
      if (error) throw error;
      try {
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
          from_name: form.name,
          from_email: form.email,
          message: `New Agency Brief\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone || "—"}\nBrand: ${form.brand}\nService: ${form.service}\nBudget: ${form.budget}\n\nGoals:\n${form.goals}`,
          to_name: "Joseph Maina",
        }, EMAILJS_PUBLIC_KEY);
      } catch (emailErr) {
        console.error("EmailJS send failed (lead already saved):", emailErr);
      }
      toast({ title: "Brief sent", description: "I'll reply within 24 hours." });
      trackConversion("Lead");
      setForm({ ...form, name: "", email: "", phone: "", brand: "", service: "", budget: "", goals: "" });
      setBriefStep(0);
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
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <ArrowLeft className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">Back to Portfolio</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link to="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <button onClick={() => scrollTo("services")} className="text-muted-foreground hover:text-foreground">Services</button>
            <button onClick={() => scrollTo("how")} className="text-muted-foreground hover:text-foreground">Process</button>
            <button onClick={() => scrollTo("results")} className="text-muted-foreground hover:text-foreground">Results</button>
            <Link to="/agency/blog" className="text-muted-foreground hover:text-foreground">Blog</Link>
            <span className="text-primary font-semibold">Work With Me</span>
          </nav>
          <div className="flex items-center gap-1 shrink-0">
            <Button size="sm" onClick={() => scrollTo("booking")}>Book Call</Button>
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open menu"
              aria-expanded={mobileNavOpen}
              aria-controls="agency-mobile-nav"
              className="md:hidden h-11 w-11 -mr-2 rounded-full text-foreground inline-flex items-center justify-center shrink-0"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileNavOpen && (
          <motion.div
            id="agency-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            className="fixed inset-0 z-[100] bg-background md:hidden overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.26, ease: "easeOut" }}
          >
            <div className="h-14 px-4 flex items-center justify-between border-b border-border/40">
              <span className="text-sm font-medium text-foreground">Menu</span>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                aria-label="Close menu"
                className="h-11 w-11 -mr-2 rounded-full text-foreground inline-flex items-center justify-center"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="px-4 pt-4 pb-10 flex flex-col">
              <Link
                to="/"
                onClick={() => setMobileNavOpen(false)}
                className="py-3 min-h-[44px] text-2xl font-display font-semibold text-foreground"
              >
                Home
              </Link>
              <button
                onClick={() => scrollToAndClose("services")}
                className="py-3 min-h-[44px] text-left text-2xl font-display font-semibold text-foreground"
              >
                Services
              </button>
              <button
                onClick={() => scrollToAndClose("how")}
                className="py-3 min-h-[44px] text-left text-2xl font-display font-semibold text-foreground"
              >
                Process
              </button>
              <button
                onClick={() => scrollToAndClose("results")}
                className="py-3 min-h-[44px] text-left text-2xl font-display font-semibold text-foreground"
              >
                Results
              </button>
              <Link
                to="/agency/blog"
                onClick={() => setMobileNavOpen(false)}
                className="py-3 min-h-[44px] text-2xl font-display font-semibold text-foreground"
              >
                Blog
              </Link>

              <div className="border-t border-border my-4" />

              <Button
                className="w-full rounded-full"
                onClick={() => scrollToAndClose("booking")}
              >
                Book Call
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* HERO */}
        <section
          ref={heroRef}
          onMouseMove={handleHeroMouseMove}
          onMouseLeave={handleHeroMouseLeave}
          className="relative w-full overflow-hidden bg-background"
        >
          {/* Editorial background — theme-aware, so it never fights the site's light/dark mode */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-15%] right-[0%] w-[36rem] h-[36rem] rounded-full bg-primary/[0.07] blur-[130px] animate-drift-a" />
            <div className="absolute bottom-[-20%] left-[-5%] w-[30rem] h-[30rem] rounded-full bg-primary/[0.05] blur-[140px] animate-drift-b" />
          </div>
          <div className="absolute inset-0 z-[1] dot-grid pointer-events-none [mask-image:radial-gradient(ellipse_90%_70%_at_50%_0%,black_40%,transparent_100%)]" />
          <div className="absolute inset-0 z-[1] hero-spotlight opacity-60 pointer-events-none transition-[background] duration-300" />

          <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto pt-20 md:pt-28 pb-20 md:pb-28">
            <div className="text-left">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45 }}
                className="flex items-center gap-3 mb-7"
              >
                <span className="h-px w-8 bg-primary" />
                <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-medium">Digital Marketing Agency</span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className="text-4xl sm:text-5xl lg:text-[3.75rem] font-display font-semibold tracking-tight text-foreground max-w-xl leading-[1.08]"
              >
                Grow your brand with{" "}
                <span className="font-serif italic font-normal text-primary">data-driven</span> marketing
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.22, duration: 0.5 }}
                className="mt-6 text-lg text-muted-foreground max-w-md"
              >
                From Meta Ads to full digital strategy — I help Kenyan brands get real results online. No fluff, just growth.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.34, duration: 0.5 }}
                className="mt-10 flex flex-col sm:flex-row gap-4"
              >
                <Button size="lg" className="w-full sm:w-auto rounded-full" asChild>
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                    <Calendar className="mr-2 h-5 w-5" /> Book Free Discovery Call
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full" onClick={() => scrollTo("services")}>
                  View Pricing
                </Button>
              </motion.div>
            </div>

            <div className="hidden lg:block">
              <HeroProofPanel mouseX={heroMouseX} mouseY={heroMouseY} />
            </div>
          </div>
        </section>

        <BrandsLogoMarquee />

        {/* WHY */}
        <section className="container mx-auto px-4 py-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">
            Why Brands Choose <span className="text-gradient">Joseph Maina</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {whyCards.map((c, i) => (
              <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="p-6 h-full hover:border-primary/40 transition-colors">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-110"><c.icon className="h-6 w-6 text-primary" aria-hidden /></div>
                  <h3 className="font-display text-lg font-semibold mb-2">{c.title}</h3>
                  <p className="text-sm text-muted-foreground">{c.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SERVICES / PRICING */}
        <section id="services" className="container mx-auto px-4 py-20 scroll-mt-20">
          {/* Positioning */}
          <div className="text-center mb-16 space-y-4">
            <SectionLabel>PERFORMANCE MARKETING</SectionLabel>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
              Performance Marketing for <span className="text-gradient">Kenyan Businesses</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              I help businesses generate more leads and sales through Meta, Google and TikTok Ads.
            </p>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Management fees are separate from your advertising budget.
            </p>
          </div>

          {/* Single Platform — 60% visual weight */}
          <div className="mb-20">
            <h3 className="text-xl font-display font-semibold text-center mb-8">Single Platform</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {singlePlatform.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="corner-brackets surface-card p-7 flex flex-col hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="h-14 w-14 bg-gradient-orange flex items-center justify-center mb-5 shadow-[var(--shadow-orange-glow)]">
                      <Icon className="h-7 w-7 text-white" aria-hidden />
                    </div>
                    <h3 className="text-2xl font-display font-semibold mb-2">{s.name}</h3>
                    <p className="text-3xl font-display font-bold text-gradient mb-5">{s.price}</p>
                    <ul className="space-y-3 mb-7 flex-1">
                      {s.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="outline" className="w-full" onClick={() => scrollTo("booking")}>
                      Get Custom Quote
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Retainer Packages — 60% visual weight */}
          <div className="mb-20">
            <h3 className="text-xl font-display font-semibold text-center mb-8">Retainer Packages</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {retainerPackages.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className={`corner-brackets surface-card p-7 flex flex-col relative hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 ${p.highlight ? "border-primary/60 shadow-elegant" : ""}`}
                >
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-orange text-white text-xs font-bold uppercase tracking-wide whitespace-nowrap">
                      {p.label}
                    </div>
                  )}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-display font-bold">{p.name}</h3>
                    {!p.highlight && (
                      <span className="text-xs font-medium px-2 py-1 bg-muted text-muted-foreground">{p.label}</span>
                    )}
                  </div>
                  <p className="text-3xl font-display font-bold text-gradient mb-1">{p.price}</p>
                  <p className="text-sm text-muted-foreground mb-6">{p.note}</p>
                  <ul className="space-y-3 mb-7 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className={p.highlight ? "w-full" : "w-full variant-outline"} variant={p.highlight ? "default" : "outline"} onClick={() => scrollTo("booking")}>
                    Get Custom Quote
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Supporting Services — 40% visual weight */}
          <div className="mb-20">
            <div className="text-center mb-10 space-y-3">
              <SectionLabel>ALSO AVAILABLE</SectionLabel>
              <h3 className="text-xl font-display font-semibold">Supporting Services</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
              {supportingServices.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="corner-brackets surface-card p-5 flex flex-col hover:border-primary/40 transition-all duration-300"
                  >
                    <div className="h-10 w-10 bg-gradient-orange flex items-center justify-center mb-3 shadow-[var(--shadow-orange-glow)]">
                      <Icon className="h-5 w-5 text-white" aria-hidden />
                    </div>
                    <h4 className="font-display font-semibold mb-1">{s.name}</h4>
                    <p className="text-sm font-bold text-gradient mb-2">{s.price}</p>
                    <p className="text-xs text-muted-foreground flex-1 mb-4">{s.desc}</p>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => scrollTo("booking")}>
                      Get Custom Quote
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Closing CTA */}
          <div className="text-center max-w-2xl mx-auto space-y-6">
            <p className="text-lg text-muted-foreground">
              Not sure which package fits? Book a free 30-minute strategy call and I'll recommend the right plan for your business and budget.
            </p>
            <Button size="lg" asChild>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                <Calendar className="mr-2 h-5 w-5" /> Book Free Strategy Call
              </a>
            </Button>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="how" className="container mx-auto px-4 py-20 scroll-mt-20">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-4">Working Together Is Simple</h2>
          <p className="text-center text-sm text-muted-foreground mb-10">Click a step to see what happens</p>
          <div className="max-w-3xl mx-auto mb-10">
            <Stepper steps={steps.map((s) => s.title)} currentStep={howStep} onStepClick={setHowStep} />
          </div>
          <div className="max-w-2xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div key={howStep} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
                <Card className="p-8 text-center border-border/60">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-primary/20">
                    {(() => { const Icon = steps[howStep].icon; return <Icon className="h-6 w-6 text-primary" aria-hidden />; })()}
                  </div>
                  <h3 className="font-display text-xl font-semibold mb-2">{steps[howStep].title}</h3>
                  <p className="text-sm text-muted-foreground">{steps[howStep].desc}</p>
                </Card>
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setHowStep((s) => Math.max(0, s - 1))} disabled={howStep === 0}>Back</Button>
              <Button onClick={() => setHowStep((s) => Math.min(steps.length - 1, s + 1))} disabled={howStep === steps.length - 1}>Next</Button>
            </div>
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
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackConversion("Contact")}>
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
                <h3 className="font-display text-xl font-semibold mb-5">Send Brief Directly</h3>
                <Stepper steps={["Contact", "Business", "Goals"]} currentStep={briefStep} onStepClick={(i) => i < briefStep && setBriefStep(i)} className="mb-6" />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (briefStep === 0) {
                      if (!form.name.trim() || !form.email.trim()) {
                        toast({ title: "Please fill in your name and email", variant: "destructive" });
                        return;
                      }
                      setBriefStep(1);
                    } else if (briefStep === 1) {
                      if (!form.brand.trim() || !form.service || !form.budget) {
                        toast({ title: "Please complete these fields", variant: "destructive" });
                        return;
                      }
                      setBriefStep(2);
                    } else {
                      submitBrief(e);
                    }
                  }}
                  className="space-y-3"
                >
                  <AnimatePresence mode="wait">
                    {briefStep === 0 && (
                      <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-3">
                        <div>
                          <Label htmlFor="b-name">Name</Label>
                          <Input id="b-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="b-email">Email</Label>
                          <Input id="b-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                        </div>
                        <div>
                          <Label htmlFor="b-phone">Phone (optional)</Label>
                          <Input id="b-phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                        </div>
                      </motion.div>
                    )}
                    {briefStep === 1 && (
                      <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-3">
                        <div>
                          <Label htmlFor="b-brand">Brand name</Label>
                          <Input id="b-brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
                        </div>
                        <div>
                          <Label>Service interested in</Label>
                          <Select value={form.service} onValueChange={(v) => setForm({ ...form, service: v })}>
                            <SelectTrigger><SelectValue placeholder="Select a service" /></SelectTrigger>
                            <SelectContent>
                              {serviceOptions.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
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
                      </motion.div>
                    )}
                    {briefStep === 2 && (
                      <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }} className="space-y-3">
                        <div>
                          <Label htmlFor="b-goals">Brief description of goals</Label>
                          <Textarea id="b-goals" rows={3} value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex gap-3 pt-1">
                    {briefStep > 0 && (
                      <Button type="button" variant="outline" className="flex-1" onClick={() => setBriefStep((s) => s - 1)}>Back</Button>
                    )}
                    <Button type="submit" className="flex-1" disabled={sending}>
                      {briefStep < 2 ? "Next" : sending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : "Send Brief"}
                    </Button>
                  </div>
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
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3 ring-1 ring-primary/20"><p.icon className="h-6 w-6 text-primary" aria-hidden /></div>
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
        <Link to="/agency/blog" className="hover:text-foreground">Blog</Link>
        <span>·</span>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-foreground" target="_blank" rel="noopener noreferrer" onClick={() => trackConversion("Contact")}>WhatsApp</a>
      </footer>
    </div>
  );
};

export default Agency;
