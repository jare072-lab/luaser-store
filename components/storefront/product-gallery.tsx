"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { ShopifyImage } from "@/lib/shopify/types";

export function ProductGallery({
  images,
  title,
}: {
  images: ShopifyImage[];
  title: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? null;

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
      {images.length > 1 && (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
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
