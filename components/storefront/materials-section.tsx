import Image from "next/image";
import {
  Package,
  FileText,
  Layers,
  Gem,
  TreePine,
  PackageOpen,
  PackageCheck,
  StickyNote,
  Wallet,
  Puzzle,
  Disc,
  Shirt,
  GlassWater,
  Coffee,
  Paintbrush,
  Cog,
  CircuitBoard,
  type LucideIcon,
} from "lucide-react";

interface Material {
  icon: LucideIcon;
  label: string;
  note?: string;
}

const cutAndEngrave: Material[] = [
  { icon: Package, label: "Cartón" },
  { icon: FileText, label: "Papel" },
  { icon: Layers, label: "MDF", note: "3–6 mm" },
  { icon: Gem, label: "Acrílico", note: "varios colores" },
  { icon: TreePine, label: "Madera natural" },
  { icon: Layers, label: "Triplay" },
  { icon: PackageOpen, label: "Cartón Caple" },
  { icon: PackageCheck, label: "Cartón Sulfatado" },
  { icon: StickyNote, label: "Cartulina" },
  { icon: Layers, label: "Fibropanel / HDF" },
  { icon: Wallet, label: "Piel / Cuero", note: "algunos tipos" },
  { icon: Puzzle, label: "Goma EVA / Foamy", note: "grabado ligero y cortes delgados" },
  { icon: Disc, label: "Corcho" },
  { icon: Puzzle, label: "Fomi delgado", note: "según el tipo" },
  { icon: Shirt, label: "Tela / Fieltro", note: "según el material" },
];

const engraveOnly: Material[] = [
  { icon: GlassWater, label: "Vidrio" },
  { icon: Coffee, label: "Cerámica" },
  { icon: Paintbrush, label: "Aceros pintados" },
  { icon: Cog, label: "Aceros anodizados" },
  { icon: CircuitBoard, label: "Aluminio anodizado" },
];

function MaterialCard({ icon: Icon, label, note }: Material) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-ink-border bg-ink px-4 py-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="font-body text-sm font-semibold text-bone">{label}</p>
        {note && <p className="mt-0.5 font-body text-xs text-graystone-500">{note}</p>}
      </div>
    </div>
  );
}

export function MaterialsSection() {
  return (
    <section id="materiales" className="bg-ink-soft py-16 md:py-24">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-body font-semibold uppercase tracking-widest text-pitch">
              Materiales
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl text-bone">
              ¿Qué puede cortar y grabar nuestra máquina?
            </h2>
            <p className="mt-3 font-body text-graystone-300">
              Trabajamos con corte y grabado láser CO2 sobre una amplia variedad de materiales —
              manda el tuyo y te decimos si se puede.
            </p>
          </div>
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-ink-border">
            <Image
              src="/generated/luaser_workshop.png"
              alt="Láser CO2 grabando un diseño de rosa en acrílico"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div className="mt-12">
          <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-graystone-500">
            Corte y grabado
          </h3>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {cutAndEngrave.map((material) => (
              <MaterialCard key={material.label} {...material} />
            ))}
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-body text-sm font-semibold uppercase tracking-wide text-graystone-500">
            Solo grabado
          </h3>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {engraveOnly.map((material) => (
              <MaterialCard key={material.label} {...material} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
