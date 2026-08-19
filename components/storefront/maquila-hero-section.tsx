import Image from "next/image";
import { ArrowUpRight, ArrowRight } from "lucide-react";

const PHONE = "528131092383";
const QUOTE_MESSAGE = "Hola, quiero cotizar un proyecto de maquila / mayoreo";
const quoteHref = `https://wa.me/${PHONE}?text=${encodeURIComponent(QUOTE_MESSAGE)}`;

// Bento-style B2B teaser above the fold: a big "maquila a la medida" pitch plus
// three quick-link tiles (materials, social proof stat, real client work).
export function MaquilaHeroSection() {
  return (
    <section className="mx-auto max-w-content px-4 sm:px-6 pt-10 pb-2">
      <div className="relative overflow-hidden rounded-[28px] border border-ink-border [background:radial-gradient(circle_at_30%_20%,#1C2F4D,#0B0C0E_60%)]">
        {/* Decorative glow blobs — purely atmospheric, aria-hidden */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-16 -left-10 h-[260px] w-[260px] rounded-full bg-pitch/35 blur-[50px] animate-blob1 motion-reduce:animate-none"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -right-8 h-[280px] w-[280px] rounded-full bg-gold/30 blur-[55px] animate-blob2 motion-reduce:animate-none"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-[22%] h-0.5 w-[55%] bg-gradient-to-r from-transparent via-gold to-transparent blur-[0.5px] animate-beam motion-reduce:hidden"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 bottom-[30%] h-0.5 w-[40%] bg-gradient-to-r from-transparent via-pitch-light to-transparent blur-[0.5px] animate-beam motion-reduce:hidden [animation-delay:2s]"
        />

        {/* Corner badge */}
        <span
          className="absolute right-7 top-6 inline-flex items-center gap-1.5 rounded-full border border-gold/35 bg-ink/55 px-3.5 py-1.5 font-body text-[11px] font-semibold text-bone backdrop-blur-md animate-badge-float motion-reduce:animate-none"
        >
          Taller propio en Apodaca, N.L.
        </span>

        {/* Main pitch */}
        <div className="relative flex flex-col items-center px-8 pb-11 pt-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 font-body text-xs font-semibold text-gold">
            <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-dot motion-reduce:animate-none" aria-hidden="true" />
            MAQUILA A LA MEDIDA
          </div>
          <h1 className="mt-5 max-w-[640px] font-display text-[28px] sm:text-4xl md:text-[46px] leading-[1.12] text-bone">
            Tu aliado láser para <span className="text-gold">maquilar</span> cualquier pieza de tu
            negocio
          </h1>
          <p className="mt-4 max-w-[480px] font-body text-[15px] leading-relaxed text-graystone-300">
            Corte y grabado láser CO2 sobre acrílico, MDF, madera y más — proyectos grandes,
            mayoreo y diseños propios. Mándanos tus medidas y te cotizamos.
          </p>
          <a
            href={quoteHref}
            target="_blank"
            rel="noopener noreferrer"
            className="relative mt-6 inline-flex items-center gap-2 overflow-hidden rounded-full bg-pitch px-7 py-3.5 font-body text-[15px] font-semibold text-bone transition-transform hover:scale-[1.03]"
          >
            <span className="relative">Cotizar mi proyecto</span>
            <ArrowUpRight className="relative h-4 w-4" />
            <span
              className="pointer-events-none absolute inset-0 w-[35%] -skew-x-[15deg] bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shine motion-reduce:hidden"
              aria-hidden="true"
            />
          </a>
        </div>

        {/* Quick-link tiles */}
        <div className="relative grid grid-cols-1 gap-px bg-ink-border sm:grid-cols-3">
          <a
            href="#materiales"
            className="flex flex-col gap-3.5 bg-[#12213B] px-6 py-6 transition-colors hover:bg-[#17294a]"
          >
            <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-pitch-light/20">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#5B9FFF" strokeWidth="2" aria-hidden="true">
                <path d="M6 3l12 18M18 3L6 21" />
              </svg>
            </span>
            <div>
              <p className="font-body text-sm font-semibold text-bone">
                Corte y grabado en cualquier material
              </p>
              <p className="mt-1.5 font-body text-xs text-[#8FA9C9]">MDF, acrílico, madera, metal y más</p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1.5 font-body text-xs font-semibold text-pitch-light">
              Ver materiales <ArrowRight className="h-3 w-3" />
            </span>
          </a>

          <div className="flex flex-col justify-center gap-1.5 bg-ink px-6 py-6">
            <p className="font-display text-[38px] text-bone">+500</p>
            <p className="font-body text-xs text-graystone-500">
              piezas maquiladas para negocios en Nuevo León
            </p>
          </div>

          <a
            href="#letreros"
            className="group relative block min-h-[150px] overflow-hidden sm:min-h-0"
          >
            <Image
              src="/trabajos/quinta-carmen.jpg"
              alt="Trabajo real de Luaser: letrero de Quinta Carmen"
              fill
              sizes="(min-width: 640px) 33vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="font-body text-sm font-semibold text-bone">Ve el trabajo terminado</p>
              <p className="mt-1 font-body text-xs text-graystone-100">Trabajos reales de clientes</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}
