import waterPurifiers from "@/assets/design-water-purifiers.png";
import waterJourney from "@/assets/design-water-journey.png";
import tecno1 from "@/assets/design-tecno-1.png";
import tecno2 from "@/assets/design-tecno-2.png";
import tecno3 from "@/assets/design-tecno-3.png";
import podcastCover from "@/assets/design-podcast-cover.png";

const designs = [
  {
    title: "iClear Water Purifiers Campaign",
    image: waterPurifiers,
    description: "Product showcase design with pricing tiers",
  },
  {
    title: "iClear Brand Campaign",
    image: waterJourney,
    description: "Lifestyle marketing creative",
  },
  {
    title: "TECNO x iClear Collaboration",
    image: tecno1,
    description: "Cross-brand promotional design",
  },
  {
    title: "TECNO Product Campaign",
    image: tecno2,
    description: "Digital marketing creative with call-to-action",
  },
  {
    title: "TECNO Mobile Promotion",
    image: tecno3,
    description: "E-commerce promotional design",
  },
  {
    title: "Convey with Caroline Podcast",
    image: podcastCover,
    description: "Podcast branding and cover art",
  },
];

export function GraphicDesign() {
  return (
    <section id="graphic-design" className="py-20 sm:py-32 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
            Graphic <span className="text-gradient">Design</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Creative visual designs for digital marketing campaigns, brand identity, 
            social media content, and promotional materials that drive engagement and conversions.
          </p>
        </div>

        {/* Infinite Loop Carousel */}
        <div className="relative">
          <div className="flex animate-infinite-scroll pause-animation">
            {/* First set of designs */}
            {designs.map((design, index) => (
              <div
                key={`first-${index}`}
                className="flex-shrink-0 w-[300px] sm:w-[400px] lg:w-[500px] mx-4"
              >
                <div className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary/50 transition-all duration-300 bg-background shadow-soft hover:shadow-elegant">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={design.image}
                      alt={design.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-xl font-display font-bold text-white mb-2">
                        {design.title}
                      </h3>
                      <p className="text-white/90 text-sm">{design.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {designs.map((design, index) => (
              <div
                key={`second-${index}`}
                className="flex-shrink-0 w-[300px] sm:w-[400px] lg:w-[500px] mx-4"
              >
                <div className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary/50 transition-all duration-300 bg-background shadow-soft hover:shadow-elegant">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={design.image}
                      alt={design.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-xl font-display font-bold text-white mb-2">
                        {design.title}
                      </h3>
                      <p className="text-white/90 text-sm">{design.description}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Hover over designs to pause • Scroll automatically
        </p>
      </div>
    </section>
  );
}
