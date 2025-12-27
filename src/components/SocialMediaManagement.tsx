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

const caseStudies = [
  {
    company: "iClear Wellife Service",
    role: "Assistant Marketing Supervisor",
    period: "Aug '24 - Present",
    metrics: [
      { label: "Engagement Increase", value: "80%", icon: TrendingUp },
      { label: "Brand Visibility Growth", value: "25%", icon: Target },
      { label: "Campaigns Executed", value: "12+", icon: Users },
    ],
  },
  {
    company: "Convey Communications",
    role: "Creative Digital Officer",
    period: "Feb '24 - May '25",
    metrics: [
      { label: "Client Engagement", value: "15%", icon: TrendingUp },
      { label: "Multimedia Assets", value: "30+", icon: Target },
    ],
  },
];

export function SocialMediaManagement() {
  const [expandedProject, setExpandedProject] = useState<number | null>(null);

  const handleProjectClick = (index: number) => {
    setExpandedProject(expandedProject === index ? null : index);
  };

  return (
    <section id="social-media" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
            Social Media <span className="text-gradient">Management</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Strategic content planning, creative execution, and data-driven analytics to build 
            engaging social media presence and drive measurable brand growth across platforms.
          </p>
        </div>

        {/* Brands & Accounts Managed */}
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-center mb-8">
            Brands & Accounts I've Managed
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {brandsManagedData.map((brand, index) => (
              <Card
                key={index}
                className="border-2 hover:border-primary/30 transition-all duration-300 hover:shadow-soft"
              >
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="h-16 w-auto object-contain" />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl font-bold text-primary">{brand.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-foreground">{brand.name}</h4>
                    <p className="text-sm text-muted-foreground">{brand.industry}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Featured Projects - 2x2 Grid */}
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-center mb-8">
            Featured Projects
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
                        alt={project.title}
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

        {/* Case Studies */}
        <div>
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-center mb-8">
            Case Studies & Results
          </h3>
          <div className="space-y-8">
            {caseStudies.map((study, index) => (
              <Card key={index} className="border-2 hover:border-primary/30 transition-all">
                <CardHeader className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-2xl font-display">{study.company}</CardTitle>
                    <span className="text-sm text-muted-foreground">{study.period}</span>
                  </div>
                  <p className="text-primary font-medium">{study.role}</p>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {study.metrics.map((metric, idx) => {
                      const Icon = metric.icon;
                      return (
                        <div
                          key={idx}
                          className="bg-primary/5 rounded-lg p-4 space-y-2 border border-primary/10"
                        >
                          <Icon className="h-5 w-5 text-primary" />
                          <p className="text-2xl sm:text-3xl font-display font-bold text-primary">
                            {metric.value}
                          </p>
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
