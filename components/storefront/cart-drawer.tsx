"use client";

import Image from "next/image";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X, Minus, Plus, Loader2 } from "lucide-react";
import { useCartUI } from "@/components/storefront/cart-ui-context";
import { updateCartLineAction, removeCartLineAction } from "@/app/actions/cart";
import { formatMXN, cn } from "@/lib/utils";
import type { Cart, CartLine } from "@/lib/shopify/types";

function CartLineRow({ line }: { line: CartLine }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function changeQuantity(nextQuantity: number) {
    startTransition(async () => {
      if (nextQuantity <= 0) {
        await removeCartLineAction(line.id);
      } else {
        await updateCartLineAction(line.id, nextQuantity);
      }
      router.refresh();
    });
  }

  return (
    <div className={cn("flex gap-4 py-4", isPending && "opacity-50")}>
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-ink-soft border border-ink-border">
        {line.merchandise.image && (
          <Image
            src={line.merchandise.image.url}
            alt={line.merchandise.image.altText ?? line.merchandise.product.title}
            fill
            sizes="80px"
            className="object-cover"
          />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm text-bone line-clamp-2">
          {line.merchandise.product.title}
        </p>
        {line.merchandise.title !== "Default Title" && (
          <p className="text-xs text-graystone-500 mt-0.5">{line.merchandise.title}</p>
        )}
        {line.attributes.map((attr) => (
          <p key={attr.key} className="text-xs text-gold mt-0.5">
            {attr.key}: {attr.value}
          </p>
        ))}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-ink-border">
            <button
              aria-label="Reducir cantidad"
              disabled={isPending}
              onClick={() => changeQuantity(line.quantity - 1)}
              className="p-1.5 text-graystone-100 hover:text-gold disabled:opacity-50"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-xs font-body text-bone w-4 text-center">
              {isPending ? <Loader2 className="h-3 w-3 animate-spin mx-auto" /> : line.quantity}
            </span>
            <button
              aria-label="Aumentar cantidad"
              disabled={isPending}
              onClick={() => changeQuantity(line.quantity + 1)}
              className="p-1.5 text-graystone-100 hover:text-gold disabled:opacity-50"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
          <span className="font-display text-sm text-gold">
            {formatMXN(Number(line.merchandise.price.amount) * line.quantity)}
          </span>
        </div>
      </div>
      <button
        aria-label="Eliminar"
        disabled={isPending}
        onClick={() => changeQuantity(0)}
        className="text-graystone-500 hover:text-terracotta transition-colors h-fit"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function CartDrawer({ cart }: { cart: Cart | null }) {
  const { isOpen, close } = useCartUI();
  const lines = cart?.lines ?? [];

  return (
    <div
      className={cn(
        "fixed inset-0 z-[60] transition-opacity",
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      )}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 bg-black/60" onClick={close} />
      <div
        className={cn(
          "absolute right-0 top-0 h-full w-full max-w-md bg-ink border-l border-ink-border flex flex-col transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink-border">
          <h2 className="font-display text-xl text-bone">Tu carrito</h2>
          <button aria-label="Cerrar carrito" onClick={close} className="text-graystone-100 hover:text-gold">
            <X className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <p className="font-body text-graystone-100">Tu carrito está vacío.</p>
            <button
              onClick={close}
              className="mt-4 text-sm font-body font-semibold text-gold hover:text-gold-bright"
            >
              Seguir comprando
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 divide-y divide-ink-border">
              {lines.map((line) => (
                <CartLineRow key={line.id} line={line} />
              ))}
            </div>
            <div className="border-t border-ink-border px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-body text-sm text-graystone-100">Subtotal</span>
                <span className="font-display text-lg text-bone">
                  {cart && formatMXN(cart.cost.subtotalAmount.amount)}
                </span>
              </div>
              <a
                href={cart?.checkoutUrl}
                className="block w-full text-center rounded-full bg-gold text-ink font-body font-semibold h-12 leading-[3rem] hover:bg-gold-bright transition-colors"
              >
                Finalizar compra
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
