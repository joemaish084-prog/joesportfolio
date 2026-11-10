import { duaraKit } from "./duara";
import { iclearKit } from "./iclear";
import { sidiKit } from "./sidi";
import { noirKit } from "./noir";
import type { BrandKit } from "./shared";

/** Brand slug → the visual pieces drawn specially for that brand. */
export const kits: Record<string, BrandKit> = {
  "noir-novel": noirKit,
  "duara-schools": duaraKit,
  iclear: iclearKit,
  "sidi-safari": sidiKit,
};

export * from "./shared";
