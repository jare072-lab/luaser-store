import { shopifyFetch } from "@/lib/shopify/client";
import { PRODUCT_QUERY, ALL_PRODUCT_HANDLES_QUERY } from "@/lib/shopify/queries/product";
import type { ProductDetail, ProductVariant, ShopifyImage } from "@/lib/shopify/types";

interface RawProductDetail
  extends Omit<ProductDetail, "images" | "variants" | "primaryCollection"> {
  images: { edges: { node: ShopifyImage }[] };
  variants: { edges: { node: ProductVariant }[] };
  collections: { edges: { node: { title: string; handle: string } }[] };
}

// El revalidate largo es una red de seguridad: la frescura real la da el
// webhook de Shopify (revalidateTag) en app/api/revalidate/route.ts.
const CATALOG_REVALIDATE_SECONDS = 86400;

export async function getProductByHandle(handle: string): Promise<ProductDetail | null> {
  const data = await shopifyFetch<{ product: RawProductDetail | null }>({
    query: PRODUCT_QUERY,
    variables: { handle },
    tags: ["products"],
    revalidate: CATALOG_REVALIDATE_SECONDS,
  });

  if (!data.product) return null;

  return {
    ...data.product,
    images: data.product.images.edges.map((e) => e.node),
    variants: data.product.variants.edges.map((e) => e.node),
    primaryCollection: data.product.collections.edges[0]?.node ?? null,
  };
}

interface AllProductHandlesResponse {
  products: {
    edges: { node: { handle: string; updatedAt: string } }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

export async function getAllProductHandles(): Promise<{ handle: string; updatedAt: string }[]> {
  const handles: { handle: string; updatedAt: string }[] = [];
  let after: string | undefined;

  while (true) {
    const data = await shopifyFetch<AllProductHandlesResponse>({
      query: ALL_PRODUCT_HANDLES_QUERY,
      variables: { first: 100, after },
      tags: ["products"],
      revalidate: CATALOG_REVALIDATE_SECONDS,
    });

    handles.push(...data.products.edges.map((e) => e.node));

    if (!data.products.pageInfo.hasNextPage) break;
    after = data.products.pageInfo.endCursor ?? undefined;
  }

  return handles;
}
