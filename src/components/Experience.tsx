import { Briefcase, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const experiences = [
  {
    company: "iClear Well Life Service",
    role: "Digital Marketing Specialist",
    period: "Aug '25 - Present",
    responsibilities: [
      "Managed social media accounts and created compelling content to boost follower growth and online engagement",
      "Developed and implemented creative marketing strategies that increased audience engagement and campaign reach",
      "Supported the team in developing unique campaigns, helping to achieve a 80% increase in brand visibility",
      "Assisted in planning and executing 12+ promotional campaigns, resulting in a 25% growth in brand visibility within one year",
    ],
  },
  {
    company: "iClear Well Life Service",
    role: "Content Creator",
    period: "May '25 - Present",
    responsibilities: [
      "Promoted to Assistant Marketing Supervisor to support the supervision and coordination of day-to-day marketing operations",
      "Demonstrated strong leadership capabilities, strategic insight, and a deep commitment to the success of marketing initiatives",
      "Played a key role in driving several successful campaigns and enhancing the brand's visibility",
      "Collaborated closely with internal teams and external partners to ensure effective marketing operations",
    ],
  },
  {
    company: "Convey Communications",
    role: "Creative Digital Officer",
    period: "Feb '24 - May '25",
    responsibilities: [
      "Spearheaded content creation for both Convey Communications and its clients, maintaining brand identity while amplifying engagement across all platforms",
      "Designed and delivered over 30 multimedia assets, contributing to a 15% surge in client engagement and stronger brand visibility",
      "Transformed campaign data into actionable insights, optimizing content strategies and boosting audience interaction by 15%",
    ],
  },
  {
    company: "County Government of Nyeri",
    role: "Communications Intern",
    period: "May '23 - Aug '23",
    responsibilities: [
      "Assisted in data collection of current affairs by conducting street interviews",
      "Collected and created content, such as case studies, photos, and videos, to aid various communication",
      "Assisted in setting up camera equipment and supported live broadcasts to ensure the production of high-quality visual content",
      "Crafted clear, concise and engaging script for the social media pages",
    ],
  },
];

export function Experience() {
  return (
    <section id="experience" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
            Professional <span className="text-gradient">Experience</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Building brands and driving engagement through strategic digital marketing, 
            creative content, and data-driven campaigns.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-6">
          {experiences.map((exp, index) => (
            <Card
              key={index}
              className="group border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-elegant"
            >
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
          ))}
        </div>
      </div>
    </section>
  );
}
