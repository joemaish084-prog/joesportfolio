import { Badge } from "@/components/ui/badge";

const skills = [
  "Adobe Creative Suite",
  "Video Editing",
  "Graphic Design",
  "Social Media Marketing",
  "Content Development",
  "Digital Marketing",
  "Photography",
  "Podcasting",
  "Adobe Premiere",
  "AI Tools",
  "Public Relations",
  "Communication",
];

export function About() {
  return (
    <section id="about" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
              About <span className="text-gradient">Me</span>
            </h2>
          </div>

          <div className="space-y-12">
            <div className="space-y-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Creative marketing specialist with{" "}
                <span className="text-primary font-semibold">3+ years' experience</span> in video
                production, graphic design, and social media strategy. I've delivered campaigns that
                boosted engagement by 30% and built strong brand loyalty across diverse industries.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                My approach combines strategic thinking with creative execution, transforming data
                into actionable insights and concepts into compelling visual stories. Whether it's
                managing social media accounts, producing podcast content, or crafting multimedia
                campaigns, I bring a proven track record of driving real results.
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-display font-semibold">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-sm px-4 py-2">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-display font-semibold">Education</h3>
              <div className="space-y-4">
                <div className="border-l-2 border-primary pl-6 space-y-1">
                  <h4 className="font-semibold text-lg">The Technical University of Kenya</h4>
                  <p className="text-primary">
                    Diploma in Journalism and Mass Communication - Broadcast Option
                  </p>
                  <p className="text-sm text-muted-foreground">Dec '23</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-8 text-center space-y-4">
              <p className="text-lg font-medium">
                Based in <span className="text-primary">Nairobi, Kenya</span>
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
                <a href="mailto:joemaish084@gmail.com" className="hover:text-primary transition-colors">
                  joemaish084@gmail.com
                </a>
                <span>•</span>
                <a href="tel:0704700160" className="hover:text-primary transition-colors">
                  0704 700 160
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
