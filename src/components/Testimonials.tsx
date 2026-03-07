import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
            What Clients <span className="text-gradient">Say</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Trusted by brands across Kenya to deliver creative campaigns that drive real results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-elegant hover:-translate-y-1"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}
