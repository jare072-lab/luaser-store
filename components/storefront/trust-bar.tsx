import { Truck, ShieldCheck, Hammer, Lock } from "lucide-react";
import { CountUp } from "@/components/storefront/motion/count-up";

const items = [
  { icon: Truck, label: "Envíos a todo México" },
  { icon: Hammer, label: "Maquilamos cualquier pieza personalizada" },
  { icon: ShieldCheck, label: "Garantía de calidad" },
  { icon: Lock, label: "Pago 100% seguro" },
];

export function TrustBar() {
  return (
    <div className="border-y border-ink-border bg-ink-soft">
      {/* Las cifras suben al entrar en pantalla; abajo siguen las garantías de siempre. */}
      <div className="mx-auto grid max-w-content grid-cols-1 gap-8 border-b border-ink-border px-4 py-10 sm:grid-cols-3 sm:px-6">
        <CountUp valor={500} prefijo="+" etiqueta="piezas maquiladas para negocios en Nuevo León" />
        <CountUp valor={4} sufijo="materiales" etiqueta="acrílico, MDF, madera y metal" />
        <CountUp valor={32} sufijo="estados" etiqueta="envíos a todo México" />
      </div>
      <div className="mx-auto max-w-content px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 text-graystone-100">
            <Icon className="h-5 w-5 text-gold shrink-0" />
            <span className="text-xs sm:text-sm font-body">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
