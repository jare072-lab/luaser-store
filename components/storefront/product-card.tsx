import Image from "next/image";
import Link from "next/link";
import { formatMXN } from "@/lib/utils";
import { ScarcityBadge } from "@/components/storefront/scarcity-badge";
import type { ShopifyProduct } from "@/lib/shopify/types";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const price = Number(product.priceRange.minVariantPrice.amount);
  const compareAtAmount = product.compareAtPriceRange?.minVariantPrice?.amount;
  const compareAt = compareAtAmount ? Number(compareAtAmount) : 0;
  const hasDiscount = compareAt > price;
  const discountPct = hasDiscount ? Math.round((1 - price / compareAt) * 100) : 0;

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
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          <ScarcityBadge quantity={product.totalInventory} />
          {hasDiscount && (
            <span className="rounded-full bg-pitch px-2.5 py-1 text-xs font-body font-semibold text-bone">
              -{discountPct}%
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-body text-sm text-bone line-clamp-2">{product.title}</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="font-display text-gold">{formatMXN(price)}</p>
          {hasDiscount && (
            <p className="font-body text-xs text-graystone-500 line-through">
              {formatMXN(compareAt)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
