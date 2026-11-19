import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play, Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollReveal } from "./ScrollReveal";
import { SectionLabel } from "@/components/SectionLabel";

const testimonials = [
  {
    quote: "Joseph transformed our social media presence. Our engagement grew by over 300% in just a few months — his video content strategy was a game-changer for iClear.",
    name: "iClear Wellife Service",
    role: "Water Purification Company",
  },
  {
    quote: "Working with Joseph on the 'Convey with Caroline' podcast was a fantastic experience. His creative direction, from branding to video editing, elevated the show to a professional standard.",
    name: "Caroline Njiru",
    role: "Host, Convey with Caroline Podcast",
  },
  {
    quote: "Joseph consistently delivered high-quality designs and campaigns on tight timelines. His ability to blend strategy with creative execution made him an invaluable part of our marketing team.",
    name: "Convey Communications",
    role: "PR Agency",
  },
];

export function Testimonials({ compact = false }: { compact?: boolean }) {
  if (compact) return <StudioTestimonials />;
  return (
    <section id="testimonials" className="scroll-mt-20 lg:scroll-mt-24 dot-grid section-divider py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16 space-y-4">
            <SectionLabel>TESTIMONIALS</SectionLabel>
            <h2 className="text-title-1 sm:text-large-title font-display">
              What Clients Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Trusted by brands across Kenya to deliver creative campaigns that drive real results.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <ScrollReveal key={index} direction="up" delay={index * 0.15}>
              <Card className="glass hover:border-primary/40 hover-lift">
                <CardContent className="pt-6 space-y-4">
                  <Quote className="h-8 w-8 text-primary/30" />
                  <blockquote className="text-muted-foreground leading-relaxed italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="pt-4 border-t border-border">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function StudioTestimonials() {
  const carousel = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const PauseIcon = paused ? Play : Pause;

  function advance(direction: number) {
    const rail = carousel.current;
    if (!rail) return;
    const slides = Array.from(rail.children);
    const left = rail.getBoundingClientRect().left;
    const current = slides.findIndex(slide => Math.abs(slide.getBoundingClientRect().left - left) < 8);
    const next = slides[(Math.max(0, current) + direction + slides.length) % slides.length];
    rail.scrollTo({
      left: next.getBoundingClientRect().left - left + rail.scrollLeft,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
    });
  }

  useEffect(() => {
    const rail = carousel.current;
    if (!rail || paused) return;
    const mobile = window.matchMedia("(max-width: 623px) and (prefers-reduced-motion: no-preference)");
    let timer = 0;
    const refresh = (visible: boolean) => {
      window.clearInterval(timer);
      if (visible && mobile.matches) timer = window.setInterval(() => {
        if (!document.hidden && !rail.matches(":hover, :focus-within")) advance(1);
      }, 8500);
    };
    let visible = false;
    const update = () => refresh(visible);
    const observe = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); }, { threshold: 0.5 });
    observe.observe(rail);
    mobile.addEventListener("change", update);
    return () => { window.clearInterval(timer); observe.disconnect(); mobile.removeEventListener("change", update); };
  }, [paused]);

  return (
    <div className="studio-carousel" data-reveal>
      <div className="studio-quote-grid" ref={carousel} role="region" onPointerDown={() => setPaused(true)}
        tabIndex={0} aria-label="Client testimonials" data-lenis-prevent>
        {testimonials.map(({ quote, name, role }) => (
          <Card className="studio-quote-card studio-glow-card" key={name}>
            <figure>
              <Quote size={24} aria-hidden />
              <blockquote><p>{quote}</p></blockquote>
              <figcaption>
                <span className="studio-quote-avatar" aria-hidden>{name.split(" ").slice(0, 2).map(word => word[0]).join("")}</span>
                <span><strong>{name}</strong><span>{role}</span></span>
              </figcaption>
            </figure>
          </Card>
        ))}
      </div>
      <div className="studio-carousel-controls">
        <button type="button" className="studio-motion-control" aria-label="Previous testimonial" onClick={() => { setPaused(true); advance(-1); }}><ArrowLeft size={17} aria-hidden /></button>
        <button type="button" className="studio-motion-control studio-carousel-pause"
          aria-label={paused ? "Play testimonials" : "Pause testimonials"} onClick={() => setPaused(current => !current)}><PauseIcon size={15} aria-hidden /></button>
        <button type="button" className="studio-motion-control" aria-label="Next testimonial" onClick={() => { setPaused(true); advance(1); }}><ArrowRight size={17} aria-hidden /></button>
      </div>
    </div>
  );
}
