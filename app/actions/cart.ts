"use server";

import { cookies } from "next/headers";
import {
  createCart,
  getCart,
  addCartLines,
  updateCartLine,
  removeCartLines,
  type CartLineInput,
} from "@/lib/shopify/cart";
import { sendMetaCapiEvent } from "@/lib/analytics/meta-capi";

const CART_COOKIE = "luaser_cart_id";
const ATTRIB_COOKIE = "luaser_attrib";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

function readCartId() {
  return cookies().get(CART_COOKIE)?.value;
}

function writeCartId(cartId: string) {
  cookies().set(CART_COOKIE, cartId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

/**
 * De donde vino quien esta comprando, para que el pedido de Shopify lo diga.
 *
 * Shopify no ve el origen del trafico en un sitio headless y mandaba todo a
 * "directo"; sin esto no se puede saber que anuncio trajo una venta. Se adjunta
 * al crear el carrito porque los atributos de carrito viajan solos al pedido.
 */
function leerOrigen(): { key: string; value: string }[] | undefined {
  const crudo = cookies().get(ATTRIB_COOKIE)?.value;
  if (!crudo) return undefined;

  const params = new URLSearchParams(decodeURIComponent(crudo));
  const atributos = Array.from(params.entries()).map(([key, value]) => ({ key, value }));
  return atributos.length > 0 ? atributos : undefined;
}

async function getOrCreateCartId(): Promise<string> {
  const existingId = readCartId();
  if (existingId) {
    const cart = await getCart(existingId);
    if (cart) return existingId;
  }
  const cart = await createCart(undefined, leerOrigen());
  writeCartId(cart.id);
  return cart.id;
}

export async function getCurrentCart() {
  const cartId = readCartId();
  if (!cartId) return null;
  return getCart(cartId);
}

interface AddToCartAnalytics {
  eventId: string;
  contentId: string;
  contentName: string;
  value: number;
  currency: string;
}

export async function addToCartAction(input: CartLineInput, analytics?: AddToCartAnalytics) {
  const cartId = await getOrCreateCartId();
  const cart = await addCartLines(cartId, [input]);

  if (analytics) {
    await sendMetaCapiEvent({
      eventName: "AddToCart",
      eventId: analytics.eventId,
      customData: {
        content_ids: [analytics.contentId],
        content_name: analytics.contentName,
        value: analytics.value,
        currency: analytics.currency,
      },
    });
  }

  return cart;
}

export async function updateCartLineAction(lineId: string, quantity: number) {
  const cartId = readCartId();
  if (!cartId) throw new Error("No hay un carrito activo.");
  return updateCartLine(cartId, lineId, quantity);
}

export async function removeCartLineAction(lineId: string) {
  const cartId = readCartId();
  if (!cartId) throw new Error("No hay un carrito activo.");
  return removeCartLines(cartId, [lineId]);
}
