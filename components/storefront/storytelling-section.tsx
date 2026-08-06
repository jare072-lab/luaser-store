import { Scissors, Ruler, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Ruler,
    title: "Medimos a la exactitud del milímetro",
    body: "Cada caja se diseña a la medida precisa de tu álbum o pieza, sin holguras ni bordes ásperos.",
  },
  {
    icon: Scissors,
    title: "Corte láser, no troquelado",
    body: "El láser corta con precisión de décimas de milímetro — bordes limpios que un molde genérico no logra.",
  },
  {
    icon: Sparkles,
    title: "Acabado y grabado a mano",
    body: "Pulido, ensamblado y grabado de tu placa personalizada por nuestro taller en México, pieza por pieza.",
  },
];

export function StorytellingSection() {
  return (
    <section id="historia" className="bg-bone text-ink-900 py-16 md:py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <p className="text-xs font-body font-semibold uppercase tracking-widest text-pitch">
          Nuestro proceso
        </p>
        <h2 className="mt-2 font-display text-3xl sm:text-4xl max-w-xl">
          De la lámina de acrílico a una pieza que perdura
        </h2>
        <div className="mt-12 grid md:grid-cols-3 gap-10">
          {steps.map(({ icon: Icon, title, body }) => (
            <div key={title}>
              <Icon className="h-6 w-6 text-pitch" />
              <h3 className="mt-4 font-body font-semibold text-lg">{title}</h3>
              <p className="mt-2 text-sm text-graystone-700">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
