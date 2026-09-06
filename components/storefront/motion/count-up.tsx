"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useEnVista, useMovimientoReducido } from "./use-en-vista";

/**
 * Número que sube con desaceleración (easeOutExpo) al entrar en pantalla.
 * Sólo anima la cifra: prefijo y sufijo son texto fijo, así "+500" no
 * parpadea entre "+" y "500".
 */
export function CountUp({
  valor,
  prefijo = "",
  sufijo,
  duracion = 1600,
  className,
  sufijoClassName,
  repeticion = 0,
}: {
  valor: number;
  prefijo?: string;
  sufijo?: string;
  duracion?: number;
  className?: string;
  sufijoClassName?: string;
  repeticion?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visto = useEnVista(ref, 0.5, repeticion);
  const reducido = useMovimientoReducido();
  const [n, setN] = useState(0);

  useEffect(() => {
    setN(0);
    if (!visto) return;
    if (reducido) {
      setN(valor);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      const u = Math.min(1, (now - t0) / duracion);
      const e = u >= 1 ? 1 : 1 - Math.pow(2, -10 * u);
      setN(Math.round(valor * e));
      if (u < 1) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [visto, reducido, valor, duracion, repeticion]);

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefijo}
      {n}
      {sufijo && <span className={cn("ml-[0.05em] text-[0.42em] tracking-normal text-gold", sufijoClassName)}>{sufijo}</span>}
    </span>
  );
}
