import { ExternalLink } from "lucide-react";
import podcastThumbnail from "@/assets/convey-podcast-thumbnail.webp";
import youtubeThumbnail from "@/assets/content-youtube-thumbnail.webp";
import tiktokThumbnail from "@/assets/content-tiktok-thumbnail.webp";
import asdspThumbnail from "@/assets/content-asdsp-thumbnail.webp";

const contentLinks = [
  {
    title: "Convey with Caroline - Podcast",
    url: "https://open.spotify.com/show/60e2Uhy5tyYb4Xj4VINVKS?si=48da04b7aca84374",
    platform: "Spotify Podcast",
    thumbnail: podcastThumbnail,
    description: "Full podcast episodes featuring engaging conversations",
  },
  {
    title: "Caroline Njiru Conveys Channel",
    url: "https://www.youtube.com/@CarolineNjiruConveys",
    platform: "YouTube Channel",
    thumbnail: youtubeThumbnail,
    description: "Subscribe for more podcast episodes and content",
  },
  {
    title: "TikTok Content",
    url: "https://www.tiktok.com/@iclear_water",
    platform: "TikTok",
    thumbnail: tiktokThumbnail,
    description: "Short-form video content and creative campaigns",
  },
  {
    title: "ASDSP Programme – A Game Changer for Nyeri Farmers",
    url: "https://youtu.be/7jCqcsyXGC8?si=qhxuqCsP1xOCc53W",
    platform: "Documentary",
    thumbnail: asdspThumbnail,
    description: "Full documentary collaboration with County Government of Nyeri - shooting & photography",
  },
];

export function ContentLinks() {
  return (
    <section id="content" className="py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
            Content I've <span className="text-gradient">Created</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore my creative work across multiple platforms - from podcasts to social media campaigns.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {contentLinks.map((content, index) => (
            <a
              key={index}
              href={content.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary/50 transition-all duration-300 bg-background shadow-soft hover:shadow-elegant hover:-translate-y-1"
            >
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={content.thumbnail}
                  alt={content.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute top-3 right-3 bg-primary/90 text-primary-foreground text-xs font-medium px-3 py-1 rounded-full">
                  {content.platform}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                    <ExternalLink className="w-8 h-8 text-primary-foreground" />
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-2">
                <h3 className="text-xl font-display font-bold group-hover:text-primary transition-colors">
                  {content.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {content.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
