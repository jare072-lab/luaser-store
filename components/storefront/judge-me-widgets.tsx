// Divs vacios que el script preloader de Judge.me (cargado en el layout)
// encuentra por clase y llena del lado del cliente. No son "use client":
// React los renderiza una sola vez y no vuelve a tocar su contenido, asi que
// no hay conflicto con lo que Judge.me inyecta despues del mount.

export function JudgeMeRatingBadge({ productId }: { productId: string }) {
  return <div className="jdgm-widget jdgm-preview-badge" data-id={productId} />;
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
    />
  );
}
