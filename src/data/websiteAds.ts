import { packageFeeKes, serviceFeeKes } from "@/data/services";

export const websiteAdsSlug = "website-and-ads";
export const websiteAdsPath = `/agency/${websiteAdsSlug}`;
export const websiteAdsLabel = "Website + 90-Day Ads";
export const websiteAdsDescription = "A new website and three months of ads for Kenyan retailers and service businesses.";
export const websiteAdsMonths = 3;

export const websiteAdsHero = {
  src: "/media/partnership/nairobi-market-960.webp",
  srcSet: "/media/partnership/nairobi-market-480.webp 480w, /media/partnership/nairobi-market-960.webp 960w",
  alt: "Roadside fruit stalls in a Nairobi market",
  caption: "Nairobi, Kenya",
  width: 960,
  height: 640,
};

export const websiteAdsPlans = [
  {
    id: "growth",
    name: "Growth",
    buildFee: 120_000,
    scope: {
      retail: "Online shop with checkout and up to 25 products",
      services: "Full service website with booking or quote requests",
    },
    campaignScope: "Up to two ad platforms, with reviews every two weeks",
    options: [{ name: "Campaign budget", management: packageFeeKes("GROWTH"), media: 50_000 }],
  },
  {
    id: "launch",
    name: "Launch",
    buildFee: 50_000,
    scope: {
      retail: "Catalogue of up to 10 products with WhatsApp ordering",
      services: "Three-page website with a quote form",
    },
    campaignScope: "One offer and one ad platform, with monthly reporting",
    options: [
      { name: "Meta", management: serviceFeeKes("meta-ads"), media: 30_000 },
      { name: "Google", management: serviceFeeKes("google-ads"), media: 25_000 },
    ],
  },
] as const;
