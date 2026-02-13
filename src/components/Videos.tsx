import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Play } from "lucide-react";
import thumb1 from "@/assets/video-thumb-1.png";
import thumb2 from "@/assets/video-thumb-2.png";
import thumb3 from "@/assets/video-thumb-3.png";
import thumb4 from "@/assets/video-thumb-4.png";

const videos = [
  {
    title: "iClear Water Delivery",
    thumbnail: thumb1,
    link: "https://www.instagram.com/reel/DT-w2FtjTnk/",
  },
  {
    title: "Commonly Asked Questions",
    thumbnail: thumb2,
    link: "https://www.instagram.com/reel/DUFhZLMCkI6/",
  },
  {
    title: "Filter Installation",
    thumbnail: thumb3,
    link: "https://www.instagram.com/reel/DR0_0WSCKvx/",
  },
  {
    title: "Corporate Trends",
    thumbnail: thumb4,
    link: "https://www.instagram.com/reel/DQ6zTmTjqlq/",
  },
];

const infiniteVideos = [...videos, ...videos, ...videos];

export function Videos() {
  const [emblaRef] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      containScroll: false,
      startIndex: videos.length,
    },
    [Autoplay({ delay: 2500, stopOnInteraction: true, stopOnMouseEnter: true })]
  );

  return (
    <section id="videos" className="py-20 sm:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
            Video <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Short-form video content created for social media — from concept to final cut
          </p>
        </div>
      </div>

      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {infiniteVideos.map((video, index) => (
            <div
              key={`video-${index}`}
              className="flex-[0_0_260px] sm:flex-[0_0_320px] lg:flex-[0_0_380px] min-w-0 px-3"
            >
              <a
                href={video.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary/50 transition-all duration-300 bg-background shadow-soft hover:shadow-elegant"
              >
                <div className="relative aspect-[9/16] overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center group-hover:scale-110 transition-transform shadow-elegant">
                      <Play className="h-7 w-7 text-primary-foreground ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-lg font-display font-bold text-white">
                      {video.title}
                    </h3>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Swipe to browse • Click to watch • Auto-scrolls when idle
      </p>
    </section>
  );
}
