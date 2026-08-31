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

  // Estos tres casos se veían idénticos desde fuera (un 401 mudo) y son el
  // modo de falla más probable al montar los webhooks: el secreto de Shopify
  // tiene que ser el mismo que SHOPIFY_WEBHOOK_SECRET en Vercel. Sin este log,
  // un webhook mal firmado se reintenta, Shopify lo desactiva y nadie se enteró.
  if (!secret) {
    console.error("[revalidate] Falta SHOPIFY_WEBHOOK_SECRET en el entorno.");
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  if (!hmacHeader) {
    console.error(`[revalidate] Petición sin cabecera HMAC (topic: ${topic || "desconocido"}).`);
    return NextResponse.json({ error: "Firma inválida" }, { status: 401 });
  }

  if (!isValidShopifyHmac(rawBody, hmacHeader, secret)) {
    console.error(
      `[revalidate] HMAC no coincide (topic: ${topic || "desconocido"}). ` +
        "Revisa que SHOPIFY_WEBHOOK_SECRET sea el mismo secreto con el que Shopify firma este webhook."
    );
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

// Los atributos del carrito llegan al pedido como note_attributes. Ahí viajan
// _fbc y _fbp, que el pixel dejó en luaser.mx y que este webhook jamás podría
// leer por su cuenta: Shopify lo llama de servidor a servidor, sin el navegador
// del comprador. Es el único puente entre el clic en el anuncio y la venta.
function leerAtributoDePedido(
  order: { note_attributes?: { name: string; value: string }[] },
  nombre: string
): string | undefined {
  return order.note_attributes?.find((a) => a.name === nombre)?.value || undefined;
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
        fbc: leerAtributoDePedido(order, "_fbc"),
        fbp: leerAtributoDePedido(order, "_fbp"),
      },
    });
  } catch (error) {
    // Nunca rompemos el 200 de vuelta a Shopify (ver comentario arriba), pero
    // sí lo dejamos en los logs: si el Purchase no llega a Meta, el motivo
    // tiene que ser visible en algún lado.
    console.error("[revalidate] No se pudo enviar el Purchase a Meta CAPI:", error);
  }
}
