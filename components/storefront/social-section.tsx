import Image from "next/image";
import { socialLinks } from "@/lib/social-links";

const photos = [
  { src: "/trabajos/quinta-carmen.jpg", alt: "Letrero acrílico con contorno LED para Quinta Carmen" },
  { src: "/trabajos/glow-beauty.jpg", alt: "Letrero acrílico blanco con rosa dorado para Glow Beauty" },
  { src: "/trabajos/los-vaqueros.jpg", alt: "Letrero retroiluminado a color para Snack Los Vaqueros" },
  { src: "/trabajos/linda-floristeria.jpg", alt: "Letrero grabado con retroiluminación cálida para Linda Floristería" },
  { src: "/trabajos/genesis-eventos.jpg", alt: "Letrero acrílico espejo negro y dorado para Génesis Eventos" },
  { src: "/trabajos/eterno-barbershop.jpg", alt: "Letrero acrílico espejo dorado para Eterno Barber Shop" },
];

export function SocialSection() {
  return (
    <section className="bg-ink-soft py-16 md:py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <p className="text-xs font-body font-semibold uppercase tracking-widest text-gold">
            Síguenos
          </p>
          <h2 className="mt-2 font-display text-3xl sm:text-4xl text-bone text-balance">
            El taller no se detiene — y tampoco nuestro feed
          </h2>
          <p className="mt-3 max-w-xl font-body text-sm text-graystone-300">
            Diseños nuevos, cortes en proceso y promociones exclusivas primero para quienes nos
            siguen. Únete a la comunidad Luaser.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {photos.map((photo) => (
            <div
              key={photo.src}
              className="relative aspect-square overflow-hidden rounded-xl border border-ink-border bg-ink"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 16vw, 33vw"
                className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 font-body text-sm font-semibold text-ink transition-colors hover:bg-gold-bright"
            >
              {social.icon}
              Síguenos en {social.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
