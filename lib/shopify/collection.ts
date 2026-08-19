import { shopifyFetch } from "@/lib/shopify/client";
import { COLLECTION_QUERY, ALL_COLLECTION_HANDLES_QUERY } from "@/lib/shopify/queries/collection";
import type { CollectionDetail, ShopifyProduct } from "@/lib/shopify/types";

interface RawCollectionDetail extends Omit<CollectionDetail, "products"> {
  products: { edges: { node: ShopifyProduct }[] };
}

// El revalidate largo es una red de seguridad: la frescura real la da el
// webhook de Shopify (revalidateTag) en app/api/revalidate/route.ts.
// Ver la nota en lib/shopify/product.ts: sin webhook registrado, este numero
// es el unico mecanismo de frescura del catalogo.
const CATALOG_REVALIDATE_SECONDS = 300;

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
  // Usado por generateStaticParams y el sitemap. El sitio es 100% dinámico
  // (el layout raíz lee la cookie del carrito), así que estas dos cosas son
  // solo una optimización — nunca deben tumbar el build completo si la
  // Storefront API falla momentáneamente o hay una var de entorno mal puesta.
  try {
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
  } catch (error) {
    console.error("[getAllCollectionHandles] No se pudo consultar la Storefront API:", error);
    return [];
  }
}
