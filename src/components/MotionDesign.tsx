import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play } from "lucide-react";

const motionProjects = [
  {
    title: "Logo Reveal Animation",
    description: "Dynamic brand reveal with particle effects",
    type: "Logo Animation",
    thumbnail: "/placeholder.svg",
  },
  {
    title: "UI Transition Pack",
    description: "Smooth micro-interactions for mobile app",
    type: "UI Animation",
    thumbnail: "/placeholder.svg",
  },
  {
    title: "Social Media Reel",
    description: "Vertical format motion graphics for Instagram",
    type: "Reel",
    thumbnail: "/placeholder.svg",
  },
  {
    title: "Typography Animation",
    description: "Kinetic typography for brand storytelling",
    type: "Motion Graphics",
    thumbnail: "/placeholder.svg",
  },
];

export function MotionDesign() {
  return (
    <section id="motion-design" className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
            Motion <span className="text-gradient">Design</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Bringing brands to life through dynamic animations, logo reveals, UI transitions, 
            and motion graphics that captivate audiences and elevate visual storytelling.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {motionProjects.map((project, index) => (
            <Card
              key={index}
              className="group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-elegant"
            >
              <div className="relative aspect-[9/16] sm:aspect-video overflow-hidden bg-muted">
                <img
                  src={project.thumbnail}
                  alt={project.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-primary/90 backdrop-blur-sm rounded-full p-4">
                    <Play className="h-8 w-8 text-primary-foreground" fill="currentColor" />
                  </div>
                </div>
              </div>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-xl font-display font-semibold line-clamp-1">
                    {project.title}
                  </h3>
                  <Badge variant="secondary" className="shrink-0">
                    {project.type}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {project.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
