import Script from "next/script";

// El widget preloader busca los divs .jdgm-widget en el DOM apenas carga, asi
// que la config (window.jdgm) y el script externo van con strategy
// "beforeInteractive": es la unica que Next.js garantiza dentro del <head>
// antes de que la pagina hidrate, tal como pide la guia de Judge.me para
// tiendas headless ("right above </head>").
export function JudgeMeScripts({
  shopDomain,
  publicToken,
}: {
  shopDomain: string;
  publicToken: string;
}) {
  return (
    <>
      <Script id="judgeme-config" strategy="beforeInteractive">
        {`
          window.jdgm = window.jdgm || {};
          window.jdgm.SHOP_DOMAIN = '${shopDomain}';
          window.jdgm.PLATFORM = 'shopify';
          window.jdgm.PUBLIC_TOKEN = '${publicToken}';
        `}
      </Script>
      <Script
        src="https://cdnwidget.judge.me/widget_preloader.js"
        strategy="beforeInteractive"
        data-cfasync="false"
      />
    </>
  );
}
