import { shopifyFetch } from "@/lib/shopify/client";
import { HOME_QUERY } from "@/lib/shopify/queries/home";
import type { HomeData, ShopifyImage, ShopifyProduct } from "@/lib/shopify/types";

const HERO_PRODUCT_HANDLE = "letrero-de-acrilico-personalizado-para-negocio";

interface RawHeroProduct extends Omit<ShopifyProduct, "images"> {
  images: { edges: { node: ShopifyImage }[] };
}

interface RawHomeData {
  shop: { name: string };
  heroProduct: RawHeroProduct | null;
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
    // Ver la nota en lib/shopify/product.ts sobre por que no son 24 h.
    revalidate: 300,
  });

  return {
    shop: data.shop,
    heroProduct: data.heroProduct
      ? {
          ...data.heroProduct,
          images: data.heroProduct.images.edges.map((e) => e.node),
        }
      : null,
    bestsellers: data.bestsellers
      ? {
          title: data.bestsellers.title,
          products: data.bestsellers.products.edges.map((e) => e.node),
        }
      : null,
  };
}
