import { ButtonLink } from "@/components/ui/button";

export function MundialSection() {
  return (
    <section
      id="mundial-2026"
      className="relative bg-gradient-to-br from-pitch via-ink to-ink py-20 md:py-28"
    >
      <div className="mx-auto max-w-content px-4 sm:px-6 text-center">
        <p className="text-xs font-body font-semibold uppercase tracking-widest text-gold">
          Edición limitada
        </p>
        <h2 className="mt-3 font-display text-3xl sm:text-5xl text-bone max-w-2xl mx-auto">
          Colección Mundial 2026
        </h2>
        <p className="mt-4 max-w-lg mx-auto font-body text-graystone-100">
          Piezas pensadas para el aficionado que completa su álbum, exhibe su colección y no se
          conforma con guardarla en un cajón.
        </p>
        <div className="mt-8">
          <ButtonLink href="/coleccion/frontpage" size="lg">
            Ver la colección
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
