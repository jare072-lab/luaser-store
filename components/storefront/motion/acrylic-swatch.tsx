"use client";

import { useRef, type CSSProperties, type PointerEvent } from "react";
import { cn } from "@/lib/utils";
import "./motion.css";

/**
 * Muestra de acrílico espejo que reacciona al cursor: se inclina en 3D y el
 * reflejo se desplaza según dónde esté el puntero, como girar la placa bajo
 * la luz. Un brillo pasa solo cada seis segundos (`retraso` lo desfasa entre
 * muestras) para que el muestrario viva también sin interacción.
 *
 * Los acabados son una superficie CSS (`gradiente`), no una foto: así el
 * color del producto es exacto y el archivo pesa cero.
 */
export const ACABADOS = {
  "espejo-dorado-rosa": {
    nombre: "Espejo dorado rosa",
    gradiente: "linear-gradient(160deg,#F8C8B4 0%,#E8927A 40%,#B8654C 70%,#F5AF95 100%)",
  },
  "espejo-plata": {
    nombre: "Espejo plata",
    gradiente: "linear-gradient(160deg,#F4F6F8 0%,#C9CDD3 35%,#7E858E 70%,#E9ECEF 100%)",
  },
  "espejo-oro": {
    nombre: "Espejo oro",
    gradiente: "linear-gradient(160deg,#FFE9A8 0%,#E6B84A 40%,#8F6A16 75%,#F2D27C 100%)",
  },
  negro: {
    nombre: "Negro brillante",
    gradiente: "linear-gradient(160deg,#2C2F35 0%,#0B0C0E 60%,#23262C 100%)",
    brillo: 0.28,
  },
  blanco: {
    nombre: "Blanco",
    gradiente: "linear-gradient(160deg,#FFFFFF 0%,#EFEDE7 60%,#FFFFFF 100%)",
    brillo: 0.6,
    oscuro: true,
  },
  tornasol: {
    nombre: "Tornasol",
    gradiente: "linear-gradient(160deg,#E9F0FA 0%,#B9C6DA 50%,#F3F6FB 100%)",
    holo: true,
  },
} satisfies Record<string, { nombre: string; gradiente: string; brillo?: number; oscuro?: boolean; holo?: boolean }>;

export type Acabado = keyof typeof ACABADOS;

export function AcrylicSwatch({
  acabado,
  detalle = "Acrílico 3 mm",
  retraso = 0,
  seleccionada = false,
  onClick,
  className,
}: {
  acabado: Acabado;
  detalle?: string;
  /** Segundos de desfase del brillo ambiental. */
  retraso?: number;
  seleccionada?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const a = ACABADOS[acabado];
  const oscuro = "oscuro" in a && a.oscuro;
  const holo = "holo" in a && a.holo;
  const brillo = "brillo" in a ? a.brillo : undefined;

  const mover = (e: PointerEvent<HTMLButtonElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `rotateY(${x * 18}deg) rotateX(${-y * 14}deg) translateZ(6px)`;
    el.style.setProperty("--lz-mx", (x * r.width * 0.9).toFixed(1));
  };
  const soltar = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = "";
    el.style.setProperty("--lz-mx", "0");
  };

  const estilo: CSSProperties = {
    ["--lz-bg" as string]: a.gradiente,
    ["--lz-d" as string]: `${retraso}s`,
    ...(brillo !== undefined ? { ["--lz-gloss" as string]: brillo } : {}),
  };

  return (
    <button
      ref={ref}
      type="button"
      onPointerMove={mover}
      onPointerLeave={soltar}
      onClick={onClick}
      aria-pressed={onClick ? seleccionada : undefined}
      style={estilo}
      className={cn(
        "lz-swatch aspect-[3/4] w-full rounded-[10px] border-0 p-0 text-left",
        holo && "lz-holo",
        seleccionada && "ring-2 ring-gold ring-offset-2 ring-offset-ink",
        onClick ? "cursor-pointer" : "cursor-default",
        className
      )}
    >
      <span className="lz-sheen" aria-hidden="true" />
      <span
        className={cn(
          "absolute bottom-3 left-3 right-3 z-[2] font-body text-xs font-semibold leading-tight",
          oscuro ? "text-ink" : "text-bone [text-shadow:0_1px_2px_rgba(0,0,0,0.6)]"
        )}
      >
        {a.nombre}
        <span className={cn("mt-0.5 block text-[11px] font-medium", oscuro ? "text-graystone-700" : "text-bone/75")}>
          {detalle}
        </span>
      </span>
    </button>
  );
}
