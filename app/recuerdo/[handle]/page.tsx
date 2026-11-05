import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getRecuerdo, youtubeEmbed } from "@/lib/shopify/recuerdo";

// Página a la que lleva el QR de la placa. Privada para buscadores: es de la familia, no de SEO.
export const revalidate = 300;

type Props = { params: { handle: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const r = await getRecuerdo(params.handle);
  if (!r) return { title: "Recuerdo", robots: { index: false, follow: false } };
  const fechas = [r.nace, r.fallece].filter(Boolean).join(" – ");
  return {
    title: `En memoria de ${r.nombre}`,
    description: r.frase ?? `En memoria de ${r.nombre}${fechas ? `, ${fechas}` : ""}.`,
    robots: { index: false, follow: false },
    openGraph: r.retrato ? { images: [{ url: r.retrato.url }] } : undefined,
  };
}

export default async function RecuerdoPage({ params }: Props) {
  const r = await getRecuerdo(params.handle);
  if (!r) notFound();

  const video = youtubeEmbed(r.video);
  // Video subido a Archivos de Shopify (mp4): se reproduce directo, sin YouTube.
  const mp4 = !video && r.video && /\.mp4(\?|$)/i.test(r.video) ? r.video : null;
  const url = `https://luaser.mx/recuerdo/${r.handle}`;
  const compartir = `https://wa.me/?text=${encodeURIComponent(`En memoria de ${r.nombre}: ${url}`)}`;

  return (
    <article className="bg-bone">
      <header className="mx-auto max-w-3xl px-4 sm:px-6 pt-14 pb-10 text-center">
        <p className="font-body text-xs tracking-[0.3em] uppercase text-graystone-700">En memoria de</p>
        {r.retrato && (
          <div className="mx-auto mt-6 w-48 h-48 sm:w-60 sm:h-60 overflow-hidden rounded-full ring-4 ring-gold/60 shadow-lg">
            <Image
              src={r.retrato.url}
              alt={r.retrato.altText ?? r.nombre}
              width={480}
              height={480}
              className="h-full w-full object-cover"
              priority
            />
          </div>
        )}
        <h1 className="mt-6 font-display text-3xl sm:text-5xl text-ink">{r.nombre}</h1>
        {(r.nace || r.fallece) && (
          <p className="mt-3 font-body text-lg text-graystone-700">
            {r.nace && <span>★ {r.nace}</span>}
            {r.nace && r.fallece && <span className="mx-3">·</span>}
            {r.fallece && <span>✝ {r.fallece}</span>}
          </p>
        )}
        {r.frase && <p className="mt-6 font-body text-xl italic text-ink/80 whitespace-pre-line">“{r.frase}”</p>}
      </header>

      {mp4 && (
        <section className="mx-auto max-w-md px-4 sm:px-6 pb-12">
          <video
            src={mp4}
            poster={r.retrato?.url}
            controls
            playsInline
            preload="metadata"
            className="w-full rounded-lg bg-ink shadow-lg"
          />
        </section>
      )}

      {r.historia && (
        <section className="mx-auto max-w-2xl px-4 sm:px-6 pb-12">
          <h2 className="font-display text-2xl text-ink">Su historia</h2>
          <p className="mt-4 font-body text-graystone-700 leading-relaxed whitespace-pre-line">{r.historia}</p>
        </section>
      )}

      {r.galeria.length > 0 && (
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-12">
          <h2 className="font-display text-2xl text-ink">Galería de fotos</h2>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {r.galeria.map((img, i) => (
              <a key={i} href={img.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg bg-bone-muted">
                <Image
                  src={img.url}
                  alt={img.altText ?? `${r.nombre}, foto ${i + 1}`}
                  width={600}
                  height={600}
                  className="aspect-square w-full object-cover transition hover:scale-105"
                />
              </a>
            ))}
          </div>
        </section>
      )}

      {video && (
        <section className="mx-auto max-w-3xl px-4 sm:px-6 pb-12">
          <h2 className="font-display text-2xl text-ink">Video</h2>
          <div className="mt-5 aspect-video overflow-hidden rounded-lg bg-ink">
            <iframe
              src={video}
              title={`Video de ${r.nombre}`}
              className="h-full w-full"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

      <footer className="mx-auto max-w-2xl px-4 sm:px-6 pb-16 text-center">
        {r.familia && <p className="font-body text-lg text-ink">{r.familia}</p>}
        <a
          href={compartir}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-gold px-6 py-3 font-body font-semibold text-ink hover:bg-gold-bright"
        >
          Compartir su recuerdo por WhatsApp
        </a>
        <p className="mt-10 font-body text-xs text-graystone-700">
          Placa conmemorativa con QR hecha por{" "}
          <a href="/producto/placa-conmemorativa-codigo-qr" className="underline">
            Luaser
          </a>
        </p>
      </footer>
    </article>
  );
}
