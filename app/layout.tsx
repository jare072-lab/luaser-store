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
    default: "Luaser — Corte láser en Monterrey: letreros, placas y piezas de acrílico a la medida",
    template: "%s | Luaser",
  },
  description:
    "Corte y grabado láser en Monterrey. Letreros de acrílico con tu logo, placas conmemorativas, llaveros y acrílico cortado a la medida. Entrega a domicilio en Monterrey y envío a todo México.",
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "Luaser",
  },
};

/** Datos del negocio para Google: van en todas las páginas. */
const negocioJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${resolveSiteUrl().origin}/#negocio`,
  name: "Luaser",
  url: resolveSiteUrl().origin,
  telephone: "+52 81 3109 2383",
  email: "contacto@luaser.mx",
  description:
    "Taller de corte y grabado láser en acrílico, MDF y madera. Letreros, placas conmemorativas, llaveros y piezas a la medida.",
  priceRange: "$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Apodaca",
    addressRegion: "Nuevo León",
    postalCode: "66648",
    addressCountry: "MX",
  },
  areaServed: [
    { "@type": "City", name: "Monterrey" },
    { "@type": "State", name: "Nuevo León" },
    { "@type": "Country", name: "México" },
  ],
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Saturday"], opens: "09:00", closes: "14:00" },
  ],
  sameAs: ["https://www.facebook.com/profile.php?id=61586225530093", "https://www.instagram.com/luasermx/"],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cart = await getCurrentCart();
  const judgeMeAssets = await getJudgeMeShopAssets();

  return (
    <html lang="es-MX" className={`${display.variable} ${body.variable}`}>
      <body className="font-body">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(negocioJsonLd) }} />
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
