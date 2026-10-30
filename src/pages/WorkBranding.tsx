import { WorkPageLayout } from "@/components/WorkPageLayout";
import { BrandCard } from "@/components/BrandCard";
import { brands } from "@/data/brands";
import { brandingIndexHead } from "@/seo/pageHeads";

const WorkBranding = () => (
  <WorkPageLayout
    seo={brandingIndexHead(brands)}
    backHref="/#branding"
    eyebrow="Branding"
    title={
      <>
        Brand <span className="text-gradient">Identity</span>
      </>
    }
    intro="Full brand systems and creator media kits, not single posts: logo, colour, typography and the templates that keep every piece looking like the brand."
    meta={[`${brands.length} ${brands.length === 1 ? "brand" : "brands"}`, "Logo · Colour · Type", "Mockups"]}
  >
    <ul className="mt-10 space-y-8">
      {brands.map((b) => (
        <li key={b.slug}>
          <BrandCard brand={b} />
        </li>
      ))}
    </ul>
  </WorkPageLayout>
);

export default WorkBranding;
