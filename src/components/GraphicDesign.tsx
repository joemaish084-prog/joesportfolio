import { useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import waterPurifiers from "@/assets/design-water-purifiers.png";
import waterJourney from "@/assets/design-water-journey.png";
import tecno1 from "@/assets/design-tecno-1.png";
import tecno2 from "@/assets/design-tecno-2.png";
import tecno3 from "@/assets/design-tecno-3.png";
import podcastCover from "@/assets/design-podcast-cover.png";
import iclearFacebook from "@/assets/design-iclear-facebook.png";
import mkush from "@/assets/design-mkush.png";
import iclearNewMonth from "@/assets/design-iclear-new-month.png";
import iclearOct from "@/assets/design-iclear-oct.png";
import iclearMonday from "@/assets/design-iclear-monday.png";
import iclearHomes from "@/assets/design-iclear-homes.png";
import iclearDecember from "@/assets/design-iclear-december.png";
import iclearParachute from "@/assets/design-iclear-parachute.png";
import iclearFilter from "@/assets/design-iclear-filter.png";

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
  {
    title: "iClear Water Facebook Campaign",
    image: iclearFacebook,
    description: "Social media header design for brand awareness",
  },
  {
    title: "MKUSH Music Album Cover",
    image: mkush,
    description: "Hip-hop album artwork and branding",
  },
  {
    title: "iClear New Month Campaign",
    image: iclearNewMonth,
    description: "Monthly engagement post design",
  },
  {
    title: "iClear October Campaign",
    image: iclearOct,
    description: "Seasonal social media content",
  },
  {
    title: "iClear Monday Motivation",
    image: iclearMonday,
    description: "Weekly engagement post series",
  },
  {
    title: "iClear Built for Homes",
    image: iclearHomes,
    description: "Christmas promotional campaign",
  },
  {
    title: "iClear Happy December",
    image: iclearDecember,
    description: "Festive new month celebration design",
  },
  {
    title: "iClear Filter Delivery",
    image: iclearParachute,
    description: "Creative product visualization",
  },
  {
    title: "iClear December Promo",
    image: iclearFilter,
    description: "Free filter promotional campaign",
  },
];

export function GraphicDesign() {
  const [selectedDesign, setSelectedDesign] = useState<typeof designs[0] | null>(null);
  
  // Split designs into two rows
  const firstRow = designs.slice(0, Math.ceil(designs.length / 2));
  const secondRow = designs.slice(Math.ceil(designs.length / 2));
  
  // Create infinite loop by tripling the designs
  const infiniteFirstRow = [...firstRow, ...firstRow, ...firstRow];
  const infiniteSecondRow = [...secondRow, ...secondRow, ...secondRow];

  const [emblaRef1] = useEmblaCarousel(
    { 
      loop: true,
      dragFree: true,
      containScroll: false,
      startIndex: firstRow.length,
    },
    [Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  const [emblaRef2] = useEmblaCarousel(
    { 
      loop: true,
      dragFree: true,
      containScroll: false,
      startIndex: secondRow.length,
    },
    [Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  return (
    <section id="graphic-design" className="py-20 sm:py-32 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
            Graphic <span className="text-gradient">Design</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Creative visual designs for digital marketing campaigns, brand identity, 
            social media content, and promotional materials that drive engagement and conversions.
          </p>
        </div>

        <div className="space-y-6">
          {/* First Row Carousel */}
          <div className="overflow-hidden" ref={emblaRef1}>
            <div className="flex">
              {infiniteFirstRow.map((design, index) => (
                <div
                  key={`row1-${index}`}
                  className="flex-[0_0_300px] sm:flex-[0_0_400px] lg:flex-[0_0_500px] min-w-0 px-4"
                >
                  <button
                    onClick={() => setSelectedDesign(design)}
                    className="w-full group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary/50 transition-all duration-300 bg-background shadow-soft hover:shadow-elegant cursor-pointer"
                  >
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
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Second Row Carousel */}
          <div className="overflow-hidden" ref={emblaRef2}>
            <div className="flex">
              {infiniteSecondRow.map((design, index) => (
                <div
                  key={`row2-${index}`}
                  className="flex-[0_0_300px] sm:flex-[0_0_400px] lg:flex-[0_0_500px] min-w-0 px-4"
                >
                  <button
                    onClick={() => setSelectedDesign(design)}
                    className="w-full group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary/50 transition-all duration-300 bg-background shadow-soft hover:shadow-elegant cursor-pointer"
                  >
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
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Swipe to browse • Click to view • Auto-scrolls when idle
        </p>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedDesign} onOpenChange={(open) => !open && setSelectedDesign(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedDesign?.title}
          </DialogTitle>
          {selectedDesign && (
            <div className="relative">
              <img
                src={selectedDesign.image}
                alt={selectedDesign.title}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                <h3 className="text-2xl font-display font-bold text-white mb-2">
                  {selectedDesign.title}
                </h3>
                <p className="text-white/90">{selectedDesign.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
