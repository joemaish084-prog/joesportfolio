import { useRef, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CountUp } from "@/components/CountUp";
import { HeroCollage, HeroCollageMobile } from "@/components/HeroCollage";
import { CALENDLY_URL, trustNumbers as stats } from "@/data/services";

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
        initial={false}
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

export function AgencyHero({ whatsappUrl, showAuditLink = false }: { whatsappUrl: string; showAuditLink?: boolean }) {
  const heroRef = useRef<HTMLElement>(null);
  const heroMouseX = useMotionValue(0);
  const heroMouseY = useMotionValue(0);

  const handleHeroMouseMove = (e: MouseEvent<HTMLElement>) => {
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

  return (
    <section
      ref={heroRef}
      data-track-location="hero"
      data-hero-audit={showAuditLink || undefined}
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={handleHeroMouseLeave}
      className="relative w-full overflow-hidden bg-background"
    >
      {/* Editorial background — theme-aware, so it never fights the site's light/dark mode */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] md:hidden"
        style={{ background: "radial-gradient(ellipse at top right, hsl(var(--primary) / 0.09), transparent 70%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block">
        <div className="absolute top-[-15%] right-[0%] w-[36rem] h-[36rem] rounded-full bg-primary/[0.07] blur-[130px] animate-drift-a motion-reduce:animate-none" />
        <div className="absolute bottom-[-20%] left-[-5%] w-[30rem] h-[30rem] rounded-full bg-primary/[0.05] blur-[140px] animate-drift-b motion-reduce:animate-none" />
      </div>
      <div className="absolute inset-0 z-[1] dot-grid pointer-events-none [mask-image:radial-gradient(ellipse_90%_70%_at_50%_0%,black_40%,transparent_100%)]" />
      <div className="absolute inset-0 z-[1] hero-spotlight opacity-60 pointer-events-none transition-[background] duration-300" />

      <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center px-4 sm:px-6 lg:px-10 max-w-7xl mx-auto pt-20 md:pt-28 pb-20 md:pb-28">
        <div className="text-left">
          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="flex items-center gap-3 mb-7"
          >
            <span className="h-px w-8 bg-primary" />
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-medium">Joseph Maina Marketing · Nairobi, Kenya</span>
          </motion.div>

          <motion.h1
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl sm:text-5xl lg:text-[3.75rem] font-display font-semibold tracking-tight text-foreground max-w-xl leading-[1.08]"
          >
            More leads and sales for{" "}
            <span className="font-serif italic font-normal text-primary">Kenyan businesses</span>
          </motion.h1>

          <motion.p
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="mt-6 text-lg text-muted-foreground max-w-md"
          >
            Joseph Maina Marketing is a founder-led digital marketing agency in Nairobi. You work directly with me, Joseph Maina, on paid ads, SEO and content.
          </motion.p>

          <motion.div
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, duration: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto rounded-full" asChild>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                <Calendar className="mr-2 h-5 w-5" /> Book a Free Strategy Call
              </a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full" asChild><Link to="/agency/pricing">
              View Pricing
            </Link></Button>
          </motion.div>
          <p className="mt-4 text-sm text-muted-foreground">
            Prefer to chat?{" "}
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">Message me on WhatsApp</a>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-5">
            {showAuditLink && (
              <a href="#audit" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline">
                Book a Free Audit <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            )}
            <a href="#customer-journey" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Explore the customer journey <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <HeroCollageMobile loading="lazy" />
        </div>

        <div className="hidden lg:block">
          <HeroCollage loading="lazy" mouseX={heroMouseX} mouseY={heroMouseY}>
            <HeroProofPanel mouseX={heroMouseX} mouseY={heroMouseY} />
          </HeroCollage>
        </div>
      </div>
    </section>
  );
}
