import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const portfolioItems = [
  {
    title: "Brand Campaign Design",
    description: "Visual identity and marketing materials for iClear Wellife Service",
    tags: ["Branding", "Graphic Design"],
    link: "#",
  },
  {
    title: "Social Media Graphics",
    description: "Content creation for various client campaigns",
    tags: ["Social Media", "Design"],
    link: "#",
  },
  {
    title: "Podcast Visual Identity",
    description: "Complete branding for Convey with Caroline Podcast",
    tags: ["Branding", "Podcast"],
    link: "#",
  },
  {
    title: "Marketing Campaigns",
    description: "30+ multimedia assets driving 15% engagement increase",
    tags: ["Marketing", "Design"],
    link: "#",
  },
];

export function Portfolio() {
  return (
    <section id="portfolio" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
            Design <span className="text-gradient">Portfolio</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A showcase of creative work spanning branding, digital marketing, and visual design
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
          {portfolioItems.map((item, index) => (
            <Card
              key={index}
              className="group hover-lift cursor-pointer border-2 hover:border-primary/50 transition-all bg-card"
            >
              <CardContent className="p-6 sm:p-8 space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Project Preview</p>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-display font-semibold group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  </div>
                  <p className="text-muted-foreground">{item.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">Want to see more? Connect with me on Behance</p>
          <a
            href="#"
            className="text-primary hover:underline font-medium inline-flex items-center gap-2"
          >
            View Behance Profile
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
