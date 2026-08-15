const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const GRAPH_API_VERSION = "v21.0";

interface MetaCapiEvent {
  eventName: string;
  eventId: string;
  customData: Record<string, unknown>;
  // Hashes SHA-256 (em/ph) para Advanced Matching — mejora el Event Match
  // Quality en eventos server-side donde no hay cookie de navegador.
  userData?: Record<string, string[] | undefined>;
}

// Espejo server-side del evento de Meta Pixel: sobrevive a bloqueadores de
// anuncios y a Safari/ITP. Nunca debe romper el flujo de compra, por eso
// atrapa cualquier error en silencio.
export async function sendMetaCapiEvent({ eventName, eventId, customData, userData }: MetaCapiEvent) {
  if (!PIXEL_ID || !ACCESS_TOKEN) return;

  try {
    await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: [
            {
              event_name: eventName,
              event_time: Math.floor(Date.now() / 1000),
              event_id: eventId,
              action_source: "website",
              custom_data: customData,
              user_data: userData,
            },
          ],
        }),
      }
    );
  } catch {
    // Ver comentario arriba: la analítica nunca debe tumbar una compra real.
  }
}
