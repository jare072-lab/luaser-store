"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ShopifyImage, ShopifyVideo } from "@/lib/shopify/types";

type GallerySlide =
  | { type: "image"; image: ShopifyImage }
  | { type: "video"; video: ShopifyVideo };

function bestVideoSource(video: ShopifyVideo) {
  // Prefer a plain mp4 (autoplay/controls work everywhere) over HLS, and the
  // highest resolution mp4 available.
  const mp4Sources = video.sources.filter((s) => s.mimeType === "video/mp4");
  return mp4Sources.sort((a, b) => b.height - a.height)[0] ?? video.sources[0];
}

export function ProductGallery({
  images,
  videos = [],
  title,
  variantImage,
}: {
  images: ShopifyImage[];
  videos?: ShopifyVideo[];
  title: string;
  variantImage?: ShopifyImage | null;
}) {
  const gallery = useMemo<GallerySlide[]>(() => {
    const imgs = (() => {
      if (!variantImage) return images;
      const rest = images.filter((image) => image.url !== variantImage.url);
      return [variantImage, ...rest];
    })();
    // Video goes second (right after the hero product shot) so it reads as
    // "here's this exact product in use" rather than being buried at the end.
    const imageSlides: GallerySlide[] = imgs.map((image) => ({ type: "image", image }));
    const videoSlides: GallerySlide[] = videos.map((video) => ({ type: "video", video }));
    return imageSlides.length > 0
      ? [imageSlides[0], ...videoSlides, ...imageSlides.slice(1)]
      : videoSlides;
  }, [images, videos, variantImage]);

  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [variantImage?.url]);

  const current = gallery[active] ?? null;

  return (
    <div>
      <div className="relative aspect-square rounded-3xl overflow-hidden border border-ink-border bg-ink-soft">
        {current?.type === "image" && (
          <Image
            src={current.image.url}
            alt={current.image.altText ?? title}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}
        {current?.type === "video" && (
          <video
            key={current.video.id}
            className="h-full w-full object-cover"
            controls
            playsInline
            preload="metadata"
            poster={current.video.previewImageUrl ?? undefined}
          >
            <source src={bestVideoSource(current.video)?.url} type="video/mp4" />
          </video>
        )}
      </div>
      {gallery.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {gallery.map((slide, index) => {
            const key = slide.type === "image" ? slide.image.url : slide.video.id;
            const thumbSrc = slide.type === "image" ? slide.image.url : slide.video.previewImageUrl;
            return (
              <button
                key={key}
                onClick={() => setActive(index)}
                aria-label={slide.type === "video" ? `Ver video de ${title}` : `Ver imagen ${index + 1}`}
                className={cn(
                  "relative aspect-square rounded-xl overflow-hidden border-2 transition-colors",
                  index === active ? "border-gold" : "border-ink-border hover:border-graystone-500"
                )}
              >
                {thumbSrc && (
                  <Image
                    src={thumbSrc}
                    alt={slide.type === "image" ? (slide.image.altText ?? title) : (slide.video.alt ?? title)}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
                {slide.type === "video" && (
                  <span className="absolute inset-0 flex items-center justify-center bg-ink/30">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-bone drop-shadow" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
