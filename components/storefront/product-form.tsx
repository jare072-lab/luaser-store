"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ScarcityBadge } from "@/components/storefront/scarcity-badge";
import { useCartUI } from "@/components/storefront/cart-ui-context";
import { addToCartAction } from "@/app/actions/cart";
import { trackAddToCart } from "@/lib/analytics/track";
import { cn, formatMXN } from "@/lib/utils";
import {
  buildInitialValues,
  getMissingRequired,
  getPersonalizationFields,
  toCartAttributes,
} from "@/lib/personalization";
import type { ProductDetail, ProductVariant } from "@/lib/shopify/types";

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
  const personalizationFields = useMemo(
    () => getPersonalizationFields(product.tags),
    [product.tags]
  );
  const [personalization, setPersonalization] = useState(() =>
    buildInitialValues(personalizationFields)
  );
  const [showErrors, setShowErrors] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const { open } = useCartUI();
  const router = useRouter();

  const selectedVariant = useMemo(() => findVariant(variants, selected) ?? variants[0], [
    variants,
    selected,
  ]);

  const missingRequired = getMissingRequired(personalizationFields, personalization);
  const hasPersonalization = personalizationFields.length > 0;

  const hasLogoUpload = product.tags.includes("logo");
  const logoWhatsappHref = `https://wa.me/528131092383?text=${encodeURIComponent(
    `Hola, acabo de comprar "${product.title}" y quiero enviarles mi logo.`
  )}`;

  function handleAddToCart() {
    // Una pieza personalizada sin texto es una pieza que no se puede fabricar:
    // se bloquea aquí en vez de descubrirlo cuando ya entró el pedido.
    if (missingRequired.length > 0) {
      setShowErrors(true);
      document
        .getElementById(`perso-${missingRequired[0]}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    startTransition(async () => {
      const attributes = toCartAttributes(personalizationFields, personalization);

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
        <div className="mt-6 rounded-xl border border-ink-border bg-ink-soft px-4 py-4">
          <p className="text-xs font-body font-semibold uppercase tracking-wide text-gold mb-3">
            Personaliza tu pieza
          </p>

          <div className="space-y-4">
            {personalizationFields.map((field) => {
              const value = personalization[field.key] ?? "";
              const isMissing = showErrors && missingRequired.includes(field.key);
              const inputId = `perso-${field.key}`;
              const controlClasses = cn(
                "w-full rounded-xl border bg-ink px-4 py-3 text-sm font-body text-bone placeholder:text-graystone-500 outline-none transition-colors",
                isMissing
                  ? "border-terracotta focus:border-terracotta"
                  : "border-ink-border focus:border-gold"
              );

              function update(next: string) {
                setPersonalization((prev) => ({ ...prev, [field.key]: next }));
              }

              return (
                <div key={field.key}>
                  <label
                    htmlFor={inputId}
                    className="text-xs font-body font-semibold uppercase tracking-wide text-graystone-100 mb-2 block"
                  >
                    {field.label}
                    {field.required ? (
                      <span className="text-terracotta"> *</span>
                    ) : (
                      <span className="text-graystone-500 normal-case font-normal"> (opcional)</span>
                    )}
                  </label>

                  {field.type === "select" ? (
                    <select
                      id={inputId}
                      value={value}
                      onChange={(e) => update(e.target.value)}
                      className={controlClasses}
                    >
                      {field.options?.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      id={inputId}
                      value={value}
                      rows={2}
                      maxLength={field.maxLength}
                      onChange={(e) => update(e.target.value)}
                      placeholder={field.placeholder}
                      className={cn(controlClasses, "resize-y")}
                    />
                  ) : (
                    <input
                      id={inputId}
                      type="text"
                      value={value}
                      maxLength={field.maxLength}
                      onChange={(e) => update(e.target.value)}
                      placeholder={field.placeholder}
                      className={controlClasses}
                    />
                  )}

                  <div className="mt-1 flex items-baseline justify-between gap-3">
                    <p
                      className={cn(
                        "text-xs",
                        isMissing ? "text-terracotta" : "text-graystone-500"
                      )}
                    >
                      {isMissing ? "Completa este dato para continuar." : field.help}
                    </p>
                    {field.maxLength && field.type !== "select" && (
                      <p className="shrink-0 text-xs text-graystone-500">
                        {value.length}/{field.maxLength}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
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
          aria-describedby={showErrors && missingRequired.length > 0 ? "perso-aviso" : undefined}
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

      {showErrors && missingRequired.length > 0 && (
        <p id="perso-aviso" role="alert" className="mt-3 text-sm font-body text-terracotta">
          Falta completar: {missingRequired.join(", ")}.
        </p>
      )}
    </div>
  );
}
