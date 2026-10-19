import Image from "next/image";
import Link from "next/link";
import { getProductByHandle } from "@/lib/shopify/product";
import { formatMXN } from "@/lib/utils";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/storefront/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/storefront/breadcrumb-json-ld";
import type { ProductDetail } from "@/lib/shopify/types";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const PHONE = "528131092383";

export interface Faq {
  q: string;
  a: string;
}

export interface Seccion {
  h2: string;
  parrafos: string[];
  /** Lista opcional debajo de los párrafos. */
  lista?: string[];
}

export interface LandingProps {
  ruta: string;
  eyebrow: string;
  h1: string;
  intro: string;
  bullets: { titulo: string; texto: string }[];
  /** Handles de Shopify que se muestran como tarjetas con precio real. */
  productos: string[];
  tituloProductos: string;
  secciones: Seccion[];
  faqs: Faq[];
  /** Texto del mensaje de WhatsApp que abre el botón principal. */
  mensajeWhatsApp: string;
  /** JSON-LD extra (Service, Product, etc.). FAQ y migas ya van incluidos. */
  jsonLdExtra?: Record<string, unknown>[];
  /** Enlaces a páginas hermanas, al pie. */
  relacionadas?: { label: string; href: string }[];
  breadcrumbNombre: string;
}

function precioDesde(p: ProductDetail) {
  const precios = p.variants.filter((v) => v.availableForSale).map((v) => Number(v.price.amount));
  const min = precios.length ? Math.min(...precios) : Number(p.priceRange.minVariantPrice.amount);
  return formatMXN(min);
}

function TarjetaProducto({ p }: { p: ProductDetail }) {
  const img = p.images[0];
  return (
    <Link
      href={`/producto/${p.handle}`}
      className="group block overflow-hidden rounded-2xl border border-ink-border bg-ink-soft transition-colors hover:border-gold/50"
    >
      <div className="relative aspect-square bg-ink">
        {img && (
          <Image
            src={img.url}
            alt={img.altText ?? p.title}
            fill
            sizes="(min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-body text-sm text-bone line-clamp-2">{p.title}</h3>
        <p className="mt-2 font-body text-sm text-graystone-300">
          Desde <span className="font-semibold text-gold">{precioDesde(p)}</span>
        </p>
      </div>
    </Link>
  );
}

/**
 * Página de aterrizaje para una búsqueda concreta ("placas conmemorativas",
 * "letreros de acrílico"...). Los precios salen de Shopify para que nunca
 * contradigan al carrito; el texto, las FAQ y el JSON-LD viven en cada página.
 */
export async function Landing(props: LandingProps) {
  const productos = (await Promise.all(props.productos.map((h) => getProductByHandle(h)))).filter(
    (p): p is ProductDetail => p != null
  );

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: "Inicio", href: "/" },
    { name: props.breadcrumbNombre, href: props.ruta },
  ];

  const whatsapp = `https://wa.me/${PHONE}?text=${encodeURIComponent(props.mensajeWhatsApp)}`;

  const jsonLd: Record<string, unknown>[] = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: props.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    ...(productos.length
      ? [
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: productos.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: `${SITE_URL}/producto/${p.handle}`,
              name: p.title,
            })),
          },
        ]
      : []),
    ...(props.jsonLdExtra ?? []),
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-content px-4 sm:px-6 py-12 md:py-16">
        <Breadcrumbs items={breadcrumbItems} />

        <p className="mt-6 text-xs font-body font-semibold uppercase tracking-widest text-gold">{props.eyebrow}</p>
        <h1 className="mt-2 max-w-3xl font-display text-3xl sm:text-5xl leading-tight text-bone">{props.h1}</h1>
        <p className="mt-4 max-w-2xl font-body text-lg text-graystone-100">{props.intro}</p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex rounded-full bg-gold px-6 py-3 font-body font-semibold text-ink hover:opacity-90"
          >
            Cotizar por WhatsApp
          </a>
          {productos[0] && (
            <Link
              href={`/producto/${productos[0].handle}`}
              className="inline-flex rounded-full border border-ink-border px-6 py-3 font-body font-semibold text-bone hover:border-gold"
            >
              Ver precios y comprar
            </Link>
          )}
        </div>

        <ul className="mt-8 grid gap-3 sm:grid-cols-3 font-body text-sm text-graystone-100">
          {props.bullets.map((b) => (
            <li key={b.titulo} className="rounded-lg border border-ink-border p-4">
              <strong className="block text-bone">{b.titulo}</strong>
              {b.texto}
            </li>
          ))}
        </ul>

        {productos.length > 0 && (
          <>
            <h2 className="mt-16 font-display text-2xl sm:text-3xl text-bone">{props.tituloProductos}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {productos.map((p) => (
                <TarjetaProducto key={p.handle} p={p} />
              ))}
            </div>
          </>
        )}

        {props.secciones.map((s) => (
          <section key={s.h2} className="mt-16 max-w-3xl">
            <h2 className="font-display text-2xl sm:text-3xl text-bone">{s.h2}</h2>
            {s.parrafos.map((t) => (
              <p key={t} className="mt-3 font-body text-graystone-300">
                {t}
              </p>
            ))}
            {s.lista && (
              <ul className="mt-4 list-disc space-y-1 pl-5 font-body text-graystone-100">
                {s.lista.map((l) => (
                  <li key={l}>{l}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        <h2 className="mt-16 font-display text-2xl sm:text-3xl text-bone">Preguntas frecuentes</h2>
        <div className="mt-6 max-w-3xl divide-y divide-ink-border border-y border-ink-border">
          {props.faqs.map((f) => (
            <details key={f.q} className="group py-4">
              <summary className="cursor-pointer font-body font-semibold text-bone">{f.q}</summary>
              <p className="mt-2 font-body text-graystone-300">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-gold/40 bg-gold/10 p-6 sm:p-8">
          <p className="font-display text-xl text-bone">¿Tienes un diseño o una idea distinta?</p>
          <p className="mt-2 font-body text-graystone-100">
            Mándanos medidas, foto o logo y te cotizamos el mismo día hábil. Taller propio en Apodaca, N.L.
          </p>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-full bg-gold px-6 py-3 font-body font-semibold text-ink hover:opacity-90"
          >
            Escribir por WhatsApp · 81 3109 2383
          </a>
        </div>

        {props.relacionadas && props.relacionadas.length > 0 && (
          <p className="mt-10 font-body text-sm text-graystone-300">
            También hacemos:{" "}
            {props.relacionadas.map((r, i) => (
              <span key={r.href}>
                <Link href={r.href} className="text-gold hover:underline">
                  {r.label}
                </Link>
                {i < props.relacionadas!.length - 1 ? " · " : ""}
              </span>
            ))}
          </p>
        )}
      </div>
    </>
  );
}
