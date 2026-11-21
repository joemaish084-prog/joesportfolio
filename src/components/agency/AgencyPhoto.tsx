import { agencyPhotoPath, agencyPhotoSize } from "@/data/agencyPageMedia";

export function AgencyPhoto({ name, alt, sizes, priority = false, className = "" }: {
  name: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const { small, large, height } = agencyPhotoSize;
  const src = agencyPhotoPath(name);

  return (
    <img
      src={src}
      srcSet={`${agencyPhotoPath(name, small)} ${small}w, ${src} ${large}w`}
      sizes={sizes}
      alt={alt}
      width={large}
      height={height}
      loading={priority ? "eager" : "lazy"}
      {...{ fetchpriority: priority ? "high" : undefined }}
      decoding="async"
      className={`h-full w-full bg-muted object-cover ${className}`}
    />
  );
}
