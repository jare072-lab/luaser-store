export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyImage {
  url: string;
  altText: string | null;
  width: number;
  height: number;
}

export interface ShopifyVideoSource {
  url: string;
  mimeType: string;
  format: string;
  width: number;
  height: number;
}

export interface ShopifyVideo {
  id: string;
  alt: string | null;
  previewImageUrl: string | null;
  sources: ShopifyVideoSource[];
}

export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: ShopifyMoney;
  };
  compareAtPriceRange?: {
    minVariantPrice: ShopifyMoney | null;
  };
  featuredImage: ShopifyImage | null;
  totalInventory: number;
  images?: ShopifyImage[];
}

export interface HomeData {
  shop: { name: string };
  heroProduct: ShopifyProduct | null;
  bestsellers: {
    title: string;
    products: ShopifyProduct[];
  } | null;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: ShopifyMoney;
  compareAtPrice: ShopifyMoney | null;
  selectedOptions: { name: string; value: string }[];
  image: ShopifyImage | null;
}

export interface ProductDetail {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  totalInventory: number;
  tags: string[];
  options: ProductOption[];
  images: ShopifyImage[];
  videos: ShopifyVideo[];
  variants: ProductVariant[];
  priceRange: {
    minVariantPrice: ShopifyMoney;
  };
  primaryCollection: { title: string; handle: string } | null;
}

export interface CollectionDetail {
  title: string;
  handle: string;
  description: string;
  products: ShopifyProduct[];
}

export interface CartLine {
  id: string;
  quantity: number;
  attributes: { key: string; value: string }[];
  merchandise: {
    id: string;
    title: string;
    image: ShopifyImage | null;
    price: ShopifyMoney;
    product: { title: string; handle: string };
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: ShopifyMoney;
    totalAmount: ShopifyMoney;
  };
  lines: CartLine[];
}
