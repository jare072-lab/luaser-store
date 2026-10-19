import type { Metadata } from "next";
import { Landing } from "@/components/storefront/landings/landing";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Llaveros de acrílico personalizados con logo o foto — mayoreo desde 10 piezas",
  description:
    "Llaveros de acrílico impresos a color y cortados a láser a la silueta de tu logo o de tu foto. Para negocios, eventos y mascotas. Hechos en Monterrey, envío a todo México. Paquetes desde $200.",
  alternates: { canonical: "/llaveros-de-acrilico-personalizados" },
  openGraph: {
    title: "Llaveros de acrílico personalizados | Luaser",
    description: "Con tu logo o tu foto, cortados a la silueta. Desde 10 piezas, envío a todo México.",
  },
};

export default function LlaverosAcrilicoPage() {
  return (
    <Landing
      ruta="/llaveros-de-acrilico-personalizados"
      breadcrumbNombre="Llaveros de acrílico"
      eyebrow="Impresión a color + corte láser a la silueta"
      h1="Llaveros de acrílico personalizados con tu logo o tu foto"
      intro="Llaveros de acrílico transparente impresos a color y cortados a láser siguiendo el contorno exacto de tu logo, tu mascota o la foto que quieras. Para regalar a clientes, vender en tu negocio o dar de recuerdo en un evento. Paquetes desde 10 piezas con envío a todo México."
      bullets={[
        { titulo: "A la silueta, no un rectángulo", texto: "El láser recorre el contorno de tu diseño; el llavero tiene la forma de tu marca." },
        { titulo: "Color que no se borra", texto: "Impresión UV sobre acrílico de 3 mm, sellada; no es calcomanía ni se despinta con las llaves." },
        { titulo: "Desde 10 piezas", texto: "Pide pocas para probar o cientos para una campaña; el precio baja por volumen." },
      ]}
      productos={[
        "llaveros-de-acrilico-con-tu-logo-publicidad-para-tu-negocio",
        "llaveros-de-acrilico-personalizados-con-tu-foto-o-logo-corte-a-la-silueta",
      ]}
      tituloProductos="Llaveros con precio publicado"
      secciones={[
        {
          h2: "Llaveros con logo para tu negocio",
          parrafos: [
            "Son el regalo promocional que la gente sí usa: tu logo en las llaves de tus clientes todos los días. Los piden gimnasios, estéticas, talleres, inmobiliarias, restaurantes y escuelas, y los usan como obsequio con la compra, como premio o para venderlos con su marca.",
            "Incluyen argolla metálica y vienen en bolsa individual; podemos agregar al reverso tu teléfono, redes o un código QR a tu WhatsApp.",
          ],
        },
        {
          h2: "Llaveros con foto para eventos y mascotas",
          parrafos: [
            "Para bodas, XV años, bautizos y graduaciones: la foto de los festejados o de cada invitado, cortada a la silueta. También la foto de tu perro o tu gato como recuerdo o como placa de identificación con su nombre y tu teléfono al reverso.",
          ],
        },
        {
          h2: "Medidas, cantidades y tiempos",
          parrafos: ["Lo normal es de 4 a 6 cm por el lado más largo; hacemos hasta 10 cm."],
          lista: [
            "Mínimo 10 piezas por diseño; precio por volumen desde 50 y desde 100 piezas.",
            "Vista previa en 24 horas hábiles; producción de 3 a 5 días hábiles.",
            "Entrega a domicilio en Monterrey y envío por paquetería a todo México.",
          ],
        },
      ]}
      faqs={[
        {
          q: "¿Cuánto cuestan los llaveros de acrílico personalizados?",
          a: "Los paquetes parten de $200 y el precio por pieza baja conforme sube la cantidad. Mándanos tu logo o foto y cuántos necesitas, y te damos el precio exacto el mismo día.",
        },
        {
          q: "¿Cuál es el mínimo de piezas?",
          a: "10 piezas por diseño. Para campañas de 100 o más piezas tenemos precio especial.",
        },
        {
          q: "¿Qué archivo mando?",
          a: "Tu logo en vector o PNG con buena resolución, o la foto del celular. Nosotros preparamos el contorno de corte y te mandamos la vista previa antes de producir.",
        },
        {
          q: "¿Se puede imprimir por los dos lados?",
          a: "Sí. Por un lado el logo o la foto y por el otro tu teléfono, tus redes o un código QR.",
        },
        {
          q: "¿Hacen envíos a toda la República?",
          a: "Sí, por paquetería a todo México. En el área metropolitana de Monterrey entregamos a domicilio.",
        },
      ]}
      mensajeWhatsApp="Hola Luaser, quiero cotizar llaveros de acrílico personalizados."
      jsonLdExtra={[
        {
          "@context": "https://schema.org",
          "@type": "Product",
          name: "Llaveros de acrílico personalizados con logo o foto",
          description:
            "Llaveros de acrílico impresos a color y cortados a láser a la silueta. Paquetes desde 10 piezas con envío a todo México.",
          brand: { "@type": "Brand", name: "Luaser" },
          url: `${SITE_URL}/llaveros-de-acrilico-personalizados`,
          offers: { "@type": "AggregateOffer", priceCurrency: "MXN", lowPrice: 200, availability: "https://schema.org/InStock", areaServed: "MX" },
        },
      ]}
      relacionadas={[
        { label: "Letreros de acrílico con logo", href: "/letreros-de-acrilico-personalizados" },
        { label: "Agitadores personalizados", href: "/producto/agitadores-de-coctel-personalizados-en-acrilico" },
        { label: "Corte láser en Monterrey", href: "/corte-laser-monterrey" },
      ]}
    />
  );
}
