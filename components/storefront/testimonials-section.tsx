import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Fernanda L.",
    location: "Monterrey",
    tag: "Lua Eventos",
    initials: "FL",
    quote:
      "Contratamos la barra de frappés y crepas para el XV de mi hija y fue lo más comentado de la fiesta. Puntuales, todo muy limpio y el sabor buenísimo. Sin duda los vuelvo a contratar.",
  },
  {
    name: "Andrea R.",
    location: "San Pedro Garza García",
    tag: "Luaser",
    initials: "AR",
    quote:
      "Pedí una caja de acrílico personalizada para mi álbum de estampas y quedó mejor de lo que imaginé. El corte y el grabado son perfectos, se nota la calidad del acrílico y llegó bien empacada.",
  },
  {
    name: "Roberto M.",
    location: "Monterrey",
    tag: "Luaser · Negocio",
    initials: "RM",
    quote:
      "Les pedí el letrero con el logo de mi negocio y quedó exactamente como lo diseñamos. Buen tiempo de entrega y respondieron todas mis dudas por WhatsApp antes de producir. Muy recomendados.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-ink py-16 md:py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="text-center max-w-lg mx-auto">
          <h2 className="font-display text-2xl sm:text-3xl text-bone">
            Lo que dicen nuestros clientes
          </h2>
          <p className="mt-2 font-body text-graystone-300">
            Opiniones reales de eventos y piezas personalizadas en Monterrey y su área
            metropolitana.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-ink-border bg-ink-soft p-6 flex flex-col"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                ))}
              </div>
              <p className="mt-4 font-body text-sm text-graystone-100 flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 font-display text-sm text-gold">
                  {t.initials}
                </span>
                <div>
                  <p className="font-body text-sm font-semibold text-bone">{t.name}</p>
                  <p className="font-body text-xs text-graystone-500">
                    {t.location} · {t.tag}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
