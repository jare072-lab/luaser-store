"use client";

import { ShoppingBag } from "lucide-react";
import { useCartUI } from "@/components/storefront/cart-ui-context";

export function CartButton({ quantity }: { quantity: number }) {
  const { toggle } = useCartUI();

  return (
    <button
      aria-label="Carrito"
      onClick={toggle}
      className="relative hover:text-gold transition-colors"
    >
      <ShoppingBag className="h-5 w-5" />
      {quantity > 0 && (
        <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[10px] font-body font-bold text-ink">
          {quantity}
        </span>
      )}
    </button>
  );
}
