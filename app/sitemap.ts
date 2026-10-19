import type { MetadataRoute } from "next";
import { getAllProductHandles } from "@/lib/shopify/product";
import { getAllCollectionHandles } from "@/lib/shopify/collection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
    getAllProductHandles(),
    getAllCollectionHandles(),
  ]);

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...[
      "/acrilico-cortado-a-la-medida",
      "/acrilico-cortado-a-la-medida/monterrey",
      "/placas-conmemorativas",
      "/letreros-de-acrilico-personalizados",
      "/llaveros-de-acrilico-personalizados",
      "/corte-laser-monterrey",
      "/cotiza",
    ].map((ruta) => ({
      url: `${SITE_URL}${ruta}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...collections.map((collection) => ({
      url: `${SITE_URL}/coleccion/${collection.handle}`,
      lastModified: new Date(collection.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/producto/${product.handle}`,
      lastModified: new Date(product.updatedAt),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];
}
