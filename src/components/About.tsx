import { Badge } from "@/components/ui/badge";
import { ScrollReveal } from "./ScrollReveal";

const skills = [
  "Video Production & Editing",
  "Graphic Design",
  "Social Media Marketing",
  "Content Strategy & Development",
  "Digital Marketing & Analytics",
  "Adobe Premiere Pro",
  "Adobe Creative Suite",
  "Meta Business Suite",
  "Google Ads & SEO",
  "Photography",
  "Podcast Production",
  "AI-Powered Marketing (ChatGPT, Gemini, Midjourney)",
  "Public Relations",
  "Brand Strategy & Storytelling",
];

export function About() {
  return (
    <section id="about" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
                About <span className="text-gradient">Joseph Maina</span> — Digital Marketing Specialist
              </h2>
            </div>
          </ScrollReveal>

          <div className="space-y-12">
            <article className="space-y-6">
              <ScrollReveal direction="left" delay={0.1}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I'm <strong className="text-foreground">Joseph Isaac Maina</strong>, a{" "}
                  <span className="text-primary font-semibold">Digital Marketing Specialist</span> based
                  in <strong className="text-foreground">Nairobi, Kenya</strong> with over 3 years of
                  hands-on experience in video production, graphic design, social media management, and
                  data-driven campaign execution. I help brands grow their digital presence and turn
                  engagement into measurable revenue.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.2}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  My approach combines strategic thinking with creative execution — from producing
                  short-form video content and designing social media campaigns, to managing Meta Ads,
                  optimising SEO, and leveraging AI tools like ChatGPT and Midjourney to streamline
                  workflows. Whether it's managing social media accounts, producing podcast content, or
                  crafting multimedia campaigns, I bring a proven track record of driving real results.
                </p>
              </ScrollReveal>
              <ScrollReveal direction="left" delay={0.3}>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  I'm currently <span className="text-primary font-semibold">open to freelance projects
                  and full-time opportunities</span> in digital marketing, content creation, and brand
                  management. Let's build something impactful together.
                </p>
              </ScrollReveal>
            </article>

            <ScrollReveal direction="up" delay={0.2}>
              <div className="space-y-6">
                <h3 className="text-2xl font-display font-semibold">Skills & Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <ScrollReveal key={skill} direction="scale" delay={0.05 * i} duration={0.3}>
                      <Badge variant="secondary" className="text-sm px-4 py-2 hover:bg-primary/20 transition-colors">
                        {skill}
                      </Badge>
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <div className="space-y-6">
                <h3 className="text-2xl font-display font-semibold">Education</h3>
                <div className="space-y-4">
                  <div className="border-l-2 border-primary pl-6 space-y-1">
                    <h4 className="font-semibold text-lg">The Technical University of Kenya</h4>
                    <p className="text-primary">
                      Diploma in Journalism and Mass Communication — Broadcast Option
                    </p>
                    <p className="text-sm text-muted-foreground">Dec '23</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="scale" delay={0.2}>
              <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-8 text-center space-y-4">
                <p className="text-lg font-medium">
                  Joseph Maina · Digital Marketing Specialist
                </p>
                <p className="text-base text-muted-foreground">
                  Based in <span className="text-primary font-semibold">Nairobi, Kenya</span> — open to freelance & full-time roles
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                  <a href="mailto:joemaish084@gmail.com" className="hover:text-primary transition-colors">
                    joemaish084@gmail.com
                  </a>
                  <span>•</span>
                  <a href="tel:+254704700160" className="hover:text-primary transition-colors">
                    +254 704 700 160
                  </a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
