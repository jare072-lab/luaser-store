import { Truck, ShieldCheck, Hammer, Lock } from "lucide-react";

const items = [
  { icon: Truck, label: "Envíos a todo México" },
  { icon: Hammer, label: "Maquilamos cualquier pieza personalizada" },
  { icon: ShieldCheck, label: "Garantía de calidad" },
  { icon: Lock, label: "Pago 100% seguro" },
];

export function TrustBar() {
  return (
    <div className="border-y border-ink-border bg-ink-soft">
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
