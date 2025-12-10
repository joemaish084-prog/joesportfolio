import { Building2 } from "lucide-react";

const clients = [
  {
    name: "iClear Wellife Service",
    role: "Assistant Marketing Supervisor",
    description: "Social media management, campaign execution, brand visibility growth",
  },
  {
    name: "Convey Communications",
    role: "Creative Digital Officer",
    description: "Content creation, multimedia design, campaign optimization",
  },
  {
    name: "County Government of Nyeri",
    role: "Communications Intern",
    description: "Content creation, live broadcasts, script writing",
  },
  {
    name: "Convey with Caroline",
    role: "Visual & Production Lead",
    description: "Podcast branding, video/audio production, post-production",
  },
];

export function Clients() {
  return (
    <section id="clients" className="py-20 sm:py-32 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
            Brands & <span className="text-gradient">Clients</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trusted by leading organizations to deliver creative marketing excellence
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {clients.map((client, index) => (
            <div
              key={index}
              className="group bg-card border-2 border-border rounded-xl p-6 hover-lift hover:border-primary/30 transition-all space-y-4"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                  {client.name}
                </h3>
                <p className="text-sm text-primary font-medium">{client.role}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {client.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
