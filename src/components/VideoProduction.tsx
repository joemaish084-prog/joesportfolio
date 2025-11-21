import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Calendar } from "lucide-react";
import conveyThumbnail from "@/assets/convey-podcast-thumbnail.png";

const videoProjects = [
  {
    title: "Convey with Caroline Podcast",
    description: "A dynamic podcast series featuring thought leaders and industry experts, discussing trends in communication and digital marketing.",
    type: "Podcast Production",
    date: "2024",
    thumbnail: conveyThumbnail,
    link: "https://open.spotify.com/show/60e2Uhy5tyYb4Xj4VINVKS?si=39d88e0150784a2a",
    approach: "Multi-camera setup with professional audio mixing and dynamic graphics integration",
  },
  {
    title: "Brand Commercial Edit",
    description: "High-energy promotional video showcasing product features with dynamic transitions and color grading.",
    type: "Commercial",
    date: "2024",
    thumbnail: "/placeholder.svg",
    approach: "Fast-paced editing style with motion graphics overlay and soundtrack synchronization",
  },
  {
    title: "Corporate Interview Series",
    description: "Professional interview content with seamless editing and engaging B-roll integration.",
    type: "Interview",
    date: "2024",
    thumbnail: "/placeholder.svg",
    approach: "Clean cuts with lower thirds, ambient audio mixing, and strategic B-roll placement",
  },
  {
    title: "Social Media Ad Campaign",
    description: "15-second vertical format ads optimized for Instagram and TikTok platforms.",
    type: "Social Ad",
    date: "2024",
    thumbnail: "/placeholder.svg",
    approach: "Attention-grabbing opening with text overlays and platform-optimized aspect ratio",
  },
  {
    title: "Event Highlight Reel",
    description: "Cinematic recap of corporate event capturing key moments and attendee engagement.",
    type: "Event Video",
    date: "2024",
    thumbnail: "/placeholder.svg",
    approach: "Slow-motion sequences, music syncing, and emotional storytelling through visual narrative",
  },
  {
    title: "Product Demo Video",
    description: "Clear, concise demonstration of product features with professional voiceover and screen recordings.",
    type: "Demo",
    date: "2024",
    thumbnail: "/placeholder.svg",
    approach: "Screen capture editing with callouts, zoom effects, and synchronized narration",
  },
];

export function VideoProduction() {
  return (
    <section id="video-production" className="py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
            Video <span className="text-gradient">Production</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Professional video editing, storytelling, and production for commercials, interviews, 
            ads, and digital content that engages audiences and delivers impactful narratives.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {videoProjects.map((project, index) => {
            const content = (
              <Card
                key={index}
                className="group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-elegant"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-primary/90 backdrop-blur-sm rounded-full p-4">
                      <Play className="h-8 w-8 text-primary-foreground" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-display font-semibold line-clamp-2">
                      {project.title}
                    </h3>
                    <Badge variant="secondary" className="shrink-0">
                      {project.type}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {project.description}
                  </p>
                  <div className="pt-3 border-t border-border/50 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{project.date}</span>
                    </div>
                    <div className="bg-muted/50 rounded-md p-3">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <span className="font-semibold text-foreground">Editing Approach:</span>{" "}
                        {project.approach}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );

            return project.link ? (
              <a
                key={index}
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                {content}
              </a>
            ) : (
              content
            );
          })}
        </div>
      </div>
    </section>
  );
}
