/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/**",
      },
    ],
  },
  async redirects() {
    return [
      // Las placas ya tienen pagina propia con texto y datos estructurados.
      // La coleccion generica de Shopify queda redirigida de forma permanente
      // para que Google consolide la autoridad en una sola URL.
      {
        source: "/coleccion/placas-de-acrilico",
        destination: "/placas-de-acrilico",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
