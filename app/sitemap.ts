import type { MetadataRoute } from "next";
import { getAllProductHandles } from "@/lib/shopify/product";
import { getAllCollectionHandles } from "@/lib/shopify/collection";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// Colecciones que ya tienen pagina propia y se redirigen: no van al sitemap
// porque Google no debe descubrir una URL que responde 301.
const COLECCIONES_REDIRIGIDAS = new Set(["placas-de-acrilico"]);

// Paginas estaticas del sitio. Antes el sitemap solo listaba home, colecciones
// y productos: la cotizacion, la landing de placas y las paginas de ayuda no
// se le anunciaban a Google.
const PAGINAS_ESTATICAS: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/placas-de-acrilico", priority: 0.9, changeFrequency: "daily" },
  { path: "/cotiza", priority: 0.8, changeFrequency: "monthly" },
  { path: "/paginas/envios-y-tiempos", priority: 0.5, changeFrequency: "monthly" },
  { path: "/paginas/garantia", priority: 0.4, changeFrequency: "monthly" },
  { path: "/paginas/preguntas-frecuentes", priority: 0.5, changeFrequency: "monthly" },
  { path: "/paginas/contacto", priority: 0.5, changeFrequency: "monthly" },
  { path: "/paginas/terminos-y-condiciones", priority: 0.2, changeFrequency: "monthly" },
  { path: "/paginas/privacidad", priority: 0.2, changeFrequency: "monthly" },
];

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
    ...PAGINAS_ESTATICAS.map((p) => ({
      url: `${SITE_URL}${p.path}`,
      lastModified: new Date(),
      changeFrequency: p.changeFrequency,
      priority: p.priority,
    })),
    ...collections
      .filter((collection) => !COLECCIONES_REDIRIGIDAS.has(collection.handle))
      .map((collection) => ({
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
