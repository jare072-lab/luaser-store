import { ProductCard } from "@/components/storefront/product-card";
import type { ShopifyProduct } from "@/lib/shopify/types";

export function BestsellersSection({
  title,
  products,
}: {
  title: string;
  products: ShopifyProduct[];
}) {
  if (products.length === 0) return null;

  return (
    <section id="bestsellers" className="bg-ink py-16 md:py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-gold">
              {title}
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-bone">Más vendidos</h2>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
