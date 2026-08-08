import { getHomeData } from "@/lib/shopify/home";
import { HeroSection } from "@/components/storefront/hero-section";
import { TrustBar } from "@/components/storefront/trust-bar";
import { BestsellersSection } from "@/components/storefront/bestsellers-section";
import { StorytellingSection } from "@/components/storefront/storytelling-section";
import { MaterialsSection } from "@/components/storefront/materials-section";
import { MundialSection } from "@/components/storefront/mundial-section";
import { BundleSection } from "@/components/storefront/bundle-section";
import { TestimonialsSection } from "@/components/storefront/testimonials-section";
import { B2BSection } from "@/components/storefront/b2b-section";

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
      <MaterialsSection />
      <MundialSection />
      <BundleSection products={bestsellers?.products ?? []} />
      <TestimonialsSection />
      <B2BSection />
    </>
  );
}
