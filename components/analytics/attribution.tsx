"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const COOKIE = "luaser_attrib";
const MAX_AGE = 60 * 60 * 24 * 30;
const CLAVES = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

function CapturaOrigen() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Gana el primer toque: si alguien llega por un anuncio y regresa directo
    // tres días después a comprar, la venta le sigue perteneciendo al anuncio
    // que la trajo. Con último toque, todo el catálogo parecería "directo".
    if (document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=`))) return;

    const partes = CLAVES.map((clave) => [clave, searchParams.get(clave)] as const).filter(
      (par): par is readonly [(typeof CLAVES)[number], string] => Boolean(par[1])
    );

    if (partes.length === 0) return;

    const valor = partes.map(([clave, v]) => `${clave}=${encodeURIComponent(v)}`).join("&");
    document.cookie = `${COOKIE}=${encodeURIComponent(valor)}; path=/; max-age=${MAX_AGE}; samesite=lax`;
  }, [searchParams]);

  return null;
}

/**
 * Guarda de dónde vino el visitante para que el pedido de Shopify lo diga.
 *
 * Sin esto, Shopify atribuía cero sesiones a redes sociales aunque la tienda
 * gastara miles en anuncios: al ser un sitio headless, Shopify nunca ve el
 * origen y manda todo a "directo" y "desconocido". El valor viaja después como
 * atributo del carrito y termina visible en el pedido.
 */
export function Attribution() {
  return (
    <Suspense fallback={null}>
      <CapturaOrigen />
    </Suspense>
  );
}
