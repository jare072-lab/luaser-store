import { getHomeData } from "@/lib/shopify/home";
import { HeroSection } from "@/components/storefront/hero-section";
import { TrustBar } from "@/components/storefront/trust-bar";
import { TrabajosSection } from "@/components/storefront/trabajos-section";
import { BestsellersSection } from "@/components/storefront/bestsellers-section";
import { StorytellingSection } from "@/components/storefront/storytelling-section";
import { MaterialsSection } from "@/components/storefront/materials-section";
import { SocialSection } from "@/components/storefront/social-section";
import { TestimonialsSection } from "@/components/storefront/testimonials-section";
import { B2BSection } from "@/components/storefront/b2b-section";
import { ContactSection } from "@/components/storefront/contact-section";

export const revalidate = 3600;

export default async function HomePage() {
  const { heroProduct, bestsellers } = await getHomeData();

  return (
    <>
      <BestsellersSection
        title={bestsellers?.title ?? "Página de inicio"}
        products={bestsellers?.products ?? []}
      />
      <HeroSection product={heroProduct} />
      <TrustBar />
      <TrabajosSection />
      <StorytellingSection />
      <MaterialsSection />
      <SocialSection />
      <TestimonialsSection />
      <B2BSection />
      <ContactSection />
    </>
  );
}
