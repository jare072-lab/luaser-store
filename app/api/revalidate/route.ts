import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "crypto";

// Shopify firma cada webhook con el "Client secret" del custom app.
// Sin esa firma válida, cualquiera podría forzar revalidaciones a voluntad.
function isValidShopifyHmac(rawBody: string, hmacHeader: string, secret: string): boolean {
  const digest = crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");

  const digestBuffer = Buffer.from(digest);
  const headerBuffer = Buffer.from(hmacHeader);

  if (digestBuffer.length !== headerBuffer.length) return false;
  return crypto.timingSafeEqual(digestBuffer, headerBuffer);
}

export async function POST(request: NextRequest) {
  const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
  const hmacHeader = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic") ?? "";
  const rawBody = await request.text();

  if (!secret || !hmacHeader || !isValidShopifyHmac(rawBody, hmacHeader, secret)) {
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  const revalidated: string[] = [];

  if (topic.startsWith("products/") || topic.startsWith("inventory_levels/")) {
    revalidateTag("products");
    revalidateTag("home");
    revalidated.push("products", "home");
  }

  if (topic.startsWith("collections/")) {
    revalidateTag("collections");
    revalidateTag("home");
    revalidated.push("collections", "home");
  }

  return NextResponse.json({ revalidated, topic });
}
