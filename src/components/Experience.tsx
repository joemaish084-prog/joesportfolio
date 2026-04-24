import { Briefcase, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollReveal } from "./ScrollReveal";
import { CollapsibleSection } from "./CollapsibleSection";

const experiences = [
  {
    company: "iClear Welllife Service Limited",
    role: "Assistant Marketing Supervisor / Digital Marketing Specialist",
    period: "May '25 - Present",
    responsibilities: [
      "Co-led end-to-end marketing strategy and execution across social media and digital campaigns, contributing to 80% growth in brand visibility and engagement",
      "Owned planning, execution, and optimization of 12+ integrated promotional campaigns, driving a 25% increase in brand reach and measurable ROI",
      "Built and managed paid and organic experimentation frameworks across creative assets, app store optimization, and landing pages to maximize growth",
      "Developed and managed retention marketing strategies and lifecycle campaigns to grow and retain the user base",
      "Introduced AI-powered marketing workflows (ChatGPT, Gemini) to streamline ideation, content creation, and campaign planning",
      "Directed end-to-end content production (video, graphics, copy), ensuring brand alignment with business objectives",
      "Collaborated cross-functionally with internal teams to align marketing initiatives with organizational priorities",
    ],
  },
  {
    company: "Convey Communications",
    role: "Digital Creative Lead",
    period: "Jan '25 - Present",
    responsibilities: [
      "Led creative direction and digital strategy for the 'Convey with Caroline' podcast, defining brand identity, tone, audience growth strategy, and platform expansion",
      "Designed and executed multi-platform promotional campaigns including reels, teasers, thumbnails, and branded content across social channels",
      "Owned full multimedia production lifecycle: concept development, filming, editing, sound design, and post-production",
    ],
  },
  {
    company: "Convey Communications",
    role: "Creative Digital Officer",
    period: "Feb '24 - May '25",
    responsibilities: [
      "Grew audience engagement and brand clarity through consistent, high-quality storytelling and platform-specific content distribution",
      "Spearheaded digital content execution for internal brand initiatives and client campaigns, delivering 30+ multimedia assets",
      "Achieved a 15% increase in engagement and brand visibility through strategic content improvements informed by performance analysis",
      "Supported senior leadership in campaign ideation, execution, and optimization across digital and social channels",
    ],
  },
  {
    company: "County Government of Nyeri",
    role: "Communications Intern",
    period: "May '23 - Aug '23",
    responsibilities: [
      "Supported public communications through content creation, field interviews, digital storytelling, and social media content strategy",
      "Assisted in script development, live broadcast setup, and multimedia production for community engagement initiatives",
    ],
  },
];

export function Experience() {
  return (
    <section id="experience" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
              Professional <span className="text-gradient">Experience</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Building brands and driving engagement through strategic digital marketing, 
              creative content, and data-driven campaigns.
            </p>
          </div>
        </ScrollReveal>

        <CollapsibleSection
          id="experience-list"
          title="Roles & Responsibilities"
          defaultOpen
          className="max-w-4xl mx-auto"
        >
          <div className="space-y-6">
            {experiences.map((exp, index) => (
              <ScrollReveal key={index} direction="up" delay={index * 0.15}>
                <Card className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
                  <CardHeader className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="space-y-2">
                        <CardTitle className="text-xl sm:text-2xl font-display flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-primary" />
                          {exp.role}
                        </CardTitle>
                        <p className="text-lg font-semibold text-foreground/90">
                          {exp.company}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{exp.period}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {exp.responsibilities.map((responsibility, idx) => (
                        <li
                          key={idx}
                          className="flex gap-3 text-muted-foreground leading-relaxed"
                        >
                          <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                          <span>{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </CollapsibleSection>
      </div>
    </section>
  );
}
