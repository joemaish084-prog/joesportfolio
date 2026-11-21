import { useState } from "react";
import type { ProofImageSlot } from "@/data/services";
import { serviceImageReplacements } from "@/data/serviceVisuals";
import { contentImageProps } from "@/lib/responsiveImage";
import { ServiceImagePlaceholder } from "./ServiceImagePlaceholder";

export function ServiceImage({ slot, sizes, className = "" }: {
  slot: ProofImageSlot;
  sizes: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const visual = serviceImageReplacements[slot];
  const image = { src: visual.src, srcSet: undefined, ...contentImageProps(visual.src, sizes) };

  if (failed) return <ServiceImagePlaceholder slot={slot} className={className} />;

  return (
    <img
      src={image.src}
      srcSet={visual.srcSet ?? image.srcSet}
      sizes={sizes}
      alt={visual.alt}
      width={visual.width}
      height={visual.height}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
      data-image-slot={slot}
      className={`bg-muted object-cover ${className}`}
    />
  );
}
