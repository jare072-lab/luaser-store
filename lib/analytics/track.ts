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

export {};
