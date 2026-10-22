export function unsplashImageProps(src: string, sizes: string) {
  if (!src.startsWith("https://images.unsplash.com/")) return {};
  const resized = (width: number) => {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    return url.toString();
  };
  return {
    src: resized(640),
    srcSet: [400, 640, 800, 1200, 1600].map(width => `${resized(width)} ${width}w`).join(", "),
    sizes,
    width: 1600,
    height: 1040,
  };
}
import { localImageProps } from "./imageVariants";


/** Responsive sources without changing the caller's chosen crop or layout. */
export function contentImageProps(src: string, sizes: string) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const { width: _width, height: _height, ...image } = unsplashImageProps(src, sizes);
    return image;
  }
  return localImageProps(src, sizes);
}
