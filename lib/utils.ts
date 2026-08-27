import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** "gid://shopify/Product/123" -> "123". Judge.me pide el ID numerico, no el GID. */
export function shopifyLegacyId(gid: string): string {
  return gid.split("/").pop() ?? gid;
}

export function formatMXN(amount: string | number) {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}
