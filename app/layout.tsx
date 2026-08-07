import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { SiteHeader } from "@/components/storefront/site-header";
import { SiteFooter } from "@/components/storefront/site-footer";
import { CartUIProvider } from "@/components/storefront/cart-ui-context";
import { CartDrawer } from "@/components/storefront/cart-drawer";
import { GoogleAnalytics } from "@/components/analytics/google-analytics";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { getCurrentCart } from "@/app/actions/cart";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Luaser — Piezas de acrílico cortadas a láser | Edición Mundial 2026",
    template: "%s | Luaser",
  },
  description:
    "Cajas acrílicas, vitrinas y decoración cortadas a láser en México. Pieza estrella: caja de colección para tu álbum del Mundial 2026.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Luaser",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  let cart = null;
  let debugError: string | null = null;

  try {
    cart = await getCurrentCart();
  } catch (err) {
    debugError = err instanceof Error ? `${err.message}\n\n${err.stack ?? ""}` : String(err);
  }

  return (
    <html lang="es-MX" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">
        {/* DIAGNÓSTICO TEMPORAL — quitar en cuanto se resuelva el error de producción */}
        {debugError && (
          <pre
            style={{
              background: "#2a0000",
              color: "#ffb3b3",
              padding: "16px",
              margin: "16px",
              borderRadius: "8px",
              whiteSpace: "pre-wrap",
              fontSize: "12px",
              overflowX: "auto",
            }}
          >
            {debugError}
          </pre>
        )}
        {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
        {META_PIXEL_ID && <MetaPixel pixelId={META_PIXEL_ID} />}
        <CartUIProvider>
          <SiteHeader cartQuantity={cart?.totalQuantity ?? 0} />
          <main>{children}</main>
          <SiteFooter />
          <CartDrawer cart={cart} />
        </CartUIProvider>
      </body>
    </html>
  );
}
