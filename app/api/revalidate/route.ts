import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import crypto from "crypto";
import { sendMetaCapiEvent } from "@/lib/analytics/meta-capi";

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

  if (topic === "orders/paid") {
    await reportPurchaseToMeta(rawBody);
  }

  return NextResponse.json({ revalidated, topic });
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

// Espejo server-side del evento de compra: Shopify solo llama este webhook
// cuando el pago ya se confirmó (orders/paid), así el píxel nunca aprende de
// pedidos pendientes o cancelados. Nunca debe romper el 200 de vuelta a
// Shopify, por eso el error se atrapa en silencio (igual que en meta-capi.ts).
async function reportPurchaseToMeta(rawBody: string) {
  try {
    const order = JSON.parse(rawBody);

    await sendMetaCapiEvent({
      eventName: "Purchase",
      eventId: `order_${order.id}`,
      customData: {
        currency: order.currency ?? order.current_total_price_set?.shop_money?.currency_code,
        value: Number(order.current_total_price ?? order.total_price),
        content_ids: (order.line_items ?? []).map((item: { variant_id: number | string }) =>
          String(item.variant_id)
        ),
        num_items: (order.line_items ?? []).reduce(
          (sum: number, item: { quantity: number }) => sum + item.quantity,
          0
        ),
      },
      userData: {
        em: order.email ? [sha256(order.email)] : undefined,
        ph: order.phone ? [sha256(order.phone.replace(/\D/g, ""))] : undefined,
      },
    });
  } catch {
    // Ver comentario arriba.
  }
}
