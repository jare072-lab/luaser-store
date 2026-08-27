"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    jdgmCacheServer?: { reloadAll?: () => void };
  }
}

/**
 * Vuelve a montar los widgets de Judge.me despues de la hidratacion.
 *
 * widget_preloader.js llena los divs en DOMContentLoaded, que ocurre antes de
 * que React hidrate; al hidratar, React ve esos divs vacios en su arbol y borra
 * lo que Judge.me habia puesto. Pedir el remontado aqui —ya con la hidratacion
 * hecha— es lo que hace que el contenido se quede.
 *
 * Tambien cubre la navegacion interna: al pasar de un producto a otro sin
 * recargar no hay DOMContentLoaded nuevo, y sin esto el widget saldria vacio.
 */
function useJudgeMeReload(productId: string) {
  useEffect(() => {
    let cancelled = false;

    // Reintenta un rato: en la primera visita el preloader puede seguir
    // descargandose cuando React ya termino de hidratar.
    const start = Date.now();
    const timer = window.setInterval(() => {
      if (cancelled) return;
      if (window.jdgmCacheServer?.reloadAll) {
        window.jdgmCacheServer.reloadAll();
        window.clearInterval(timer);
      } else if (Date.now() - start > 10000) {
        window.clearInterval(timer);
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [productId]);
}

export function JudgeMeRatingBadge({ productId }: { productId: string }) {
  useJudgeMeReload(productId);
  return (
    <div
      className="jdgm-widget jdgm-preview-badge"
      data-id={productId}
      suppressHydrationWarning
    />
  );
}

export function JudgeMeReviewWidget({
  productId,
  productTitle,
}: {
  productId: string;
  productTitle: string;
}) {
  return (
    <div
      className="jdgm-widget jdgm-review-widget jdgm-outside-widget"
      data-id={productId}
      data-product-title={productTitle}
      suppressHydrationWarning
    />
  );
}
