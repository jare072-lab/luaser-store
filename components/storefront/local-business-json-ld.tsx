import { socialLinks } from "@/lib/social-links";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/**
 * Datos estructurados del negocio, en todas las paginas.
 *
 * Es lo que le dice a Google que Luaser es un taller real en Monterrey y no
 * solo una tienda en linea: sin esto no compite en busquedas locales como
 * "placas de acrilico Monterrey". Solo lleva datos que ya se muestran en el
 * sitio (telefono de WhatsApp, correo, ciudad, redes); la calle y el horario
 * se agregan cuando el cliente los confirme.
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
      addressLocality: "Monterrey",
      addressRegion: "Nuevo León",
      addressCountry: "MX",
    },
    areaServed: [
      { "@type": "City", name: "Monterrey" },
      { "@type": "Country", name: "México" },
    ],
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
