import { shopifyFetch } from "@/lib/shopify/client";
import { HOME_QUERY } from "@/lib/shopify/queries/home";
import type { HomeData, ShopifyProduct } from "@/lib/shopify/types";

const HERO_PRODUCT_HANDLE = "letrero-de-acrilico-personalizado-para-negocio";

interface RawHomeData {
  shop: { name: string };
  heroProduct: ShopifyProduct | null;
  bestsellers: {
    title: string;
    products: { edges: { node: ShopifyProduct }[] };
  } | null;
}

export async function getHomeData(): Promise<HomeData> {
  const data = await shopifyFetch<RawHomeData>({
    query: HOME_QUERY,
    variables: { heroHandle: HERO_PRODUCT_HANDLE },
    tags: ["home", "products", "collections"],
    revalidate: 86400,
  });

  return {
    shop: data.shop,
    heroProduct: data.heroProduct,
    bestsellers: data.bestsellers
      ? {
          title: data.bestsellers.title,
          products: data.bestsellers.products.edges.map((e) => e.node),
        }
      : null,
  };
}
