"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ShopifyImage } from "@/lib/shopify/types";

export function ProductGallery({
  images,
  title,
  variantImage,
}: {
  images: ShopifyImage[];
  title: string;
  variantImage?: ShopifyImage | null;
}) {
  const gallery = useMemo(() => {
    if (!variantImage) return images;
    const rest = images.filter((image) => image.url !== variantImage.url);
    return [variantImage, ...rest];
  }, [images, variantImage]);

  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
  }, [variantImage?.url]);

  const current = gallery[active] ?? null;

  return (
    <div>
      <div className="relative aspect-square rounded-3xl overflow-hidden border border-ink-border bg-ink-soft">
        {current && (
          <Image
            src={current.url}
            alt={current.altText ?? title}
            fill
            priority
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      {gallery.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {gallery.map((image, index) => (
            <button
              key={image.url}
              onClick={() => setActive(index)}
              aria-label={`Ver imagen ${index + 1}`}
              className={cn(
                "relative aspect-square rounded-xl overflow-hidden border-2 transition-colors",
                index === active ? "border-gold" : "border-ink-border hover:border-graystone-500"
              )}
            >
              <Image
                src={image.url}
                alt={image.altText ?? title}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
