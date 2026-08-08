import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Envíos y tiempos",
  description: "Tiempos de entrega, costos de envío y cobertura de Luaser en todo México.",
};

export default function EnviosYTiemposPage() {
  return (
    <section className="bg-bone">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 md:py-24">
        <h1 className="font-display text-3xl sm:text-4xl text-ink">Envíos y tiempos</h1>
        <p className="mt-4 font-body text-graystone-700">
          Maquilamos cada pieza a la medida en Monterrey y la enviamos a cualquier punto de México.
        </p>

        <div className="mt-10 space-y-8 font-body text-graystone-700">
          <div>
            <h2 className="font-display text-xl text-ink">Tiempo de producción</h2>
            <p className="mt-2">
              Cada pieza se corta y graba a láser bajo pedido. El tiempo de producción es de{" "}
              <strong className="text-ink">2 a 4 días hábiles</strong>, dependiendo de la
              complejidad del diseño y el volumen de pedidos en cola. Para pedidos personalizados
              (con tu logo o diseño propio), el tiempo puede extenderse mientras confirmamos
              contigo el arte final antes de producir.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Tiempo de entrega</h2>
            <ul className="mt-2 list-disc pl-5 space-y-1">
              <li>Área Metropolitana de Monterrey: 1–2 días hábiles después de producción.</li>
              <li>Resto de México: 2–5 días hábiles después de producción, según destino.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Costo de envío</h2>
            <p className="mt-2">
              El costo se calcula automáticamente en el checkout según tu código postal y el peso
              del paquete. Verás el monto exacto antes de pagar, sin sorpresas.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">Rastreo de tu pedido</h2>
            <p className="mt-2">
              En cuanto tu pedido sale de nuestro taller, te enviamos un correo con el número de
              guía para que puedas darle seguimiento en tiempo real.
            </p>
          </div>

          <div>
            <h2 className="font-display text-xl text-ink">¿Dudas sobre tu envío?</h2>
            <p className="mt-2">
              Escríbenos por WhatsApp y con gusto te ayudamos a dar seguimiento a tu pedido.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
