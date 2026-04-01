import { useState } from "react";
import { TrendingUp, Users, Target, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FeaturedProjectExpanded } from "@/components/FeaturedProjectExpanded";
import { cn } from "@/lib/utils";

import logoConvey from "@/assets/logo-convey.png";
import logoTechmindset from "@/assets/logo-techmindset.png";
import logoJoan from "@/assets/logo-joan.png";
import logoIclear from "@/assets/logo-iclear.png";
import logoNorthgate from "@/assets/logo-northgate.png";
import logoPowwater from "@/assets/logo-powwater.png";

// Design assets
import waterPurifiers from "@/assets/design-water-purifiers.png";
import waterJourney from "@/assets/design-water-journey.png";
import iclearFacebook from "@/assets/design-iclear-facebook.png";
import iclearNewMonth from "@/assets/design-iclear-new-month.png";
import iclearOct from "@/assets/design-iclear-oct.png";
import iclearMonday from "@/assets/design-iclear-monday.png";
import iclearHomes from "@/assets/design-iclear-homes.png";
import iclearDecember from "@/assets/design-iclear-december.png";
import iclearParachute from "@/assets/design-iclear-parachute.png";
import iclearFilter from "@/assets/design-iclear-filter.png";
import podcastCover from "@/assets/design-podcast-cover.png";
import tecno1 from "@/assets/design-tecno-1.png";
import tecno2 from "@/assets/design-tecno-2.png";
import tecno3 from "@/assets/design-tecno-3.png";

// New design assets
import freeFilterCampaign from "@/assets/design-free-filter-campaign.webp";
import iclearNewyear from "@/assets/design-iclear-newyear.webp";
import iclearPurity from "@/assets/design-iclear-purity.webp";
import iclearNakuruActivated from "@/assets/design-iclear-nakuru-activated.webp";
import iclearFreshLiving from "@/assets/design-iclear-fresh-living.webp";
import iclearBoxingDay from "@/assets/design-iclear-boxing-day.webp";
import schoolAdmission from "@/assets/design-school-admission.webp";
import schoolInnovative from "@/assets/design-school-innovative.webp";
import schoolChristmas from "@/assets/design-school-christmas.webp";
import christmasNewyear from "@/assets/design-christmas-newyear.webp";

// Content thumbnails
import contentYoutube from "@/assets/content-youtube-thumbnail.jpg";
import contentTiktok from "@/assets/content-tiktok-thumbnail.jpg";
import contentAsdsp from "@/assets/content-asdsp-thumbnail.png";
import conveyPodcast from "@/assets/convey-podcast-thumbnail.png";

const brandsManagedData = [
  { name: "iClear Wellife Service", industry: "Water Purification Company", logo: logoIclear },
  { name: "Convey Communications", industry: "PR Firm", logo: logoConvey },
  { name: "Joan Mbesya", industry: "Personal Brand", logo: logoJoan },
  { name: "TechMindset Africa", industry: "AI Company", logo: logoTechmindset },
  { name: "NorthGate School", industry: "Education", logo: logoNorthgate },
  { name: "PowWater", industry: "Water Services", logo: logoPowwater },
];

const socialProjects = [
  // Row 1 - New Designs
  {
    title: "Free Filter Campaign",
    description: "Strategic promotional campaign driving product awareness and customer engagement through compelling social media content",
    type: "Campaign",
    thumbnail: freeFilterCampaign,
    designs: [
      { thumbnail: freeFilterCampaign, fullImage: freeFilterCampaign, title: "Free Filter Campaign" },
      { thumbnail: iclearPurity, fullImage: iclearPurity, title: "Unmatched Purity Campaign" },
      { thumbnail: iclearNakuruActivated, fullImage: iclearNakuruActivated, title: "Nakuru Activated Campaign" },
      { thumbnail: iclearFreshLiving, fullImage: iclearFreshLiving, title: "Walk Your Way Fresh Living" },
      { thumbnail: iclearBoxingDay, fullImage: iclearBoxingDay, title: "Happy Boxing Day" },
      { thumbnail: iclearNewyear, fullImage: iclearNewyear, title: "Happy New Year 2025" },
    ],
    videos: [
      { thumbnail: contentTiktok, videoUrl: "https://www.tiktok.com/@iclearwellife", title: "iClear TikTok Content" },
    ],
  },
  {
    title: "Convey with Caroline Podcast",
    description: "Complete podcast branding, social media content strategy, and promotional material design",
    type: "Podcast Branding",
    thumbnail: podcastCover,
    designs: [
      { thumbnail: schoolAdmission, fullImage: schoolAdmission, title: "School Admission 2026" },
      { thumbnail: schoolInnovative, fullImage: schoolInnovative, title: "Innovative Learning Campaign" },
      { thumbnail: schoolChristmas, fullImage: schoolChristmas, title: "Merry Christmas Greeting" },
      { thumbnail: christmasNewyear, fullImage: christmasNewyear, title: "Merry Christmas & Happy New Year" },
      { thumbnail: podcastCover, fullImage: podcastCover, title: "Convey with Caroline Podcast Cover" },
    ],
    videos: [
      { thumbnail: conveyPodcast, videoUrl: "https://open.spotify.com/show/60e2Uhy5tyYb4Xj4VINVKS", title: "Convey with Caroline Podcast" },
      { thumbnail: contentYoutube, videoUrl: "https://www.youtube.com/@CarolineNjiruConveys", title: "Caroline Njiru YouTube Channel" },
    ],
  },
  // Row 2 - Existing Projects
  {
    title: "TECNO x iClear",
    description: "Collaborative brand partnership campaign showcasing cross-industry marketing synergy",
    type: "Collaboration",
    thumbnail: tecno1,
    designs: [
      { thumbnail: tecno1, fullImage: tecno1, title: "TECNO x iClear Collaboration" },
      { thumbnail: tecno2, fullImage: tecno2, title: "TECNO Product Campaign" },
      { thumbnail: tecno3, fullImage: tecno3, title: "TECNO Mobile Promotion" },
      { thumbnail: waterPurifiers, fullImage: waterPurifiers, title: "iClear Water Purifiers Campaign" },
      { thumbnail: waterJourney, fullImage: waterJourney, title: "iClear Brand Campaign" },
      { thumbnail: iclearHomes, fullImage: iclearHomes, title: "iClear Built for Homes" },
    ],
    videos: [],
  },
  {
    title: "ASDSP Documentary",
    description: "Documentary video production showcasing agricultural transformation and community impact storytelling",
    type: "Documentary",
    thumbnail: contentAsdsp,
    designs: [
      { thumbnail: iclearDecember, fullImage: iclearDecember, title: "iClear Happy December" },
      { thumbnail: iclearParachute, fullImage: iclearParachute, title: "iClear Filter Delivery" },
      { thumbnail: iclearFacebook, fullImage: iclearFacebook, title: "iClear Facebook Campaign" },
      { thumbnail: iclearNewMonth, fullImage: iclearNewMonth, title: "iClear New Month Campaign" },
      { thumbnail: iclearOct, fullImage: iclearOct, title: "iClear October Campaign" },
      { thumbnail: iclearMonday, fullImage: iclearMonday, title: "iClear Monday Motivation" },
      { thumbnail: iclearFilter, fullImage: iclearFilter, title: "iClear December Promo" },
    ],
    videos: [
      { thumbnail: contentAsdsp, videoUrl: "https://youtu.be/7jCqcsyXGC8", title: "ASDSP Documentary" },
    ],
  },
];

import { ScrollReveal } from "./ScrollReveal";

export function SocialMediaManagement() {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const handleProjectClick = (index: number) => {
    setExpandedProject(expandedProject === index ? null : index);
  };

  return (
    <section id="social-media" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
              Social Media <span className="text-gradient">Management</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Strategic content planning, creative execution, and data-driven analytics to build 
              engaging social media presence and drive measurable brand growth across platforms.
            </p>
          </div>
        </ScrollReveal>

        {/* Brands & Accounts Managed - Infinite Scroll */}
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-center mb-8">
            Brands & Accounts I've Managed
          </h3>
          <div 
            className="relative overflow-x-auto cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            <div className="flex animate-infinite-scroll hover:[animation-play-state:paused] active:[animation-play-state:paused] w-max">
              {[...brandsManagedData, ...brandsManagedData, ...brandsManagedData, ...brandsManagedData].map((brand, index) => (
                <div
                  key={`brand-${index}`}
                  className="flex-shrink-0 mx-8 sm:mx-12 flex flex-col items-center gap-2"
                >
                  <img
                    src={brand.logo}
                    alt={`${brand.name} logo - ${brand.industry}`}
                    width={112}
                    height={112}
                    loading="lazy"
                    className="h-20 sm:h-28 w-auto object-contain transition-all duration-300"
                    title={brand.name}
                  />
                  <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{brand.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Projects - 2x2 Grid */}
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-center mb-8">
            Campaign <span className="text-gradient">Projects</span>
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {socialProjects.map((project, index) => (
              <div key={index}>
                <Card
                  onClick={() => handleProjectClick(index)}
                  className={cn(
                    "group cursor-pointer overflow-hidden border-2 transition-all duration-300 h-full",
                    expandedProject === index
                      ? "border-primary shadow-elegant"
                      : "hover:border-primary/50 hover:shadow-elegant"
                  )}
                >
                  <div className="flex flex-col">
                    <div className="relative w-full aspect-[4/3] overflow-hidden bg-muted">
                       <img
                         src={project.thumbnail}
                         alt={`${project.title} - ${project.type} project by Joseph Maina`}
                         width={600}
                         height={450}
                         loading="lazy"
                         className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                       />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <Badge 
                        variant="secondary" 
                        className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm"
                      >
                        {project.type}
                      </Badge>
                    </div>
                    <CardContent className="p-6 flex flex-col justify-between flex-1">
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h4 className="text-xl font-display font-semibold">
                            {project.title}
                          </h4>
                          <ChevronDown
                            className={cn(
                              "h-5 w-5 text-muted-foreground transition-transform duration-300 flex-shrink-0",
                              expandedProject === index && "rotate-180"
                            )}
                          />
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                      <p className="text-xs text-primary mt-4 font-medium">
                        Click to explore {project.designs.length > 0 && project.videos.length > 0 
                          ? `${project.designs.length} designs & ${project.videos.length} video${project.videos.length > 1 ? 's' : ''}` 
                          : project.designs.length > 0 
                            ? `${project.designs.length} designs` 
                            : `${project.videos.length} video${project.videos.length > 1 ? 's' : ''}`}
                      </p>
                    </CardContent>
                  </div>
                </Card>
                
                {/* Expanded Content */}
                <FeaturedProjectExpanded
                  isOpen={expandedProject === index}
                  designs={project.designs}
                  videos={project.videos}
                  onClose={() => setExpandedProject(null)}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
