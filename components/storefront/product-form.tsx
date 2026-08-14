"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScarcityBadge } from "@/components/storefront/scarcity-badge";
import { useCartUI } from "@/components/storefront/cart-ui-context";
import { addToCartAction } from "@/app/actions/cart";
import { trackAddToCart } from "@/lib/analytics/track";
import { cn, formatMXN } from "@/lib/utils";
import type { ProductDetail, ProductVariant } from "@/lib/shopify/types";

const PERSONALIZATION_MAX_LENGTH = 15;

function findVariant(variants: ProductVariant[], selected: Record<string, string>) {
  return variants.find((variant) =>
    variant.selectedOptions.every((option) => selected[option.name] === option.value)
  );
}

export function ProductForm({
  product,
  selected,
  onSelect,
}: {
  product: ProductDetail;
  selected: Record<string, string>;
  onSelect: (optionName: string, value: string) => void;
}) {
  const { variants, options } = product;
  const [personalization, setPersonalization] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const { open } = useCartUI();
  const router = useRouter();

  const selectedVariant = useMemo(() => findVariant(variants, selected) ?? variants[0], [
    variants,
    selected,
  ]);

  const hasPersonalization =
    product.description.toLowerCase().includes("personaliza") ||
    product.title.toLowerCase().includes("personaliz");

  const hasLogoUpload = product.tags.includes("logo");
  const logoWhatsappHref = `https://wa.me/528131092383?text=${encodeURIComponent(
    `Hola, acabo de comprar "${product.title}" y quiero enviarles mi logo.`
  )}`;

  function handleAddToCart() {
    startTransition(async () => {
      const attributes: { key: string; value: string }[] = [];
      if (personalization.trim()) {
        attributes.push({ key: "Personalización", value: personalization.trim() });
      }

      const eventId = crypto.randomUUID();
      const currency = selectedVariant.price.currencyCode;
      const price = Number(selectedVariant.price.amount);

      trackAddToCart(
        { id: selectedVariant.id, name: product.title, price, quantity, currency },
        eventId
      );

      await addToCartAction(
        { merchandiseId: selectedVariant.id, quantity, attributes },
        {
          eventId,
          contentId: selectedVariant.id,
          contentName: product.title,
          value: price * quantity,
          currency,
        }
      );

      setJustAdded(true);
      open();
      router.refresh();
      setTimeout(() => setJustAdded(false), 2000);
    });
  }

  const price = Number(selectedVariant.price.amount);
  const compareAt = selectedVariant.compareAtPrice ? Number(selectedVariant.compareAtPrice.amount) : 0;
  const hasDiscount = compareAt > price;
  const discountPct = hasDiscount ? Math.round((1 - price / compareAt) * 100) : 0;

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="font-display text-3xl text-gold">{formatMXN(price)}</span>
        {hasDiscount && (
          <>
            <span className="font-body text-lg text-graystone-500 line-through">
              {formatMXN(compareAt)}
            </span>
            <span className="rounded-full bg-pitch px-2.5 py-1 text-xs font-body font-semibold text-bone">
              -{discountPct}%
            </span>
          </>
        )}
        <ScarcityBadge quantity={selectedVariant.quantityAvailable} />
      </div>

      {options
        .filter((option) => option.values.length > 1)
        .map((option) => (
          <div key={option.name} className="mt-6">
            <p className="text-xs font-body font-semibold uppercase tracking-wide text-graystone-100 mb-2">
              {option.name}: <span className="text-bone">{selected[option.name]}</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const isSelected = selected[option.name] === value;
                return (
                  <button
                    key={value}
                    onClick={() => onSelect(option.name, value)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-body transition-colors",
                      isSelected
                        ? "border-gold bg-gold/10 text-gold"
                        : "border-ink-border text-graystone-100 hover:border-graystone-500"
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      {hasLogoUpload && (
        <div className="mt-6 rounded-xl border border-ink-border bg-ink-soft px-4 py-3">
          <p className="text-xs font-body font-semibold uppercase tracking-wide text-graystone-100 mb-1">
            ¿Ya tienes tu logo listo?
          </p>
          <p className="text-sm font-body text-graystone-100 mb-3">
            Compra ahora y mándanos tu logo por WhatsApp — te damos atención personalizada para
            que quede exactamente como lo imaginas.
          </p>
          <a
            href={logoWhatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-pitch/50 bg-pitch/10 px-4 py-2 text-sm font-body font-semibold text-pitch-light transition-colors hover:bg-pitch/20"
          >
            Enviar mi logo por WhatsApp
          </a>
        </div>
      )}

      {hasPersonalization && (
        <div className="mt-6">
          <label
            htmlFor="personalization"
            className="text-xs font-body font-semibold uppercase tracking-wide text-graystone-100 mb-2 block"
          >
            Personalización (opcional)
          </label>
          <input
            id="personalization"
            type="text"
            value={personalization}
            maxLength={PERSONALIZATION_MAX_LENGTH}
            onChange={(e) => setPersonalization(e.target.value)}
            placeholder="Nombre o texto a grabar"
            className="w-full rounded-xl border border-ink-border bg-ink-soft px-4 py-3 text-sm font-body text-bone placeholder:text-graystone-500 outline-none focus:border-gold"
          />
          <p className="mt-1 text-xs text-graystone-500">
            {personalization.length}/{PERSONALIZATION_MAX_LENGTH} caracteres
          </p>
        </div>
      )}

      <div className="mt-6 flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-full border border-ink-border px-2">
          <button
            aria-label="Reducir cantidad"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="h-10 w-8 text-graystone-100 hover:text-gold"
          >
            −
          </button>
          <span className="font-body text-bone w-4 text-center">{quantity}</span>
          <button
            aria-label="Aumentar cantidad"
            onClick={() => setQuantity((q) => q + 1)}
            className="h-10 w-8 text-graystone-100 hover:text-gold"
          >
            +
          </button>
        </div>

        <Button
          size="lg"
          className="flex-1"
          disabled={isPending || !selectedVariant.availableForSale}
          onClick={handleAddToCart}
        >
          {!selectedVariant.availableForSale
            ? "Agotado"
            : isPending
              ? "Agregando..."
              : justAdded
                ? "¡Agregado!"
                : "Agregar al carrito"}
        </Button>
      </div>
    </div>
  );
}
