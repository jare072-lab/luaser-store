import { getPlacas } from "@/lib/shopify/placas";
import { PlacasSection } from "@/components/storefront/placas-section";

/**
 * Ruta temporal de revision: monta SOLO la seccion de placas, sin el lienzo
 * animado del hero, que bloquea la captura de pantalla del home completo.
 *
 * Existe para que los criticos del design-loop juzguen el resultado renderizado
 * en vez del codigo. Se borra cuando la seccion pase las tres revisiones.
 */
export const revalidate = 300;

export default async function PlacasPreviewPage() {
  const placas = await getPlacas();
  return (
    <main className="bg-black">
      <PlacasSection productos={placas} />
    </main>
  );
}
