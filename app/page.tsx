import { getHomeData } from "@/lib/shopify/home";
import { HeroSection } from "@/components/storefront/hero-section";
import { TrustBar } from "@/components/storefront/trust-bar";
import { BestsellersSection } from "@/components/storefront/bestsellers-section";
import { StorytellingSection } from "@/components/storefront/storytelling-section";
import { MundialSection } from "@/components/storefront/mundial-section";
import { BundleSection } from "@/components/storefront/bundle-section";
import { NewsletterSection } from "@/components/storefront/newsletter-section";

export const revalidate = 3600;

export default async function HomePage() {
  const { heroProduct, bestsellers } = await getHomeData();

  return (
    <>
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
