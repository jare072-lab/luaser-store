declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

interface AddToCartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  currency: string;
}

interface ViewContentItem {
  id: string;
  name: string;
  price: number;
  currency: string;
}

interface CheckoutItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface CheckoutPayload {
  items: CheckoutItem[];
  value: number;
  currency: string;
}

// GA4 y el pixel entran con <Script strategy="afterInteractive">, así que un
// evento automático (ViewContent al montar la página) puede llegar antes que
// el snippet. Sin esta espera el evento se perdería sin dejar rastro; los
// eventos que nacen de un clic no la necesitan porque para entonces ya cargó.
function whenReady(get: () => unknown, run: () => void) {
  if (get()) {
    run();
    return;
  }

  const startedAt = Date.now();
  const timer = window.setInterval(() => {
    if (get()) {
      window.clearInterval(timer);
      run();
      return;
    }
    // Si a los 5s no cargó, o el visitante lo bloquea o no va a cargar nunca:
    // dejamos de intentar y el espejo de CAPI queda como única fuente.
    if (Date.now() - startedAt > 5000) window.clearInterval(timer);
  }, 100);
}

// Dispara los eventos client-side (GA4 + Meta Pixel) en el mismo instante que
// se llama al Server Action. El eventId se comparte con el evento espejo que
// manda meta-capi.ts desde el servidor, para que Meta deduplique.
export function trackAddToCart(item: AddToCartItem, eventId: string) {
  const value = item.price * item.quantity;

  window.gtag?.("event", "add_to_cart", {
    currency: item.currency,
    value,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity,
      },
    ],
  });

  window.fbq?.(
    "track",
    "AddToCart",
    {
      content_ids: [item.id],
      content_name: item.name,
      value,
      currency: item.currency,
    },
    { eventID: eventId }
  );
}

export function trackViewContent(item: ViewContentItem, eventId: string) {
  whenReady(
    () => window.gtag,
    () => {
      window.gtag?.("event", "view_item", {
        currency: item.currency,
        value: item.price,
        items: [{ item_id: item.id, item_name: item.name, price: item.price }],
      });
    }
  );

  whenReady(
    () => window.fbq,
    () => {
      window.fbq?.(
        "track",
        "ViewContent",
        {
          content_ids: [item.id],
          content_name: item.name,
          content_type: "product",
          value: item.price,
          currency: item.currency,
        },
        { eventID: eventId }
      );
    }
  );
}

export function trackInitiateCheckout(payload: CheckoutPayload, eventId: string) {
  const numItems = payload.items.reduce((sum, item) => sum + item.quantity, 0);

  window.gtag?.("event", "begin_checkout", {
    currency: payload.currency,
    value: payload.value,
    items: payload.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });

  window.fbq?.(
    "track",
    "InitiateCheckout",
    {
      content_ids: payload.items.map((item) => item.id),
      content_type: "product",
      num_items: numItems,
      value: payload.value,
      currency: payload.currency,
    },
    { eventID: eventId }
  );
}

export {};
