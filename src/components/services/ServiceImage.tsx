import { useState } from "react";
import type { ImageSlot } from "@/data/services";
import { ServiceImagePlaceholder } from "./ServiceImagePlaceholder";

/**
 * Every webp in `src/assets/services/`. A slot is `<slot>.webp` (full size) with
 * an optional `<slot>-<width>.webp` smaller copy. Drop a file in the folder and
 * it is used; no import to add. Made by `scripts/build-service-images.py`.
 */
const files = import.meta.glob<string>("/src/assets/services/*.webp", { eager: true, query: "?url", import: "default" });

/** Intrinsic size of the full-size file per slot. Sets width/height so nothing shifts. */
const SIZE: Record<ImageSlot, { width: number; height: number }> = {
  "svc-meta-ads": { width: 1125, height: 703 },
  "svc-google-ads": { width: 1200, height: 1500 },
  "svc-seo": { width: 800, height: 600 },
  "svc-social": { width: 800, height: 600 },
  "svc-tiktok-ads": { width: 800, height: 600 },
  "svc-lead-gen": { width: 800, height: 600 },
  "svc-shopify": { width: 800, height: 600 },
};

function sources(slot: ImageSlot) {
  const full = files[`/src/assets/services/${slot}.webp`];
  if (!full) return null;
  const small = Object.entries(files).find(([path]) => path.endsWith(`/${slot}-400.webp`))?.[1];
  const { width } = SIZE[slot];
  return { src: full, srcSet: small ? `${small} 400w, ${full} ${width}w` : undefined };
}

interface ServiceImageProps {
  slot: ImageSlot;
  /** Alt text from the data file. */
  alt: string;
  /** The `sizes` attribute: how wide the image renders at each breakpoint. */
  sizes: string;
  /** Above the fold only. Every slot on the services page is below it. */
  priority?: boolean;
  /** Sets the size and ratio of the box. */
  className?: string;
  /** Passed to the placeholder shown when the slot has no file yet. */
  thumbOnMobile?: boolean;
}

/**
 * Lazy-loaded slot image with a solid colour behind it until it arrives.
 * A slot with no file (or a file that fails to load) shows the labelled placeholder.
 */
export function ServiceImage({ slot, alt, sizes, priority = false, className = "", thumbOnMobile = false }: ServiceImageProps) {
  const [failed, setFailed] = useState(false);
  const image = sources(slot);

  if (!image || failed) return <ServiceImagePlaceholder slot={slot} className={className} thumbOnMobile={thumbOnMobile} />;

  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      alt={alt}
      {...SIZE[slot]}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
      data-image-slot={slot}
      className={`bg-muted object-cover ${className}`}
    />
  );
}
