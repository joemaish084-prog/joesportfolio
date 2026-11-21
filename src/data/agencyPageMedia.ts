export const agencyPhotoSize = { small: 480, large: 960, height: 640 };

export const agencyHeroPhotos = {
  pricing: {
    name: "pricing-planning",
    alt: "Hands using a calculator beside a laptop", // Pexels 8296991
  },
  results: {
    name: "results-reporting",
    alt: "Laptop showing charts against an orange and green wall", // Pexels 7108044
  },
} as const;

export const agencyPhotoPath = (name: string, width = agencyPhotoSize.large) =>
  `/media/agency/${name}-${width}.webp`;
