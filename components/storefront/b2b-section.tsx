import { ButtonLink } from "@/components/ui/button";

const PHONE = "528131092383";
const MESSAGE = "Hola, tengo un proyecto especial / pedido de mayoreo que quiero cotizar";

export function B2BSection() {
  const whatsappHref = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`;

  return (
    <section className="bg-bone py-16 md:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6 text-center max-w-2xl">
        <h2 className="font-display text-2xl sm:text-3xl text-ink">
          ¿Necesitas un proyecto especial, corte láser a medida o compras de mayoreo?
        </h2>
        <p className="mt-3 font-body text-graystone-700">
          Fabricamos sobre diseño en acrílico, MDF y triplay con máquina CO2 — ideal para
          negocios, eventos o proyectos grandes. Mándanos tus medidas, cantidades o tu idea y te
          armamos una cotización a la medida.
        </p>
        <div className="mt-7">
          <ButtonLink
            href={whatsappHref}
            size="lg"
            className="bg-[#25D366] text-white hover:bg-[#128C7E]"
          >
            Cotizar por WhatsApp
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
