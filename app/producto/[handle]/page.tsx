import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductByHandle, getAllProductHandles } from "@/lib/shopify/product";
import { getCollectionByHandle } from "@/lib/shopify/collection";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { ProductForm } from "@/components/storefront/product-form";
import { ProductAccordion } from "@/components/storefront/product-accordion";
import { RelatedProducts } from "@/components/storefront/related-products";
import { ProductJsonLd } from "@/components/storefront/product-json-ld";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/storefront/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/storefront/breadcrumb-json-ld";

interface ProductPageProps {
  params: { handle: string };
}

export async function generateStaticParams() {
  const products = await getAllProductHandles();
  return products.map((product) => ({ handle: product.handle }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductByHandle(params.handle);
  if (!product) return {};

  return {
    title: product.title,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/producto/${product.handle}` },
    openGraph: product.images[0]
      ? { images: [{ url: product.images[0].url }] }
      : undefined,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductByHandle(params.handle);
  if (!product) notFound();

  const collection = await getCollectionByHandle(product.primaryCollection?.handle ?? "frontpage");
  const related = (collection?.products ?? [])
    .filter((p) => p.handle !== product.handle)
    .slice(0, 3);

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: "Inicio", href: "/" },
    ...(product.primaryCollection
      ? [{ name: product.primaryCollection.title, href: `/coleccion/${product.primaryCollection.handle}` }]
      : []),
    { name: product.title, href: `/producto/${product.handle}` },
  ];

  return (
    <>
      <ProductJsonLd product={product} />
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="mx-auto max-w-content px-4 sm:px-6 py-12 md:py-16">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="mt-6 grid md:grid-cols-2 gap-10 md:gap-16">
          <ProductGallery images={product.images} title={product.title} />
          <div>
            <h1 className="font-display text-3xl sm:text-4xl text-bone">{product.title}</h1>
            <div className="mt-6">
              <ProductForm product={product} />
            </div>
            <ProductAccordion
              items={[
                { title: "Descripción", content: product.description },
                {
                  title: "Envío y producción",
                  content:
                    "Producción: 3-5 días hábiles.\nEnvío: 24-48h dentro de México.\nHecho a mano en Monterrey.",
                },
                {
                  title: "Garantía",
                  content: "30 días. Si llega dañada o no queda como esperabas, la reponemos.",
                },
              ]}
            />
          </div>
        </div>
        <RelatedProducts products={related} />
      </div>
    </>
  );
}
