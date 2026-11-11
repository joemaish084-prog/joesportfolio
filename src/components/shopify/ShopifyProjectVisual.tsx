import { shopifyProject } from "@/data/shopify";
import "./shopify.css";

export function ShopifyProjectVisual({ priority = false }: { priority?: boolean }) {
  return (
    <div className="shopify-project relative min-w-0 pb-8 pr-12 max-sm:mx-auto max-sm:max-w-[260px] max-sm:p-0 sm:pb-10 sm:pr-20">
      <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-xl shadow-foreground/5 max-sm:hidden">
        <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-border px-3 py-2.5 text-[10px] text-muted-foreground">
          {[0, 1, 2].map(dot => <span key={dot} className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />)}
          <span className="mx-auto pr-6">babyshopdansar.com</span>
        </div>
        <img src={shopifyProject.desktop} width={1200} height={820} alt="Babyshop Dansar homepage with product categories and seasonal merchandising" loading={priority ? "eager" : "lazy"} {...{ fetchpriority: priority ? "high" : "auto" }} decoding="async" className="block h-auto w-full" />
      </div>
      <div className="absolute bottom-0 right-0 w-[24%] min-w-[82px] max-w-[180px] overflow-hidden rounded-[1.25rem] border-[4px] border-foreground bg-background shadow-xl shadow-foreground/15 max-sm:relative max-sm:mx-auto max-sm:w-full max-sm:max-w-[230px] sm:rounded-[1.75rem] sm:border-[5px]">
        <img src={shopifyProject.mobile} width={390} height={844} alt="Babyshop Dansar mobile product page showing product photography, pricing, and design options" loading={priority ? "eager" : "lazy"} decoding="async" className="block h-auto w-full" />
      </div>
    </div>
  );
}
