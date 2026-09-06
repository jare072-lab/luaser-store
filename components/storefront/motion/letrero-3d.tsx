"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useEnVista, useMovimientoReducido } from "./use-en-vista";
import "./motion.css";

/**
 * Letrero de acrílico que se arma: cada letra es una pieza con canto (extrusión
 * por text-shadow), caen en cascada, asientan, y luego la luz de fondo
 * parpadea y queda encendida como un letrero retroiluminado.
 *
 * `texto` puede ser el nombre del negocio del cliente en su ficha. `acento`
 * es el índice de la letra que va en dorado (por defecto ninguna).
 */
export function Letrero3D({
  texto,
  acento = -1,
  className,
  textoClassName,
  repeticion = 0,
}: {
  texto: string;
  acento?: number;
  className?: string;
  textoClassName?: string;
  repeticion?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visto = useEnVista(ref, 0.35, repeticion);
  const reducido = useMovimientoReducido();
  const letras = Array.from(texto);

  return (
    <div
      ref={ref}
      key={repeticion}
      className={cn(
        "lz-sign relative grid w-full place-items-center overflow-hidden [aspect-ratio:16/7] [background:radial-gradient(ellipse_at_50%_60%,#1B1E24,#0B0C0E_70%)]",
        visto && !reducido && "lz-run",
        reducido && "lz-done",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 [background:repeating-linear-gradient(90deg,rgba(255,255,255,0.025)_0_1px,transparent_1px_48px),repeating-linear-gradient(0deg,rgba(255,255,255,0.025)_0_1px,transparent_1px_48px)]"
      />
      <div
        aria-hidden="true"
        className="lz-halo absolute left-1/2 top-1/2 h-[46%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full"
      />
      <div
        className={cn(
          "lz-word relative flex gap-[0.06em] font-display text-[clamp(56px,12vw,150px)] font-bold leading-none tracking-[-0.01em]",
          textoClassName
        )}
        aria-label={texto}
      >
        {letras.map((ch, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={cn("lz-ch", i === acento && "lz-acc")}
            style={{ ["--lz-i" as string]: i }}
          >
            {ch === " " ? " " : ch}
          </span>
        ))}
      </div>
      <div
        aria-hidden="true"
        className="absolute bottom-[12%] left-1/2 h-[10px] w-[60%] -translate-x-1/2 blur-[6px] [background:radial-gradient(closest-side,rgba(0,0,0,0.7),transparent)]"
      />
    </div>
  );
}
