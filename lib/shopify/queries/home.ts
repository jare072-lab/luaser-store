const PRODUCT_FIELDS = /* GraphQL */ `
  id
  title
  handle
  description
  totalInventory
  priceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  compareAtPriceRange {
    minVariantPrice {
      amount
      currencyCode
    }
  }
  featuredImage {
    url
    altText
    width
    height
  }
`;

export const HOME_QUERY = /* GraphQL */ `
  query HomeData($heroHandle: String!) {
    shop {
      name
    }
    heroProduct: product(handle: $heroHandle) {
      ${PRODUCT_FIELDS}
      images(first: 6) {
        edges {
          node {
            url
            altText
            width
            height
          }
        }
      }
    }
    bestsellers: collection(handle: "frontpage") {
      title
      products(first: 24) {
        edges {
          node {
            ${PRODUCT_FIELDS}
          }
        }
      }
    }
  }
`;
