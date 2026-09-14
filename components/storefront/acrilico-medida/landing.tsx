import Link from "next/link";
import { getPlacas, type PlacaProducto } from "@/lib/shopify/placas";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/storefront/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/storefront/breadcrumb-json-ld";
import { CalculadoraMedida, type MaterialMedida } from "./calculadora";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const MEDIDAS = ["20 x 30 cm", "30 x 30 cm", "40 x 40 cm"];

/** Monterrey y los municipios donde entregamos sin paquetería. */
export const MUNICIPIOS_MTY = [
  "Monterrey",
  "San Pedro Garza García",
  "San Nicolás de los Garza",
  "Guadalupe",
  "Apodaca",
  "Escobedo",
  "Santa Catarina",
  "García",
  "Juárez",
];

interface Fila {
  nombre: string;
  handle: string;
  /** Precio de la pieza suelta por medida. */
  sueltas: (number | null)[];
  /** Precio por placa de 40 × 40 comprando el pack de 10. */
  packPorPlaca: number | null;
}

function precio(p: PlacaProducto, color: string, medida: string, pack: string) {
  return p.variantes.find((v) => v.color === color && v.medida === medida && v.pack === pack)
    ?.precio ?? null;
}

/**
 * Filas de la tabla: el cristal por espesor (3 y 6 mm, los que más se piden) y
 * cada familia de color por su primer color, que tiene el mismo precio que el
 * resto. Todo sale de Shopify para que la página nunca contradiga al carrito.
 */
function construirFilas(placas: PlacaProducto[]): Fila[] {
  const filas: Fila[] = [];
  for (const p of placas) {
    const ejes = p.ejeColor === "Espesor" ? p.colores.filter((c) => c === "3 mm" || c === "6 mm") : [p.colores[0]];
    for (const eje of ejes) {
      if (!eje) continue;
      const nombre =
        p.ejeColor === "Espesor"
          ? `Cristal transparente ${eje}`
          : p.titulo.replace(/^Placas de Acrílico\s*(de\s*)?/i, "").replace(/^\w/, (c) => c.toUpperCase());
      const diez = precio(p, eje, "40 x 40 cm", "10 piezas");
      filas.push({
        nombre,
        handle: p.handle,
        sueltas: MEDIDAS.map((m) => precio(p, eje, m, "1 pieza")),
        packPorPlaca: diez ? Math.round((diez / 10) * 10) / 10 : null,
      });
    }
  }
  return filas;
}

function construirMateriales(placas: PlacaProducto[]): MaterialMedida[] {
  const materiales: MaterialMedida[] = [];
  for (const p of placas) {
    const ejes = p.ejeColor === "Espesor" ? p.colores : [p.colores[0]];
    for (const eje of ejes) {
      if (!eje) continue;
      const grande = precio(p, eje, "40 x 40 cm", "1 pieza");
      const chica = precio(p, eje, "20 x 30 cm", "1 pieza");
      if (!grande || !chica) continue;
      const nombre =
        p.ejeColor === "Espesor"
          ? `Cristal transparente ${eje}`
          : p.titulo.replace(/^Placas de Acrílico\s*(de\s*)?/i, "").replace(/^\w/, (c) => c.toUpperCase());
      materiales.push({ nombre, precioCm2: grande / 1600, minimo: chica });
    }
  }
  return materiales;
}

const pesos = (n: number | null) => (n == null ? "—" : `$${n.toLocaleString("es-MX")}`);

interface Props {
  enMonterrey: boolean;
}

export async function AcrilicoMedidaLanding({ enMonterrey }: Props) {
  const placas = await getPlacas();
  const filas = construirFilas(placas);
  const materiales = construirMateriales(placas);
  const desde = Math.min(
    ...placas.flatMap((p) => p.variantes.filter((v) => v.pack === "1 pieza").map((v) => v.precio))
  );

  const ruta = enMonterrey ? "/acrilico-cortado-a-la-medida/monterrey" : "/acrilico-cortado-a-la-medida";
  const breadcrumbItems: BreadcrumbItem[] = [
    { name: "Inicio", href: "/" },
    { name: "Acrílico a la medida", href: "/acrilico-cortado-a-la-medida" },
    ...(enMonterrey ? [{ name: "Monterrey", href: ruta }] : []),
  ];

  const faqs = [
    {
      q: "¿Cuánto cuesta el acrílico cortado a la medida?",
      a: `Las placas de 20×30, 30×30 y 40×40 cm tienen precio fijo desde ${pesos(desde)} por pieza, y bajan en packs de 5 y 10. Para otra medida, la calculadora te da un estimado y te confirmamos el precio final por WhatsApp.`,
    },
    {
      q: enMonterrey ? "¿Entregan en mi municipio?" : "¿Hacen envíos a todo México?",
      a: enMonterrey
        ? `Sí. Entregamos a domicilio en ${MUNICIPIOS_MTY.join(", ")}. La entrega es gratis en pedidos desde $499; no tienes que pasar a recoger.`
        : "Sí, enviamos por Estafeta a todo México. El envío es gratis en pedidos desde $1,049, y en el área metropolitana de Monterrey desde $499.",
    },
    {
      q: "¿Cuánto tarda mi pedido?",
      a: enMonterrey
        ? "Cortamos tu pedido en 2 a 3 días hábiles y lo entregamos en Monterrey 1 a 2 días hábiles después."
        : "Cortamos tu pedido en 2 a 3 días hábiles; la paquetería tarda de 2 a 5 días hábiles según el destino.",
    },
    {
      q: "¿Tengo que comprar la lámina completa?",
      a: "No. Una lámina de 1.20 × 2.40 m cuesta más de $900 y casi nadie la usa completa. Aquí pagas solo las piezas que necesitas, cortadas a láser con canto limpio.",
    },
    {
      q: "¿Qué tipos de acrílico manejan?",
      a: "Cristal transparente de 2 a 25 mm, colores sólidos en 3 mm, blanco y negro en 6 mm, espejo plata, oro, rosa y rosa gold, y traslúcidos y fluorescentes.",
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Store",
      name: "Luaser",
      url: `${SITE_URL}${ruta}`,
      telephone: "+52 81 3109 2383",
      email: "contacto@luaser.mx",
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Apodaca",
        addressRegion: "Nuevo León",
        addressCountry: "MX",
      },
      areaServed: enMonterrey
        ? MUNICIPIOS_MTY.map((m) => ({ "@type": "City", name: m }))
        : { "@type": "Country", name: "México" },
    },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-content px-4 sm:px-6 py-12 md:py-16">
        <Breadcrumbs items={breadcrumbItems} />

        <p className="mt-6 text-xs font-body font-semibold uppercase tracking-widest text-gold">
          Precios publicados · compra en línea
        </p>
        <h1 className="mt-2 max-w-3xl font-display text-3xl sm:text-5xl leading-tight text-bone">
          {enMonterrey
            ? "Acrílico cortado a la medida en Monterrey"
            : "Acrílico cortado a la medida con envío a todo México"}
        </h1>
        <p className="mt-4 max-w-2xl font-body text-lg text-graystone-100">
          {enMonterrey
            ? `Placas de acrílico cristal, color y espejo desde ${pesos(desde)}, cortadas a láser y entregadas a domicilio en toda el área metropolitana. Sin cotizaciones eternas: ves el precio y compras.`
            : `Placas de acrílico cristal, color y espejo desde ${pesos(desde)}, cortadas a láser en Monterrey y enviadas a cualquier estado. Ves el precio y compras, sin esperar cotización.`}
        </p>

        <ul className="mt-8 grid gap-3 sm:grid-cols-3 font-body text-sm text-graystone-100">
          <li className="rounded-lg border border-ink-border p-4">
            <strong className="block text-bone">
              {enMonterrey ? "Entrega gratis desde $499" : "Envío gratis desde $1,049"}
            </strong>
            {enMonterrey ? "A domicilio en el área metropolitana." : "Gratis en Monterrey desde $499."}
          </li>
          <li className="rounded-lg border border-ink-border p-4">
            <strong className="block text-bone">Pagas solo lo que usas</strong>
            No tienes que comprar la lámina completa.
          </li>
          <li className="rounded-lg border border-ink-border p-4">
            <strong className="block text-bone">Listo en 2 a 3 días hábiles</strong>
            Corte láser, canto limpio y película protectora.
          </li>
        </ul>

        <h2 className="mt-16 font-display text-2xl sm:text-3xl text-bone">Precios de acrílico por pieza</h2>
        <p className="mt-2 font-body text-graystone-300">
          Precio por pieza suelta. En pack de 10 cada placa sale más barata.
        </p>
        <div className="mt-6 overflow-x-auto rounded-lg border border-ink-border">
          <table className="w-full min-w-[640px] text-left font-body text-sm">
            <thead className="bg-ink-soft text-graystone-300">
              <tr>
                <th className="px-4 py-3 font-semibold">Material</th>
                {MEDIDAS.map((m) => (
                  <th key={m} className="px-4 py-3 font-semibold">
                    {m.replace(" x ", " × ")}
                  </th>
                ))}
                <th className="px-4 py-3 font-semibold text-gold">40 × 40 en pack de 10 (c/u)</th>
              </tr>
            </thead>
            <tbody>
              {filas.map((f) => (
                <tr key={f.nombre} className="border-t border-ink-border text-graystone-100">
                  <td className="px-4 py-3">
                    <Link href={`/producto/${f.handle}`} className="text-bone hover:text-gold">
                      {f.nombre}
                    </Link>
                  </td>
                  {f.sueltas.map((s, i) => (
                    <td key={i} className="px-4 py-3">
                      {pesos(s)}
                    </td>
                  ))}
                  <td className="px-4 py-3 font-semibold text-gold">{pesos(f.packPorPlaca)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link
          href="/coleccion/placas-de-acrilico"
          className="mt-6 inline-flex rounded-full bg-gold px-6 py-3 font-body font-semibold text-ink hover:opacity-90"
        >
          Comprar placas de acrílico
        </Link>

        <h2 className="mt-16 font-display text-2xl sm:text-3xl text-bone">¿Necesitas otra medida?</h2>
        <p className="mt-2 max-w-2xl font-body text-graystone-300">
          Cortamos cualquier medida hasta 120 × 240 cm. Pon tus medidas, mira el estimado y mándanoslo
          por WhatsApp para confirmarlo.
        </p>
        <div className="mt-6 max-w-2xl">
          <CalculadoraMedida materiales={materiales} />
        </div>

        {enMonterrey && (
          <>
            <h2 className="mt-16 font-display text-2xl sm:text-3xl text-bone">Entregamos en toda el área metropolitana</h2>
            <p className="mt-2 max-w-2xl font-body text-graystone-300">
              {MUNICIPIOS_MTY.join(" · ")}. Entrega a domicilio gratis en pedidos desde $499; te
              llevamos el acrílico, no tienes que venir por él.
            </p>
          </>
        )}

        <h2 className="mt-16 font-display text-2xl sm:text-3xl text-bone">Preguntas frecuentes</h2>
        <div className="mt-6 max-w-3xl divide-y divide-ink-border border-y border-ink-border">
          {faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="cursor-pointer font-body font-semibold text-bone">{f.q}</summary>
              <p className="mt-2 font-body text-graystone-300">{f.a}</p>
            </details>
          ))}
        </div>

        <p className="mt-12 font-body text-graystone-300">
          {enMonterrey ? (
            <>
              ¿Estás fuera de Nuevo León?{" "}
              <Link href="/acrilico-cortado-a-la-medida" className="text-gold hover:underline">
                Enviamos acrílico a todo México
              </Link>
              .
            </>
          ) : (
            <>
              ¿Estás en Monterrey?{" "}
              <Link href="/acrilico-cortado-a-la-medida/monterrey" className="text-gold hover:underline">
                Entrega gratis a domicilio desde $499
              </Link>
              .
            </>
          )}
        </p>
      </div>
    </>
  );
}
