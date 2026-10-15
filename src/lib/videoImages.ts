// Responsive derivatives keep full-resolution originals out of video cards.
import original0 from "@/assets/featured-showreel-thumb.webp";
import image0_640 from "@/assets/video-previews/featured-showreel-thumb-640.webp";
import image0_1280 from "@/assets/video-previews/featured-showreel-thumb-1280.webp";
import original1 from "@/assets/longform-joan-mbesya.webp";
import image1_640 from "@/assets/video-previews/longform-joan-mbesya-640.webp";
import image1_1280 from "@/assets/video-previews/longform-joan-mbesya-1280.webp";
import original2 from "@/assets/longform-asdsp.webp";
import image2_640 from "@/assets/video-previews/longform-asdsp-640.webp";
import image2_1280 from "@/assets/video-previews/longform-asdsp-1280.webp";
import original3 from "@/assets/video-thumb-1.webp";
import image3_400 from "@/assets/video-previews/video-thumb-1-400.webp";
import image3_800 from "@/assets/video-previews/video-thumb-1-800.webp";
import original4 from "@/assets/video-thumb-2.webp";
import image4_400 from "@/assets/video-previews/video-thumb-2-400.webp";
import image4_800 from "@/assets/video-previews/video-thumb-2-800.webp";
import original5 from "@/assets/video-thumb-3.webp";
import image5_400 from "@/assets/video-previews/video-thumb-3-400.webp";
import image5_800 from "@/assets/video-previews/video-thumb-3-800.webp";
import original6 from "@/assets/video-thumb-4.webp";
import image6_400 from "@/assets/video-previews/video-thumb-4-400.webp";
import image6_800 from "@/assets/video-previews/video-thumb-4-800.webp";
import original7 from "@/assets/video-thumb-5.webp";
import image7_400 from "@/assets/video-previews/video-thumb-5-400.webp";
import image7_800 from "@/assets/video-previews/video-thumb-5-800.webp";
import original8 from "@/assets/video-thumb-6.webp";
import image8_400 from "@/assets/video-previews/video-thumb-6-400.webp";
import image8_800 from "@/assets/video-previews/video-thumb-6-800.webp";
import original9 from "@/assets/video-thumb-7.webp";
import image9_400 from "@/assets/video-previews/video-thumb-7-400.webp";
import image9_800 from "@/assets/video-previews/video-thumb-7-800.webp";
import original10 from "@/assets/video-thumb-8.webp";
import image10_400 from "@/assets/video-previews/video-thumb-8-400.webp";
import image10_800 from "@/assets/video-previews/video-thumb-8-800.webp";
import original11 from "@/assets/video-thumb-9.webp";
import image11_400 from "@/assets/video-previews/video-thumb-9-400.webp";
import image11_800 from "@/assets/video-previews/video-thumb-9-800.webp";
import original12 from "@/assets/short-iclear-dishwash.webp";
import image12_400 from "@/assets/video-previews/short-iclear-dishwash-400.webp";
import image12_800 from "@/assets/video-previews/short-iclear-dishwash-800.webp";
import original13 from "@/assets/short-maji-ni-uhai.webp";
import image13_400 from "@/assets/video-previews/short-maji-ni-uhai-400.webp";
import image13_800 from "@/assets/video-previews/short-maji-ni-uhai-800.webp";
import original14 from "@/assets/short-for-typography.webp";
import image14_400 from "@/assets/video-previews/short-for-typography-400.webp";
import image14_800 from "@/assets/video-previews/short-for-typography-800.webp";

const previews = new Map<string, { src: string; srcSet: string }>([
  [original0, { src: image0_640, srcSet: `${image0_640} 640w, ${image0_1280} 1280w` }],
  [original1, { src: image1_640, srcSet: `${image1_640} 640w, ${image1_1280} 1280w` }],
  [original2, { src: image2_640, srcSet: `${image2_640} 640w, ${image2_1280} 1280w` }],
  [original3, { src: image3_400, srcSet: `${image3_400} 400w, ${image3_800} 800w` }],
  [original4, { src: image4_400, srcSet: `${image4_400} 400w, ${image4_800} 800w` }],
  [original5, { src: image5_400, srcSet: `${image5_400} 400w, ${image5_800} 800w` }],
  [original6, { src: image6_400, srcSet: `${image6_400} 400w, ${image6_800} 800w` }],
  [original7, { src: image7_400, srcSet: `${image7_400} 400w, ${image7_800} 800w` }],
  [original8, { src: image8_400, srcSet: `${image8_400} 400w, ${image8_800} 800w` }],
  [original9, { src: image9_400, srcSet: `${image9_400} 400w, ${image9_800} 800w` }],
  [original10, { src: image10_400, srcSet: `${image10_400} 400w, ${image10_800} 800w` }],
  [original11, { src: image11_400, srcSet: `${image11_400} 400w, ${image11_800} 800w` }],
  [original12, { src: image12_400, srcSet: `${image12_400} 400w, ${image12_800} 800w` }],
  [original13, { src: image13_400, srcSet: `${image13_400} 400w, ${image13_800} 800w` }],
  [original14, { src: image14_400, srcSet: `${image14_400} 400w, ${image14_800} 800w` }],
]);

export function videoImageProps(src: string, sizes: string) {
  return { ...(previews.get(src) ?? { src }), sizes };
}
