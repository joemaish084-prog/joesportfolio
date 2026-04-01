import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const managedAccounts = [
  {
    name: "iClear Well Life Service",
    role: "Social Media Management, Content Creation, Strategy, Growth",
    platforms: [
      { name: "Instagram", url: "https://www.instagram.com/iclear_water/", icon: "instagram" },
      { name: "Facebook", url: "https://www.facebook.com/iclearwater", icon: "facebook" },
      { name: "TikTok", url: "https://www.tiktok.com/@iclear_water", icon: "tiktok" },
    ],
    description: "Water purification company",
  },
  {
    name: "Convey Communications",
    role: "Digital Content, Client Management, Brand Strategy",
    platforms: [
      { name: "Instagram", url: "https://www.instagram.com/conveycommunications/", icon: "instagram" },
      { name: "Facebook", url: "https://www.facebook.com/conveycommunications", icon: "facebook" },
    ],
    description: "PR agency",
  },
  {
    name: "Convey With Caroline",
    role: "Podcast Production, Visual Design, Social Strategy",
    platforms: [
      { name: "YouTube", url: "https://www.youtube.com/@CarolineNjiruConveys", icon: "youtube" },
      { name: "Instagram", url: "https://www.instagram.com/carolinenjiruconveys/", icon: "instagram" },
    ],
    description: "Podcast",
  },
  {
    name: "Joan Mbesya",
    role: "Content Creation, Strategy, Design, Growth",
    platforms: [
      { name: "YouTube", url: "https://www.youtube.com/@JoanMbesyaAI", icon: "youtube" },
      { name: "Facebook", url: "https://www.facebook.com/joan.mbesya.7", icon: "facebook" },
      { name: "Instagram", url: "https://www.instagram.com/joanmbesya/", icon: "instagram" },
    ],
    description: "Personal brand",
  },
];

const PlatformIcon = ({ platform }: { platform: string }) => {
  const iconClass = "w-5 h-5";
  
  switch (platform) {
    case "youtube":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case "instagram":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      );
    case "facebook":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case "tiktok":
      return (
        <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      );
    default:
      return null;
  }
};

import { ScrollReveal } from "./ScrollReveal";

export function ManagedAccounts() {
  return (
    <section id="managed-accounts" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
              Social Media Accounts <span className="text-gradient">Managed</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Building and growing digital presence across multiple platforms with strategic 
              content creation, design, and data-driven growth strategies.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {managedAccounts.map((account, index) => (
            <ScrollReveal key={index} direction="up" delay={index * 0.1}>
            <Card
              className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-elegant hover:-translate-y-2"
            >
              <CardHeader className="space-y-3 pb-4">
                <CardTitle className="text-xl font-display">{account.name}</CardTitle>
                {account.description && (
                  <p className="text-xs text-muted-foreground/80 font-medium">
                    {account.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {account.role}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-3">
                  {account.platforms.map((platform, idx) => (
                    <a
                      key={idx}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 rounded-md bg-primary/10 hover:bg-primary/20 text-primary transition-colors duration-200 group/link"
                      aria-label={`${account.name} on ${platform.name}`}
                    >
                      <PlatformIcon platform={platform.icon} />
                      <span className="text-sm font-medium">{platform.name}</span>
                      <ExternalLink className="w-3 h-3 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
