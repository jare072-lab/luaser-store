import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { formatMXN } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/shopify/types";

export function HeroSection({ product }: { product: ShopifyProduct | null }) {
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
            <ButtonLink href={product ? `/producto/${product.handle}` : "/coleccion/frontpage"} size="lg">
              Cotiza el tuyo
            </ButtonLink>
            {product && (
              <span className="font-display text-2xl text-bone">
                Desde {formatMXN(product.priceRange.minVariantPrice.amount)}
              </span>
            )}
          </div>
        </div>
        <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-ink-border bg-ink-soft">
          {product?.featuredImage && (
            <Image
              src={product.featuredImage.url}
              alt={product.featuredImage.altText ?? product.title}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          )}
        </div>
      </div>
    </section>
  );
}
