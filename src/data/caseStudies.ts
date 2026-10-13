export interface CaseStudyImage {
  src: string;
  alt: string;
  caption?: string;
}

// Same source as the blog thumbnails. These are stock photos used for
// illustration, not pictures of the client or the campaign itself.
const unsplash = (id: string, width: number) =>
  `https://images.unsplash.com/photo-${id}?q=80&w=${width}&auto=format&fit=crop`;

export interface CaseStudySummary {
  /** Anchor on /work/case-studies. */
  id: string;
  tag: string;
  period: string;
  title: string;
  summary: string;
  stats: { value: string; label: string }[];
  cover: CaseStudyImage;
  /** Three supporting photos: the first is shown large. */
  gallery: CaseStudyImage[];
}

/**
 * NEWEST FIRST. Add new case studies at the TOP of this list: the homepage
 * preview and the /work/case-studies page both follow this order.
 */
export const caseStudies: CaseStudySummary[] = [
  {
    id: "google-ads-launch",
    tag: "Paid search",
    period: "Aug to Oct 2026",
    title: "Zero to KES 1.94M: a Google Ads launch in ten weeks",
    summary:
      "The business had never run Google Ads. I launched Search first, then Shopping, and tracked every order back to the campaign that drove it. The client is not named, the numbers are real.",
    stats: [
      { value: "KES 1.94M", label: "Tracked revenue" },
      { value: "15.5x", label: "Return on ad spend" },
      { value: "339", label: "Tracked orders" },
    ],
    cover: {
      src: unsplash("1573804633927-bfcbcd909acd", 1600),
      alt: "The Google logo as a multicoloured neon sign on a dark wall",
    },
    gallery: [
      {
        src: unsplash("1477013743164-ffc3a5e556da", 1200),
        alt: "Phone showing a Google search results page",
        caption: "Search: in front of buyers who are already looking",
      },
      {
        src: unsplash("1522204523234-8729aa6e3d5f", 800),
        alt: "Hands browsing an online shop on a tablet, surrounded by plants",
        caption: "Shopping ads: 139 orders",
      },
      {
        src: unsplash("1551288049-bebda4e38f71", 800),
        alt: "Dark analytics dashboard with bar and line charts",
        caption: "Every order tracked",
      },
    ],
  },
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
    cover: {
      src: unsplash("1596462502278-27bfdc403348", 1600),
      alt: "Makeup brushes, lipstick, mascara and powder compacts laid out on a beige surface",
    },
    gallery: [
      {
        src: unsplash("1460925895917-afdab827c52f", 1200),
        alt: "Laptop showing an analytics dashboard with charts and traffic figures",
        caption: "Measurement first: every purchase tracked back to its campaign",
      },
      {
        src: unsplash("1607083206968-13611e3d76db", 800),
        alt: "Red sale tags scattered on a dark surface",
        caption: "One clear offer per campaign",
      },
      {
        src: unsplash("1563013544-824ae1b704d3", 800),
        alt: "Person holding a bank card while shopping on a laptop",
        caption: "953 tracked purchases",
      },
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
    cover: {
      src: unsplash("1744135995241-3afc337786fd", 1600),
      alt: "Smartphone on a tripod recording a video",
    },
    gallery: [
      {
        src: unsplash("1574717024653-61fd2cf4d44d", 1200),
        alt: "Video editing timeline with clips and audio tracks on a screen",
        caption: "142 videos planned, shot and edited",
      },
      {
        src: unsplash("1611262588024-d12430b98920", 800),
        alt: "Instagram logo as a glossy 3D icon on a dark background",
        caption: "Instagram: 2.5M video views",
      },
      {
        src: unsplash("1432888622747-4eb9a8efeb07", 800),
        alt: "Phone showing the Facebook login screen next to letter tiles spelling social media",
        caption: "Facebook: 4.8M views",
      },
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
