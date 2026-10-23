import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { motion, useInView, AnimatePresence, useMotionValue, useSpring, useTransform, MotionConfig, type MotionValue } from "framer-motion";
import type { ReactNode } from "react";
import { Stepper } from "@/components/ui/stepper";
import { useRef } from "react";
import {
  Calendar, Phone, MessageCircle, Loader2, Check, Target, ShieldCheck, MapPin, Zap,
  CalendarDays, ClipboardList, PenLine, Rocket, BarChart3, CreditCard, Building2, Receipt, Star,
  Video, Search, Lightbulb, ArrowRight, Share2, FileText, Palette, MessageSquare, Calculator,
  ChevronRight, Mail, ExternalLink, LayoutGrid, TrendingUp, Tag,
} from "lucide-react";
import { ShineBorder } from "@/components/ui/shine-border";
import { trackSpotlight } from "@/lib/spotlight";
import { SectionLabel } from "@/components/SectionLabel";
import { getLiveServicePages } from "@/data/servicePages";
import { BrandsLogoMarquee } from "@/components/BrandsLogoMarquee";
import { PaidMediaApproachSection } from "@/components/PaidMediaApproachSection";
import { track } from "@/lib/track";
import { Seo } from "@/components/Seo";
import { agencyHead } from "@/seo/agencyHeads";
import { agencyPages, legacyAgencyTarget, type AgencyPageKey } from "@/data/agencyPages";
import { AgencyNavigation, AgencySectionLinks } from "@/components/agency/AgencyNavigation";
import { blogSummaries } from "@/data/blogSummaries";
import { HeroCollage, HeroCollageMobile, FieldworkVisual, CreativeShowcase, CardCover } from "@/components/agency/AgencyVisuals";
import iclearFacebookBanner from "@/assets/design-iclear-facebook.webp";
import iclearFilterPromo from "@/assets/design-iclear-filter-promo.webp";
import iclearDishwashShort from "@/assets/short-iclear-dishwash.webp";
import conveyYoutubeThumb from "@/assets/content-youtube-thumbnail.webp";
import iclearPurifiersCampaign from "@/assets/design-water-purifiers.webp";
import asdspDocumentary from "@/assets/longform-asdsp.webp";

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
    slug: "meta-ads",
    name: "Meta Ads Management",
    price: "From KES 40,000/month",
    image: { src: iclearFacebookBanner, alt: "iClear 'Water is Sweet' Facebook campaign banner", position: "object-[85%_center]" },
    features: ["Campaign strategy and setup", "Audience research", "Creative direction", "Weekly optimization", "Monthly reporting"],
    proof: { label: "Read: what Kenyan SMEs should spend on Meta Ads", to: "/agency/blog/how-much-should-a-kenyan-sme-spend-on-meta-ads" },
    hub: { label: "All Meta Ads guides", to: "/agency/blog/topics/meta-ads" },
  },
  {
    icon: Search,
    slug: "google-ads",
    name: "Google Ads Management",
    price: "From KES 45,000/month",
    image: { src: iclearFilterPromo, alt: "iClear 'Buy standard, get a free filter' display ad", position: "object-[center_20%]" },
    features: ["Search, Display and YouTube campaigns", "Keyword research and strategy", "Bid management", "Conversion tracking", "Monthly reporting"],
    proof: { label: "Read: what Google Ads management costs in Kenya", to: "/agency/blog/google-ads-cost-kenya-2026" },
    hub: { label: "All Google Ads guides", to: "/agency/blog/topics/paid-search" },
  },
  {
    icon: Video,
    slug: "tiktok-ads",
    name: "TikTok Ads Management",
    price: "From KES 40,000/month",
    image: { src: iclearDishwashShort, alt: "Still from an iClear short-form installation video", position: "object-[center_35%]" },
    features: ["Campaign strategy", "Creative direction", "Audience targeting", "Weekly optimization", "Performance reporting"],
    proof: { label: "Case study: 0 to 4 million TikTok views", to: "/agency/blog/0-to-4-million-tiktok-views-behind-the-campaign" },
    hub: { label: "All TikTok & social guides", to: "/agency/blog/topics/tiktok-and-social" },
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

// Every value restates a line from the package's own feature list or note.
const packageComparison = [
  { label: "Monthly ad spend", values: ["Under KES 50,000", "KES 50,000 – 200,000", "KES 200,000+"] },
  { label: "Platforms managed", values: ["1", "2", "All"] },
  { label: "Reporting", values: ["Monthly", "Bi-weekly", "Weekly"] },
  { label: "Support", values: ["Email", "WhatsApp", "Priority WhatsApp"] },
];

const hubIcons = { services: LayoutGrid, results: TrendingUp, pricing: Tag, contact: MessageCircle } as const;

// "From KES 40,000/month" -> qualifier, amount and period, so the amount can lead.
function PriceTag({ price, size = "lg" }: { price: string; size?: "lg" | "sm" }) {
  const [, from, amount, per] = price.match(/^(from\s+)?(.*?)(\/\w+)?$/i) ?? ["", "", price, ""];
  return <p className="font-display leading-tight">
    {from && <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">From</span>}
    <span className={`font-bold text-gradient tabular-nums ${size === "lg" ? "text-3xl sm:text-[2.1rem]" : "text-lg"}`}>{amount}</span>
    {per && <span className={`ml-0.5 text-muted-foreground ${size === "lg" ? "text-base" : "text-xs"}`}>{per}</span>}
  </p>;
}

/** Left-aligned heading row used to break up the inner agency pages. */
function SubHeading({ eyebrow, title, children, aside }: { eyebrow?: string; title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return <div className="mb-8 flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div className="max-w-2xl">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {children && <p className="mt-2 text-sm text-muted-foreground sm:text-base">{children}</p>}
    </div>
    {aside}
  </div>;
}

const supportingServices = [
  { icon: Share2, slug: "social-media-management", name: "Social Media Management", price: "from KES 40,000/mo", desc: "Content, scheduling and community management.", proof: { label: "Read: TikTok vs Instagram for Kenyan brands", to: "/agency/blog/tiktok-vs-instagram-for-kenyan-brands-2026" } },
  { icon: Search, slug: "seo-optimization", name: "SEO Optimization", price: "from KES 45,000/mo", desc: "On-page, technical and local SEO.", proof: { label: "Read: why your Nairobi business isn't on Google", to: "/agency/blog/why-your-nairobi-business-isnt-showing-up-on-google-2026" } },
  { icon: FileText, slug: "content-strategy", name: "Content Strategy", price: "from KES 45,000/mo", desc: "Editorial calendars and content plans.", proof: { label: "Read: my honest take on AI and marketing", to: "/agency/blog/ai-marketing-honest-take-2026" } },
  { icon: Video, slug: "video-production", name: "Video Production", price: "from KES 40,000/project", desc: "Short-form ads and brand videos.", proof: { label: "Read: video ads vs static ads in Kenya", to: "/agency/blog/video-ads-vs-static-ads-kenya-2026" } },
  { icon: Lightbulb, slug: "brand-strategy", name: "Brand Strategy", price: "from KES 60,000", desc: "Positioning, messaging and identity.", proof: { label: "Read: why most Kenyan SMEs fail at marketing", to: "/agency/blog/real-reason-kenyan-smes-fail-at-marketing" } },
  { icon: Palette, slug: "graphic-design", name: "Graphic Design", price: "from KES 40,000/mo", desc: "Social graphics, ads and collateral.", proof: { label: "Read: ad creative testing for Kenyan brands", to: "/agency/blog/ad-creative-testing-kenyan-brands-2026" } },
  { icon: ClipboardList, slug: "digital-marketing-audit", name: "Digital Marketing Audit", price: "Free for now", desc: "Performance review, with findings in a written report or call within 1-2 days.", proof: { label: "Read: what an audit actually finds", to: "/agency/blog/what-a-digital-marketing-audit-finds-kenya-2026" } },
  { icon: MessageSquare, slug: "strategy-consultation", name: "Strategy Consultation", price: "KES 40,000/session", desc: "One-on-one advisory session.", proof: { label: "Read: how to choose an agency in Nairobi", to: "/agency/blog/how-to-choose-a-digital-marketing-agency-nairobi-2026" } },
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
  { name: "Convey Communications", image: conveyYoutubeThumb, imageAlt: "Convey with Caroline podcast YouTube thumbnail", headline: "10x leads", challenge: "Low organic reach and stagnant lead flow across digital channels.", results: "10x increase in qualified leads, 300%+ engagement growth across IG & TikTok in 6 months.", services: ["Meta Ads", "TikTok Strategy", "Content Production"] },
  { name: "iClear Kenya", image: iclearPurifiersCampaign, imageAlt: "iClear water purifiers campaign poster", headline: "4.2x ROAS", challenge: "Limited brand awareness in a saturated FMCG market.", results: "KES 1.2M+ ad spend managed at 4.2x ROAS, +180% follower growth.", services: ["Google Ads", "Social Media Management", "Creative Direction"] },
  { name: "Nyeri County Campaign", image: asdspDocumentary, imageAlt: "ASDSP Programme documentary title card for Nyeri farmers", headline: "500K+ views", challenge: "Reaching a hyper-local audience with limited budget.", results: "500K+ video views, 22 community events filled to capacity.", services: ["Video Production", "Meta Ads", "Local SEO"] },
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
  return <span ref={ref}>{prefix}<span className="agency-counter-animated" aria-hidden="true">{n}</span><span className="agency-counter-static">{value}</span>{suffix}</span>;
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

const Agency = ({ pageKey = "home" }: { pageKey?: AgencyPageKey }) => {
  const page = agencyPages[pageKey];
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [form, setForm] = useState<{ name: string; email: string; phone: string; brand: string; service: string; budget: string; goals: string; source: string | null }>({ name: "", email: "", phone: "", brand: "", service: "", budget: "", goals: "", source: null });
  const [sending, setSending] = useState(false);
  const [briefStep, setBriefStep] = useState(0);
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

  const liveServicePages = getLiveServicePages();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("source") || params.get("utm_source");
    if (source) setForm((f) => ({ ...f, source }));
  }, []);

  useEffect(() => {
    const legacy = pageKey === "home" ? legacyAgencyTarget(location.hash) : undefined;
    if (legacy) {
      const target = new URL(legacy, window.location.origin);
      navigate({ pathname: target.pathname, search: location.search, hash: target.hash }, { replace: true });
      return;
    }
    if (!location.hash) { window.scrollTo(0, 0); return; }
    const frame = requestAnimationFrame(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pageKey, location.pathname, location.hash, location.search, navigate]);

  const submitBrief = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.brand.trim() || !form.service || !form.budget || !form.goals.trim()) {
      toast({ title: "Please complete all fields", variant: "destructive" });
      return;
    }
    setSending(true);
    try {
      const { supabase } = await import("@/integrations/supabase/client");
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
        const { default: emailjs } = await import("@emailjs/browser");
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
      track("generate_lead", { form_location: "agency_brief" });
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
    <MotionConfig reducedMotion="user">
    <div className="agency-page min-h-screen bg-background">
      <Seo {...agencyHead(pageKey)} />
      <AgencyNavigation />

      <main>
        {pageKey !== "home" && <header className="relative overflow-hidden border-b border-border/50">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-primary/[0.07] blur-[120px]" />
            <div className="absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_80%_90%_at_70%_0%,black_30%,transparent_100%)]" />
          </div>
          <div className="relative container mx-auto px-4 pt-10 pb-12 sm:pt-16 sm:pb-16">
            <div className="mx-auto max-w-6xl">
              <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
                <ol className="flex flex-wrap items-center gap-1.5">
                  <li><Link to="/agency" className="hover:text-primary transition-colors">Agency</Link></li>
                  <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
                  <li><span aria-current="page" className="text-foreground">{page.label}</span></li>
                </ol>
              </nav>
              <SectionLabel>DIGITAL MARKETING AGENCY</SectionLabel>
              <h1 className="mt-4 max-w-4xl text-balance text-4xl font-display font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{page.heading}</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{page.intro}</p>
              {pageKey === "contact" && <p className="mt-8 flex flex-wrap gap-2.5 text-sm">
                <a className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card/60 px-4 hover:border-primary/50 hover:text-primary transition-colors" href="mailto:joemaish084@gmail.com"><Mail className="h-4 w-4 text-primary" aria-hidden />joemaish084@gmail.com</a>
                <a className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card/60 px-4 hover:border-primary/50 hover:text-primary transition-colors" href="tel:+254704700160"><Phone className="h-4 w-4 text-primary" aria-hidden />+254 704 700 160</a>
                <span className="inline-flex min-h-10 items-center gap-2 rounded-full px-2 text-muted-foreground"><MapPin className="h-4 w-4" aria-hidden />Nairobi, Kenya</span>
              </p>}
            </div>
          </div>
        </header>}

{pageKey === "home" && <>
        {/* HERO */}
        <section
          ref={heroRef}
          data-track-location="hero"
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
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full" asChild><Link to="/agency/pricing">
                  View Pricing
                </Link></Button>
              </motion.div>

              <HeroCollageMobile />
            </div>

            <div className="hidden lg:block">
              <HeroCollage mouseX={heroMouseX} mouseY={heroMouseY}>
                <HeroProofPanel mouseX={heroMouseX} mouseY={heroMouseY} />
              </HeroCollage>
            </div>
          </div>
        </section>

        {pageKey === "home" && <section className="container mx-auto px-4 pt-4 sm:pt-8">
          <div className="mx-auto grid max-w-7xl gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            {(Object.entries(agencyPages) as [AgencyPageKey, (typeof agencyPages)[AgencyPageKey]][]).filter(([key]) => key !== "home").map(([key, item], i) => {
              const Icon = hubIcons[key as keyof typeof hubIcons];
              return <Link key={key} to={item.path} onMouseMove={trackSpotlight}
                className="spotlight surface-card group flex items-center gap-4 p-4 hover:border-primary/40 sm:flex-col sm:items-start sm:gap-0 sm:p-6">
                <div className="flex w-full items-center justify-between sm:mb-6 max-sm:w-auto">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <span className="mono-accent hidden text-xs text-muted-foreground sm:block">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-display text-lg font-semibold transition-colors group-hover:text-primary sm:text-xl">{item.label}</h2>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:mt-2">{item.teaser}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary sm:mt-5">
                  <span className="hidden sm:inline">Explore</span><ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
                </span>
              </Link>;
            })}
          </div>
        </section>}
        <BrandsLogoMarquee />

        {/* WHY */}
        <section className="container mx-auto px-4 py-20">
          <div className="grid lg:grid-cols-[1fr_1.05fr] gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
            <FieldworkVisual />
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
                className="mb-8 space-y-3"
              >
                <SectionLabel>WHY WORK WITH ME</SectionLabel>
                <h2 className="text-3xl md:text-4xl font-display font-bold">
                  Why Brands Choose <span className="text-gradient">Joseph Maina</span>
                </h2>
              </motion.div>
              <div className="grid sm:grid-cols-2 gap-4">
                {whyCards.map((c, i) => (
                  <motion.div key={c.title} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ delay: 0.1 + i * 0.1, duration: 0.5 }}>
                    <Card className="group p-5 h-full hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center mb-3 ring-1 ring-primary/20 transition-transform duration-300 group-hover:scale-110"><c.icon className="h-5 w-5 text-primary" aria-hidden /></div>
                      <h3 className="font-display text-base font-semibold mb-1.5">{c.title}</h3>
                      <p className="text-sm text-muted-foreground">{c.desc}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <PaidMediaApproachSection />


</>}
{(pageKey === "services" || pageKey === "pricing") && <>
        {/* SERVICES / PRICING */}
        <section id="services" className="container mx-auto px-4 py-16 sm:py-20 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
          {/* Positioning */}
          <div className="mb-10 max-w-3xl space-y-3">
            <SectionLabel>PERFORMANCE MARKETING</SectionLabel>
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              {pageKey === "pricing" ? "Monthly retainers and management fees" : <>Performance Marketing for <span className="text-gradient">Kenyan Businesses</span></>}
            </h2>
            <p className="text-lg text-muted-foreground">
              {pageKey === "pricing" ? "Choose the package that matches your channels and advertising budget." : "I help businesses generate more leads and sales through Meta, Google and TikTok Ads."}
            </p>
            <p className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3.5 py-1.5 text-sm text-muted-foreground">
              <Receipt className="h-4 w-4 shrink-0 text-primary" aria-hidden /> Management fees are separate from your advertising budget.
            </p>
          </div>

{pageKey === "services" && <>
          {/* Single Platform — 60% visual weight */}
          <div className="mb-20">
            <SubHeading eyebrow="Paid media" title="Single Platform">Strategy, setup, optimisation and reporting for one advertising channel.</SubHeading>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {singlePlatform.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    id={`service-${s.slug}`}
                    onMouseMove={trackSpotlight}
                    className="spotlight group surface-card flex flex-col overflow-hidden hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 scroll-mt-24"
                  >
                    <CardCover src={s.image.src} alt={s.image.alt} position={s.image.position} />
                    <div className="px-6 pb-6 sm:px-7 sm:pb-7 flex flex-col flex-1">
                    <div className="relative z-10 -mt-7 h-14 w-14 rounded-2xl bg-gradient-orange flex items-center justify-center mb-5 shadow-[var(--shadow-orange-glow)] ring-4 ring-background">
                      <Icon className="h-7 w-7 text-white" aria-hidden />
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-semibold mb-3">{s.name}</h3>
                    <div className="mb-5"><PriceTag price={s.price} /></div>
                    <ul className="space-y-2.5 mb-6 flex-1 border-t border-border/60 pt-5">
                      {s.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mb-5 space-y-2 rounded-xl bg-muted/50 p-4">
                      <Link
                        to={s.proof.to}
                        className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {s.proof.label} &rarr;
                      </Link>
                      <Link
                        to={s.hub.to}
                        className="block text-sm font-medium text-primary hover:underline"
                      >
                        {s.hub.label} &rarr;
                      </Link>
                    </div>
                    <Button variant="outline" className="w-full rounded-full" asChild><Link to="/agency/contact">
                      Get Custom Quote
                    </Link></Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>


</>}
{pageKey === "pricing" && <>
          {/* Retainer Packages — 60% visual weight */}
          <div className="mb-16">
            <div className="grid md:grid-cols-3 gap-6 md:items-stretch pt-3">
              {retainerPackages.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  onMouseMove={trackSpotlight}
                  className={`spotlight surface-card p-6 sm:p-7 flex flex-col relative hover:-translate-y-1 transition-all duration-300 ${p.highlight ? "border-primary/50 shadow-elegant md:-my-3 md:py-10" : "hover:border-primary/40"}`}
                >
                  {p.highlight && <ShineBorder borderWidth={1.5} duration={10} shineColor={["hsl(25 100% 50%)", "hsl(33 100% 62%)"]} />}
                  {p.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3.5 py-1 bg-gradient-orange text-white text-xs font-bold uppercase tracking-wide whitespace-nowrap shadow-[var(--shadow-orange-glow)]">
                      {p.label}
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <h3 className="text-xl font-display font-bold tracking-wide">{p.name}</h3>
                    {!p.highlight && (
                      <span className="rounded-full text-xs font-medium px-2.5 py-1 bg-muted text-muted-foreground">{p.label}</span>
                    )}
                  </div>
                  <PriceTag price={p.price} />
                  <p className="mt-3 mb-6 rounded-lg bg-muted/60 px-3 py-2 text-sm text-muted-foreground">{p.note}</p>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full rounded-full" variant={p.highlight ? "default" : "outline"} asChild><Link to="/agency/contact">
                    Get Custom Quote
                  </Link></Button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Side-by-side comparison of the packages above */}
          <div className="mb-20">
            <h3 className="mb-4 font-display text-lg font-semibold">Compare packages at a glance</h3>
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full min-w-[34rem] text-left text-sm">
                <caption className="sr-only">Retainer package comparison, taken from each package's listed features</caption>
                <thead><tr className="bg-muted/60">
                  <td className="p-4" />
                  {retainerPackages.map((p) => <th key={p.name} scope="col" className={`p-4 font-display font-semibold tracking-wide ${p.highlight ? "text-primary" : ""}`}>{p.name}</th>)}
                </tr></thead>
                <tbody>{packageComparison.map((row) => <tr key={row.label} className="border-t border-border">
                  <th scope="row" className="p-4 font-normal text-muted-foreground">{row.label}</th>
                  {row.values.map((v, i) => <td key={i} className={`p-4 font-medium ${retainerPackages[i].highlight ? "bg-primary/[0.04]" : ""}`}>{v}</td>)}
                </tr>)}</tbody>
              </table>
            </div>
          </div>

          <div className="mb-16">
            <SubHeading eyebrow="Pay per service" title="Single services and project fees">Starting fees for each service. Select a service to see its scope.</SubHeading>
            <div className="rounded-2xl border border-border max-sm:border-0 sm:overflow-hidden">
              <table className="w-full text-left text-sm max-sm:block">
                <caption className="sr-only">Starting fees for existing agency services; ad spend is separate</caption>
                <thead className="bg-muted/60 max-sm:sr-only"><tr><th scope="col" className="p-4">Service</th><th scope="col" className="p-4">Starting fee</th><th scope="col" className="p-4">Scope</th></tr></thead>
                <tbody className="max-sm:grid max-sm:gap-3">{[...singlePlatform.map(item => ({...item, desc: item.features.join(", ")})), ...supportingServices].map(item => <tr key={item.slug} className="border-t border-border transition-colors hover:bg-muted/40 max-sm:grid max-sm:grid-cols-[1fr_auto] max-sm:gap-x-4 max-sm:gap-y-1.5 max-sm:rounded-2xl max-sm:border max-sm:bg-card/60 max-sm:p-4">
                  <th scope="row" className="p-4 font-medium max-sm:p-0"><Link to={`/agency/services#service-${item.slug}`} className="hover:text-primary">{item.name}</Link></th>
                  <td className="p-4 font-semibold text-primary whitespace-nowrap max-sm:p-0 max-sm:text-right first-letter:uppercase">{item.price}</td><td className="p-4 text-muted-foreground max-sm:col-span-2 max-sm:p-0">{item.desc}</td>
                </tr>)}</tbody>
              </table>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <p className="rounded-xl border border-border/70 bg-card/50 p-4 text-sm text-muted-foreground">For Meta Ads, the minimum advertising budget is KSh 30,000 per month, paid separately from the management fee. Video production is quoted separately when it goes beyond light social content.</p>
              <p className="rounded-xl border border-border/70 bg-card/50 p-4 text-sm text-muted-foreground"><Link to="/agency/lead-generation" className="font-medium text-primary hover:underline">Lead generation starts at KSh 50,000/month, including landing pages.</Link> Your team follows up with the leads.</p>
            </div>
          </div>


</>}
{pageKey === "services" && <>
          {/* Supporting Services — 40% visual weight */}
          <div className="mb-20">
            <SubHeading eyebrow="Also available" title="Supporting Services">Creative, content and advisory work alongside your campaigns.</SubHeading>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {supportingServices.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    id={`service-${s.slug}`}
                    onMouseMove={trackSpotlight}
                    className="spotlight surface-card p-5 flex flex-col hover:border-primary/40 transition-all duration-300 scroll-mt-24"
                  >
                    <div className="h-10 w-10 rounded-xl bg-gradient-orange flex items-center justify-center mb-4 shadow-[var(--shadow-orange-glow)]">
                      <Icon className="h-5 w-5 text-white" aria-hidden />
                    </div>
                    <h3 className="font-display font-semibold mb-1.5">{s.name}</h3>
                    <div className="mb-2"><PriceTag price={s.price} size="sm" /></div>
                    <p className="text-sm text-muted-foreground flex-1 mb-3">{s.desc}</p>
                    <Link
                      to={s.proof.to}
                      className="mb-4 block text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      {s.proof.label} &rarr;
                    </Link>
                    <Button variant="outline" size="sm" className="w-full rounded-full" asChild><Link to="/agency/contact">
                      Get Custom Quote
                    </Link></Button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Dedicated service pages. Renders only once a page is out of draft. */}
          {liveServicePages.length > 0 && (
            <div className="mb-20">
              <SubHeading eyebrow="In detail" title="Full Service Pages">Scope, pricing, process, case studies and FAQs for each service.</SubHeading>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {liveServicePages.map((sp, i) => {
                  const Icon = sp.icon;
                  // With an odd count, widen the first (umbrella) service so the grid closes evenly.
                  const featured = i === 0 && liveServicePages.length % 2 === 1;
                  return (
                    <Link
                      key={sp.slug}
                      to={`/agency/${sp.slug}`}
                      onMouseMove={trackSpotlight}
                      className={`spotlight surface-card p-5 sm:p-6 flex flex-col hover:border-primary/40 transition-all duration-300 group ${featured ? "sm:col-span-2 bg-gradient-to-br from-primary/[0.08] to-transparent" : ""}`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20"><Icon className="h-5 w-5 text-primary" aria-hidden /></span>
                        <ArrowRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-1 group-hover:text-primary" aria-hidden />
                      </div>
                      <h3 className={`font-display font-semibold mb-1 group-hover:text-primary transition-colors ${featured ? "text-xl" : ""}`}>
                        {sp.navLabel}
                      </h3>
                      <p className="text-sm font-semibold text-primary mb-2">{sp.price.amount}</p>
                      <p className={`text-muted-foreground flex-1 ${featured ? "text-sm max-w-md" : "text-xs leading-relaxed"}`}>{sp.standfirst}</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}


</>}
          {/* Free tool: lets visitors test whether a budget pays for itself before booking. */}
          <Link
            to="/agency/ad-budget-calculator"
            onMouseMove={trackSpotlight}
            className="spotlight surface-card group mb-10 flex flex-col gap-5 p-6 transition-all duration-300 hover:border-primary/40 sm:flex-row sm:items-center sm:p-8"
          >
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-orange">
              <Calculator className="h-7 w-7 text-white" aria-hidden />
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Free tool</p>
              <h3 className="mt-1 font-display text-xl font-semibold group-hover:text-primary transition-colors">
                Will your ad budget pay for itself?
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Enter your budget, sale value and close rate to see the leads, customers and profit to expect, and the
                cost per lead you can afford.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Try the calculator <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>

          {/* Closing CTA */}
          <div className="flex flex-col items-start gap-5 rounded-2xl border border-border/70 bg-card/40 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <p className="max-w-xl text-base text-muted-foreground sm:text-lg">
              Not sure which package fits? Book a free 30-minute strategy call and I'll recommend the right plan for your business and budget.
            </p>
            <Button size="lg" className="w-full rounded-full sm:w-auto shrink-0" asChild>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                <Calendar className="mr-2 h-5 w-5" /> Book Free Strategy Call
              </a>
            </Button>
          </div>
          </div>
        </section>


</>}
{pageKey === "home" && <>
        <CreativeShowcase />

        {/* HOW IT WORKS */}
        <section id="how" className="container mx-auto px-4 py-20 scroll-mt-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-12 text-center space-y-3">
              <SectionLabel>HOW IT WORKS</SectionLabel>
              <h2 className="text-3xl md:text-4xl font-display font-bold">Working Together Is Simple</h2>
              <p className="text-muted-foreground">From the first call to monthly reporting, in five steps.</p>
            </div>
            {/* The wrapper watches the viewport: the connector starts at zero size, so it can't. */}
            <motion.div className="relative" initial="hidden" whileInView="shown" viewport={{ once: true, margin: "-120px" }}>
              {/* Connector that draws in once; starts hidden only for JS visitors (see index.css). */}
              <div aria-hidden className="absolute left-6 top-6 bottom-6 w-px bg-border lg:left-[10%] lg:right-[10%] lg:bottom-auto lg:h-px lg:w-auto">
                <motion.div
                  variants={{ hidden: { opacity: 0, scaleY: 0, scaleX: 0 }, shown: { opacity: 1, scaleY: 1, scaleX: 1 } }}
                  transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                  className="h-full w-full origin-top bg-gradient-to-b from-primary to-orange-light lg:origin-left lg:bg-gradient-to-r"
                />
              </div>
            <ol className="relative grid gap-8 lg:grid-cols-5 lg:gap-6">
              {steps.map((s, i) => (
                <motion.li
                  key={s.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: 0.15 + i * 0.12, duration: 0.5 }}
                  className="relative flex gap-5 lg:flex-col lg:items-center lg:text-center lg:gap-0"
                >
                  <span className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-background ring-1 ring-primary/30 shadow-[0_0_0_6px_hsl(var(--background))] lg:mb-5">
                    <s.icon className="h-5 w-5 text-primary" aria-hidden />
                  </span>
                  <div className="pt-1 lg:pt-0">
                    <p className="mono-accent text-xs text-muted-foreground">Step {i + 1}</p>
                    <h3 className="mt-1 font-display text-lg font-semibold">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground lg:mx-auto lg:max-w-[14rem]">{s.desc}</p>
                  </div>
                </motion.li>
              ))}
            </ol>
            </motion.div>
          </div>
        </section>


</>}
{pageKey === "results" && <>
        {/* RESULTS */}
        <section id="results" className="container mx-auto px-4 py-20 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
          <SubHeading eyebrow="Selected campaigns" title="Real Results for Real Brands">The headline outcome, the challenge behind it and the channels used.</SubHeading>
          <div className="grid md:grid-cols-3 gap-6">
            {caseStudies.map((c, i) => {
              const [metric, ...metricLabel] = c.headline.split(" ");
              return (
              <motion.div
                key={c.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: i * 0.12 }}
              >
              <Card onMouseMove={trackSpotlight} className="spotlight group h-full overflow-hidden rounded-2xl flex flex-col hover:border-primary/40 hover:-translate-y-1 transition-all duration-300">
                <CardCover src={c.image} alt={c.imageAlt} className="aspect-video" position="object-top" />
                <div className="p-6 flex flex-col flex-1">
                <p className="flex items-baseline gap-2 font-display">
                  <span className="text-4xl font-bold tracking-tight text-gradient tabular-nums">{metric}</span>
                  <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{metricLabel.join(" ")}</span>
                </p>
                <h3 className="mt-1 mb-5 font-display text-xl font-semibold">{c.name}</h3>
                <dl className="mb-5 space-y-4 border-t border-border/60 pt-5">
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Challenge</dt>
                    <dd className="text-sm text-muted-foreground">{c.challenge}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-primary mb-1">Results</dt>
                    <dd className="text-sm font-medium text-foreground">{c.results}</dd>
                  </div>
                </dl>
                <div className="mt-auto">
                  <div className="sr-only">Services</div>
                  <div className="flex flex-wrap gap-1.5">
                    {c.services.map((sv) => (
                      <span key={sv} className="text-xs px-2.5 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">{sv}</span>
                    ))}
                  </div>
                </div>
                </div>
              </Card>
              </motion.div>
              );
            })}
          </div>
          </div>
          <div className="max-w-6xl mx-auto mt-16">
            <SubHeading eyebrow="Go deeper" title="Read the campaign breakdowns">The portfolio contains the wider creative work. These articles explain the marketing decisions, campaign context and reported results.</SubHeading>
            <div className="grid sm:grid-cols-2 gap-4">{[
              "meta-ads-turnaround-case-study-kenya-2026", "convey-communications-case-study-10x-leads",
              "0-to-4-million-tiktok-views-behind-the-campaign", "nyeri-county-campaign-hyper-local-marketing",
            ].map(slug => blogSummaries.find(post => post.slug === slug)).filter(Boolean).map(post => <Link key={post!.slug} to={`/agency/blog/${post!.slug}`} onMouseMove={trackSpotlight} className="spotlight surface-card flex flex-col p-6 group hover:border-primary/40 transition-colors">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Case study</p>
              <h3 className="font-display text-lg font-semibold leading-snug group-hover:text-primary transition-colors">{post!.title}</h3><p className="mt-2 flex-1 text-sm text-muted-foreground">{post!.excerpt}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">Read the breakdown <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden /></span>
            </Link>)}</div>
            <p className="mt-6 text-sm text-muted-foreground">My work with Convey began as an employee and later continued as a consultant. Each linked case study provides its own context; these outcomes are not a promise of future results.</p>
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" className="rounded-full" asChild>
              <Link to="/work/case-studies">See All Case Studies <ArrowRight className="h-4 w-4" aria-hidden /></Link>
            </Button>
          </div>
        </section>


</>}
{pageKey === "contact" && <>
        {/* BOOKING */}
        <section id="booking" className="container mx-auto px-4 py-20 scroll-mt-20">
          <div className="max-w-6xl mx-auto">
          <SubHeading eyebrow="Get in touch" title="Ready to Grow Your Brand?">Book a free 30-minute discovery call — no commitment, just a conversation.</SubHeading>

          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
            {/* Calendly */}
            <Card className="p-5 sm:p-6 rounded-2xl border-primary/30">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20"><Calendar className="h-5 w-5 text-primary" aria-hidden /></span>
                <div>
                  <h3 className="font-display text-xl font-semibold leading-tight">Book Discovery Call</h3>
                  <p className="text-xs text-muted-foreground">Free · 30 minutes · Pick a time that suits you</p>
                </div>
              </div>
              <div className="rounded-lg overflow-hidden border border-border/60 bg-muted/30" style={{ minHeight: 480 }}>
                <iframe
                  src={CALENDLY_URL}
                  title="Book a discovery call with Joseph Maina"
                  className="w-full"
                  style={{ minHeight: 480, border: 0 }}
                />
              </div>
              <p className="mt-4 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                Widget not loading?
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-medium text-primary hover:underline">Open Calendly in a new tab <ExternalLink className="h-3 w-3" aria-hidden /></a>
              </p>
            </Card>

            {/* WhatsApp + Brief */}
            <div className="space-y-6">
              <Card className="p-5 sm:p-6 rounded-2xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20"><MessageCircle className="h-5 w-5 text-primary" aria-hidden /></span>
                    <div>
                      <h3 className="font-display text-xl font-semibold leading-tight">Chat on WhatsApp</h3>
                      <p className="text-sm text-muted-foreground">Prefer WhatsApp? Let's talk there.</p>
                    </div>
                  </div>
                  <Button asChild className="rounded-full shrink-0">
                    <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
                      <Phone className="h-4 w-4" /> Message me
                    </a>
                  </Button>
                </div>
              </Card>

              <Card className="p-5 sm:p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20"><FileText className="h-5 w-5 text-primary" aria-hidden /></span>
                  <div>
                    <h3 className="font-display text-xl font-semibold leading-tight">Send Brief Directly</h3>
                    <p className="text-sm text-muted-foreground">Three short steps. I reply within 24 hours.</p>
                  </div>
                </div>
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
          </div>
        </section>


</>}
{pageKey === "pricing" && <>
        {/* PAYMENTS */}
        <section className="container mx-auto px-4 pb-16 sm:pb-20">
          <div className="max-w-6xl mx-auto">
          <SubHeading eyebrow="Payments" title="Simple, Transparent Payments" />
          <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
            {payments.map((p) => (
              <Card key={p.title} className="p-6 rounded-2xl">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 ring-1 ring-primary/20"><p.icon className="h-5 w-5 text-primary" aria-hidden /></div>
                <h3 className="font-display text-lg font-semibold mb-1.5">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </Card>
            ))}
          </div>
          <p className="mt-6 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 text-sm text-muted-foreground">
            <strong className="text-foreground">Note:</strong> 50% deposit required to begin work. Balance due on agreed milestone dates.
          </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight">Common Questions</h2>
            <p className="mt-3 text-muted-foreground">Still unsure? <Link to="/agency/contact" className="text-primary hover:underline">Ask me directly</Link>.</p>
          </div>
          <div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((f, i) => (
                <AccordionItem key={i} value={`f${i}`}>
                  <AccordionTrigger className="text-left">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          </div>
        </section>


</>}
        {/* FOOTER CTA — the contact page is already the next step */}
        {pageKey !== "contact" && <section className="container mx-auto px-4 pb-20">
          <Card className="relative max-w-4xl mx-auto overflow-hidden rounded-3xl p-8 md:p-14 text-center border-primary/40 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent">
            <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_70%_80%_at_50%_0%,black_20%,transparent_100%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
                <Star className="h-3 w-3 fill-primary" /> Work Together
              </div>
              <h2 className="text-balance text-3xl md:text-4xl font-display font-bold mb-3">Find the right next step for your brand</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">I take on a limited number of clients to ensure quality and attention to detail.</p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row">
                <Button size="lg" className="rounded-full" asChild><Link to="/agency/contact">Discuss Your Project <ArrowRight className="h-4 w-4" aria-hidden /></Link></Button>
                {pageKey !== "pricing" && <Button size="lg" variant="outline" className="rounded-full" asChild><Link to="/agency/pricing">View Pricing</Link></Button>}
              </div>
            </div>
          </Card>
        </section>}
      </main>

      <div className="container mx-auto px-4 pb-10"><AgencySectionLinks className="justify-center text-muted-foreground" /></div>
      <footer className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 whitespace-nowrap border-t border-border/40 px-4 py-8 text-sm text-muted-foreground leading-8">
        <span>© {new Date().getFullYear()} Joseph Maina</span>
        <span>·</span>
        <Link to="/" className="hover:text-foreground">Portfolio</Link>
        <span>·</span>
        <Link to="/agency/blog" className="hover:text-foreground">Blog</Link>
        <span>·</span>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="hover:text-foreground" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </footer>
    </div>
    </MotionConfig>
  );
};

export default Agency;
