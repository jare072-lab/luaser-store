export const COLLECTION_QUERY = /* GraphQL */ `
  query CollectionByHandle($handle: String!, $first: Int!) {
    collection(handle: $handle) {
      title
      handle
      description
      products(first: $first) {
        edges {
          node {
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
          }
        }
      }
    }
  }
`;

export const ALL_COLLECTION_HANDLES_QUERY = /* GraphQL */ `
  query AllCollectionHandles($first: Int!, $after: String) {
    collections(first: $first, after: $after) {
      edges {
        node {
          handle
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
