import type { ShopifyProduct } from "@/lib/shopify/types";

/**
 * El descuento mas alto que hay hoy en el catalogo, en porcentaje entero.
 *
 * Se calcula sobre los productos reales para que el banner nunca prometa mas de
 * lo que la ficha cumple: un cliente que llega por un "hasta 50%" y encuentra
 * 30% se va, y ademas es publicidad que no se sostiene.
 */
export function maxDescuento(productos: ShopifyProduct[]): number {
  let max = 0;
  for (const p of productos) {
    const precio = Number(p.priceRange?.minVariantPrice?.amount ?? 0);
    const antes = Number(p.compareAtPriceRange?.minVariantPrice?.amount ?? 0);
    if (precio > 0 && antes > precio) {
      max = Math.max(max, Math.round((1 - precio / antes) * 100));
    }
  }
  return max;
}
