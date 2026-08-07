const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION ?? "2025-01";

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
  // Leídas dentro de la función (no a nivel de módulo) para evitar cualquier
  // ambigüedad sobre cuándo se evalúan en el entorno serverless de Vercel.
  const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  const token = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

  if (!domain || !token) {
    throw new Error(
      `Faltan variables de entorno de Shopify en runtime. NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=${domain ? "OK" : "AUSENTE"}, NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN=${token ? "OK" : "AUSENTE"}`
    );
  }

  const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

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

  // Leemos como texto primero: si Shopify responde algo que no es JSON
  // (por dominio o versión de API inválidos, por ejemplo), queremos ver el
  // cuerpo crudo en el error en vez de un fallo genérico de res.json().
  const rawText = await res.text();

  let json: { data?: T; errors?: unknown };
  try {
    json = JSON.parse(rawText);
  } catch {
    throw new Error(
      `Shopify respondió algo que no es JSON (status ${res.status} en ${endpoint}): ${rawText.slice(0, 300)}`
    );
  }

  if (!res.ok) {
    throw new Error(`Shopify respondió ${res.status} en ${endpoint}: ${JSON.stringify(json).slice(0, 500)}`);
  }

  if (json.errors) {
    throw new Error(`Shopify GraphQL devolvió errores: ${JSON.stringify(json.errors).slice(0, 500)}`);
  }

  return json.data as T;
}
