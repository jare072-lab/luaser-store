"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const COOKIE = "luaser_attrib";
const MAX_AGE = 60 * 60 * 24 * 30;
const CLAVES = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"] as const;

// Cookies que el pixel de Meta deja en luaser.mx. El checkout vive en otro
// dominio (luaser.myshopify.com), donde el navegador ya no las puede leer, así
// que viajan al pedido como atributos del carrito. Sin ellas el Purchase
// server-side llega sin fbc/fbp y Meta no puede ligar la venta con el anuncio
// que la trajo: es exactamente lo que tenía la atribución en ceros.
const CLAVES_META = ["_fbc", "_fbp"] as const;

function leerCookie(nombre: string): string | null {
  const prefijo = `${nombre}=`;
  const cruda = document.cookie.split("; ").find((c) => c.startsWith(prefijo));
  return cruda ? decodeURIComponent(cruda.slice(prefijo.length)) : null;
}

function CapturaOrigen() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // Gana el primer toque: si alguien llega por un anuncio y regresa directo
    // tres días después a comprar, la venta le sigue perteneciendo al anuncio
    // que la trajo. Con último toque, todo el catálogo parecería "directo".
    if (document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=`))) return;

    const partes: [string, string][] = [];

    for (const clave of CLAVES) {
      const valor = searchParams.get(clave);
      if (valor) partes.push([clave, valor]);
    }

    for (const clave of CLAVES_META) {
      const valor = leerCookie(clave);
      if (valor) partes.push([clave, valor]);
    }

    // Meta manda casi todo su tráfico solo con fbclid, sin UTMs: por eso antes
    // se perdían la mayoría de los pedidos. Si el pixel todavía no escribió
    // _fbc, lo armamos con el formato que Meta documenta como alternativa,
    // fb.<subdominio>.<timestamp>.<fbclid>, donde 1 es el índice de luaser.mx.
    const fbclid = searchParams.get("fbclid");
    if (fbclid && !partes.some(([clave]) => clave === "_fbc")) {
      partes.push(["_fbc", `fb.1.${Date.now()}.${fbclid}`]);
    }

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
