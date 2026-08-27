import type { JudgeMeShopAssets } from "@/lib/judgeme";

// Todo va en UN solo <script> inline, y el preloader se inyecta desde ahi.
//
// El orden no es negociable: widget_preloader.js arma la URL del cache server
// en el momento en que se evalua...
//
//   var cacheMetafieldsUrl = jdgm.CACHE_SERVER_HOST + "/widgets/"
//                          + jdgm.PLATFORM + "/" + jdgm.SHOP_DOMAIN
//
// ...asi que si carga antes que la config, pide ".../widgets/undefined/undefined"
// y no dibuja nada. Poner el <script src> despues en el JSX no basta: Next.js
// lo iza al <head> y termina corriendo primero. Crear el elemento a mano, ya
// con la config puesta, es la unica forma de garantizar el orden.
export function JudgeMeScripts({
  shopDomain,
  publicToken,
  assets,
}: {
  shopDomain: string;
  publicToken: string;
  assets: JudgeMeShopAssets | null;
}) {
  const boot = `
    ${assets?.settingsJs ?? ""}
    window.jdgm = window.jdgm || {};
    window.jdgm.SHOP_DOMAIN = ${JSON.stringify(shopDomain)};
    window.jdgm.PLATFORM = 'shopify';
    window.jdgm.PUBLIC_TOKEN = ${JSON.stringify(publicToken)};
    if (!window.__jdgmBooted) {
      window.__jdgmBooted = true;
      var s = document.createElement('script');
      s.src = 'https://cdnwidget.judge.me/widget_preloader.js';
      s.async = true;
      s.setAttribute('data-cfasync', 'false');
      document.head.appendChild(s);
    }
  `;

  return (
    <>
      {assets?.styles && <div dangerouslySetInnerHTML={{ __html: assets.styles }} />}
      <script dangerouslySetInnerHTML={{ __html: boot }} />
    </>
  );
}
