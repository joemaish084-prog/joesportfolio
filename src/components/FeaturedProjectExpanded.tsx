import { useState, useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Play, Image as ImageIcon, Video } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MediaItem {
  thumbnail: string;
  fullImage?: string;
  videoUrl?: string;
  title: string;
}

interface FeaturedProjectExpandedProps {
  isOpen: boolean;
  designs: MediaItem[];
  videos: MediaItem[];
  onClose: () => void;
}

export function FeaturedProjectExpanded({
  isOpen,
  designs,
  videos,
}: FeaturedProjectExpandedProps) {
  const [activeTab, setActiveTab] = useState<"designs" | "videos">("designs");
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const hasDesigns = designs.length > 0;
  const hasVideos = videos.length > 0;

  // Set default tab based on available content
  useEffect(() => {
    if (isOpen) {
      if (hasDesigns) {
        setActiveTab("designs");
      } else if (hasVideos) {
        setActiveTab("videos");
      }
      // Trigger animation after mount
      setTimeout(() => setIsVisible(true), 50);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, hasDesigns, hasVideos]);

  // Autoplay plugin
  const autoplayPlugin = useCallback(
    () => Autoplay({ delay: 3000, stopOnInteraction: true, stopOnMouseEnter: true }),
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: true,
      containScroll: false,
      align: "start",
    },
    [autoplayPlugin()]
  );

  // Reset carousel when tab changes
  useEffect(() => {
    if (emblaApi) {
      emblaApi.scrollTo(0);
    }
  }, [activeTab, emblaApi]);

  if (!isOpen || (!hasDesigns && !hasVideos)) return null;

  const currentItems = activeTab === "designs" ? designs : videos;
  // Triple items for infinite loop effect
  const infiniteItems = [...currentItems, ...currentItems, ...currentItems];

  const handleItemClick = (item: MediaItem) => {
    if (activeTab === "videos" && item.videoUrl) {
      window.open(item.videoUrl, "_blank", "noopener,noreferrer");
    } else if (activeTab === "designs") {
      setSelectedImage(item);
    }
  };

  return (
    <>
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          isVisible 
            ? "max-h-[600px] opacity-100 translate-y-0" 
            : "max-h-0 opacity-0 -translate-y-4"
        )}
      >
        <div className="pt-6 pb-2">
          {/* Tabs */}
          <div className="flex justify-center gap-3 mb-6">
            {hasDesigns && (
              <button
                onClick={() => setActiveTab("designs")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300",
                  activeTab === "designs"
                    ? "bg-primary text-primary-foreground shadow-elegant"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <ImageIcon className="h-4 w-4" />
                Designs / Photos
              </button>
            )}
            {hasVideos && (
              <button
                onClick={() => setActiveTab("videos")}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300",
                  activeTab === "videos"
                    ? "bg-primary text-primary-foreground shadow-elegant"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                )}
              >
                <Video className="h-4 w-4" />
                Videos
              </button>
            )}
          </div>

          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {infiniteItems.map((item, index) => (
                <div
                  key={`${activeTab}-${index}`}
                  className={cn(
                    "min-w-0 px-2 transition-all duration-500",
                    // Responsive: 1 on mobile, 2-3 on tablet, 3-4 on desktop
                    "flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_35%] lg:flex-[0_0_28%]",
                    // Staggered animation
                    isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
                  )}
                  style={{
                    transitionDelay: `${Math.min(index * 50, 300)}ms`,
                  }}
                >
                  <button
                    onClick={() => handleItemClick(item)}
                    className="w-full group relative overflow-hidden rounded-xl border-2 border-border hover:border-primary/50 transition-all duration-300 bg-background shadow-soft hover:shadow-elegant cursor-pointer"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Play icon overlay for videos */}
                      {activeTab === "videos" && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-primary/90 rounded-full p-4 shadow-lg transform transition-transform duration-300 group-hover:scale-110">
                            <Play className="h-8 w-8 text-primary-foreground fill-primary-foreground" />
                          </div>
                        </div>
                      )}
                      
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <h4 className="text-base font-display font-semibold text-white line-clamp-2">
                          {item.title}
                        </h4>
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-4">
            Swipe to browse • Click to {activeTab === "videos" ? "watch" : "view"}
          </p>
        </div>
      </div>

      {/* Lightbox Dialog for Designs */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          <DialogTitle className="sr-only">{selectedImage?.title}</DialogTitle>
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.fullImage || selectedImage.thumbnail}
                alt={selectedImage.title}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                <h3 className="text-xl font-display font-bold text-white">
                  {selectedImage.title}
                </h3>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
