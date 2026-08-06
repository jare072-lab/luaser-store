import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCollectionByHandle, getAllCollectionHandles } from "@/lib/shopify/collection";
import { ProductCard } from "@/components/storefront/product-card";
import { Breadcrumbs, type BreadcrumbItem } from "@/components/storefront/breadcrumbs";
import { BreadcrumbJsonLd } from "@/components/storefront/breadcrumb-json-ld";

interface CollectionPageProps {
  params: { handle: string };
}

export async function generateStaticParams() {
  const collections = await getAllCollectionHandles();
  return collections.map((collection) => ({ handle: collection.handle }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const collection = await getCollectionByHandle(params.handle);
  if (!collection) return {};

  return {
    title: collection.title,
    description: collection.description || undefined,
    alternates: { canonical: `/coleccion/${collection.handle}` },
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collection = await getCollectionByHandle(params.handle);
  if (!collection) notFound();

  const breadcrumbItems: BreadcrumbItem[] = [
    { name: "Inicio", href: "/" },
    { name: collection.title, href: `/coleccion/${collection.handle}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <div className="mx-auto max-w-content px-4 sm:px-6 py-12 md:py-16">
        <Breadcrumbs items={breadcrumbItems} />
        <p className="mt-6 text-xs font-body font-semibold uppercase tracking-widest text-gold">
          Colección
        </p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl text-bone">{collection.title}</h1>
        {collection.description && (
          <p className="mt-3 max-w-2xl text-graystone-100 font-body">{collection.description}</p>
        )}

        {collection.products.length === 0 ? (
          <p className="mt-10 text-graystone-500 font-body">
            Pronto agregaremos piezas a esta colección.
          </p>
        ) : (
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {collection.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
