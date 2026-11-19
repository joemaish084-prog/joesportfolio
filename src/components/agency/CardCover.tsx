import type { ReactNode } from "react";

export function CardCover({ src, alt, className = "aspect-[16/10]", position = "object-center", children }: {
  src: string;
  alt: string;
  className?: string;
  position?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`relative overflow-hidden bg-muted ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`h-full w-full object-cover ${position} transition-transform duration-700 ease-out group-hover:scale-105`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      {children}
    </div>
  );
}
