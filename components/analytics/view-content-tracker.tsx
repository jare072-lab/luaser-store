"use client";

import { useEffect, useRef } from "react";
import { reportViewContentAction } from "@/app/actions/analytics";
import { trackViewContent } from "@/lib/analytics/track";

// ViewContent es el único evento del sitio que nace solo, sin que nadie haga
// clic: se manda una vez por producto abierto. El ref evita que el doble
// render de React en desarrollo lo mande dos veces con eventId distintos, que
// Meta contaría como dos vistas reales en vez de deduplicar.
export function ViewContentTracker({
  contentId,
  contentName,
  price,
  currency,
}: {
  contentId: string;
  contentName: string;
  price: number;
  currency: string;
}) {
  const trackedId = useRef<string | null>(null);

  useEffect(() => {
    if (trackedId.current === contentId) return;
    trackedId.current = contentId;

    const eventId = crypto.randomUUID();

    trackViewContent({ id: contentId, name: contentName, price, currency }, eventId);

    void reportViewContentAction({
      eventId,
      contentId,
      contentName,
      value: price,
      currency,
      sourceUrl: window.location.href,
    });
  }, [contentId, contentName, price, currency]);

  return null;
}
