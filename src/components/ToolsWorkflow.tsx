import { useEffect, useRef, useState } from "react";
import { Sparkles } from "lucide-react";
import { ScrollReveal } from "./ScrollReveal";

// Import brand icons
import iconMeta from "@/assets/icon-meta.webp";
import iconGemini from "@/assets/icon-gemini.webp";
import iconChatgpt from "@/assets/icon-chatgpt.webp";
import iconDavinci from "@/assets/icon-davinci.webp";
import iconPremiere from "@/assets/icon-premiere.webp";
import iconCanva from "@/assets/icon-canva.webp";
import iconClaude from "@/assets/icon-claude.webp";
import iconCapcut from "@/assets/icon-capcut.webp";
import iconInstagram from "@/assets/icon-instagram.webp";
import iconTiktok from "@/assets/icon-tiktok.webp";
import iconFacebook from "@/assets/icon-facebook.webp";
import iconYoutube from "@/assets/icon-youtube.webp";
import iconLinkedin from "@/assets/icon-linkedin.webp";
import iconX from "@/assets/icon-x.webp";
import iconMidjourney from "@/assets/icon-midjourney.webp";

const tools = [
  { name: "Canva", proficiency: 95, icon: iconCanva },
  { name: "CapCut", proficiency: 90, icon: iconCapcut },
  { name: "DaVinci Resolve", proficiency: 85, icon: iconDavinci },
  { name: "Premiere Pro", proficiency: 88, icon: iconPremiere },
  { name: "ChatGPT", proficiency: 98, icon: iconChatgpt },
  { name: "Midjourney", proficiency: 92, icon: iconMidjourney },
  { name: "Gemini", proficiency: 94, icon: iconGemini },
  { name: "Claude", proficiency: 93, icon: iconClaude },
  { name: "Meta Business Suite", proficiency: 94, icon: iconMeta },
  { name: "Instagram", proficiency: 96, icon: iconInstagram },
  { name: "TikTok", proficiency: 92, icon: iconTiktok },
  { name: "Facebook", proficiency: 94, icon: iconFacebook },
  { name: "YouTube", proficiency: 90, icon: iconYoutube },
  { name: "LinkedIn", proficiency: 88, icon: iconLinkedin },
  { name: "X", proficiency: 85, icon: iconX },
];

export const ToolsWorkflow = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || isHovered || isDragging) return;

    const scroll = () => {
      if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
        scrollContainer.scrollLeft = 0;
      } else {
        scrollContainer.scrollLeft += 1;
      }
    };

    const interval = setInterval(scroll, 30);
    return () => clearInterval(interval);
  }, [isHovered, isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0);
    const walk = (x - startX) * 2;
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollLeft - walk;
    }
  };

  // Duplicate tools for seamless infinite scroll
  const duplicatedTools = [...tools, ...tools];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3 gradient-underline pb-4">
              Tools That Power My Workflow
            </h2>
            <p className="text-muted-foreground text-lg">
              These Are the Tools That Power My Work
            </p>
          </div>
        </ScrollReveal>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide cursor-grab active:cursor-grabbing select-none"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsDragging(false);
          }}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchEnd={() => setIsDragging(false)}
          onTouchMove={handleTouchMove}
        >
          {duplicatedTools.map((tool, index) => (
            <div
              key={`${tool.name}-${index}`}
              className="flex-shrink-0 w-44 bg-card rounded-2xl p-6 shadow-soft hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 border border-border/50"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                  {tool.icon ? (
                    <img 
                       src={tool.icon} 
                       alt={`${tool.name} icon`} 
                       width={40}
                       height={40}
                       loading="lazy"
                       className="w-10 h-10 object-contain"
                    />
                  ) : (
                    <Sparkles className="w-7 h-7 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm mb-2">
                    {tool.name}
                  </h3>
                  <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-orange-400 rounded-full transition-all duration-500"
                      style={{ width: `${tool.proficiency}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground mt-1 block">
                    {tool.proficiency}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
