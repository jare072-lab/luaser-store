const LOW_STOCK_THRESHOLD = 15;

export function ScarcityBadge({ quantity }: { quantity: number | null | undefined }) {
  if (quantity == null || quantity <= 0 || quantity > LOW_STOCK_THRESHOLD) return null;

  return (
    <span className="inline-flex items-center rounded-full bg-terracotta px-3 py-1 text-[10px] font-body font-semibold uppercase tracking-wide text-bone">
      Quedan {quantity}
    </span>
  );
}
