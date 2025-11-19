import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section id="home" className="min-h-screen flex items-center pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <p className="text-primary font-medium text-sm sm:text-base tracking-wide uppercase">
              Digital Marketing Specialist
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
              Creative Strategy Meets{" "}
              <span className="text-gradient">Visual Storytelling</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              3+ years crafting compelling campaigns that boost engagement by 30%
              and build lasting brand connections through video, design, and social media.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="w-full sm:w-auto shadow-elegant text-base"
              asChild
            >
              <a href="#portfolio">
                View My Work
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto border-2 hover:bg-primary/5 text-base"
              asChild
            >
              <a href="#contact">
                <Mail className="mr-2 h-5 w-5" />
                Get in Touch
              </a>
            </Button>
          </div>

          <div className="pt-12 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-display font-bold text-primary">
                3+
              </p>
              <p className="text-sm text-muted-foreground">Years Experience</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-display font-bold text-primary">
                30+
              </p>
              <p className="text-sm text-muted-foreground">Projects Delivered</p>
            </div>
            <div className="space-y-1">
              <p className="text-3xl sm:text-4xl font-display font-bold text-primary">
                80%
              </p>
              <p className="text-sm text-muted-foreground">Engagement Boost</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
