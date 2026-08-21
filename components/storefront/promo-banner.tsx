import Image from "next/image";
import Link from "next/link";
import { NumeroQueSube } from "@/components/storefront/promo-contador";
import { formatMXN } from "@/lib/utils";
import type { ShopifyProduct } from "@/lib/shopify/types";

const PHONE = "528131092383";
const WA_MESSAGE = "Hola, quiero conocer los productos con descuento";
const waHref = `https://wa.me/${PHONE}?text=${encodeURIComponent(WA_MESSAGE)}`;

// 26 partículas como la referencia, pero con posición fija y flotación en CSS.
// El original recalcula las 26 en cada fotograma con requestAnimationFrame; eso
// pelea con la carga del catálogo justo cuando el cliente espera ver precios.
const PARTICULAS = Array.from({ length: 26 }, (_, i) => {
  const angulo = (i / 26) * Math.PI * 2 + (i % 3) * 0.15;
  const dist = 26 + (i % 5) * 9;
  return {
    left: `${50 + Math.cos(angulo) * dist}%`,
    top: `${38 + Math.sin(angulo) * dist * 0.9}%`,
    size: 4 + (i % 4) * 2,
    delay: `${(i % 8) * 0.35}s`,
    dur: `${9 + (i % 5) * 1.5}s`,
  };
});

function descuento(p: ShopifyProduct) {
  const precio = Number(p.priceRange?.minVariantPrice?.amount ?? 0);
  const antes = Number(p.compareAtPriceRange?.minVariantPrice?.amount ?? 0);
  if (!(precio > 0 && antes > precio)) return null;
  return { precio, antes, pct: Math.round((1 - precio / antes) * 100) };
}

/**
 * Banner de promoción a pantalla ancha, primera sección del home.
 *
 * El porcentaje y los precios de las tarjetas NO se escriben a mano: salen del
 * catálogo real, para que el banner nunca prometa un descuento que la ficha no
 * cumple. Si mañana cambia un precio en Shopify, el banner se corrige solo.
 *
 * Los tiempos de entrada son los de la referencia: 0.10 s el rótulo, 0.15 s el
 * titular, 0.85 s el párrafo, 1.10 s los botones y las tarjetas escalonadas
 * después. Todo se apaga con `motion-reduce`, y como usa `backwards`, quien
 * pide menos movimiento ve el banner completo y quieto, no un bloque invisible.
 */
export function PromoBanner({
  maxDescuento,
  productos = [],
}: {
  maxDescuento: number;
  productos?: ShopifyProduct[];
}) {
  const enOferta = productos.map((p) => ({ p, d: descuento(p) })).filter((x) => x.d).slice(0, 5);

  return (
    <section
      className="relative isolate flex min-h-[680px] flex-col items-center justify-center overflow-hidden px-6 py-14 [background:linear-gradient(180deg,#0B0C0E_0%,#16181C_100%)] [perspective:1400px]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-36 -right-28 h-[420px] w-[420px] rounded-full animate-blob1 motion-reduce:animate-none [background:radial-gradient(circle,rgba(232,146,122,0.25)_0%,rgba(232,146,122,0)_70%)]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-24 h-[380px] w-[380px] rounded-full animate-blob2 motion-reduce:animate-none [background:radial-gradient(circle,rgba(232,146,122,0.18)_0%,rgba(232,146,122,0)_70%)]"
      />

      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {PARTICULAS.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-gold-bright/50 animate-promo-float motion-reduce:hidden"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: p.delay,
              animationDuration: p.dur,
              boxShadow: "0 0 6px rgba(245,175,149,0.6)",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex max-w-[860px] flex-col items-center gap-3.5 text-center [transform-style:preserve-3d]">
        <div
          className="flex items-center gap-2.5 font-body text-[13px] font-bold uppercase tracking-[3px] text-gold animate-promo-in motion-reduce:animate-none"
          style={{ animationDelay: "0.1s" }}
        >
          <span aria-hidden="true" className="h-px w-7 bg-gold" />
          Productos seleccionados
          <span aria-hidden="true" className="h-px w-7 bg-gold" />
        </div>

        <h2
          className="m-0 font-display text-[54px] uppercase leading-[0.92] tracking-[1px] text-bone sm:text-7xl md:text-[108px] animate-promo-in motion-reduce:animate-none"
          style={{ animationDelay: "0.15s" }}
        >
          Hasta{" "}
          <span
            className="inline-block text-terracotta animate-promo-pop motion-reduce:animate-none"
            style={{ animationDelay: "0.15s", filter: "drop-shadow(0 0 30px rgba(230,57,128,0.45))" }}
          >
            <NumeroQueSube objetivo={maxDescuento} />
          </span>{" "}
          <span className="bg-[linear-gradient(90deg,#F5AF95,#E8927A_40%,#B8654C_60%,#F5AF95)] bg-[length:200%_auto] bg-clip-text text-transparent animate-promo-shine-text motion-reduce:animate-none">
            de descuento
          </span>
        </h2>

        <p
          className="m-0 max-w-[560px] font-body text-base font-medium leading-relaxed text-graystone-300 sm:text-[19px] animate-promo-in motion-reduce:animate-none"
          style={{ animationDelay: "0.85s" }}
        >
          Letreros, cajas, llaveros y piezas de acrílico y MDF cortadas a láser en nuestro taller
          de Monterrey — descuentos especiales en piezas seleccionadas.
        </p>

        <div
          className="mt-3 flex flex-wrap justify-center gap-3.5 animate-promo-in motion-reduce:animate-none"
          style={{ animationDelay: "1.1s" }}
        >
          <Link
            href="/coleccion/frontpage"
            className="relative overflow-hidden rounded bg-[linear-gradient(180deg,#F5AF95,#B8654C)] px-8 py-4 font-body text-base font-extrabold text-ink shadow-[0_8px_24px_rgba(232,146,122,0.35)] transition-transform hover:scale-[1.03]"
          >
            <span className="relative">Ver productos en oferta</span>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 w-[35%] -skew-x-[15deg] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine motion-reduce:hidden"
            />
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded border border-bone/35 px-8 py-4 font-body text-base font-bold text-bone transition-colors hover:bg-bone/10"
          >
            Cotizar por WhatsApp
          </a>
        </div>
      </div>

      {enOferta.length > 0 && (
        <div className="relative z-10 mt-12 grid w-full max-w-[1180px] grid-cols-2 gap-[18px] sm:grid-cols-3 lg:grid-cols-5 [perspective:1000px]">
          {enOferta.map(({ p, d }, i) => (
            <Link
              key={p.handle}
              href={`/producto/${p.handle}`}
              className="group overflow-hidden rounded-md bg-ink-soft animate-promo-card motion-reduce:animate-none"
              style={{ animationDelay: `${1.3 + i * 0.12}s` }}
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
                <span
                  className="absolute left-2 top-2 rounded-sm bg-terracotta px-2 py-0.5 font-body text-xs font-extrabold text-bone animate-promo-badge motion-reduce:animate-none"
                  style={{ animationDelay: `${1.6 + i * 0.12}s` }}
                >
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
      )}
    </section>
  );
}
