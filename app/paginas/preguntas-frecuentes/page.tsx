import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Respuestas a las dudas más comunes sobre los productos de acrílico de Luaser.",
};

const faqs = [
  {
    q: "¿Maquilan piezas personalizadas que no están en la tienda?",
    a: "Sí. Maquilamos cualquier pieza de acrílico a la medida — letreros, exhibidores, protectores, figuras y más. Mándanos tu idea o logo por WhatsApp y te cotizamos.",
  },
  {
    q: "¿Puedo mandar mi propio logo o diseño?",
    a: "Sí. Puedes mandarnos tu logo en cualquier formato de imagen; nosotros lo vectorizamos y preparamos para corte y grabado láser sin costo extra en la mayoría de los casos.",
  },
  {
    q: "¿A todo México envían?",
    a: "Sí, enviamos a todo el país. Consulta tiempos y costos en la sección de Envíos y tiempos.",
  },
  {
    q: "¿Qué formas de pago aceptan?",
    a: "Aceptamos tarjeta de crédito/débito, transferencia SPEI y pago en OXXO a través de nuestro checkout seguro.",
  },
  {
    q: "¿El acrílico se despinta o decolora con el sol?",
    a: "Usamos acrílico premium de alta durabilidad. Para exteriores con exposición solar directa y prolongada, te recomendamos consultarnos el grosor y acabado más adecuado.",
  },
  {
    q: "¿Puedo pedir una pieza urgente?",
    a: "Escríbenos por WhatsApp antes de comprar y con gusto revisamos si podemos acomodar tu fecha en nuestra cola de producción.",
  },
];

export default function PreguntasFrecuentesPage() {
  return (
    <section className="bg-bone">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-16 md:py-24">
        <h1 className="font-display text-3xl sm:text-4xl text-ink">Preguntas frecuentes</h1>
        <p className="mt-4 font-body text-graystone-700">
          Si no encuentras la respuesta que buscas, escríbenos por WhatsApp.
        </p>

        <div className="mt-10 divide-y divide-graystone-100">
          {faqs.map((item) => (
            <details key={item.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg text-ink">
                {item.q}
                <span className="ml-4 shrink-0 font-body text-graystone-500 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 font-body text-graystone-700">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
