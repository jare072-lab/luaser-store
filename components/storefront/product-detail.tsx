"use client";

import { useState } from "react";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductForm } from "@/components/storefront/product-form";
import { ProductAccordion } from "@/components/storefront/product-accordion";
import type { ProductDetail as ProductDetailType, ProductVariant } from "@/lib/shopify/types";

function findVariant(variants: ProductVariant[], selected: Record<string, string>) {
  return variants.find((variant) =>
    variant.selectedOptions.every((option) => selected[option.name] === option.value)
  );
}

export function ProductDetail({ product }: { product: ProductDetailType }) {
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const first = product.variants[0];
    return Object.fromEntries(first.selectedOptions.map((o) => [o.name, o.value]));
  });

  const selectedVariant = findVariant(product.variants, selected) ?? product.variants[0];

  return (
    <>
      <ProductGallery
        images={product.images}
        videos={product.videos}
        title={product.title}
        variantImage={selectedVariant.image}
      />
      <div>
        <h1 className="font-display text-3xl sm:text-4xl text-bone">{product.title}</h1>
        <div className="mt-6">
          <ProductForm
            product={product}
            selected={selected}
            onSelect={(optionName, value) =>
              setSelected((prev) => ({ ...prev, [optionName]: value }))
            }
          />
        </div>
        <ProductAccordion
          items={[
            { title: "Descripción", content: product.description },
            {
              title: "Envío y producción",
              content:
                "Producción: 3-5 días hábiles.\nEnvío: 24-48h dentro de México.\nHecho a mano en Monterrey.",
            },
            {
              title: "Garantía",
              content: "30 días. Si llega dañada o no queda como esperabas, la reponemos.",
            },
          ]}
        />
      </div>
    </>
  );
}
