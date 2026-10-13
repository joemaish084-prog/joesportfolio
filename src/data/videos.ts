import featuredThumb from "@/assets/featured-showreel-thumb.webp";
import longJoanThumb from "@/assets/longform-joan-mbesya.webp";
import longAsdspThumb from "@/assets/longform-asdsp.webp";
import thumb1 from "@/assets/video-thumb-1.webp";
import thumb2 from "@/assets/video-thumb-2.webp";
import thumb3 from "@/assets/video-thumb-3.webp";
import thumb4 from "@/assets/video-thumb-4.webp";
import thumb5 from "@/assets/video-thumb-5.webp";
import thumb6 from "@/assets/video-thumb-6.webp";
import thumb7 from "@/assets/video-thumb-7.webp";
import thumb8 from "@/assets/video-thumb-8.webp";
import thumb9 from "@/assets/video-thumb-9.webp";
import shortIclearDishwash from "@/assets/short-iclear-dishwash.webp";
import shortMajiNiUhai from "@/assets/short-maji-ni-uhai.webp";
import shortForTypography from "@/assets/short-for-typography.webp";

export type Platform = "Instagram" | "TikTok" | "YouTube";

export interface ShortVideo {
  title: string;
  thumbnail: string;
  link: string;
  platform: Platform;
  duration: string;
  uploadDate: string;
  description?: string;
}

export interface LongVideo {
  title: string;
  description: string;
  thumbnail: string;
  link: string;
  platform: Platform;
  duration: string;
  uploadDate: string;
}

// Newest first, by upload date. Add a video anywhere in these lists with its
// real uploadDate and it is placed automatically.
const byNewest = <T extends { uploadDate: string }>(list: T[]) =>
  [...list].sort((a, b) => b.uploadDate.localeCompare(a.uploadDate));

export const shortVideos: ShortVideo[] = byNewest([
  { title: "iClear Water Delivery Reel", thumbnail: thumb1, link: "https://www.instagram.com/reel/DT-w2FtjTnk/", platform: "Instagram", duration: "0:30", uploadDate: "2025-09-12", description: "Short-form Instagram reel for iClear Wellife water delivery — social media marketing & video production by Joseph Maina, Digital Marketing Specialist in Nairobi, Kenya." },
  { title: "Commonly Asked Questions", thumbnail: thumb2, link: "https://www.instagram.com/reel/DUFhZLMCkI6/", platform: "Instagram", duration: "0:45", uploadDate: "2025-09-20", description: "Customer education reel answering FAQs about iClear water filters — content strategy and Meta video by Joseph Maina, Nairobi." },
  { title: "Filter Installation Tutorial", thumbnail: thumb3, link: "https://www.instagram.com/reel/DR0_0WSCKvx/", platform: "Instagram", duration: "0:38", uploadDate: "2025-07-18", description: "Step-by-step Instagram tutorial reel for installing an iClear water filter — short-form video production by Joseph Maina, Kenya." },
  { title: "Corporate Trends Recap", thumbnail: thumb4, link: "https://www.instagram.com/reel/DQ6zTmTjqlq/", platform: "Instagram", duration: "0:28", uploadDate: "2025-06-22", description: "Trend-driven corporate recap reel for social media marketing in Kenya — produced by Joseph Maina, Digital Marketing Specialist Nairobi." },
  { title: "Water Filter Setup Guide", thumbnail: thumb5, link: "https://www.instagram.com/reel/DLuTwgPCbbw/", platform: "Instagram", duration: "0:42", uploadDate: "2025-04-08", description: "Product setup guide reel — short-form Instagram video for iClear Wellife water filtration, produced by Joseph Maina." },
  { title: "Product Showcase Reel", thumbnail: thumb6, link: "https://www.instagram.com/reel/DScs6erjcfO/", platform: "Instagram", duration: "0:25", uploadDate: "2025-08-04", description: "Product showcase Instagram reel for iClear Wellife — Nairobi-based video production and content strategy by Joseph Maina." },
  { title: "On Location Shoot", thumbnail: thumb7, link: "https://www.instagram.com/reel/DQ_5aRdl2YS/", platform: "Instagram", duration: "0:35", uploadDate: "2025-06-28", description: "Behind-the-scenes on-location field shoot reel — branded video production in Nairobi, Kenya by Joseph Maina." },
  { title: "Sustainability Report Reel", thumbnail: thumb8, link: "https://www.instagram.com/reel/DP4KbNTDQj-/", platform: "Instagram", duration: "0:50", uploadDate: "2025-05-30", description: "Sustainability storytelling reel for corporate social media in Kenya — produced by Joseph Maina, Digital Marketing Specialist Nairobi." },
  { title: "Behind The Scenes", thumbnail: thumb9, link: "https://www.instagram.com/reel/DP1XkoaDsUE/", platform: "Instagram", duration: "0:33", uploadDate: "2025-05-26", description: "Behind-the-scenes reel from a Nairobi commercial shoot — video production and social media by Joseph Maina." },
  { title: "iClear Field Service Reel", thumbnail: shortIclearDishwash, link: "https://www.instagram.com/reel/DW3-G4fIMjO/", platform: "Instagram", duration: "0:30", uploadDate: "2025-11-04", description: "Field service Instagram reel for iClear Wellife — short-form brand video by Joseph Maina, Digital Marketing Specialist Nairobi Kenya." },
  { title: "Maji Ni Uhai — iClear Campaign", thumbnail: shortMajiNiUhai, link: "https://www.instagram.com/reel/DXesQTfjYnp/", platform: "Instagram", duration: "0:35", uploadDate: "2025-11-18", description: "Maji Ni Uhai campaign reel for iClear Wellife — performance marketing & creative direction by Joseph Maina, Nairobi." },
  { title: "Cinematic Typography Promo", thumbnail: shortForTypography, link: "https://www.instagram.com/reel/DVnbbkKjSRa/", platform: "Instagram", duration: "0:20", uploadDate: "2025-10-15", description: "Cinematic typography promo reel — kinetic text social media video produced by Joseph Maina, Nairobi Kenya." },
]);

export const longVideos: LongVideo[] = byNewest([
  {
    title: "Let Go of the Fear & Own Your Authentic Voice! — Caroline Njiru",
    description: "Featured long-form brand film with Caroline Njiru on confidence, voice and authenticity — directed and produced by Joseph Maina, Video Production Nairobi Kenya.",
    thumbnail: featuredThumb,
    link: "https://youtu.be/RREDY1htp7Q",
    platform: "YouTube",
    duration: "12:18",
    uploadDate: "2024-11-20",
  },
  {
    title: "Joan Mbesya — Full Interview",
    description: "Long-form YouTube interview feature with entrepreneur Joan Mbesya — brand storytelling and video production by Joseph Maina, Nairobi.",
    thumbnail: longJoanThumb,
    link: "https://youtu.be/lulDBOcFiCw",
    platform: "YouTube",
    duration: "18:42",
    uploadDate: "2024-08-14",
  },
  {
    title: "ASDSP Programme — A Game Changer for Nyeri Farmers",
    description: "Documentary on the ASDSP programme transforming agriculture for Nyeri farmers — produced and shot by Joseph Maina, Digital Marketing Specialist Kenya.",
    thumbnail: longAsdspThumb,
    link: "https://youtu.be/7jCqcsyXGC8",
    platform: "YouTube",
    duration: "9:54",
    uploadDate: "2023-06-30",
  },
]);

export const FEATURED_VIDEO = {
  youtubeId: "RREDY1htp7Q",
  title: "Let Go of the Fear & Own Your Authentic Voice! — Caroline Njiru",
  description: "Featured brand film directed and produced by Joseph Maina — Caroline Njiru opens up about confidence, voice and authenticity.",
  watchUrl: "https://youtu.be/RREDY1htp7Q",
};

export const featuredThumbnail = featuredThumb;

/** How many short videos the homepage preview shows before linking to the full page. */
export const HOME_SHORTS_COUNT = 4;
