import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Garantía",
  description: "Garantía de calidad de Luaser en piezas de acrílico cortadas y grabadas a láser.",
};

export default function GarantiaPage() {
  return (
    <section className="bg-bone">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 md:py-24">
        <h1 className="font-display text-3xl sm:text-4xl text-ink">Garantía de calidad</h1>
        <p className="mt-4 font-body text-graystone-700">
          Cada pieza sale de nuestro taller revisada a mano antes de empacarse. Si algo no cumple
          con lo que pediste, lo resolvemos.
        </p>

        <div className="mt-10 space-y-8 font-body text-graystone-700">
          <div>
            <h2 className="font-display text-xl text-ink">¿Qué cubre la garantía?</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Defectos de corte o grabado láser no solicitados por ti.</li>
              <li>Piezas dañadas o rotas durante el transporte.</li>
              <li>Errores nuestros en las medidas, color o acabado acordado.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">¿Qué no cubre?</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Cambios de opinión sobre el diseño una vez producida la pieza personalizada.</li>
              <li>Desgaste normal por uso, exposición prolongada al sol o mal manejo.</li>
              <li>Errores en el arte o texto que tú mismo aprobaste antes de producción.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">¿Cómo hago válida mi garantía?</h2>
            <p className="mt-2">
              Escríbenos por WhatsApp dentro de los <strong className="text-ink">7 días</strong>{" "}
              posteriores a recibir tu pedido, con fotos del producto y tu número de orden. Lo
              revisamos y, si aplica, reponemos o reembolsamos la pieza sin costo adicional.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
