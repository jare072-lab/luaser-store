import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: "Aviso de privacidad de Luaser sobre el uso de tus datos personales.",
};

export default function PrivacidadPage() {
  return (
    <section className="bg-bone">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 md:py-24">
        <h1 className="font-display text-3xl sm:text-4xl text-ink">Aviso de privacidad</h1>
        <p className="mt-4 font-body text-graystone-700">
          En Luaser protegemos tus datos personales conforme a la Ley Federal de Protección de
          Datos Personales en Posesión de los Particulares.
        </p>

        <div className="mt-10 space-y-8 font-body text-graystone-700">
          <div>
            <h2 className="font-display text-xl text-ink">Datos que recopilamos</h2>
            <p className="mt-2">
              Nombre, correo electrónico, teléfono, dirección de envío y datos de pago necesarios
              para procesar tu pedido a través de nuestra plataforma de checkout.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Uso de tus datos</h2>
            <p className="mt-2">
              Usamos tus datos únicamente para procesar y enviar tu pedido, darte seguimiento a tu
              compra y, si lo autorizas, enviarte novedades por correo o WhatsApp.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Con quién compartimos tus datos</h2>
            <p className="mt-2">
              Compartimos únicamente lo necesario con nuestro proveedor de pagos y paqueterías
              para completar tu compra y entrega. No vendemos tus datos a terceros.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Tus derechos (ARCO)</h2>
            <p className="mt-2">
              Puedes solicitar acceso, rectificación, cancelación u oposición al uso de tus datos
              escribiéndonos por WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
