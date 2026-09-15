import type { Metadata } from "next";
import Link from "next/link";
import { getPlacas, maxAhorroPack, type PlacaProducto } from "@/lib/shopify/placas";
import { PlacasSection } from "@/components/storefront/placas-section";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/storefront/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/storefront/breadcrumb-json-ld";

/**
 * Pagina propia de las placas de acrilico: /placas-de-acrilico.
 *
 * Antes las placas solo vivian como seccion del home (/#placas) y como una
 * coleccion generica de Shopify. Google no posiciona un ancla, y la coleccion
 * no tenia texto: para la busqueda "placas de acrilico Monterrey" el sitio no
 * competia. Esta pagina es la URL que se posiciona: titulo y descripcion con
 * la intencion de busqueda, un H1 real, el selector interactivo, texto
 * indexable sobre familias, medidas, tiempos y envio, preguntas frecuentes y
 * datos estructurados (ItemList + Product + FAQPage).
 *
 * Habla el lenguaje de galeria oscura de la seccion de placas (ver
 * public/tmp-carousel/design-system-sitio.md): negro, dos pesos, radio cero,
 * vacio como estructura. Todo numero que aparece sale de Shopify.
 */

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const RUTA = "/placas-de-acrilico";

export const metadata: Metadata = {
  title: "Placas de acrílico cortadas a láser — precios por pieza y pack, envío a todo México",
  description:
    "Placas de acrílico de color, espejo, traslúcido, fluorescente y cristal, cortadas a láser en Monterrey. Compra por pieza o en pack, producción en 1 día hábil y envío por Estafeta a todo México.",
  alternates: { canonical: RUTA },
  openGraph: {
    title: "Placas de acrílico cortadas a láser | Luaser",
    description:
      "Color sólido, espejo, traslúcido, fluorescente y cristal. Precio por placa, packs de 5 y 10, producción en 1 día hábil en Monterrey.",
    url: RUTA,
  },
};

const pesos = (n: number) =>
  Number(n.toFixed(2)).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** Precio de la placa suelta mas barata de una familia. 0 si no hay. */
function desde(p: PlacaProducto): number {
  const sueltas = p.variantes.filter((v) => v.pack === "1 pieza" && v.precio > 0);
  return sueltas.length ? Math.min(...sueltas.map((v) => v.precio)) : 0;
}

const nombreCorto = (p: PlacaProducto) =>
  p.titulo.replace(/^Placas de Acrílico\s*/i, "") || "Cristal";

export default async function PlacasDeAcrilicoPage() {
  const placas = await getPlacas();
  const ahorro = maxAhorroPack(placas);

  const medidas = Array.from(new Set(placas.flatMap((p) => p.medidas)));
  const packs = Array.from(new Set(placas.flatMap((p) => p.packs)));
  const familiasColor = placas.filter((p) => p.ejeColor !== "Espesor");
  const cristal = placas.find((p) => p.ejeColor === "Espesor");
  const colores = Array.from(new Set(familiasColor.flatMap((p) => p.colores)));

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: "Inicio", href: "/" },
    { name: "Placas de acrílico", href: RUTA },
  ];

  const faqs = [
    {
      q: "¿En qué medidas vienen las placas?",
      a: medidas.length
        ? `Las placas se cortan a láser en ${medidas.join(", ")}. Si necesitas otra medida o una forma especial, la maquilamos a la medida: pídela en Cotiza.`
        : "Consulta las medidas disponibles en el selector o pide una medida especial en Cotiza.",
    },
    {
      q: "¿Puedo comprar una sola placa?",
      a: packs.length
        ? `Sí. Cada familia se vende por ${packs.join(", ")}. El precio por placa baja en los packs${ahorro > 0 ? `, hasta ${ahorro}% menos que comprándola suelta` : ""}.`
        : "Sí, cada placa se vende por pieza y también en pack.",
    },
    {
      q: "¿Cuánto tarda y cómo llega?",
      a: "Producción en 1 día hábil y envío por Estafeta a todo México. En el área metropolitana de Monterrey normalmente llega 1 a 2 días hábiles después de producción.",
    },
    {
      q: "¿Qué espesores manejan?",
      a: cristal
        ? `Las placas de color van en 3 mm y 6 mm. El acrílico cristal transparente se vende en ${cristal.colores.length} espesores, de ${cristal.colores[0]} a ${cristal.colores[cristal.colores.length - 1]}.`
        : "Las placas de color van en 3 mm y 6 mm; el cristal transparente en varios espesores.",
    },
    {
      q: "¿Sirven para corte láser, grabado o Cricut?",
      a: "Sí. Son acrílico colado (PMMA) que se corta y graba a láser con canto limpio. Llegan con su película protectora en ambas caras para que trabajes la placa sin rayarla.",
    },
    {
      q: "¿Qué formas de pago aceptan?",
      a: "Tarjeta de crédito o débito, transferencia SPEI y pago en OXXO desde el checkout seguro de la tienda.",
    },
  ];

  const itemListJson = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Placas de acrílico cortadas a láser",
    itemListElement: placas.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.titulo,
        url: `${SITE_URL}/producto/${p.handle}`,
        ...(p.variantes.find((v) => v.imagen)?.imagen
          ? { image: p.variantes.find((v) => v.imagen)!.imagen }
          : {}),
        brand: { "@type": "Brand", name: "Luaser" },
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: "MXN",
          lowPrice: desde(p),
          offerCount: p.variantes.length,
          availability: p.variantes.some((v) => v.disponible)
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        },
      },
    })),
  };

  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const texto = "font-body text-[16px] font-normal leading-[1.25] tracking-[-0.01em]";

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }} />

      <div className="bg-black">
        <header className="mx-auto w-full max-w-[1280px] px-6 pt-12 sm:pt-16">
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="mt-[120px] max-w-[18ch] font-body text-[44px] font-light leading-none tracking-[-0.02em] text-white sm:text-[64px] lg:text-[80px]">
            Placas de acrílico cortadas a láser
          </h1>
          <p className={`mt-8 max-w-[62ch] ${texto} text-[#A0A0A0]`}>
            {placas.length > 0
              ? `${placas.length} familias — color sólido, espejo, traslúcido y fluorescente, cristal transparente — cortadas a láser en nuestro taller de Monterrey. Compra por pieza o en pack, producción en 1 día hábil y envío a todo México.`
              : "Acrílico de color, espejo, traslúcido, fluorescente y cristal, cortado a láser en Monterrey y enviado a todo México."}
          </p>
        </header>
      </div>

      <PlacasSection productos={placas} />

      <div className="bg-black">
        <div className="mx-auto w-full max-w-[1280px] px-6 pb-[120px] sm:pb-[240px]">
          {/* Familias: texto indexable con enlace a cada producto */}
          <section aria-labelledby="familias" className="border-t border-[#484848] pt-[120px]">
            <h2 id="familias" className="font-body text-[32px] font-light leading-none tracking-[-0.02em] text-white">
              Las familias
            </h2>
            <ul className="mt-[120px] grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
              {placas.map((p) => {
                const min = desde(p);
                return (
                  <li key={p.id} className="flex flex-col gap-4">
                    <Link
                      href={`/producto/${p.handle}`}
                      className="font-body text-[24px] font-normal leading-[1.13] tracking-[-0.01em] text-white transition-colors duration-300 hover:text-[#A0A0A0]"
                    >
                      {nombreCorto(p)}
                    </Link>
                    <p className={`${texto} text-[#A0A0A0]`}>
                      {p.ejeColor === "Espesor"
                        ? `${p.colores.length} espesores, de ${p.colores[0]} a ${p.colores[p.colores.length - 1]}.`
                        : `${p.colores.length} ${p.colores.length === 1 ? "color" : "colores"}: ${p.colores.join(", ")}.`}
                    </p>
                    {min > 0 && (
                      <p className={`${texto} text-white`}>Desde ${pesos(min)} por placa</p>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Lo que importa al comprar: medidas, tiempos, taller */}
          <section aria-labelledby="como" className="mt-[120px] border-t border-[#484848] pt-[120px]">
            <h2 id="como" className="font-body text-[32px] font-light leading-none tracking-[-0.02em] text-white">
              Cortadas en Monterrey, enviadas a todo México
            </h2>
            <div className="mt-[120px] grid gap-16 sm:grid-cols-3">
              <div className="flex flex-col gap-4">
                <p className="font-body text-[24px] font-normal leading-[1.13] tracking-[-0.01em] text-white">
                  Medidas
                </p>
                <p className={`${texto} text-[#A0A0A0]`}>
                  {medidas.length ? `${medidas.join(", ")}.` : "Tres medidas estándar."} Corte láser con
                  canto limpio y película protectora en ambas caras.
                  {" "}
                  <Link href="/cotiza" className="text-white transition-colors duration-300 hover:text-[#A0A0A0]">
                    ¿Otra medida o forma? Cotízala.
                  </Link>
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="font-body text-[24px] font-normal leading-[1.13] tracking-[-0.01em] text-white">
                  Tiempos
                </p>
                <p className={`${texto} text-[#A0A0A0]`}>
                  Producción en 1 día hábil. Envío por Estafeta a todo México; en el área
                  metropolitana de Monterrey, 1 a 2 días hábiles después de producción.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <p className="font-body text-[24px] font-normal leading-[1.13] tracking-[-0.01em] text-white">
                  Colores
                </p>
                <p className={`${texto} text-[#A0A0A0]`}>
                  {colores.length
                    ? `${colores.length} colores de acrílico en existencia, más cristal transparente.`
                    : "Acrílico de color y cristal transparente en existencia."}{" "}
                  Para letreros, señalética, exhibidores, reconocimientos, invitaciones y
                  piezas de corte láser o Cricut.
                </p>
              </div>
            </div>
          </section>

          {/* Preguntas frecuentes */}
          <section aria-labelledby="faq" className="mt-[120px] border-t border-[#484848] pt-[120px]">
            <h2 id="faq" className="font-body text-[32px] font-light leading-none tracking-[-0.02em] text-white">
              Preguntas frecuentes
            </h2>
            <div className="mt-[120px] divide-y divide-[#484848] border-b border-[#484848]">
              {faqs.map((f) => (
                <details key={f.q} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-body text-[24px] font-normal leading-[1.13] tracking-[-0.01em] text-white">
                    {f.q}
                    <span
                      aria-hidden="true"
                      className="shrink-0 font-body text-[24px] font-normal text-[#A0A0A0] transition-transform duration-300 group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <p className={`mt-4 max-w-[62ch] ${texto} text-[#A0A0A0]`}>{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-[120px] border-t border-[#484848] pt-[120px]">
            <p className="max-w-[62ch] font-body text-[24px] font-normal leading-[1.13] tracking-[-0.01em] text-white">
              ¿Necesitas la placa ya cortada con tu logo, tu texto o una forma especial?
            </p>
            <Link
              href="/cotiza"
              className="group mt-8 inline-flex items-center gap-3 font-body text-[24px] font-normal leading-[1.13] tracking-[-0.01em] text-white"
            >
              <span
                aria-hidden="true"
                className="block h-1.5 w-1.5 shrink-0 bg-[#E4002B] transition-transform duration-300 group-hover:translate-x-1"
              />
              Pide tu cotización
            </Link>
          </section>
        </div>
      </div>
    </>
  );
}
