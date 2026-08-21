"use server";

import { sendMetaCapiEvent } from "@/lib/analytics/meta-capi";
import { getBrowserUserData } from "@/lib/analytics/browser-identity";

interface ViewContentInput {
  eventId: string;
  contentId: string;
  contentName: string;
  value: number;
  currency: string;
  sourceUrl: string;
}

interface InitiateCheckoutInput {
  eventId: string;
  contentIds: string[];
  numItems: number;
  value: number;
  currency: string;
  sourceUrl: string;
}

// Los dos eventos de abajo ya salieron por el pixel del navegador; esto es el
// espejo server-side con el mismo eventId, que es lo que Meta usa para
// quedarse con una sola copia. Sirve para el tercio de visitantes que trae
// bloqueador de anuncios, donde el evento de navegador nunca llega.
export async function reportViewContentAction(input: ViewContentInput) {
  await sendMetaCapiEvent({
    eventName: "ViewContent",
    eventId: input.eventId,
    eventSourceUrl: input.sourceUrl,
    customData: {
      content_ids: [input.contentId],
      content_name: input.contentName,
      content_type: "product",
      value: input.value,
      currency: input.currency,
    },
    userData: getBrowserUserData(),
  });
}

export async function reportInitiateCheckoutAction(input: InitiateCheckoutInput) {
  await sendMetaCapiEvent({
    eventName: "InitiateCheckout",
    eventId: input.eventId,
    eventSourceUrl: input.sourceUrl,
    customData: {
      content_ids: input.contentIds,
      content_type: "product",
      num_items: input.numItems,
      value: input.value,
      currency: input.currency,
    },
    userData: getBrowserUserData(),
  });
}
