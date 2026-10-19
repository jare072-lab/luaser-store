import type { Metadata } from "next";
import { Landing } from "@/components/storefront/landings/landing";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Corte láser en Monterrey — acrílico, MDF y madera, maquila desde 1 pieza",
  description:
    "Servicio de corte y grabado láser en Monterrey: acrílico, MDF, madera, cuero y más. Maquilamos tu diseño desde una pieza hasta miles, con entrega a domicilio en el área metropolitana y envío a todo México.",
  alternates: { canonical: "/corte-laser-monterrey" },
  openGraph: {
    title: "Corte y grabado láser en Monterrey | Luaser",
    description: "Acrílico, MDF y madera. Maquila desde 1 pieza, entrega a domicilio en Monterrey.",
  },
};

export default function CorteLaserMonterreyPage() {
  return (
    <Landing
      ruta="/corte-laser-monterrey"
      breadcrumbNombre="Corte láser en Monterrey"
      eyebrow="Taller propio en Apodaca, N.L. · láser CO2 de 130 × 90 cm"
      h1="Corte y grabado láser en Monterrey"
      intro="Maquilamos tu diseño en acrílico, MDF, madera, cuero, cartón y otros materiales no metálicos. Desde una pieza de prueba hasta producción de miles, con el mismo acabado. Mándanos tu archivo o una foto con medidas y te cotizamos el mismo día hábil."
      bullets={[
        { titulo: "Acrílico de 2 a 25 mm", texto: "Cristal, colores, espejo y traslúcidos. Canto pulido de fábrica, sin rebaba." },
        { titulo: "MDF y madera hasta 12 mm", texto: "Corte y grabado de alto detalle para letreros, decoración, maquetas y empaques." },
        { titulo: "Entrega a domicilio en Monterrey", texto: "Y envío por paquetería al resto de México; no tienes que venir al taller." },
      ]}
      productos={[
        "letrero-de-acrilico-personalizado-para-negocio",
        "letrero-bienvenidos-de-mdf-diseno-religioso-corte-laser",
        "numeros-de-mesa-de-acrilico-para-boda-set-con-soportes-10-x-15-cm",
      ]}
      tituloProductos="Ejemplos de lo que cortamos"
      secciones={[
        {
          h2: "Qué maquilamos",
          parrafos: ["Lo que más sale del taller cada semana:"],
          lista: [
            "Placas y piezas de acrílico a la medida para makers, negocios y proyectos escolares.",
            "Letreros, señalética y displays de acrílico para locales y oficinas.",
            "Piezas de MDF: letreros, nombres, decoración de eventos, topers, rompecabezas y empaques.",
            "Grabado láser de logos, textos y fotos sobre acrílico, madera y cuero.",
            "Series para revendedores: cortamos tu diseño por cientos con el mismo precio por pieza.",
          ],
        },
        {
          h2: "Materiales y espesores",
          parrafos: [
            "Acrílico cristal de 2 a 25 mm; acrílico de color, espejo y traslúcido en 3 y 6 mm; MDF de 3, 6, 9 y 12 mm; madera de pino y triplay hasta 12 mm; cuero, fieltro, cartón y papel. No cortamos metal: para acero y aluminio trabajamos con Kortametal.",
            "Área de corte de 130 × 90 cm; piezas más grandes se arman por secciones con unión invisible.",
          ],
        },
        {
          h2: "Cómo cotizar",
          parrafos: ["Mientras más claro el archivo, más rápido el precio."],
          lista: [
            "Archivo vectorial (AI, SVG, PDF, DXF o CDR) o una foto con medidas si todavía no lo tienes.",
            "Material, espesor y color, o te recomendamos uno.",
            "Cantidad: el precio por pieza baja a partir de 10, 50 y 100.",
            "Te respondemos con precio y tiempo de entrega; en Monterrey entregamos a domicilio.",
          ],
        },
      ]}
      faqs={[
        {
          q: "¿Cuánto cuesta el corte láser?",
          a: "Depende del material, el tiempo de corte y la cantidad. Como referencia, una placa de acrílico cristal de 3 mm de 20 × 30 cm cuesta desde $79 y un letrero de acrílico con logo desde $580. Mándanos tu archivo y te damos el precio exacto el mismo día hábil.",
        },
        {
          q: "¿Tienen mínimo de piezas?",
          a: "No. Cortamos desde una pieza. Para series grandes damos precio por volumen.",
        },
        {
          q: "¿Puedo llevar mi propio material?",
          a: "Sí, siempre que sea apto para láser CO2 (acrílico, MDF, madera, cuero, cartón). No cortamos PVC ni policarbonato.",
        },
        {
          q: "¿Cortan metal?",
          a: "No. Nuestro láser es CO2 para materiales no metálicos. Para acero al carbón, inoxidable y aluminio trabajamos con Kortametal, también en Monterrey.",
        },
        {
          q: "¿Dónde están y cómo entregan?",
          a: "El taller está en Apodaca, N.L. No atendemos público en el local: entregamos a domicilio en Monterrey, San Pedro, San Nicolás, Guadalupe, Apodaca, Escobedo, Santa Catarina, García y Juárez, y enviamos por paquetería a todo México.",
        },
      ]}
      mensajeWhatsApp="Hola Luaser, quiero cotizar un corte láser. Te mando mi archivo."
      jsonLdExtra={[
        {
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Corte y grabado láser",
          provider: {
            "@type": "LocalBusiness",
            name: "Luaser",
            telephone: "+52 81 3109 2383",
            email: "contacto@luaser.mx",
            url: SITE_URL,
            address: { "@type": "PostalAddress", addressLocality: "Apodaca", addressRegion: "Nuevo León", addressCountry: "MX" },
          },
          areaServed: ["Monterrey", "San Pedro Garza García", "San Nicolás de los Garza", "Guadalupe", "Apodaca", "Escobedo", "Santa Catarina", "García", "Juárez"].map(
            (name) => ({ "@type": "City", name })
          ),
          url: `${SITE_URL}/corte-laser-monterrey`,
        },
      ]}
      relacionadas={[
        { label: "Acrílico cortado a la medida en Monterrey", href: "/acrilico-cortado-a-la-medida/monterrey" },
        { label: "Letreros de acrílico personalizados", href: "/letreros-de-acrilico-personalizados" },
        { label: "Placas conmemorativas", href: "/placas-conmemorativas" },
        { label: "Solicitar cotización", href: "/cotiza" },
      ]}
    />
  );
}
