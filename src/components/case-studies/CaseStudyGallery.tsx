import type { CaseStudyImage } from "@/data/caseStudies";

/** One large photo with two smaller ones beside it. Expects a dark case-study background. */
export function CaseStudyGallery({ images }: { images: CaseStudyImage[] }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 auto-rows-[8.5rem] sm:grid-cols-3 sm:gap-4 sm:auto-rows-[11rem]">
        {images.map((image, i) => (
          <figure
            key={image.src}
            className={`group relative overflow-hidden rounded-2xl border ${
              i === 0 ? "col-span-2 row-span-2" : ""
            }`}
            style={{ borderColor: "hsl(var(--case-study-card-border))" }}
          >
            <img
              src={image.src}
              alt={image.alt}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {image.caption && (
              <figcaption
                className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent font-medium leading-snug text-white ${
                  i === 0 ? "p-4 pt-12 text-sm sm:p-5 sm:pt-16 sm:text-base" : "p-3 pt-10 text-xs sm:text-sm"
                }`}
              >
                {image.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      <p className="mt-3 text-xs" style={{ color: "hsl(var(--case-study-muted))" }}>
        Photos are stock images used for illustration.
      </p>
    </div>
  );
}
