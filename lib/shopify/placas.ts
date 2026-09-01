import { shopifyFetch } from "@/lib/shopify/client";

/**
 * Datos de las placas de acrilico para la seccion interactiva del home.
 *
 * Consulta aparte y no dentro de HOME_QUERY porque trae la matriz completa de
 * precios: 286 variantes con su color, su medida y su pack. El selector no
 * puede calcular nada sin ella, y el resto del home no la necesita.
 */

const PLACAS_QUERY = /* GraphQL */ `
  query Placas {
    collection(handle: "placas-de-acrilico") {
      products(first: 10) {
        edges {
          node {
            id
            title
            handle
            options {
              name
              values
            }
            variants(first: 250) {
              edges {
                node {
                  id
                  price {
                    amount
                  }
                  availableForSale
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export interface PlacaVariante {
  id: string;
  precio: number;
  disponible: boolean;
  color: string; // valor de la primera opcion: Color o Espesor
  medida: string;
  pack: string;
  imagen: string | null;
}

export interface PlacaProducto {
  id: string;
  titulo: string;
  handle: string;
  /** Como se llama la primera opcion en este producto: "Color" o "Espesor". */
  ejeColor: string;
  colores: string[];
  medidas: string[];
  packs: string[];
  variantes: PlacaVariante[];
}

interface Cruda {
  collection: {
    products: {
      edges: {
        node: {
          id: string;
          title: string;
          handle: string;
          options: { name: string; values: string[] }[];
          variants: {
            edges: {
              node: {
                id: string;
                price: { amount: string };
                availableForSale: boolean;
                selectedOptions: { name: string; value: string }[];
                image: { url: string; altText: string | null } | null;
              };
            }[];
          };
        };
      }[];
    };
  } | null;
}

export async function getPlacas(): Promise<PlacaProducto[]> {
  const data = await shopifyFetch<Cruda>({
    query: PLACAS_QUERY,
    tags: ["placas", "products", "collections"],
    revalidate: 300,
  });

  const productos = data.collection?.products.edges ?? [];

  return productos.map(({ node }) => {
    // La primera opcion es "Color" en cuatro productos y "Espesor" en el
    // cristal. Se trata igual: es el eje que pinta la muestra.
    const ejeColor = node.options[0]?.name ?? "Color";
    const opcion = (n: string) => node.options.find((o) => o.name === n)?.values ?? [];

    const variantes: PlacaVariante[] = node.variants.edges.map(({ node: v }) => {
      const val = (n: string) => v.selectedOptions.find((o) => o.name === n)?.value ?? "";
      return {
        id: v.id,
        precio: Number(v.price.amount),
        disponible: v.availableForSale,
        color: val(ejeColor),
        medida: val("Medida"),
        pack: val("Pack"),
        imagen: v.image?.url ?? null,
      };
    });

    return {
      id: node.id,
      titulo: node.title,
      handle: node.handle,
      ejeColor,
      colores: opcion(ejeColor),
      medidas: opcion("Medida"),
      packs: opcion("Pack"),
      variantes,
    };
  });
}

/**
 * Ahorro real por placa al comprar el pack de 10 en vez de la pieza suelta.
 *
 * No es un descuento ni una promocion: es la escalera de volumen que ya existe
 * en la tienda. Se calcula, no se escribe a mano, para que el dia que cambie
 * un precio en Shopify el numero del home se corrija solo.
 */
export function maxAhorroPack(productos: PlacaProducto[]): number {
  let max = 0;
  for (const p of productos) {
    for (const color of p.colores) {
      for (const medida of p.medidas) {
        const suelta = p.variantes.find(
          (v) => v.color === color && v.medida === medida && v.pack === "1 pieza"
        );
        const diez = p.variantes.find(
          (v) => v.color === color && v.medida === medida && v.pack === "10 piezas"
        );
        if (!suelta || !diez || suelta.precio <= 0) continue;
        const porPlaca = diez.precio / 10;
        if (porPlaca < suelta.precio) {
          max = Math.max(max, Math.round((1 - porPlaca / suelta.precio) * 100));
        }
      }
    }
  }
  return max;
}
