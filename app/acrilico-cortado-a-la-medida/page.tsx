import type { Metadata } from "next";
import { AcrilicoMedidaLanding } from "@/components/storefront/acrilico-medida/landing";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Acrílico cortado a la medida — precios en línea y envío a todo México",
  description:
    "Placas de acrílico cristal, color y espejo cortadas a láser a la medida, desde $79. Precios publicados, compra en línea y envío gratis desde $1,049 a todo México.",
  alternates: { canonical: "/acrilico-cortado-a-la-medida" },
};

export default function AcrilicoCortadoALaMedidaPage() {
  return <AcrilicoMedidaLanding enMonterrey={false} />;
}
