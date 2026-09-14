import type { Metadata } from "next";
import { AcrilicoMedidaLanding } from "@/components/storefront/acrilico-medida/landing";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Acrílico cortado a la medida en Monterrey · Láminas acrílicas MTY",
  description:
    "Láminas y placas de acrílico cortadas a la medida en Monterrey desde $79. Precios en línea y entrega a domicilio gratis desde $499 en San Pedro, Guadalupe, Apodaca y toda el área metropolitana.",
  alternates: { canonical: "/acrilico-cortado-a-la-medida/monterrey" },
};

export default function AcrilicoMonterreyPage() {
  return <AcrilicoMedidaLanding enMonterrey />;
}
