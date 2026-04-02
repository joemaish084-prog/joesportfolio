import { useState } from "react";
import { Lock, Mail, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";

const placeholders = [
  "Brand Identity Mockup",
  "Product Packaging",
  "Campaign Poster",
];

export function PrintMockup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) setSubmitted(true);
  };

  return (
    <section className="py-16 sm:py-24 bg-background relative overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Badge */}
        <ScrollReveal direction="fade" className="flex justify-center mb-4">
          <Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1.5 text-sm animate-pulse">
            🎨 New Section
          </Badge>
        </ScrollReveal>

        {/* Heading */}
        <ScrollReveal direction="up" delay={0.1}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-foreground mb-2">
            Print / Mockup Design
          </h2>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.2}>
          <p className="text-center text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-[hsl(var(--orange))] to-[hsl(var(--orange-light))] bg-clip-text text-transparent mb-4">
            Coming Soon
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" delay={0.3}>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-12 text-base sm:text-lg">
            Professional mockup designs showcasing brands, products and campaigns — coming very soon!
          </p>
        </ScrollReveal>

        {/* Placeholder cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
          {placeholders.map((label, i) => (
            <ScrollReveal key={label} direction="up" delay={0.3 + i * 0.15}>
              <div className="relative group rounded-xl border border-border/50 bg-card/30 backdrop-blur-xl overflow-hidden aspect-[4/5]">
                {/* Shimmer overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/[0.03] to-transparent shimmer-animation" />

                {/* Lock icon */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                    <Lock className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground/60">
                    Coming Soon
                  </span>
                </div>

                {/* Frosted bottom bar */}
                <div className="absolute bottom-0 inset-x-0 h-12 bg-card/60 backdrop-blur-md border-t border-border/30 flex items-center justify-center">
                  <span className="text-xs text-muted-foreground font-medium">
                    Mockup Coming Soon
                  </span>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Notify form */}
        <ScrollReveal direction="up" delay={0.6}>
          <div className="max-w-md mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Get notified when mockups go live 👇
            </p>

            {submitted ? (
              <div className="flex items-center justify-center gap-2 text-primary font-medium py-3">
                <CheckCircle className="w-5 h-5" />
                We'll notify you!
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-card/50 backdrop-blur-sm border-border/50"
                />
                <Button type="submit" variant="gradient" className="shrink-0">
                  <Mail className="w-4 h-4 mr-1" />
                  Notify Me
                </Button>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* Shimmer keyframes */}
      <style>{`
        .shimmer-animation {
          animation: shimmer 2.5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </section>
  );
}
