import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Contacta a Luaser por WhatsApp para cotizar tu pieza de acrílico personalizada.",
};

const PHONE = "528131092383";
const MESSAGE = "Hola, quiero cotizar una pieza personalizada";

export default function ContactoPage() {
  const whatsappHref = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <section className="bg-bone">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 md:py-24">
        <h1 className="font-display text-3xl sm:text-4xl text-ink">Contacto</h1>
        <p className="mt-4 font-body text-graystone-700 max-w-lg">
          ¿Tienes una idea, un logo o una pieza en mente? Escríbenos y te cotizamos sin
          compromiso.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <ButtonLink href={whatsappHref} size="lg" className="bg-[#25D366] text-white hover:bg-[#128C7E]">
            Escríbenos por WhatsApp
          </ButtonLink>
        </div>

        <div className="mt-12 grid sm:grid-cols-2 gap-8 font-body text-graystone-700">
          <div>
            <h2 className="font-display text-lg text-ink">Ubicación</h2>
            <p className="mt-2">Monterrey, Nuevo León, México</p>
          </div>
          <div>
            <h2 className="font-display text-lg text-ink">Horario de atención</h2>
            <p className="mt-2">Lunes a sábado, 9:00 a.m. – 7:00 p.m.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
