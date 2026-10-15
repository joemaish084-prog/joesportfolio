import { duaraKit } from "./duara";
import { iclearKit } from "./iclear";
import type { BrandKit } from "./shared";

/** Brand slug → the visual pieces drawn specially for that brand. */
export const kits: Record<string, BrandKit> = {
  "duara-schools": duaraKit,
  iclear: iclearKit,
};

export * from "./shared";
