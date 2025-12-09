import { TrendingUp, Users, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import logoConvey from "@/assets/logo-convey.png";
import logoTechmindset from "@/assets/logo-techmindset.png";
import logoJoan from "@/assets/logo-joan.png";
import logoIclear from "@/assets/logo-iclear.png";

const brandsManagedData = [
  { name: "iClear Wellife Service", industry: "Water Purification Company", logo: logoIclear },
  { name: "Convey Communications", industry: "PR Firm", logo: logoConvey },
  { name: "Joan Mbesya", industry: "Personal Brand", logo: logoJoan },
  { name: "TechMindset Africa", industry: "AI Company", logo: logoTechmindset },
];

const socialProjects = [
  {
    title: "Instagram Campaign Series",
    description: "30-day content strategy with carousel posts driving 80% engagement increase",
    type: "Campaign",
    thumbnail: "/placeholder.svg",
  },
  {
    title: "Brand Identity Posts",
    description: "Cohesive social media design maintaining consistent brand voice",
    type: "Content Design",
    thumbnail: "/placeholder.svg",
  },
  {
    title: "Growth Analytics Dashboard",
    description: "Data-driven insights showcasing 25% brand visibility growth",
    type: "Analytics",
    thumbnail: "/placeholder.svg",
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
  return (
    <section id="social-media" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
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

        {/* Social Media Projects */}
        <div className="mb-16">
          <h3 className="text-2xl sm:text-3xl font-display font-bold text-center mb-8">
            Featured Projects
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {socialProjects.map((project, index) => (
              <Card
                key={index}
                className="group cursor-pointer overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-elegant"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img
                    src={project.thumbnail}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h4 className="text-lg font-display font-semibold line-clamp-1">
                      {project.title}
                    </h4>
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
