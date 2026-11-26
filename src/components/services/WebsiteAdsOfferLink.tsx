import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { websiteAdsDescription, websiteAdsLabel, websiteAdsPath } from "@/data/websiteAds";

export function WebsiteAdsOfferLink() {
  return (
    <Link to={websiteAdsPath} className="group flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-2xl border border-[#00bfa5]/40 bg-[#101815] px-5 py-5 text-[#ebebdf] transition-colors hover:border-[#00bfa5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-7">
      <div>
        <p className="text-xs font-semibold text-[#00bfa5]">Nuvana × JM Marketing</p>
        <h3 className="mt-1 font-serif text-3xl leading-none sm:text-4xl">{websiteAdsLabel}</h3>
        <p className="mt-2 text-sm text-[#c5d4cc]">{websiteAdsDescription}</p>
      </div>
      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#ff9850]">
        Compare packages <ArrowRight className="h-4 w-4 motion-safe:transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}
