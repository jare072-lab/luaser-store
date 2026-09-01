import Image from "next/image";
import Link from "next/link";
import { RevealLuaser } from "@/components/storefront/reveal-luaser";
import { formatMXN } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/shopify/types";

const PHONE = "528131092383";
const WA_MESSAGE = "Hola, quiero conocer los productos con descuento";
const waHref = `https://wa.me/${PHONE}?text=${encodeURIComponent(WA_MESSAGE)}`;

// La animación dura 2.40 s. Todo lo que va abajo entra después, no encima.
const FIN = 2.4;

function descuento(p: ShopifyProduct) {
  const precio = Number(p.priceRange?.minVariantPrice?.amount ?? 0);
  const antes = Number(p.compareAtPriceRange?.minVariantPrice?.amount ?? 0);
  if (!(precio > 0 && antes > precio)) return null;
  return { precio, antes, pct: Math.round((1 - precio / antes) * 100) };
}

/**
 * Primera sección del home: el revelado de marca y, debajo, los descuentos.
 *
 * Están separados a propósito. La referencia que sirve de vara resuelve en un
 * cuadro con 0.6 % de tinta, y ese vacío es justo lo que la hace funcionar:
 * meter logo, oferta, descuentos y botones dentro del mismo encuadre rompería
 * lo único que valía la pena copiar. Así que la animación dice una sola cosa
 * —el descuento máximo— y la rejilla de productos entra después, en su bloque.
 *
 * El lienzo es decorativo (`aria-hidden`): el mensaje va también como texto
 * real para lectores de pantalla y para quien tenga el canvas bloqueado.
 *
 * Los porcentajes y precios salen del catálogo, no están escritos a mano: si
 * mañana cambia un precio en Shopify, esta sección se corrige sola.
 */
export function PromoBanner({
  ahorroPlacas,
  productos = [],
}: {
  /** Cuanto baja la placa de acrilico al comprarla en pack de 10 en vez de
   *  suelta. No es un descuento: es la escalera de volumen que ya existe. */
  ahorroPlacas: number;
  productos?: ShopifyProduct[];
}) {
  const enOferta = productos.map((p) => ({ p, d: descuento(p) })).filter((x) => x.d).slice(0, 5);

  // El bloque de abajo si habla de descuentos de verdad: son las piezas con
  // precio comparativo. Su porcentaje sale de ESAS piezas, no del acrilico,
  // porque son dos cosas distintas y mezclarlas seria mentir en una de las dos.
  const maxOferta = enOferta.reduce((m, x) => Math.max(m, x.d?.pct ?? 0), 0);

  return (
    <section className="relative isolate overflow-hidden bg-ink">
      {/* El cuadro del revelado: nada se dibuja encima. */}
      <div className="relative h-[72svh] max-h-[720px] min-h-[460px] w-full">
        <RevealLuaser className="absolute inset-0 block h-full w-full" maxDescuento={ahorroPlacas} />
        <h1 className="sr-only">
          Luaser — placas de acrílico cortadas a láser, hasta {ahorroPlacas}% menos por placa
          comprando el pack
        </h1>
      </div>

      {/* Salida del cuadro: aparece cuando la animación ya resolvió. */}
      <div
        className="relative z-10 flex flex-wrap items-center justify-center gap-3 px-6 pb-2 pt-1 animate-promo-in motion-reduce:animate-none"
        style={{ animationDelay: `${FIN + 0.15}s` }}
      >
        <Link
          href="/coleccion/frontpage"
          className="rounded bg-gold px-7 py-3.5 font-body text-[15px] font-extrabold text-ink transition-transform hover:scale-[1.03]"
        >
          Ver todos los productos
        </Link>
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded border border-bone/25 px-7 py-3.5 font-body text-[15px] font-bold text-bone transition-colors hover:bg-bone/10"
        >
          Cotizar por WhatsApp
        </a>
      </div>

      {enOferta.length > 0 && (
        <div
          className="relative z-10 mx-auto flex w-full max-w-content flex-col items-center gap-6 px-6 pb-16 pt-12 animate-promo-in motion-reduce:animate-none"
          style={{ animationDelay: `${FIN + 0.35}s` }}
        >
          <div className="flex flex-wrap items-baseline justify-center gap-x-2.5 gap-y-1 text-center">
            <span className="font-body text-[13px] font-bold uppercase tracking-[3px] text-graystone-500">
              Y además
            </span>
            <span className="font-display text-[26px] uppercase leading-none tracking-[1px] text-bone sm:text-[32px]">
              hasta <span className="text-gold">{maxOferta}%</span> de descuento
            </span>
          </div>

          <div className="grid w-full grid-cols-2 gap-[18px] sm:grid-cols-3 lg:grid-cols-5">
            {enOferta.map(({ p, d }) => (
              <Link
                key={p.handle}
                href={`/producto/${p.handle}`}
                className="group overflow-hidden rounded-md bg-ink-soft transition-colors hover:bg-graystone-900"
              >
                <div className="relative aspect-square overflow-hidden bg-[#0e0e0f]">
                  {p.featuredImage && (
                    <Image
                      src={p.featuredImage.url}
                      alt={p.featuredImage.altText ?? p.title}
                      fill
                      sizes="(max-width: 1024px) 45vw, 220px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  <span className="absolute left-2 top-2 rounded-sm bg-terracotta px-2 py-0.5 font-body text-xs font-extrabold text-bone">
                    -{d!.pct}%
                  </span>
                </div>
                <div className="flex flex-col gap-1 px-3 pb-3.5 pt-2.5">
                  <span className="min-h-[32px] font-body text-[12.5px] font-semibold leading-tight text-graystone-100">
                    {p.title}
                  </span>
                  <span className="flex items-baseline gap-1.5">
                    <span className="font-body text-[15px] font-extrabold text-gold">
                      {formatMXN(d!.precio)}
                    </span>
                    <span className="font-body text-xs text-graystone-500 line-through">
                      {formatMXN(d!.antes)}
                    </span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
