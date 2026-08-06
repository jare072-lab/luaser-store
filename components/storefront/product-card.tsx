import Image from "next/image";
import Link from "next/link";
import { formatMXN } from "@/lib/utils";
import { ScarcityBadge } from "@/components/storefront/scarcity-badge";
import type { ShopifyProduct } from "@/lib/shopify/types";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  return (
    <Link
      href={`/producto/${product.handle}`}
      className="group block rounded-2xl border border-ink-border bg-ink-soft overflow-hidden transition-colors hover:border-gold/50"
    >
      <div className="relative aspect-square bg-ink">
        {product.featuredImage && (
          <Image
            src={product.featuredImage.url}
            alt={product.featuredImage.altText ?? product.title}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <div className="absolute top-3 left-3">
          <ScarcityBadge quantity={product.totalInventory} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-body text-sm text-bone line-clamp-2">{product.title}</h3>
        <p className="mt-2 font-display text-gold">
          {formatMXN(product.priceRange.minVariantPrice.amount)}
        </p>
      </div>
    </Link>
  );
}
