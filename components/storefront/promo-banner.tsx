import Link from "next/link";
import { ArrowRight } from "lucide-react";

const PHONE = "528131092383";
const WA_MESSAGE = "Hola, quiero conocer los productos con descuento";
const waHref = `https://wa.me/${PHONE}?text=${encodeURIComponent(WA_MESSAGE)}`;

// Partículas de fondo. Van fijas y no calculadas por cuadro: el banner de
// referencia recomputa 26 de ellas en cada fotograma con requestAnimationFrame,
// y eso compite con la carga del catálogo justo cuando el cliente espera ver
// precios. Compuestas por GPU cuestan lo mismo que un div vacío.
const PARTICULAS = [
  { left: "8%", top: "18%", size: 6, delay: "0s", dur: "11s" },
  { left: "18%", top: "72%", size: 4, delay: "1.5s", dur: "13s" },
  { left: "31%", top: "12%", size: 5, delay: "3s", dur: "9s" },
  { left: "44%", top: "84%", size: 3, delay: "0.8s", dur: "12s" },
  { left: "58%", top: "22%", size: 5, delay: "2.2s", dur: "10s" },
  { left: "69%", top: "68%", size: 4, delay: "4s", dur: "14s" },
  { left: "81%", top: "30%", size: 6, delay: "1.2s", dur: "11s" },
  { left: "91%", top: "60%", size: 3, delay: "2.8s", dur: "9s" },
];

/**
 * Banner de promoción a pantalla ancha, primera sección del home.
 *
 * El porcentaje NO se escribe a mano: llega calculado del catálogo real, para
 * que el banner nunca prometa un descuento que la ficha no cumple.
 *
 * Las entradas replican los tiempos de la referencia (0.10 s, 0.15 s, 0.85 s y
 * 1.10 s) y todas combinan opacidad con desplazamiento. Se apagan con
 * `motion-reduce`, y como usan `backwards`, quien pide menos movimiento ve el
 * banner completo y quieto en vez de un bloque invisible.
 */
export function PromoBanner({ maxDescuento }: { maxDescuento: number }) {
  return (
    <section className="relative isolate overflow-hidden bg-ink">
      {/* Atmósfera: dos manchas de color que derivan lento, aria-hidden */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-0 h-[420px] w-[420px] rounded-full bg-gold-dark/25 blur-[90px] animate-blob1 motion-reduce:animate-none"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 bottom-0 h-[380px] w-[380px] rounded-full bg-gold/20 blur-[80px] animate-blob2 motion-reduce:animate-none"
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
              boxShadow: "0 0 8px rgba(245,175,149,0.55)",
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex max-w-content flex-col items-center px-4 py-20 text-center sm:px-6 sm:py-24">
        <span
          className="inline-flex items-center gap-3 font-body text-[11px] font-semibold uppercase tracking-[0.28em] text-gold sm:text-xs animate-promo-in motion-reduce:animate-none"
          style={{ animationDelay: "0.1s" }}
        >
          <span aria-hidden="true" className="h-px w-8 bg-gold/50 sm:w-10" />
          Productos seleccionados
          <span aria-hidden="true" className="h-px w-8 bg-gold/50 sm:w-10" />
        </span>

        <h2
          className="mt-6 font-display text-[52px] uppercase leading-[0.92] tracking-tight text-bone sm:text-7xl md:text-8xl animate-promo-in motion-reduce:animate-none"
          style={{ animationDelay: "0.15s" }}
        >
          Hasta{" "}
          <span
            className="inline-block bg-gradient-to-b from-gold-bright via-gold to-gold-dark bg-clip-text text-transparent animate-promo-pop motion-reduce:animate-none"
            style={{ animationDelay: "0.15s", filter: "drop-shadow(0 0 28px rgba(232,146,122,0.35))" }}
          >
            {maxDescuento}%
          </span>
          <span className="block">de descuento</span>
        </h2>

        <p
          className="mt-6 max-w-[560px] font-body text-[15px] leading-relaxed text-graystone-300 sm:text-base animate-promo-in motion-reduce:animate-none"
          style={{ animationDelay: "0.85s" }}
        >
          Letreros, cajas, llaveros y piezas de acrílico y MDF cortadas a láser en nuestro
          taller de Monterrey.
        </p>

        <div
          className="mt-9 flex flex-col items-center gap-3 sm:flex-row animate-promo-in motion-reduce:animate-none"
          style={{ animationDelay: "1.1s" }}
        >
          <Link
            href="/coleccion/frontpage"
            className="relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-b from-gold-bright to-gold-dark px-8 py-4 font-body text-[15px] font-bold text-ink transition-transform hover:scale-[1.03]"
          >
            <span className="relative">Ver productos en oferta</span>
            <ArrowRight className="relative h-4 w-4" />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 w-[35%] -skew-x-[15deg] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine motion-reduce:hidden"
            />
          </Link>

          <a
            href={waHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-full border border-bone/30 px-8 py-4 font-body text-[15px] font-semibold text-bone transition-colors hover:bg-bone/10"
          >
            Cotizar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
