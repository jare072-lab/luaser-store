import { socialLinks } from "@/lib/social-links";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Datos estructurados del negocio, en todas las paginas.
 *
 * Es lo que le dice a Google que Luaser es un taller real en el area de
 * Monterrey y no solo una tienda en linea: sin esto no compite en busquedas
 * locales como "placas de acrilico Monterrey".
 *
 * Luaser es un negocio de AREA DE SERVICIO: vende solo por envio y no recibe
 * clientes en el taller. Por eso la direccion lleva ciudad y estado pero no
 * calle, igual que la ficha de Google Business Profile con direccion oculta.
 * Google compara la ficha con el sitio, y una calle aqui que no aparece alla
 * (o al reves) resta confianza. La calle no se agrega aunque el cliente la
 * comparta, salvo que decida mostrar el taller al publico.
 *
 * Horario confirmado por el cliente: lunes a sabado de 10 a 18 (atencion por
 * WhatsApp y produccion, no mostrador).
 */
export function LocalBusinessJsonLd() {
  const json = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${SITE_URL}/#negocio`,
    name: "Luaser",
    url: SITE_URL,
    image: `${SITE_URL}/logo-luaser.jpg`,
    telephone: "+52 81 3109 2383",
    email: "contacto@luaser.mx",
    description:
      "Taller de corte y grabado láser en acrílico: placas de acrílico de color, espejo y cristal, letreros personalizados y piezas a la medida. Envíos a todo México.",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Apodaca",
      addressRegion: "Nuevo León",
      addressCountry: "MX",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "10:00",
        closes: "18:00",
      },
    ],
    areaServed: [
      { "@type": "City", name: "Monterrey" },
      { "@type": "State", name: "Nuevo León" },
      { "@type": "Country", name: "México" },
    ],
    // Solo envios: no hay atencion en el taller.
    potentialAction: {
      "@type": "OrderAction",
      target: `${SITE_URL}/placas-de-acrilico`,
      deliveryMethod: "http://purl.org/goodrelations/v1#DeliveryModeMail",
    },
    priceRange: "$$",
    sameAs: socialLinks.map((s) => s.href),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  );
}
