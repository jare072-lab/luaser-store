import { ProductCard } from "@/components/storefront/product-card";
import type { ShopifyProduct } from "@/lib/shopify/types";

export function RelatedProducts({ products }: { products: ShopifyProduct[] }) {
  if (products.length === 0) return null;

  return (
    <section className="border-t border-ink-border py-16">
      <p className="text-xs font-body font-semibold uppercase tracking-widest text-gold">
        Completa tu colección
      </p>
      <h2 className="mt-2 font-display text-2xl sm:text-3xl text-bone">También te puede gustar</h2>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
