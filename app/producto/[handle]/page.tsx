import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProductByHandle, getAllProductHandles } from "@/lib/shopify/product";
import { getCollectionByHandle } from "@/lib/shopify/collection";
import { ProductDetail } from "@/components/storefront/product-detail";
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
          <ProductDetail product={product} />
        </div>
        <RelatedProducts products={related} />
      </div>
    </>
  );
}
