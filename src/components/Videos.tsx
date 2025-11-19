import { Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import podcastThumbnail from "@/assets/convey-podcast-thumbnail.png";

const videoProjects = [
  {
    title: "Convey with Caroline Podcast",
    description: "Full video and audio production from filming to final delivery. Created visual identity and managed post-production for engaging podcast experience.",
    type: "Podcast Production",
    date: "Jan '25",
    thumbnail: podcastThumbnail,
    link: "https://open.spotify.com/show/60e2Uhy5tyYb4Xj4VINVKS?si=39d88e0150784a2a",
  },
  {
    title: "County Government Campaign",
    description: "Assisted in setting up camera equipment and supported live broadcasts ensuring high-quality visual content for government communications.",
    type: "Live Broadcast",
    date: "2023",
  },
  {
    title: "Brand Campaign Videos",
    description: "Produced promotional video content for iClear Wellife Service, contributing to 25% growth in brand visibility.",
    type: "Marketing Videos",
    date: "2024",
  },
  {
    title: "Social Media Content",
    description: "Created engaging video content for social media platforms, driving 30+ multimedia assets for various clients.",
    type: "Social Content",
    date: "2024-Present",
  },
];

export function Videos() {
  return (
    <section id="videos" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
            Video <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From concept to final cut - showcasing expertise in video production, editing, and storytelling
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {videoProjects.map((project, index) => {
            const CardWrapper = project.link ? 'a' : 'div';
            const cardProps = project.link ? { href: project.link, target: "_blank", rel: "noopener noreferrer" } : {};
            
            return (
              <CardWrapper key={index} {...cardProps} className="block">
                <Card className="group hover-lift cursor-pointer border-2 hover:border-primary/50 transition-all overflow-hidden h-full">
                  <div className="aspect-video relative overflow-hidden">
                    {project.thumbnail ? (
                      <>
                        <img 
                          src={project.thumbnail} 
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-elegant">
                            <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div className="relative z-10 flex flex-col items-center gap-2">
                            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-elegant">
                              <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    <Badge variant="secondary" className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm">
                      {project.type}
                    </Badge>
                  </div>
                  <CardContent className="p-6 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-xl font-display font-semibold group-hover:text-primary transition-colors">
                        {project.title}
                      </h3>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {project.date}
                      </span>
                    </div>
                    <p className="text-muted-foreground">{project.description}</p>
                  </CardContent>
                </Card>
              </CardWrapper>
            );
          })}
        </div>

        <div className="mt-12 text-center space-y-4">
          <p className="text-muted-foreground">
            Video embeds from YouTube and Vimeo can be added here
          </p>
        </div>
      </div>
    </section>
  );
}
