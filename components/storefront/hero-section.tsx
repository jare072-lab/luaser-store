"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { formatMXN } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/shopify/types";

export function HeroSection({ product }: { product: ShopifyProduct | null }) {
  const images =
    product?.images && product.images.length > 0
      ? product.images
      : product?.featuredImage
        ? [product.featuredImage]
        : [];

  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="mx-auto max-w-content px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-pitch/40 bg-pitch/10 px-4 py-1.5 text-xs font-body font-semibold text-pitch-light">
            <span className="h-1.5 w-1.5 rounded-full bg-pitch-light animate-pulse" />
            Envíos a todo México
          </div>
          <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-bone">
            Letreros y piezas de <span className="text-gold">acrílico a la medida</span> para tu
            negocio
          </h1>
          <p className="mt-5 max-w-lg font-body text-graystone-100 text-base sm:text-lg">
            Cortamos y grabamos a láser el logo de tu negocio en acrílico premium. Maquilamos
            cualquier pieza personalizada, no solo lo que ves en el catálogo — mándanos tu diseño
            y te cotizamos.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink
              href={product ? `/producto/${product.handle}` : "/coleccion/frontpage"}
              size="lg"
              className="relative overflow-hidden"
            >
              Cotiza el tuyo
              <span
                className="pointer-events-none absolute inset-0 w-1/3 -skew-x-[15deg] bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shine motion-reduce:hidden"
                aria-hidden="true"
              />
            </ButtonLink>
            {product && (
              <span className="font-display text-2xl text-bone">
                Desde {formatMXN(product.priceRange.minVariantPrice.amount)}
              </span>
            )}
          </div>
        </div>

        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-ink-border bg-ink-soft">
          {images.map((image, i) => (
            <Image
              key={image.url}
              src={image.url}
              alt={image.altText ?? product?.title ?? "Letrero personalizado Luaser"}
              fill
              priority={i === 0}
              sizes="(min-width: 768px) 50vw, 100vw"
              className={`object-cover transition-opacity duration-700 ${
                i === active ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {images.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Letrero anterior"
                onClick={() => setActive((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-bone backdrop-blur transition-colors hover:bg-gold hover:text-ink"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                aria-label="Siguiente letrero"
                onClick={() => setActive((i) => (i + 1) % images.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-ink/60 text-bone backdrop-blur transition-colors hover:bg-gold hover:text-ink"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                {images.map((image, i) => (
                  <button
                    key={image.url}
                    type="button"
                    aria-label={`Ver letrero ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === active ? "w-6 bg-gold" : "w-1.5 bg-bone/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
