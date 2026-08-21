import { cookies, headers } from "next/headers";

// El pixel de navegador deja _fbp en el dominio (y _fbc cuando la visita entró
// desde un anuncio). Reenviarlas desde el servidor es lo que permite que Meta
// reconozca que el evento server-side y el del navegador son de la misma
// persona: sin ellas el Event Match Quality se desploma y la deduplicación por
// eventId es lo único que queda en pie.
//
// Solo tiene sentido dentro de una petición del propio visitante (Server
// Actions del storefront). No la uses en el webhook de Shopify: ahí las
// cabeceras son de Shopify, no del comprador, y ensuciarían el evento.
export function getBrowserUserData(): Record<string, string | undefined> {
  const cookieStore = cookies();
  const headerList = headers();

  // x-forwarded-for llega como "ip-cliente, proxy1, proxy2": la primera es la real.
  const clientIp = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();

  return {
    fbp: cookieStore.get("_fbp")?.value,
    fbc: cookieStore.get("_fbc")?.value,
    client_user_agent: headerList.get("user-agent") ?? undefined,
    client_ip_address: clientIp || undefined,
  };
}
