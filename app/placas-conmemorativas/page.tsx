import type { Metadata } from "next";
import { Landing } from "@/components/storefront/landings/landing";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Placas conmemorativas personalizadas con foto grabada — desde $449, envío gratis",
  description:
    "Placa conmemorativa de acrílico grabada a láser con el retrato, nombre y fechas de tu ser querido. Retrato incluido gratis, vista previa antes de grabar y envío gratis a todo México. Desde $449.",
  alternates: { canonical: "/placas-conmemorativas" },
  openGraph: {
    title: "Placas conmemorativas personalizadas con foto grabada | Luaser",
    description: "Retrato grabado gratis, 4 medidas, 5 acabados y envío gratis a todo México. Desde $449.",
  },
};

export default function PlacasConmemorativasPage() {
  return (
    <Landing
      ruta="/placas-conmemorativas"
      breadcrumbNombre="Placas conmemorativas"
      eyebrow="Retrato grabado gratis · envío gratis a todo México"
      h1="Placas conmemorativas personalizadas con foto grabada a láser"
      intro="Su rostro, su nombre y sus fechas grabados en acrílico para siempre. Nos mandas una foto del celular, te enviamos la vista previa sin costo y grabamos solo cuando tú la apruebas. Desde $449 con envío incluido a cualquier estado de México."
      bullets={[
        { titulo: "Retrato incluido, sin costo extra", texto: "Dibujamos el retrato a partir de la foto que nos mandes y lo grabamos en la placa." },
        { titulo: "4 medidas, 5 acabados", texto: "30×20, 40×30, 50×30 y 60×40 cm en espejo dorado, plata, negro, blanco o rosa." },
        { titulo: "Vista previa antes de grabar", texto: "Ves el diseño terminado y cambias lo que quieras antes de que toquemos el acrílico." },
      ]}
      productos={["placa-conmemorativa-grabada-difuntos", "placa-conmemorativa-de-acrilico-con-foto-grabada-memorial"]}
      tituloProductos="Placas conmemorativas con precio publicado"
      secciones={[
        {
          h2: "Precios de placas conmemorativas",
          parrafos: [
            "Todos los precios incluyen el retrato grabado, el diseño con vista previa y el envío a todo México. No hay cargos escondidos: el precio que ves es el que pagas.",
          ],
          lista: [
            "30 × 20 cm — $449",
            "40 × 30 cm — $849",
            "50 × 30 cm — $1,049",
            "60 × 40 cm — $1,349",
          ],
        },
        {
          h2: "Para nicho, tumba, altar o casa",
          parrafos: [
            "Es acrílico de 3 mm cortado y grabado a láser: no es una foto impresa que se despinta con el sol ni vinil que se despega. El grabado queda dentro del material, así que aguanta lluvia, sol y limpieza con un trapo húmedo.",
            "Se usa en lápidas y nichos del panteón, en el altar de Día de Muertos, en la sala o en la capilla de la casa. Trae doble cinta adhesiva de alta resistencia; si va a exterior sobre granito o mármol, te mandamos instrucciones para fijarla con silicón.",
          ],
        },
        {
          h2: "Cómo se pide",
          parrafos: ["Todo el proceso es por mensaje y tarda menos de lo que piensas."],
          lista: [
            "Nos escribes por WhatsApp o Messenger con la foto, el nombre, las fechas y la frase que quieres.",
            "Te mandamos la vista previa en 24 horas hábiles; cambias lo que quieras, sin costo.",
            "Apruebas, pagas y grabamos. En Monterrey la entregamos a domicilio; al resto de México va por paquetería.",
          ],
        },
      ]}
      faqs={[
        {
          q: "¿Cuánto cuesta una placa conmemorativa con foto?",
          a: "Desde $449 la de 30 × 20 cm, $849 la de 40 × 30, $1,049 la de 50 × 30 y $1,349 la de 60 × 40 cm. El retrato grabado y el envío a todo México ya van incluidos.",
        },
        {
          q: "¿Qué foto necesito mandar?",
          a: "Cualquier foto del celular donde se vea bien la cara. Nosotros la convertimos en un retrato en línea para grabado y te mandamos la vista previa antes de hacer nada.",
        },
        {
          q: "¿Sirve para exterior, en el panteón?",
          a: "Sí. El acrílico no se oxida ni se despinta y el grabado láser es permanente. Para fijarla en granito o mármol recomendamos silicón de exterior además de la cinta que incluye.",
        },
        {
          q: "¿Cuánto tarda y cómo llega?",
          a: "Vista previa en 24 horas hábiles y la placa lista 2 a 3 días hábiles después de aprobar. En el área metropolitana de Monterrey la entregamos a domicilio; al resto del país llega en 2 a 5 días hábiles por paquetería, sin costo.",
        },
        {
          q: "¿Puedo poner dos personas o una frase propia?",
          a: "Sí. Caben hasta dos retratos y dos nombres con sus fechas en las medidas de 40 × 30 en adelante, y la frase la eliges tú o te proponemos varias.",
        },
      ]}
      mensajeWhatsApp="Hola Luaser, quiero cotizar una placa conmemorativa con foto grabada."
      jsonLdExtra={[
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Placa conmemorativa de acrílico con retrato grabado a láser",
          description:
            "Placa conmemorativa personalizada con retrato, nombre, fechas y frase grabados a láser en acrílico de 3 mm. Retrato incluido y envío gratis a todo México.",
          brand: { "@type": "Brand", name: "Luaser" },
          url: `${SITE_URL}/placas-conmemorativas`,
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "MXN",
            lowPrice: 449,
            highPrice: 1349,
            offerCount: 4,
            availability: "https://schema.org/InStock",
            areaServed: "MX",
          },
        },
      ]}
      relacionadas={[
        { label: "Letreros de acrílico personalizados", href: "/letreros-de-acrilico-personalizados" },
        { label: "Reconocimientos de acrílico", href: "/producto/reconocimiento-de-acrilico-personalizado-con-base-grabado-laser" },
        { label: "Corte láser en Monterrey", href: "/corte-laser-monterrey" },
      ]}
    />
  );
}
