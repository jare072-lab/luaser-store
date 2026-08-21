import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Franja de promoción dentro del hero.
 *
 * El porcentaje NO se escribe a mano: se recibe calculado del catálogo real,
 * porque un banner que promete un descuento que la ficha no da es la forma más
 * rápida de perder la venta justo después del clic.
 *
 * Sobre el movimiento: las entradas van escalonadas con los mismos retrasos de
 * la referencia (0.10 s, 0.15 s, 1.10 s) y todas combinan opacidad con
 * desplazamiento, nunca solo fade. Va en CSS y no en JavaScript por cuadro: el
 * original redibuja 26 partículas en cada fotograma, y en el home eso compite
 * con la carga del catálogo justo cuando el cliente espera ver precios.
 *
 * Todo se apaga con `motion-reduce`. Las animaciones usan `backwards`, así que
 * el estado final es el visible por defecto: quien pide menos movimiento ve la
 * franja completa y quieta, no un elemento invisible.
 */
export function PromoBanner({ maxDescuento }: { maxDescuento: number }) {
  return (
    <div className="relative overflow-hidden border-b border-ink-border bg-gradient-to-r from-gold-dark/25 via-gold/15 to-transparent">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-10 top-1/2 h-24 w-24 -translate-y-1/2 rounded-full bg-gold/20 blur-[40px] animate-promo-drift motion-reduce:animate-none"
      />

      <div className="relative flex flex-col items-center gap-3 px-6 py-4 text-center sm:flex-row sm:justify-center sm:gap-5 sm:text-left">
        <span
          className="inline-flex items-center gap-2 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-bright animate-promo-in motion-reduce:animate-none"
          style={{ animationDelay: "0.1s" }}
        >
          <span aria-hidden="true" className="h-px w-6 bg-gold/60" />
          Productos seleccionados
          <span aria-hidden="true" className="h-px w-6 bg-gold/60" />
        </span>

        <p
          className="font-display text-xl sm:text-2xl leading-none text-bone animate-promo-in motion-reduce:animate-none"
          style={{ animationDelay: "0.15s" }}
        >
          Hasta{" "}
          <span
            className="relative inline-block text-gold animate-promo-pop motion-reduce:animate-none"
            style={{ animationDelay: "0.15s" }}
          >
            {maxDescuento}%
          </span>{" "}
          de descuento
        </p>

        <Link
          href="/coleccion/frontpage"
          className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border border-gold/45 bg-gold/10 px-4 py-2 font-body text-[13px] font-semibold text-gold-bright transition-colors hover:bg-gold/20 animate-promo-in motion-reduce:animate-none"
          style={{ animationDelay: "1.1s" }}
        >
          <span className="relative">Ver productos en oferta</span>
          <ArrowRight className="relative h-3.5 w-3.5" />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 w-[35%] -skew-x-[15deg] bg-gradient-to-r from-transparent via-white/25 to-transparent animate-shine motion-reduce:hidden"
          />
        </Link>
      </div>
    </div>
  );
}
