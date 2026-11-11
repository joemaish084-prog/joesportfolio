import { shopifyProject } from "@/data/shopify";
import { ArrowUpRight } from "lucide-react";
import "./shopify.css";

export function ShopifyProjectVisual({ priority = false, showcase = false }: { priority?: boolean; showcase?: boolean }) {
  return (
    <div className={`shopify-project ${showcase ? "shopify-project-showcase" : ""}`}>
      <div className="shopify-project-label" aria-hidden="true"><span>Selected project / 01</span><span>Babyshop Dansar</span></div>
      <span className="shopify-project-wordmark" aria-hidden="true">COMMERCE</span>
      <div className="shopify-browser">
        <div className="shopify-browser-bar" aria-hidden="true">
          {[0, 1, 2].map(dot => <span key={dot} className="shopify-browser-dot" />)}
          <span>babyshopdansar.com</span>
        </div>
        <img src={shopifyProject.desktop} width={1200} height={820} alt="Babyshop Dansar homepage with product categories and seasonal merchandising" loading={priority ? "eager" : "lazy"} {...{ fetchpriority: priority ? "high" : "auto" }} decoding="async" />
      </div>
      <div className="shopify-phone">
        <img src={shopifyProject.mobile} width={390} height={844} alt="Babyshop Dansar mobile product page showing product photography, pricing, and design options" loading={priority ? "eager" : "lazy"} decoding="async" />
      </div>
      <a href={shopifyProject.url} target="_blank" rel="noopener noreferrer" className="shopify-project-sticker focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Visit Babyshop Dansar live store">
        <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
        <span>Visit the<br />live store</span>
      </a>
    </div>
  );
}
