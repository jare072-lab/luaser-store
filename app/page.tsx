import { getHomeData } from "@/lib/shopify/home";
import { HeroSection } from "@/components/storefront/hero-section";
import { TrustBar } from "@/components/storefront/trust-bar";
import { BestsellersSection } from "@/components/storefront/bestsellers-section";
import { StorytellingSection } from "@/components/storefront/storytelling-section";
import { MundialSection } from "@/components/storefront/mundial-section";
import { BundleSection } from "@/components/storefront/bundle-section";
import { NewsletterSection } from "@/components/storefront/newsletter-section";
import type { HomeData } from "@/lib/shopify/types";

export const revalidate = 3600;

export default async function HomePage() {
  let data: HomeData | null = null;
  let debugError: string | null = null;

  try {
    data = await getHomeData();
  } catch (err) {
    debugError = err instanceof Error ? `${err.message}\n\n${err.stack ?? ""}` : String(err);
  }

  const heroProduct = data?.heroProduct ?? null;
  const bestsellers = data?.bestsellers ?? null;

  return (
    <>
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
      <HeroSection product={heroProduct} />
      <TrustBar />
      <BestsellersSection
        title={bestsellers?.title ?? "Página de inicio"}
        products={bestsellers?.products ?? []}
      />
      <StorytellingSection />
      <MundialSection />
      <BundleSection products={bestsellers?.products ?? []} />
      <NewsletterSection />
    </>
  );
}
