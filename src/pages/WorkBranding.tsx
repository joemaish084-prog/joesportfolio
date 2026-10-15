import { WorkPageLayout } from "@/components/WorkPageLayout";
import { BrandCard } from "@/components/BrandCard";
import { brands } from "@/data/brands";

const WorkBranding = () => (
  <WorkPageLayout
    seo={{
      title: "Brand Identity Portfolio | Joseph Maina, Nairobi",
      description:
        "Brand identity work by Joseph Maina: logo systems, colour palettes, typography, social templates and mockups for Kenyan brands.",
      path: "/work/branding",
    }}
    backHref="/#branding"
    eyebrow="Branding"
    title={
      <>
        Brand <span className="text-gradient">Identity</span>
      </>
    }
    intro="Full brand systems, not single posts: logo, colour, typography and the templates that keep every post looking like the brand."
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
