import small from "@/assets/agency/baobab-campaign-360.webp";
import medium from "@/assets/agency/baobab-campaign-720.webp";
import large from "@/assets/agency/baobab-campaign-960.webp";
import smallAvif from "@/assets/agency/baobab-campaign-360.avif";
import mediumAvif from "@/assets/agency/baobab-campaign-720.avif";

export const agencyHeroPhoto = {
  src: medium,
  srcSet: `${small} 360w, ${medium} 720w, ${large} 960w`,
  sizes: "(min-width: 1280px) 500px, (min-width: 900px) 40vw, 90vw",
  avif: `${smallAvif} 360w, ${mediumAvif} 720w`,
  mobileMedia: "(max-width: 899px)",
  mobileSizes: "90vw",
};
