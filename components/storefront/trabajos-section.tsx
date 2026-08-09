import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";

const trabajos = [
  {
    src: "/trabajos/quinta-carmen.jpg",
    cliente: "Quinta Carmen",
    detalle: "Letrero acrílico con contorno LED",
    span: "row-span-2",
  },
  {
    src: "/trabajos/eterno-barbershop.jpg",
    cliente: "Eterno Barber Shop",
    detalle: "Acrílico espejo dorado",
  },
  {
    src: "/trabajos/glow-beauty.jpg",
    cliente: "Glow Beauty",
    detalle: "Acrílico blanco con rosa dorado",
  },
  {
    src: "/trabajos/los-vaqueros.jpg",
    cliente: "Snack Los Vaqueros",
    detalle: "Letrero retroiluminado a color",
    span: "row-span-2",
  },
  {
    src: "/trabajos/snorem-boutique.jpg",
    cliente: "Snorem Boutique",
    detalle: "Corte de contorno, negro y dorado",
  },
  {
    src: "/trabajos/evelyn-bazar.jpg",
    cliente: "Evelyn Bazar",
    detalle: "Acrílico blanco con dorado espejo",
  },
  {
    src: "/trabajos/linda-floristeria.jpg",
    cliente: "Linda Floristería",
    detalle: "Grabado con retroiluminación cálida",
    span: "row-span-2",
  },
  {
    src: "/trabajos/genesis-eventos.jpg",
    cliente: "Génesis Eventos",
    detalle: "Acrílico espejo negro y dorado",
  },
  {
    src: "/trabajos/la-chukiza.jpg",
    cliente: "La Chukiza Boutique",
    detalle: "Corte de contorno multicapa",
  },
] as const;

export function TrabajosSection() {
  return (
    <section id="letreros" className="bg-ink py-16 md:py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-body font-semibold uppercase tracking-widest text-gold">
            Página de inicio
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl text-bone text-balance">
            Letreros que ya cuelgan en negocios reales
          </h2>
          <p className="mt-3 max-w-xl font-body text-sm text-graystone-300">
            Cada pieza aquí salió de nuestro taller en Monterrey y hoy recibe clientes en la
            entrada de un negocio como el tuyo.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 auto-rows-[140px] sm:auto-rows-[170px] md:auto-rows-[190px] gap-3 sm:gap-4">
          {trabajos.map((trabajo) => (
            <figure
              key={trabajo.cliente}
              className={`group relative overflow-hidden rounded-2xl border border-ink-border bg-ink-soft ${trabajo.span ?? ""}`}
            >
              <Image
                src={trabajo.src}
                alt={`Letrero personalizado hecho por Luaser para ${trabajo.cliente}`}
                fill
                sizes="(min-width: 768px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/0 to-ink/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <figcaption className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="font-body text-sm font-semibold text-bone">{trabajo.cliente}</p>
                <p className="mt-0.5 font-body text-xs text-gold">{trabajo.detalle}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="font-body text-sm text-graystone-300">
            ¿Quieres el letrero de tu negocio aquí?
          </p>
          <ButtonLink href="/cotiza" size="lg">
            Solicitar cotización
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
