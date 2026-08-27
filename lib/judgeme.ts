// Judge.me en modo headless.
//
// En una tienda con tema de Shopify, el tema imprime un <script> con
// window.jdgmSettings y el HTML de los widgets ya renderizado. Aqui no hay
// tema, asi que hay que pedirle las dos cosas al cache server de Judge.me
// y montarlas nosotros. Sin el script de settings, widget_preloader.js
// truena con "jdgmSettings is not defined" y no dibuja nada.
//
// Los settings se piden del lado del servidor para que salgan ya impresos en
// el HTML inicial: el preloader los lee apenas arranca, y si llegaran despues
// (por un fetch del navegador) truena antes de dibujar nada.

const CACHE_HOST = "https://cache.judge.me";

/** 10 min: las reseñas nuevas no son urgentes y evita pegarle a Judge.me en cada visita. */
const REVALIDATE_SECONDS = 600;

function credentials() {
  const shop = process.env.NEXT_PUBLIC_JUDGEME_SHOP_DOMAIN;
  const token = process.env.NEXT_PUBLIC_JUDGEME_PUBLIC_TOKEN;
  return shop && token ? { shop, token } : null;
}

async function fetchWidgets(params: Record<string, string>) {
  const creds = credentials();
  if (!creds) return null;

  const url = new URL(`${CACHE_HOST}/widgets/shopify/${creds.shop}`);
  url.searchParams.set("public_token", creds.token);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) return null;
    return (await res.json()) as {
      html_miracle?: string;
      settings?: string;
      preview_badges?: Record<string, string>;
      review_widgets?: Record<string, string>;
    };
    // Judge.me caido no debe tumbar una ficha de producto: se devuelve null y
    // la pagina simplemente se dibuja sin la seccion de reseñas.
  } catch {
    return null;
  }
}

/**
 * El campo `settings` viene como un <script>...</script> completo. Inyectarlo
 * con dangerouslySetInnerHTML dentro de otro elemento no lo ejecutaria, asi
 * que se extrae el JS de adentro para montarlo como script propio.
 */
function extractScriptBody(scriptTag: string): string | null {
  const match = scriptTag.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
  return match?.[1]?.trim() || null;
}

export interface JudgeMeShopAssets {
  /** JS que define window.jdgmSettings; va antes del preloader. */
  settingsJs: string | null;
  /** <style> base de Judge.me (fuente de estrellas, animaciones). */
  styles: string | null;
}

/** Configuracion y estilos de la tienda: iguales para todos los productos. */
export async function getJudgeMeShopAssets(): Promise<JudgeMeShopAssets | null> {
  const data = await fetchWidgets({});
  if (!data) return null;

  return {
    settingsJs: data.settings ? extractScriptBody(data.settings) : null,
    styles: data.html_miracle ?? null,
  };
}

// El HTML por producto NO se pide aqui: widget_preloader.js lo pide y lo monta
// solo en el navegador. Pre-llenar los divis desde el servidor le impide
// completar su arranque y el widget se queda oculto.
