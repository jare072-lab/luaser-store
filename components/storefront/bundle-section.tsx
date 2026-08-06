import { formatMXN } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";
import type { ShopifyProduct } from "@/lib/shopify/types";

const BUNDLE_DISCOUNT = 0.12;

export function BundleSection({ products }: { products: ShopifyProduct[] }) {
  if (products.length < 2) return null;

  const bundleProducts = products.slice(0, 3);
  const subtotal = bundleProducts.reduce(
    (sum, p) => sum + Number(p.priceRange.minVariantPrice.amount),
    0
  );
  const bundlePrice = subtotal * (1 - BUNDLE_DISCOUNT);

  return (
    <section className="bg-ink-soft py-16 md:py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6 grid md:grid-cols-[1fr_auto] gap-10 items-center">
        <div>
          <p className="text-xs font-body font-semibold uppercase tracking-widest text-gold">
            Arma tu set
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl text-bone">
            Completa tu colección y ahorra {Math.round(BUNDLE_DISCOUNT * 100)}%
          </h2>
          <p className="mt-3 max-w-lg font-body text-graystone-100 text-sm sm:text-base">
            {bundleProducts.map((p) => p.title).join(" + ")}
          </p>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl text-gold">{formatMXN(bundlePrice)}</span>
            <span className="font-body text-sm text-graystone-500 line-through">
              {formatMXN(subtotal)}
            </span>
          </div>
        </div>
        <ButtonLink href="/coleccion/frontpage" size="lg" variant="outline">
          Armar mi set
        </ButtonLink>
      </div>
    </section>
  );
}
