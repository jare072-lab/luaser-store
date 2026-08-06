import { shopifyFetch } from "@/lib/shopify/client";
import { COLLECTION_QUERY, ALL_COLLECTION_HANDLES_QUERY } from "@/lib/shopify/queries/collection";
import type { CollectionDetail, ShopifyProduct } from "@/lib/shopify/types";

interface RawCollectionDetail extends Omit<CollectionDetail, "products"> {
  products: { edges: { node: ShopifyProduct }[] };
}

// El revalidate largo es una red de seguridad: la frescura real la da el
// webhook de Shopify (revalidateTag) en app/api/revalidate/route.ts.
const CATALOG_REVALIDATE_SECONDS = 86400;

export async function getCollectionByHandle(
  handle: string,
  first = 24
): Promise<CollectionDetail | null> {
  const data = await shopifyFetch<{ collection: RawCollectionDetail | null }>({
    query: COLLECTION_QUERY,
    variables: { handle, first },
    tags: ["collections"],
    revalidate: CATALOG_REVALIDATE_SECONDS,
  });

  if (!data.collection) return null;

  return {
    ...data.collection,
    products: data.collection.products.edges.map((e) => e.node),
  };
}

interface AllCollectionHandlesResponse {
  collections: {
    edges: { node: { handle: string; updatedAt: string } }[];
    pageInfo: { hasNextPage: boolean; endCursor: string | null };
  };
}

export async function getAllCollectionHandles(): Promise<
  { handle: string; updatedAt: string }[]
> {
  const handles: { handle: string; updatedAt: string }[] = [];
  let after: string | undefined;

  while (true) {
    const data = await shopifyFetch<AllCollectionHandlesResponse>({
      query: ALL_COLLECTION_HANDLES_QUERY,
      variables: { first: 100, after },
      tags: ["collections"],
      revalidate: CATALOG_REVALIDATE_SECONDS,
    });

    handles.push(...data.collections.edges.map((e) => e.node));

    if (!data.collections.pageInfo.hasNextPage) break;
    after = data.collections.pageInfo.endCursor ?? undefined;
  }

  return handles;
}
