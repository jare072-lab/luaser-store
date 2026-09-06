"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { useEnVista, useMovimientoReducido } from "./use-en-vista";
import "./motion.css";

/**
 * Texto que aparece como lo graba la máquina: el cabezal barre de lado a
 * lado mientras baja y el mensaje queda "esmerilado" sobre el acrílico.
 * Debajo va una copia fantasma (contorno tenue) para que el bloque conserve
 * su tamaño y el lector sepa dónde va a aparecer el texto.
 *
 * Arranca al entrar en pantalla, una sola vez. `repeticion` la reinicia.
 */
export function LaserEngrave({
  lineas,
  bajada,
  className,
  textoClassName,
  duracion = 3.4,
  repeticion = 0,
}: {
  lineas: string[];
  bajada?: string;
  className?: string;
  textoClassName?: string;
  /** Segundos que tarda en grabar el bloque completo. */
  duracion?: number;
  repeticion?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const visto = useEnVista(ref, 0.35, repeticion);
  const reducido = useMovimientoReducido();

  const texto = (fantasma: boolean) => (
    <p
      className={cn(
        "m-0 text-center font-display font-bold leading-[0.95] tracking-[-0.02em] text-[clamp(40px,8.5vw,104px)]",
        fantasma
          ? "text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.08)]"
          : "text-[#E3E0D8] [text-shadow:0_0_1px_rgba(255,255,255,0.4)]",
        textoClassName
      )}
      aria-hidden={fantasma || undefined}
    >
      {lineas.map((l, i) => (
        <span key={i} className="block">
          {l}
        </span>
      ))}
      {bajada && (
        <span
          className={cn(
            "mt-[0.35em] block text-[0.32em] font-medium tracking-[0.28em]",
            fantasma ? "text-transparent" : "text-gold"
          )}
        >
          {bajada}
        </span>
      )}
    </p>
  );

  return (
    <div
      ref={ref}
      key={repeticion}
      className={cn(
        "lz-engrave",
        visto && !reducido && "lz-run",
        reducido && "lz-done",
        className
      )}
      style={{ ["--lz-dur" as string]: `${duracion}s` }}
    >
      {texto(true)}
      <div className="lz-capa">{texto(false)}</div>
      <div className="lz-scan" aria-hidden="true" />
      <div className="lz-cabezal" aria-hidden="true" />
    </div>
  );
}
