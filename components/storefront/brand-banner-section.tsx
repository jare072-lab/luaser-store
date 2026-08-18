import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";

export function BrandBannerSection() {
  return (
    <section className="relative overflow-hidden bg-ink">
      <div className="relative aspect-[21/9] w-full">
        <Image
          src="/generated/luaser_banner_wide.png"
          alt="Letreros de acrílico espejo dorado rosa y azul cortados a láser por Luaser"
          fill
          sizes="100vw"
          className="object-cover"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/60 to-transparent" />
      </div>
      <div className="absolute inset-0 flex items-center">
        <div className="mx-auto w-full max-w-content px-4 sm:px-6">
          <div className="max-w-md">
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-gold">
              Acabado espejo premium
            </p>
            <h2 className="mt-2 font-display text-2xl sm:text-4xl text-bone text-balance">
              Cada corte, un reflejo perfecto
            </h2>
            <p className="mt-3 font-body text-sm sm:text-base text-graystone-100">
              Acrílico espejo dorado rosa y azul, cortado a la décima de milímetro en
              nuestro taller de Monterrey.
            </p>
            <ButtonLink href="/coleccion/frontpage" size="lg" className="mt-6">
              Ver catálogo
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
