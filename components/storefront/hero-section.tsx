import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { CountdownMundial } from "@/components/storefront/countdown-mundial";
import { formatMXN } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/shopify/types";

export function HeroSection({ product }: { product: ShopifyProduct | null }) {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="mx-auto max-w-content px-4 sm:px-6 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <CountdownMundial />
          <h1 className="mt-6 font-display text-4xl sm:text-5xl md:text-6xl leading-[1.05] text-bone">
            Tu álbum del <span className="text-gold">Mundial 2026</span> merece exhibirse, no
            guardarse
          </h1>
          <p className="mt-5 max-w-lg font-body text-graystone-100 text-base sm:text-lg">
            Caja de acrílico cortada a láser a la medida exacta de tu álbum de estampas, con placa
            grabada personalizada. Pieza de colección, no plástico genérico.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <ButtonLink href={product ? `/producto/${product.handle}` : "/coleccion/frontpage"} size="lg">
              Aparta la tuya
            </ButtonLink>
            {product && (
              <span className="font-display text-2xl text-bone">
                {formatMXN(product.priceRange.minVariantPrice.amount)}
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
