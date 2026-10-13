export interface CaseStudySummary {
  /** Anchor on /work/case-studies. */
  id: string;
  tag: string;
  period: string;
  title: string;
  summary: string;
  stats: { value: string; label: string }[];
}

/**
 * NEWEST FIRST. Add new case studies at the TOP of this list: the homepage
 * preview and the /work/case-studies page both follow this order.
 */
export const caseStudies: CaseStudySummary[] = [
  {
    id: "meta-ads-turnaround",
    tag: "Paid media",
    period: "Jul to Oct 2026",
    title: "Meta Ads turnaround for a Nairobi beauty retailer",
    summary:
      "The account was running Meta ads with no conversion tracking and no campaign structure. I rebuilt it around tracked, offer-specific sales campaigns. The client is not named, the numbers are real.",
    stats: [
      { value: "KES 5.33M", label: "Revenue attributed by Meta" },
      { value: "41.3x", label: "Return on ad spend" },
      { value: "953", label: "Tracked purchases" },
    ],
  },
  {
    id: "social-media-2025",
    tag: "Social media",
    period: "2025",
    title: "A full year of video-first social media",
    summary:
      "A year-long campaign across TikTok, Instagram and Facebook: 336 pieces of content, built around video, driving awareness, engagement and leads.",
    stats: [
      { value: "4M", label: "TikTok video views" },
      { value: "2.5M", label: "Instagram video views" },
      { value: "336", label: "Pieces of content" },
    ],
  },
];

export const socialStats = [
  { value: "704K", label: "Instagram Reach" },
  { value: "336", label: "Pieces of Content Published" },
  { value: "104K", label: "Top Single Video Views (TikTok)" },
  { value: "4M", label: "Total TikTok Video Views" },
  { value: "2.5M", label: "Total Instagram Video Views" },
];

export const socialPlatforms = [
  {
    name: "TikTok",
    subtitle: "Brand Awareness Champion",
    accentVar: "--tiktok",
    metrics: [
      { text: "4M total video views", bold: true },
      { text: "16K profile views", bold: false },
      { text: "230K total likes", bold: true },
      { text: "2.1K comments", bold: false },
      { text: "5.4K shares", bold: false },
    ],
    topVideo: "103.9K views, 321+ hours total play time, 10.67s avg watch time, 9.1% full-video completion rate",
    insight: "Best platform for viral reach and watch time. Video content averaged 6–8% engagement rate.",
  },
  {
    name: "Instagram",
    subtitle: "Lead Generation Powerhouse",
    accentVar: "--instagram",
    metrics: [
      { text: "2.5M total video views", bold: true },
      { text: "322.9% views growth", bold: true },
      { text: "173.4% link clicks growth", bold: true },
      { text: "18.6K link clicks", bold: false },
      { text: "32.1K profile visits (↑78.4%)", bold: false },
      { text: "16.2K content interactions (↑100%)", bold: false },
      { text: "4.1K new followers", bold: false },
    ],
    topVideo: "92,631 views reaching 31,988 users — 375 likes, 188 saves, 96 shares, 62 comments",
    insight: "Strongest platform for high-intent traffic and lead generation.",
  },
  {
    name: "Facebook",
    subtitle: "Steady Supplemental Channel",
    accentVar: "--facebook",
    metrics: [
      { text: "4.8M total views", bold: true },
      { text: "15.8K link clicks (↑2.3%)", bold: false },
      { text: "16.9K page visits", bold: false },
      { text: "6.1K content interactions (↑9.3%)", bold: false },
      { text: "816 new followers (↑6%)", bold: false },
    ],
    topVideo: null as string | null,
    insight: "Reliable channel for consistent audience touchpoints and link sharing.",
  },
];
