import type { Metadata } from "next";
import { MotionDemo } from "./motion-demo";

// Demo interna de las piezas de motion graphics. No se indexa: es una página
// de revisión, no de venta.
export const metadata: Metadata = {
  title: "Motion reel",
  robots: { index: false, follow: false },
};

export default function MotionPage() {
  return <MotionDemo />;
}
