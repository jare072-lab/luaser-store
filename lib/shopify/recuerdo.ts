import { shopifyFetch } from "@/lib/shopify/client";

/**
 * Páginas de recuerdo a las que lleva el código QR de la placa conmemorativa.
 *
 * Cada familia es un metaobjeto `recuerdo` de Shopify (Contenido → Metaobjetos):
 * agregar uno nuevo no requiere tocar código ni volver a publicar el sitio.
 */

export type Imagen = { url: string; altText: string | null; width: number | null; height: number | null };

export type Recuerdo = {
  handle: string;
  nombre: string;
  nace: string | null;
  fallece: string | null;
  frase: string | null;
  historia: string | null;
  retrato: Imagen | null;
  galeria: Imagen[];
  video: string | null;
  familia: string | null;
};

const RECUERDO_QUERY = /* GraphQL */ `
  query Recuerdo($handle: String!) {
    metaobject(handle: { type: "recuerdo", handle: $handle }) {
      handle
      fields {
        key
        value
        reference {
          ... on MediaImage {
            image { url altText width height }
          }
        }
        references(first: 30) {
          nodes {
            ... on MediaImage {
              image { url altText width height }
            }
          }
        }
      }
    }
  }
`;

type Campo = {
  key: string;
  value: string | null;
  reference: { image?: Imagen } | null;
  references: { nodes: { image?: Imagen }[] } | null;
};

export async function getRecuerdo(handle: string): Promise<Recuerdo | null> {
  const data = await shopifyFetch<{ metaobject: { handle: string; fields: Campo[] } | null }>({
    query: RECUERDO_QUERY,
    variables: { handle },
    tags: [`recuerdo-${handle}`],
    revalidate: 300,
  });
  const m = data.metaobject;
  if (!m) return null;
  const campo = (k: string) => m.fields.find((f) => f.key === k);
  const texto = (k: string) => campo(k)?.value?.trim() || null;
  return {
    handle: m.handle,
    nombre: texto("nombre") ?? "",
    nace: texto("nace"),
    fallece: texto("fallece"),
    frase: texto("frase"),
    historia: texto("historia"),
    retrato: campo("retrato")?.reference?.image ?? null,
    galeria: (campo("galeria")?.references?.nodes ?? []).flatMap((n) => (n.image ? [n.image] : [])),
    video: texto("video"),
    familia: texto("familia"),
  };
}

/** Convierte un enlace de YouTube (watch, youtu.be o shorts) en su URL de inserción. */
export function youtubeEmbed(url: string | null): string | null {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}
