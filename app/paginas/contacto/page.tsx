import type { Metadata } from "next";
import { ContactSection } from "@/components/storefront/contact-section";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacta a Luaser por WhatsApp, llamada o correo para cotizar tu pieza de acrílico personalizada. Taller en Apodaca, N.L.",
};

export default function ContactoPage() {
  return (
    <>
      <h1 className="sr-only">Contacto</h1>
      <ContactSection />
    </>
  );
}
