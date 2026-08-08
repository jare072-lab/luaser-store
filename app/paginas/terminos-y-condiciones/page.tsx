import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Términos y condiciones de compra en Luaser.",
};

export default function TerminosPage() {
  return (
    <section className="bg-bone">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 md:py-24">
        <h1 className="font-display text-3xl sm:text-4xl text-ink">Términos y condiciones</h1>
        <p className="mt-4 font-body text-graystone-700">
          Al comprar en Luaser aceptas los siguientes términos.
        </p>

        <div className="mt-10 space-y-8 font-body text-graystone-700">
          <div>
            <h2 className="font-display text-xl text-ink">Productos personalizados</h2>
            <p className="mt-2">
              Las piezas con diseño, logo o texto personalizado se producen bajo pedido una vez
              que apruebas el diseño final. Por tratarse de artículos hechos a la medida, no
              aplican cambios ni devoluciones una vez iniciada la producción, salvo defecto de
              fabricación cubierto por nuestra garantía.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Precios y pagos</h2>
            <p className="mt-2">
              Los precios están expresados en pesos mexicanos (MXN) e incluyen IVA. Nos reservamos
              el derecho de actualizar precios sin previo aviso; el precio válido es el mostrado
              al momento de tu compra.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Uso de marcas de terceros</h2>
            <p className="mt-2">
              Luaser no está afiliado ni respaldado por FIFA ni por ninguna organización oficial
              del Mundial. Cualquier referencia a torneos o selecciones es de carácter genérico e
              inspiracional.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Contacto</h2>
            <p className="mt-2">
              Para cualquier duda sobre estos términos, escríbenos por WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
