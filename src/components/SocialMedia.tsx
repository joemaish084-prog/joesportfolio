import { TrendingUp, Users, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    achievements: [
      "Managed social media accounts with strategic content creation as a Digital Marketing Specialist in Nairobi",
      "Developed creative marketing strategies that increased engagement by 80%",
      "Executed 12+ promotional campaigns driving 25% brand visibility growth",
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
    achievements: [
      "Spearheaded content creation maintaining brand identity across digital channels in Kenya",
      "Designed 30+ multimedia assets boosting brand visibility by 15%",
      "Transformed campaign data into actionable insights for improved SEO strategy",
    ],
  },
];

export function SocialMedia() {
  return (
    <section id="social-media" className="py-20 sm:py-32 bg-muted/30" aria-label="Social media marketing case studies">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
            Social Media <span className="text-gradient">Case Studies</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proven track record of driving engagement and building brand presence across platforms as a Digital Marketing Specialist in Nairobi
          </p>
        </div>

        <div className="space-y-8">
          {caseStudies.map((study, index) => (
            <article key={index}>
              <Card className="border-2 hover:border-primary/30 transition-all">
                <CardHeader className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <CardTitle className="text-2xl font-display">
                      <h3 className="text-2xl font-display font-semibold">{study.company}</h3>
                    </CardTitle>
                    <span className="text-sm text-muted-foreground">{study.period}</span>
                  </div>
                  <p className="text-primary font-medium">{study.role}</p>
                </CardHeader>
                <CardContent className="space-y-6">
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
                            <strong>{metric.value}</strong>
                          </p>
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Key Achievements:</h4>
                    <ul className="space-y-2">
                      {study.achievements.map((achievement, idx) => (
                        <li key={idx} className="flex items-start gap-3 text-muted-foreground">
                          <span className="h-1.5 w-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                          <span>{achievement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
