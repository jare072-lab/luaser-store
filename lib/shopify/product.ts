import { shopifyFetch } from "@/lib/shopify/client";
import { PRODUCT_QUERY, ALL_PRODUCT_HANDLES_QUERY } from "@/lib/shopify/queries/product";
import type { ProductDetail, ProductVariant, ShopifyImage, ShopifyVideo, ShopifyVideoSource } from "@/lib/shopify/types";

interface RawMediaNode {
  __typename: string;
  id?: string;
  alt?: string | null;
  previewImage?: { url: string } | null;
  sources?: ShopifyVideoSource[];
}

interface RawProductDetail
  extends Omit<ProductDetail, "images" | "videos" | "variants" | "primaryCollection"> {
  images: { edges: { node: ShopifyImage }[] };
  media: { edges: { node: RawMediaNode }[] };
  variants: { edges: { node: ProductVariant }[] };
  collections: { edges: { node: { title: string; handle: string } }[] };
}

// Cuando el webhook de Shopify (revalidateTag en app/api/revalidate/route.ts)
// esta registrado y firmando bien, el purgado es instantaneo y este numero casi
// no se usa. Cuando no lo esta, este numero ES el unico mecanismo de frescura:
// con 86400 un cambio de precio o de stock tardaba hasta 24 h en verse.
// 5 minutos con stale-while-revalidate: el usuario nunca espera y el catalogo
// se corrige solo.
const CATALOG_REVALIDATE_SECONDS = 300;

export async function getProductByHandle(handle: string): Promise<ProductDetail | null> {
  const data = await shopifyFetch<{ product: RawProductDetail | null }>({
    query: PRODUCT_QUERY,
    variables: { handle },
    tags: ["products"],
    revalidate: CATALOG_REVALIDATE_SECONDS,
  });

  if (!data.product) return null;

  const videos: ShopifyVideo[] = data.product.media.edges
    .filter((e) => e.node.__typename === "Video")
    .map((e) => ({
      id: e.node.id ?? "",
      alt: e.node.alt ?? null,
      previewImageUrl: e.node.previewImage?.url ?? null,
      sources: e.node.sources ?? [],
    }));

  return {
    ...data.product,
    images: data.product.images.edges.map((e) => e.node),
    videos,
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
  // Usado por generateStaticParams y el sitemap. El sitio es 100% dinámico
  // (el layout raíz lee la cookie del carrito), así que estas dos cosas son
  // solo una optimización — nunca deben tumbar el build completo si la
  // Storefront API falla momentáneamente o hay una var de entorno mal puesta.
  try {
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
  } catch (error) {
    console.error("[getAllProductHandles] No se pudo consultar la Storefront API:", error);
    return [];
  }
}
