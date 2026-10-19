import type { Metadata } from "next";
import { Landing } from "@/components/storefront/landings/landing";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Letreros de acrílico personalizados con logo — con luz LED, para negocio y oficina",
  description:
    "Letreros de acrílico cortados y grabados a láser con el logo de tu negocio: espejo dorado, colores, con luz LED o sin ella. Hechos en Monterrey, envío a todo México. Desde $580.",
  alternates: { canonical: "/letreros-de-acrilico-personalizados" },
  openGraph: {
    title: "Letreros de acrílico personalizados con tu logo | Luaser",
    description: "Corte y grabado láser, con luz LED opcional. Hechos en Monterrey, envío a todo México.",
  },
};

export default function LetrerosAcrilicoPage() {
  return (
    <Landing
      ruta="/letreros-de-acrilico-personalizados"
      breadcrumbNombre="Letreros de acrílico"
      eyebrow="Corte y grabado láser · taller propio en Monterrey"
      h1="Letreros de acrílico personalizados con tu logo"
      intro="Letreros de acrílico para negocio, oficina, consultorio y recepción, cortados y grabados a láser con tu logotipo. En espejo dorado, plata, negro o el color que elijas, con luz LED o sin ella. Mándanos tu logo y te cotizamos el mismo día."
      bullets={[
        { titulo: "Tu logo tal cual", texto: "Cortamos el contorno exacto y grabamos los detalles; no es vinil pegado sobre una placa." },
        { titulo: "Con luz LED opcional", texto: "Base iluminada con USB o adaptador para que el letrero se vea de noche y en vitrina." },
        { titulo: "Desde $580 y envío a todo México", texto: "Precio publicado en la tienda; en Monterrey entregamos a domicilio." },
      ]}
      productos={[
        "letrero-de-acrilico-personalizado-para-negocio",
        "senaletica-de-bano-de-acrilico-hombres-y-mujeres",
        "reconocimiento-de-acrilico-personalizado-con-base-grabado-laser",
      ]}
      tituloProductos="Letreros y señalética con precio publicado"
      secciones={[
        {
          h2: "Qué letrero te conviene",
          parrafos: [
            "El tipo de letrero depende de dónde va y de cómo quieres que se vea tu marca. Estos son los que más nos piden:",
          ],
          lista: [
            "Letrero de recepción o mostrador: logo en acrílico espejo dorado o plata con letras en relieve de 3 mm, sobre base transparente o negra.",
            "Letrero luminoso: acrílico cristal grabado a láser sobre base con luz LED; el grabado se ilumina y el logo flota.",
            "Letrero de fachada o puerta: acrílico de 6 mm con chapetones de acero inoxidable, para exterior cubierto.",
            "Señalética interior: baños, oficinas, salas y números de consultorio, en el mismo estilo que tu logo.",
          ],
        },
        {
          h2: "Medidas y materiales",
          parrafos: [
            "Trabajamos acrílico cristal de 3 a 10 mm, colores sólidos, espejo dorado, plata y rosa, y traslúcidos. Cortamos hasta 120 × 240 cm en una sola pieza, así que un letrero de fachada o de pared completa no se arma por partes.",
            "Si no tienes el logo en vector, no importa: con una foto o un PNG nosotros lo trazamos y te mandamos la vista previa antes de cortar.",
          ],
        },
        {
          h2: "Letreros de acrílico en Monterrey y envíos a todo México",
          parrafos: [
            "El taller está en Apodaca, N.L. En Monterrey y su área metropolitana entregamos a domicilio; al resto del país enviamos por paquetería con la pieza protegida con película y esquineros.",
          ],
        },
      ]}
      faqs={[
        {
          q: "¿Cuánto cuesta un letrero de acrílico con logo?",
          a: "El letrero LED de 25 cm para mostrador parte de $580. Un letrero de recepción de 60 a 80 cm suele quedar entre $1,500 y $3,500 según material y relieve; los de fachada se cotizan por medida. Mándanos el logo y las medidas y te damos precio el mismo día.",
        },
        {
          q: "¿Qué archivo necesito?",
          a: "Lo ideal es el logo en vector (AI, SVG, PDF o CDR). Si solo tienes PNG o una foto, nosotros lo trazamos sin costo y te mandamos la vista previa para aprobar.",
        },
        {
          q: "¿Sirve para exterior?",
          a: "Sí, en acrílico de 6 mm o más y con chapetones de acero inoxidable. El acrílico no se oxida ni amarillea; recomendamos exterior cubierto para que dure años como el primer día.",
        },
        {
          q: "¿Cuánto tardan?",
          a: "Vista previa en 24 horas hábiles. El letrero está listo 3 a 5 días hábiles después de aprobar; los luminosos o de gran formato, 5 a 7 días.",
        },
        {
          q: "¿Hacen letreros para varias sucursales?",
          a: "Sí. Para 3 piezas o más del mismo diseño damos precio por volumen y los enviamos a cada sucursal.",
        },
      ]}
      mensajeWhatsApp="Hola Luaser, quiero cotizar un letrero de acrílico con mi logo."
      jsonLdExtra={[
        {
          "@context": "https://schema.org",
          "@type": "Service",
          serviceType: "Letreros de acrílico personalizados",
          provider: { "@type": "LocalBusiness", name: "Luaser", telephone: "+52 81 3109 2383", url: SITE_URL },
          areaServed: { "@type": "Country", name: "México" },
          url: `${SITE_URL}/letreros-de-acrilico-personalizados`,
          offers: { "@type": "Offer", priceCurrency: "MXN", price: 580, description: "Letrero LED de acrílico con logo, desde" },
        },
      ]}
      relacionadas={[
        { label: "Corte láser en Monterrey", href: "/corte-laser-monterrey" },
        { label: "Llaveros de acrílico con logo", href: "/llaveros-de-acrilico-personalizados" },
        { label: "Acrílico cortado a la medida", href: "/acrilico-cortado-a-la-medida" },
      ]}
    />
  );
}
