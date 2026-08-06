const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";

const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

export async function shopifyFetch<T>({
  query,
  variables,
  tags,
  revalidate,
  cache,
}: {
  query: string;
  variables?: Record<string, unknown>;
  tags?: string[];
  revalidate?: number;
  cache?: "no-store";
}): Promise<T> {
  if (!domain || !token) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN o NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN en .env.local"
    );
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": token,
    },
    body: JSON.stringify({ query, variables }),
    // El carrito es por-usuario y nunca debe cachearse; catálogo/colecciones sí.
    ...(cache === "no-store" ? { cache: "no-store" as const } : { next: { tags, revalidate } }),
  });

  const json = await res.json();

  if (json.errors) {
    throw new Error(json.errors.map((e: { message: string }) => e.message).join("\n"));
  }

  return json.data as T;
}
