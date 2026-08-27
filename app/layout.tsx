import type { Metadata } from "next";
import { Space_Grotesk, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { CartUIProvider } from "@/components/storefront/cart-ui-context";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { WhatsAppButton } from "@/components/storefront/whatsapp-button";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { JudgeMeScripts } from "@/components/analytics/judge-me";
import { getJudgeMeShopAssets } from "@/lib/judgeme";
import { Attribution } from "@/components/analytics/attribution";
import { getCurrentCart } from "@/app/actions/cart";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700", "800"],
});

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const JUDGEME_SHOP_DOMAIN = process.env.NEXT_PUBLIC_JUDGEME_SHOP_DOMAIN;
const JUDGEME_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_JUDGEME_PUBLIC_TOKEN;

// NEXT_PUBLIC_SITE_URL mal puesta (sin protocolo, vacía, con espacios) no debe
// tumbar el build entero — degrada a localhost y sigue adelante.
function resolveSiteUrl(): URL {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  try {
    return new URL(raw || "http://localhost:3000");
  } catch {
    console.error(
      `NEXT_PUBLIC_SITE_URL no es una URL válida: "${raw}". Debe incluir el protocolo, ej. https://tu-dominio.com. Usando http://localhost:3000 como respaldo.`
    );
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: {
    default: "Luaser — Letreros y piezas de acrílico personalizadas en México",
    template: "%s | Luaser",
  },
  description:
    "Letreros de acrílico personalizados con tu logo, cortados y grabados a láser. Maquilamos cualquier pieza a la medida y enviamos a todo México.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Luaser",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cart = await getCurrentCart();
  const judgeMeAssets = await getJudgeMeShopAssets();

  return (
    <html lang="es-MX" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        {META_PIXEL_ID && <MetaPixel pixelId={META_PIXEL_ID} />}
        {JUDGEME_SHOP_DOMAIN && JUDGEME_PUBLIC_TOKEN && (
          <JudgeMeScripts
            shopDomain={JUDGEME_SHOP_DOMAIN}
            publicToken={JUDGEME_PUBLIC_TOKEN}
            assets={judgeMeAssets}
          />
        )}
        <Attribution />
        <CartUIProvider>
          <SiteHeader cartQuantity={cart?.totalQuantity ?? 0} />
          <main>{children}</main>
          <SiteFooter />
          <CartDrawer cart={cart} />
          <WhatsAppButton />
        </CartUIProvider>
      </body>
    </html>
  );
}
